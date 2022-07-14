import { P5BlockStarter } from "./base.js";

const ifElement = class If extends P5BlockStarter {
  constructor() {
    super(["cond"]);
  }
};

export default [
  class Iterate extends P5BlockStarter {
    constructor() {
      super(["test", "init, test, update"]);
    }
    get fnName() {
      if (this.params[0] === "test") return "while";
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
