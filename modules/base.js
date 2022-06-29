//  CASING CONVERTERS
const camelToSnake = (camelStr) =>
  camelStr.replace(/(?<!^)[A-Z]/g, (letter) => "-" + letter).toLowerCase();
const snakeToCamel = (snakeStr) =>
  snakeStr.replace(/-./g, (s) => s[1].toUpperCase());

//  p5 functions that set transfromation, style, modes, etc.
const allSettings = [
  "translate",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "scale",
  "shearX",
  "shearY",
  "colorMode",
  "erase",
  "noErase",
  "fill",
  "noFill",
  "noStroke",
  "stroke",
  "ellipseMode",
  "noSmooth",
  "rectMode",
  "smooth",
  "strokeCap",
  "strokeJoin",
  "strokeWeight",
];

class P5El extends HTMLElement {
  constructor() {
    super();
    els.push(this);
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

class P5Function extends P5El {
  constructor(overloads) {
    super();

    let overloadMatch = false;
    //  Start with overloads with most parameters
    overloads.reverse();
    if (overloads.length === 0) {
      this.params = [];
      this.settings = [];
      overloadMatch = true;
    }
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

class P5ColorFunction extends P5Function {
  constructor(overloads) {
    overloads = [
      "v1, v2, v3, [alpha]",
      "value",
      "gray, [alpha]",
      "values",
      "color",
      ...overloads,
    ];
    super(overloads);
  }
}

class P5BlockStarter extends P5Function {
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

export default {
  camelToSnake,
  snakeToCamel,
  allSettings,
  P5El,
  P5Function,
  P5ColorFunction,
  P5BlockStarter,
};