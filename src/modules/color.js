import { P5Function } from "./base.js";

p5.prototype.NONE = "none";

class P5ColorFunction extends P5Function {
  constructor(overloads) {
    overloads = [
      "v1, v2, v3, [alpha]",
      "value",
      "gray, [alpha]",
      "values",
      "c",
      ...overloads,
    ];
    super(overloads);
  }
}

p5.prototype._gettersAndSetters.push(
  {
    name: "fill_color",
    get: function () {
      return this.drawingContext.fillStyle;
    },
    set: function (val) {
      if (val === this.NONE) this.noFill();
      else this.fill(val);
    },
  },
  {
    name: "stroke_color",
    get: function () {
      return this.drawingContext.strokeStyle;
    },
    set: function (val) {
      if (val === this.NONE) this.noStroke();
      else this.stroke(val);
    },
  }
);

export default [
  class Background extends P5ColorFunction {
    constructor() {
      super(["colorstring, [a]", "gray, [a]", "v1, v2, v3, [a]"]);
    }
  },
  class Clear extends P5Function {
    constructor() {
      super(["", "r, g, b, a"]);
    }
  },
];
