import { P5BlockStarter } from "./base.js";

const ifElement = class If extends P5BlockStarter {
  constructor() {
    super(["cond"]);
  }
};

export default [
  class Iterate extends P5BlockStarter {
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

  class Else extends P5BlockStarter {
    constructor() {
      super([]);
    }
    fnStr(tabs) {
      return tabs + "else";
    }
  },

  class ElseIf extends ifElement {
    constructor() {
      super();
    }
    fnStr(tabs) {
      return `${tabs}else if(${this.cond})`;
    }
  },
];
