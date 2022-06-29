import {P5BlockStarter} from "./base.js";

class Iterate extends P5BlockStarter {
  constructor() {
    super(["test", "init, test, update"]);
  }
  get fnName() {
    if (this.params[0] === "test") return "while";
    return "for";
  }
}

class If extends P5BlockStarter {
  constructor() {
    super(["condition"]);
  }
}

class Else extends P5BlockStarter {
  constructor() {
    super([]);
  }
  fnStr(tabs) {
    return tabs + "else";
  }
}

class ElseIf extends P5BlockStarter {
  constructor() {
    super(["condition"]);
  }
  fnStr(tabs) {
    return `${tabs}else if(${this.condition})`;
  }
}
