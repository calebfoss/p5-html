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
  class Switch extends BlockStarter {
    constructor() {
      super(["expression"]);
    }
  },
  class Case extends BlockStarter {
    constructor() {
      super(["val"]);
    }
    get blockEnd() {
      return "break;";
    }
    get codeStrings() {
      return [
        this.comment,
        this.fnStr,
        ...[
          ...this.assignStrings,
          this.pushStr,
          ...this.setStrings,
          ...this.childStrings,
          this.popStr,
          this.endInner,
        ].map(this.constructor.addTab, this),
      ];
    }
    get endInner() {
      return "break;";
    }
    get fnStr() {
      return `case ${this.val}:`;
    }
    get isBlock() {
      return false;
    }
  }
);
