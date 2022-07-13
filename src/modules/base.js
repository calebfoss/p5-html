import { allSettings, camelToSnake, snakeToCamel } from "./utils.js";

export class P5El extends HTMLElement {
  constructor() {
    super();
    //  Save settings with atributes
    this.settings = allSettings.filter((s) =>
      this.hasAttribute(camelToSnake(s))
    );
    //  Create property for each setting and assign attribute value
    this.settings.forEach(
      (setting) => (this[setting] = this.getAttribute(camelToSnake(setting)))
    );
  }
  //  Create string to call functions for each setting
  setStr(tabs) {
    return this.settings.length
      ? this.settings.map((s) => `${tabs}${s}(${this[s]})`).join(";\n") + ";\n"
      : "";
  }
  codeString(tabs) {
    return this.setStr(tabs);
  }
}

export class P5Function extends P5El {
  constructor(overloads) {
    super();

    let overloadMatch = false;
    //  Start with overloads with most parameters
    overloads.reverse();
    this.params = [];
    if (overloads.length === 0) overloadMatch = true;
    for (const i in overloads) {
      const overloadParams = overloads[i].split(",").map((s) => s.trim());
      //  Check every required parameter has an attribute
      overloadMatch = overloadParams.every(
        (p) =>
          this.hasAttribute(p) || (p.slice(0, 1) === "[" && p.slice(-1) === "]")
      );
      //  If matched overload found
      if (overloadMatch) {
        //  Save parameters with attributes
        this.params = overloadParams.filter((p) => this.hasAttribute(p));
        //  Create property for each parameter and assign attribute value
        this.params.forEach(
          (param) => (this[param] = this.getAttribute(param))
        );
        break;
      }
    }
    if (!overloadMatch)
      console.error(
        `No overloads for ${this.fnName} match provided parameters:`,
        this.attributes
      );
  }
  childStr(tabs) {
    return this.children.length
      ? Array.from(this.children)
          .map((child) => (child instanceof P5El ? child.codeString(tabs) : ""))
          .join("\n") + "\n"
      : "";
  }
  codeString(tabs) {
    //  Concat settings and function between push and pop
    return (
      `${tabs}push();\n${this.setStr(tabs)}` +
      `${this.fnStr(tabs)}${this.childStr(tabs)}${tabs}pop();`
    );
  }
  get fnName() {
    return this.constructor.name.toLowerCase();
  }
  //  Create string to call function with provided arguments
  fnStr(tabs) {
    return `${tabs}${this.fnName}(${this.params.map((p) => this[p])});\n`;
  }
}

export class P5BlockStarter extends P5Function {
  constructor(overloads) {
    super(overloads);
  }
  codeString(tabs) {
    const innerTabs = tabs + "\t";
    //  Concat settings and function between push and pop
    return (
      `${this.fnStr(tabs)} {\n${innerTabs}push();\n` +
      `${this.setStr(innerTabs)}${this.childStr(innerTabs)}` +
      `${innerTabs}pop();\n${tabs}}`
    );
  }
  //  Create string to call function with provided arguments
  fnStr(tabs) {
    return `${tabs}${this.fnName}(${this.params
      .map((p) => this[p])
      .join("; ")})`;
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
    codeString(tabs) {
      return `${this.setStr(tabs)}${this.childStr(tabs)}`;
    }
  },
  class State extends P5El {
    constructor() {
      super();
    }
    assignStr(tabs) {
      return Array.from(this.attributes)
        .map((a) => `${tabs}${a.name} = ${this.getAttribute(a.name)};`)
        .join("\n");
    }
    codeString(tabs) {
      return `${this.setStr(tabs)}${this.assignStr(tabs)}`;
    }
  },
];
