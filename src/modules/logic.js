import { BlockStarter } from "./base.js";

const ifElement = class If extends BlockStarter {
  constructor() {
    super(["cond"]);
  }
};

const elseElement = class Else extends BlockStarter {
  constructor(overloads = []) {
    super(overloads);
    if (this.applyTo == p5.prototype.ALL) {
      console.warning(
        `${this.constructor.elementName} apply-all attribute cannot be set to ALL:\n + ${this.html}`
      );
      this.setAttribute("apply-all", p5.prototype.CHILDREN);
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
  ifElement,
  elseElement,
  class ElseIf extends elseElement {
    constructor() {
      super(["cond"]);
    }
    get fnStr() {
      return `else if(${this.cond}) {`;
    }
  },
  class Switch extends BlockStarter {
    constructor() {
      super(["exp"]);
    }
    get fnStr() {
      return `switch(${this.exp}) {`;
    }
  },
  class Case extends BlockStarter {
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
