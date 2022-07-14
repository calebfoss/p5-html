import { allSettings, snakeToCamel, transforms } from "./utils.js";

export class P5El extends HTMLElement {
  constructor() {
    super();
    [this.settings, this.transforms, this.vals] = this.parseAttributes();
    //  Create getter for each attribute
    Array.from(this.attributes).forEach(({ name }) =>
      Object.defineProperty(this, name, {
        get() {
          return this.getAttribute(name);
        },
      })
    );
  }
  assignStr(tabs) {
    return this.vals.length
      ? this.vals.map((v) => `${tabs}let ${v} = ${this.getAttribute(v)};`)
      : "";
  }
  codeStr(tabs) {
    //  Concat settings and function between push and pop
    return [
      this.assignStr(tabs),
      this.pushStr(tabs),
      this.transformStr(tabs),
      this.setStr(tabs),
      this.fnStr(tabs),
      this.childStr(tabs),
      this.popStr(tabs),
    ]
      .filter((s) => s.length)
      .join("\n");
  }
  childStr(tabs) {
    return this.children.length
      ? Array.from(this.children)
          .map((child) => (child instanceof P5El ? child.codeStr(tabs) : ""))
          .join("\n")
      : "";
  }
  fnStr(tabs) {
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
  pushStr(tabs) {
    return this.settings.length || this.transforms.length
      ? `${tabs}push();`
      : "";
  }
  popStr(tabs) {
    return this.settings.length || this.transforms.length
      ? `${tabs}pop();`
      : "";
  }
  //  Create string to call functions for each setting
  setStr(tabs) {
    return this.settings.length
      ? this.settings.map((s) => `${tabs}${s}(${this[s]})`).join(";\n") + ";"
      : "";
  }
  transformStr(tabs) {
    return this.transforms.length
      ? this.transforms.map((t) => `${tabs}${t}(${this[t]})`).join(";\n") + ";"
      : "";
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
  fnStr(tabs) {
    return `${tabs}${this.fnName}(${this.params.map((p) => this[p])});`;
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
      `No overloads for ${this.fnName} match provided parameters:`,
      this.attributes
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
    return [
      this.fnStr(tabs),
      this.pushStr(innerTabs),
      this.transformStr(innerTabs),
      this.setStr(innerTabs),
      this.childStr(innerTabs),
      this.popStr(innerTabs),
      tabs + "}",
    ]
      .filter((s) => s.length)
      .join("\n");
  }
  //  Create string to call function with provided arguments
  fnStr(tabs) {
    return `${tabs}${this.fnName}(${this.params
      .map((p) => this[p])
      .join("; ")}) {`;
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
    }
    codeStr(tabs = "") {
      return [this.transformStr(tabs), this.setStr(tabs), this.childStr(tabs)]
        .filter((s) => s.length)
        .join("\n");
    }
  },
  class Mutate extends P5El {
    constructor() {
      super();
    }
    assignStr(tabs) {
      return this.vals.length
        ? this.vals.map((v) => `${tabs}${v} = ${this.getAttribute(v)};`)
        : "";
    }
  },
];
