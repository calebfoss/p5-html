import { BlockStarter } from "./base.js";

const elseElement = class Else extends BlockStarter {
  constructor(overloads = []) {
    super(overloads);
  }
  get fnStr() {
    return "else {";
  }
};

p5.prototype._registerElements(
  class RepeatIf extends BlockStarter {
    constructor() {
      super(["cond"]);
    }
    get fnName() {
      return "while";
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
    get isBlock() {
      return false;
    }
  }
);
