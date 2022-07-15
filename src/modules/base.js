import {
  allSettings,
  camelToSnake,
  snakeToCamel,
  transforms,
} from "./utils.js";

p5.prototype.CHILDREN = "children";
p5.prototype.ALL = "all";

export class P5El extends HTMLElement {
  constructor() {
    super();
    [this.settings, this.transforms, this.vals] = this.parseAttributes();
    this.createAttributeGetters();
  }
  get applyTo() {
    const val = this.getAttribute("apply-to") || this.getAttribute("applyTo");
    return p5.prototype[val] || val || p5.prototype.CHILDREN;
  }
  get assignStr() {
    return this.vals.map((v) => `let ${v} = ${this[v]};`);
  }
  get block() {
    return this.applyTo === p5.prototype.CHILDREN && this.vals.length;
  }
  get blockEnd() {
    if (this.block) return "}";
    return "";
  }
  get blockStart() {
    if (this.block) return "{";
    return "";
  }
  childStr(tabs) {
    return Array.from(this.children).map((child) => child.codeStr?.(tabs));
  }
  codeStr(tabs) {
    const blockTab = this.block ? "\t" : "";
    const top = [this.comment, this.blockStart];
    const middle = [
      this.assignStr,
      this.pushStr,
      this.transformStr,
      this.setStr,
      this.fnStr,
      this.childStr(tabs),
      this.popStr,
    ].map((s) => (s.length ? blockTab + s : s));
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
  createAttributeGetters() {
    const attrs = Array.from(this.attributes);

    //  Find apply-to to remove it from array
    const applyToIndex = attrs.findIndex(
      ({ name }) => snakeToCamel(name) === "applyTo"
    );
    //  Create getter for each attribute
    attrs
      .slice(0, Math.max(applyToIndex, 0))
      .concat(attrs.slice(applyToIndex + 1))
      .forEach(({ name }) =>
        Object.defineProperty(this, snakeToCamel(name), {
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
    return `${camelToSnake(this.name)}-p5`;
  }

  get fnStr() {
    return "";
  }
  get html() {
    return this.outerHTML.replace(this.innerHTML, "");
  }
  parseAttributes() {
    return Array.from(this.attributes).reduce(
      ([s, t, v], { name: attr }) => {
        attr = snakeToCamel(attr);
        if (allSettings.includes(attr)) return [s.concat(attr), t, v];
        if (transforms.includes(attr)) return [s, t.concat(attr), v];
        if (attr === "applyTo") return [s, t, v];
        return [s, t, v.concat(attr)];
      },
      [[], [], []]
    );
  }
  get pushStr() {
    if (this.applyTo == p5.prototype.ALL) return "";
    if (this.settings.length || this.transforms.length) return "push();";
    return "";
  }
  get popStr() {
    if (this.applyTo == p5.prototype.ALL) return "";
    if (this.settings.length || this.transforms.length) return "pop();";
    return "";
  }
  //  Create string to call functions for each setting
  get setStr() {
    return this.settings.map((s) => `${s}(${this[s]});`);
  }
  get transformStr() {
    return this.transforms.map((t) => `${t}(${this[t]});`);
  }
}

export class P5Function extends P5El {
  constructor(overloads) {
    super();
    [this.params, this.vals] = this.splitParamsFromVals(overloads);
    const anchorSet = this.transforms.includes("anchor");
    if (this.transforms.length && !anchorSet) this.setAnchorToXY();
  }
  get fnName() {
    return this.constructor.name.toLowerCase();
  }
  //  Create string to call function with provided arguments
  get fnStr() {
    return `${this.fnName}(${this.params.map((p) => this[p]).join(", ")});`;
  }
  setAnchorToXY() {
    const x = this.x || this.x1;
    const y = this.y || this.y1;
    const anchorVal = `${x}, ${y}`;
    this.setAttribute("anchor", anchorVal);
    this.setAttribute(this.params[0], 0);
    this.setAttribute(this.params[1], 0);
    this[this.params[0]] = 0;
    this[this.params[1]] = 0;
    this.transforms.unshift("anchor");
  }
  splitParamsFromVals(overloads) {
    let overloadMatch = false;
    //  Start with overloads with most parameters
    overloads.reverse();
    if (overloads.length === 0) return [[], this.vals];
    for (const i in overloads) {
      const overloadParams = overloads[i].split(",").map((s) => s.trim());
      //  Check every required parameter has an attribute
      const isOptional = (param) => param.match(/^\[.*\]$/);
      overloadMatch = overloadParams.every(
        (p) => this.vals.includes(p) || isOptional(p)
      );
      //  If matched overload found
      if (overloadMatch) {
        //  Save parameters with attributes
        const params = overloadParams.filter((p) => this.vals.includes(p));
        //  Remove arguments from array of values
        const vals = this.vals.filter((v) => !params.includes(v));
        return [params, vals];
      }
    }
    console.error(
      `${
        this.constructor.elementName
      } has the following attributes: ${Array.from(this.attributes)
        .map(({ name }) => name)
        .join(", ")}\n` +
        `but it must have one of the following combinations of attributes: ${overloads}\n\n` +
        this.outerHTML
    );
  }
}

export class BlockStarter extends P5Function {
  constructor(overloads) {
    super(overloads);
    if (this.applyTo != p5.prototype.CHILDREN)
      console.warn(
        `${this.constructor.elementName} has apply-all set to ALL, but this element can only be applied to children\n${this.html}`
      );
  }
  codeStr(tabs) {
    const innerTabs = tabs + "\t";
    const ast = [this.assignStr, this.pushStr, this.transformStr, this.setStr];
    const comment = `\n${tabs}${this.comment}`;
    const startBlock = `\n${tabs}${this.fnStr}\n`;
    const endBlock = `\n${tabs}}`;
    console.log(
      [
        comment,
        startBlock,
        ast,
        this.childStr(innerTabs),
        this.popStr,
        endBlock,
      ]
        .flat()
        .filter((s) => s?.length)
        .join("\n" + tabs)
    );
    // Concat settings and function between push and pop
    if (this.applyTo === p5.prototype.CHILDREN)
      return [
        comment,
        startBlock,
        [ast, this.childStr(innerTabs), this.popStr]
          .flat()
          .map((s) => (s.length ? "\t" + s : s)),
        endBlock,
      ]
        .flat()
        .filter((s) => s?.length)
        .join("\n" + tabs);
    //hsv
    if (this.applyTo === p5.prototype.ALL)
      return [comment, ast, startBlock, this.childStr(innerTabs), endBlock]
        .flat()
        .filter((s) => s.length)
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
      const overloads = ["width, height, [renderer]"];
      super(overloads);
      const runCode = () => {
        const code = [
          this.vals.map((val) => `window.${val} = ${this[val]}`).join(";\n") +
            ";",
          "",
          "this.setup = function() {",
          `\tcreateCanvas(${this.width}, ${this.height});`,
          "}",
          "",
          `this.draw = function() {`,
          this.codeStr(),
          "}",
        ].join("\n");
        Function(code)();
        console.log(code);
      };
      window.addEventListener("DOMContentLoaded", runCode);
    }
    codeStr(tabs = "\t") {
      return (
        tabs +
        [this.transformStr, this.setStr, this.childStr(tabs)]
          .filter((s) => s.length)
          .flat()
          .join("\n" + tabs)
      );
    }
  },
  class Mutate extends P5El {
    constructor() {
      super();
    }
    get assignStr() {
      return this.vals.map((v) => `${v} = ${this[v]};`);
    }
  },
];
