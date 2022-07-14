import {
  allSettings,
  camelToSnake,
  snakeToCamel,
  transforms,
} from "./utils.js";

export class P5El extends HTMLElement {
  constructor() {
    super();
    [this.settings, this.transforms, this.vals] = this.parseAttributes();
    //  Create getter for each attribute
    Array.from(this.attributes).forEach(({ name }) =>
      Object.defineProperty(this, snakeToCamel(name), {
        get() {
          return this.getAttribute(name);
        },
      })
    );
  }
  get assignStr() {
    return this.vals.map((v) => `let ${v} = ${this[v]};`);
  }
  childStr(tabs) {
    return Array.from(this.children).map((child) =>
      child instanceof P5El ? child.codeStr(tabs) : ""
    );
  }
  codeStr(tabs) {
    //  Concat settings and function between push and pop
    return (
      `\n${tabs}` +
      [
        this.comment,
        this.assignStr,
        this.pushStr,
        this.transformStr,
        this.setStr,
        this.fnStr,
        this.childStr(tabs),
        this.popStr,
      ]
        .filter((s) => s.length)
        .flat()
        .join("\n" + tabs)
    );
  }
  static get elementName() {
    return `${camelToSnake(this.name)}-p5`;
  }
  get comment() {
    return `// ${this.outerHTML}`.replace(this.innerHTML, "");
  }
  get fnStr() {
    return "";
  }
  parseAttributes() {
    return Array.from(this.attributes).reduce(
      ([s, t, v], { name: att }) => {
        att = snakeToCamel(att);
        if (allSettings.includes(att)) return [s.concat(att), t, v];
        if (transforms.includes(att)) return [s, t.concat(att), v];
        return [s, t, v.concat(att)];
      },
      [[], [], []]
    );
  }
  get pushStr() {
    return this.settings.length || this.transforms.length ? `push();` : "";
  }
  get popStr() {
    return this.settings.length || this.transforms.length ? `pop();` : "";
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

export class P5BlockStarter extends P5Function {
  constructor(overloads) {
    super(overloads);
  }
  codeStr(tabs) {
    const innerTabs = tabs + "\t";
    //  Concat settings and function between push and pop
    return `\n${tabs + this.comment}\n${tabs + this.fnStr}\n${
      innerTabs +
      [
        this.assignStr,
        this.pushStr,
        this.transformStr,
        this.setStr,
        this.childStr(innerTabs),
        this.popStr,
      ]
        .filter((s) => s.length)
        .flat()
        .join("\n" + innerTabs)
    }\n${tabs}}`;
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
      const sketch = this;
      window["setup"] = function () {
        this.createCanvas(sketch.width, sketch.height).parent(sketch);
        window["draw"] = Function(sketch.codeStr());
        console.log(sketch.codeStr());
      };
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
