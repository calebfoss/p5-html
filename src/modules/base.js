import { pascalToCamel, pascalToKebab } from "./utils.js";

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
    [this.settings, this.vars] = this.parseAttributes();
    this.createAttributeGetters();
  }
  static addTab(line) {
    return line.length && this.isBlock ? "\t" + line : line;
  }
  anchorFirst() {
    const anchorIndex = this.settings.indexOf("anchor");
    this.settings = ["anchor"].concat(
      this.settings.slice(0, anchorIndex),
      this.settings.slice(anchorIndex + 1)
    );
  }
  get assignStrings() {
    return this.vars.map((attr) => {
      const init = this.varInitialized(attr) || P5El.isP5(attr) ? "" : "let ";
      if (this[attr].length === 0) return `${init}${attr};`;
      return `${init}${attr} = ${this[attr]};`;
    });
  }
  get isBlock() {
    return this.vars.length + this.settings.length > 0;
  }
  get blockEnd() {
    if (this.isBlock) return "}";
    return "";
  }
  get blockStart() {
    if (this.isBlock) return "{";
    return "";
  }
  get childStrings() {
    if (this.children.length === 0) return [];
    return Array.from(this.children)
      .map((child) => child.codeStrings || [])
      .flat();
  }
  get codeStrings() {
    return [
      " ",
      this.comment,
      this.blockStart,
      ...[
        this.pushStr,
        ...this.setStrings,
        ...this.assignStrings,
        this.fnStr,
        ...this.childStrings,
        this.innerEnd,
        this.popStr,
      ].map(P5El.addTab, this),
      this.blockEnd,
    ].filter((line) => line.length);
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
    return `p-${pascalToKebab(this.name)}`;
  }
  get fnStr() {
    return "";
  }
  get html() {
    return this.outerHTML.replace(this.innerHTML, "");
  }
  get innerEnd() {
    return "";
  }
  static isP5(name) {
    return p5.prototype.hasOwnProperty(name);
  }
  parseAttributes() {
    return Array.from(this.attributes).reduce(
      ([s, v], { name: attr }) => {
        if (P5El.isP5(attr)) return [s.concat(attr), v];
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
  get setStrings() {
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
    this.overloads = overloads;
  }
  get fnName() {
    return pascalToCamel(this.constructor.name);
  }
  //  Create string to call function with provided arguments
  get fnStr() {
    return `${this.outputAssignment}${this.targetStr}${
      this.fnName
    }(${this.params.join(", ")});`;
  }

  setParamsFromOverloads() {
    const { overloads } = this;
    //  Check every required parameter has an attribute
    const isOptional = (param) => param.match(/^\[.*\]$/);
    let overloadMatch = false;
    //  Start with overloads with most parameters
    overloads.reverse();
    if (overloads.length === 0) return [[], this.vars];
    for (const i in overloads) {
      const overloadParams = overloads[i].split(",").map((s) => s.trim());

      overloadMatch = overloadParams.every(
        (p) =>
          this.vars.includes(p) ||
          this.varInitialized(p) ||
          isOptional(p) ||
          p === ""
      );
      //  If matched overload found
      if (overloadMatch) {
        //  Save parameters with attributes
        const params = overloadParams
          .map((p) => p.replaceAll(/\[|\]/g, ""))
          .filter((p) => this.vars.includes(p) || this.varInitialized(p));
        this.params = params;
        return;
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
  get parentReturns() {
    if (this.parentElement.returnsVal) return true;
    if (this.parentElement.parentReturns)
      return this.parentElement.parentReturns;
    return false;
  }
  get outputAssignment() {
    if (!this.returnsVal) return "";
    return this.parentReturns ? "" : "let " + "output = ";
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
  setParamsFromOverloads() {
    super.setParamsFromOverloads();
    if ((this.angle || this.scaling) && !this.anchor) this.setAnchorToXY();
  }
}

export class BlockStarter extends P5Function {
  constructor(overloads) {
    super(overloads);
  }
  get childStrings() {
    return super.childStrings.map(this.constructor.addTab, this);
  }
  get innerEnd() {
    return "}";
  }

  //  Create string to call function with provided arguments
  get fnStr() {
    return `${this.fnName}(${this.params.map((p) => p).join("; ")}) {`;
  }
}

p5.prototype._registerElements(
  class Blank extends P5El {
    constructor() {
      super();
    }
  },
  class Sketch extends P5Function {
    constructor() {
      const overloads = ["w, h, [renderer]"];
      super(overloads);

      const setParams = (el) => {
        el.setParamsFromOverloads?.();
        for (const i in el.children) {
          setParams(el.children[i]);
        }
      };

      const runCode = () => {
        setParams(this);

        console.log(this.codeString);

        Function("sketch", this.codeString)(this);
      };
      window.addEventListener("customElementsDefined", runCode);
    }
    get codeString() {
      return [
        this.comment,
        this.assignStrings,
        " ",
        "this.setup = function() {",
        [this.fnStr].map(this.constructor.addTab, this),
        "}",
        " ",
        `this.draw = function() {`,
        [, ...this.setStrings, ...this.childStrings].map(
          this.constructor.addTab,
          this
        ),
        "}",
      ]
        .flat(Infinity)
        .join("\n");
    }
    get fnName() {
      return "createCanvas";
    }
    get fnStr() {
      return super.fnStr.slice(0, -1) + ".parent(sketch)";
    }
  },
  class Update extends P5El {
    constructor() {
      super();
      if (this.parentElement.hasAttribute("cond")) {
        this.vars.push("cond");
        this.cond = this.parentElement.getAttribute("cond");
      }
    }
  }
);
