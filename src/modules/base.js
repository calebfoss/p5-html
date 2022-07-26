import { pascalToCamel, pascalToSnake, snakeToCamel } from "./utils.js";

p5.prototype._customElements = [];
p5.prototype._registerElements = function () {
  p5.prototype._customElements.push(...arguments);
};

p5.prototype._defineProperties = function (obj) {
  for (const p in obj) {
    p5.prototype[p] = {};
  }
  Object.defineProperties(p5.prototype, obj);
};

p5.prototype._createFriendlyGlobalFunctionBinderBase =
  p5.prototype._createFriendlyGlobalFunctionBinder;
p5.prototype._createFriendlyGlobalFunctionBinder = function (options = {}) {
  return (prop, value) => {
    const descriptor = Object.getOwnPropertyDescriptor(p5.prototype, prop);
    const globalObject = options.globalObject || window;
    if (typeof descriptor === "undefined" || descriptor.writable)
      return this._createFriendlyGlobalFunctionBinderBase(options)(prop, value);
    return Object.defineProperty(globalObject, prop, descriptor);
  };
};

export class P5El extends HTMLElement {
  constructor() {
    super();
    [(this.settings, this.vars)] =
      this.parseAttributes();
    this.createAttributeGetters();
  }
  get assignStr() {
    return this.vars.map((attr) => {
      const init = this.varInitialized(attr) ? "" : "let ";
      return `${init}${attr} = ${this[attr]};`;
    });
  }
  get block() {
    return this.vars.length || this.settings.length;
  }
  get blockEnd() {
    if (this.block) return "}";
    return "";
  }
  get blockStart() {
    if (this.block) return "{";
    return "";
  }
  childStrings(tabs) {
    return Array.from(this.children).map((child) => child.codeStr?.(tabs));
  }
  codeStr(tabs = "\t") {
    const blockTab = this.block ? "\t" : "";
    const top = [this.comment, this.blockStart];
    const middle = [
      this.assignStr,
      this.pushStr,
      this.setStr,
      this.fnStr,
      this.childStrings(tabs),
      this.popStr,
    ]
      .flat(Infinity)
      .map((s) => (s.length ? blockTab + s : s));
    const bottom = this.blockEnd;
    //  Concat settings and function between push and pop
    return (
      `\n${tabs}` +
      top
        .concat(middle)
        .concat(bottom)
        .filter((s) => s.length)
        .join("\n" + tabs)
    );
  }
  //  Create getter for each attribute
  createAttributeGetters() {
    Array.from(this.attributes).forEach(({ name }) =>
      Object.defineProperty(this, name, {
        get() {
          return this.getAttribute(name);
        },
      })
    );
  }
  get comment() {
    return `// ${this.html}`;
  }
  static get elementName() {
    return `${pascalToSnake(this.name)}-_`;
  }

  get fnStr() {
    return "";
  }
  get html() {
    return this.outerHTML.replace(this.innerHTML, "");
  }
  static isP5(name) {
    return p5.prototype.hasOwnProperty(name);
  }
  parseAttributes() {
    return Array.from(this.attributes).reduce(
      ([s, v], { name: attr }) => {
        if (
          P5El.isP5(attr) ||
          p5.prototype._gettersAndSetters.some(obj => obj.name === attr)
        )
          return [s.concat(attr), v];
        if (attr === "apply_to" || attr === "target") return [s, v];
        return [s, v.concat(attr)];
      },
      [[], []]
    );
  }
  get pushStr() {
    if (this.settings.length) return "push();";
    return "";
  }
  get popStr() {
    if (this.settings.length) return "pop();";
    return "";
  }
  //  Create string to call functions for each setting
  get setStr() {
    return this.settings.map((s) => `${s} = ${this[s]};`);
  }
  varInitialized(varName) {
    if (this.parentElement.hasAttribute(varName)) return true;
    if (this.parentElement.varInitialized)
      return this.parentElement.varInitialized(varName);
    return false;
  }
}

export class P5Function extends P5El {
  constructor(overloads) {
    super();
    this.params = this.getParamsFromOverloads(overloads);
  }
  get fnName() {
    return pascalToCamel(this.constructor.name);
  }
  //  Create string to call function with provided arguments
  get fnStr() {
    return `${this.targetStr}${this.fnName}(${this.params.join(", ")});`;
  }

  getParamsFromOverloads(overloads) {
    let overloadMatch = false;
    //  Start with overloads with most parameters
    overloads.reverse();
    if (overloads.length === 0) return [[], this.vars];
    for (const i in overloads) {
      const overloadParams = overloads[i].split(",").map((s) => s.trim());
      //  Check every required parameter has an attribute
      const isOptional = (param) => param.match(/^\[.*\]$/);
      overloadMatch = overloadParams.every(
        (p) => this.vars.includes(p) || isOptional(p) || p === ""
      );
      //  If matched overload found
      if (overloadMatch) {
        //  Save parameters with attributes
        const params = overloadParams
          .map((p) => p.replaceAll(/\[|\]/g, ""))
          .filter((p) => this.vars.includes(p));
        return params;
      }
    }
    console.error(
      `${
        this.constructor.elementName
      } has the following attributes: ${Array.from(this.attributes)
        .map(({ name }) => name)
        .join(", ")}\n` +
        `but it must have one of the following combinations of attributes:\n${overloads.join(
          "\n"
        )}\n\n` +
        this.outerHTML
    );
  }
  get targetStr() {
    if (!this.target) return "";
    const init = this.varInitialized(this.target) ? "" : "let ";
    return `${init}${this.target} = `;
  }
}

export class PositionedFunction extends P5Function {
  constructor(overloads) {
    super(overloads);
    const anchorSet = this.vars.includes("anchor");
    if ((this.rotation || this.scaling) && !anchorSet) this.setAnchorToXY();
  }
  setAnchorToXY() {
    const x = this.x || this.x1;
    const y = this.y || this.y1;
    const anchorVal = `[${x}, ${y}]`;
    this.setAttribute("anchor", anchorVal);
    this.setAttribute(this.params[0], 0);
    this.setAttribute(this.params[1], 0);
    this.settings.unshift("anchor");
    Object.defineProperty(this, "anchor", {
      get: () => this.getAttribute("anchor"),
    });
  }
}

export class BlockStarter extends P5Function {
  constructor(overloads) {
    super(overloads);
    this.vars = this.vars.filter((v) => !this.params.includes(v));
  }
  codeStr(tabs) {
    const innerTabs = tabs + "\t";
    const endBlock = `}`;
    // Concat settings and function between push and pop
    return [
      `\n${tabs}${this.comment}`,
      this.fnStr,
      ...[
        this.assignStr,
        this.pushStr,
        this.setStr,
        this.childStrings(innerTabs),
        this.popStr,
      ]
        .flat(Infinity)
        .map((s) => (s?.length ? "\t" + s : s)),
      endBlock,
    ]
      .filter((s) => s?.length)
      .join("\n" + tabs);
  }
  //  Create string to call function with provided arguments
  get fnStr() {
    return `${this.fnName}(${this.params.map((p) => this[p]).join("; ")}) {`;
  }
}

export default [
  class Setting extends P5El {
    constructor() {
      super();
    }
  },
  class Sketch extends P5Function {
    constructor() {
      const overloads = ["w, h, [renderer]"];
      super(overloads);
      const runCode = () => {
        console.log(this.codeStr());
        Function("sketch", this.codeStr())(this);
      };
      window.addEventListener("DOMContentLoaded", runCode);
    }
    codeStr(tabs = "\t") {
      return [
        this.comment,
        this.assignStr,
        " ",
        "this.setup = function() {",
        [this.fnStr, this.setStr].flat().map((s) => (s.length ? "\t" + s : s)),
        "}",
        " ",
        `this.draw = function() {`,
        this.childStrings(tabs),
        "}",
      ]
        .flat(Infinity)
        .filter((s) => s.length)
        .join("\n");
    }
    get fnName() {
      return "createCanvas";
    }
    get fnStr() {
      return super.fnStr.slice(0, -1) + ".parent(sketch)";
    }
  },
  class Mutate extends P5El {
    constructor() {
      super();
    }
    get assignStr() {
      return this.vars.map((v) => `${v} = ${this[v]};`);
    }
  },
];
