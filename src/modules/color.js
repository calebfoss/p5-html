import { P5Function } from "./base.js";

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

export default [
  class Background extends P5ColorFunction {
    constructor() {
      const overloads = ["colorstring, [a]", "gray, [a]", "v1, v2, v3, [a]"];
      super(overloads);
    }
  },
];
