import { BlockStarter } from "./base.js";

const elseElement = class Else extends BlockStarter {
  constructor(overloads = []) {
    super(overloads);
    if (this.applyTo != this.constructor.applyToDefault) {
      console.warn(
        `${this.constructor.elementName} apply-all attribute cannot be set to ${this.applyTo}:\n + ${this.html}`
      );
      this.setAttribute("apply-all", this.constructor.applyToDefault);
    }
  }
  get fnStr() {
    return "else {";
  }
};

export default [
  class Iterate extends BlockStarter {
    constructor() {
      super(["count", "cond", "[init], cond, update"]);

      //  If cond and update provided but not init, use assignment vals as init
      if (this.update && !this.init) {
        this.init = this.vals.length
          ? "let " + this.vals.map((v) => `${v} = ${this[v]}`).join(", ")
          : "";
        this.vals = [];
        this.params.unshift("init");
      }

      //  Convert count argument to for loop
      if (this.params[0] === "count") {
        let charCode = "i".charCodeAt(0);
        while (typeof window[String.fromCharCode(charCode)] !== "undefined")
          charCode++;
        const varName = String.fromCharCode(charCode);
        Object.defineProperty(this, "fnStr", {
          get() {
            return `for(let ${varName} = 0; ${varName} < ${this.count}; ${varName}++) {`;
          },
        });
      }
    }
    get fnName() {
      if (this.params[0] === "cond") return "while";
      return "for";
    }
  },
  class If extends BlockStarter {
    constructor() {
      super(["cond"]);
    }
  },
  elseElement,
  class ElseIf extends elseElement {
    constructor() {
      super(["cond"]);
    }
    get fnStr() {
      return `else if(${this.cond}) {`;
    }
  },
  class Switch extends elseElement {
    static applyToDefault = p5.prototype.ALL;

    constructor() {
      super(["exp"]);
    }
    get fnStr() {
      return `switch(${this.exp}) {`;
    }
  },
  class Case extends elseElement {
    constructor() {
      super(["val"]);
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
      }\n${tabs}break;`;
    }
    get fnStr() {
      return `case ${this.val}:`;
    }
  },
];
