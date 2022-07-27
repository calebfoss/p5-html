import { P5Function, PositionedFunction } from "./base.js";

p5.prototype._registerElements(
  class Arc extends PositionedFunction {
    constructor() {
      super(["x, y, w, h, start, stop, [mode], [detail], image, [a]"]);
    }
  },
  class Ellipse extends PositionedFunction {
    constructor() {
      super(["x, y, w, [h]", "x, y, w, h, [detail]"]);
    }
  },
  class Circle extends PositionedFunction {
    constructor() {
      super(["x, y, d"]);
    }
  },
  class Line extends PositionedFunction {
    constructor() {
      super(["x1, y1, x2, y2", "x1, y1, z1, x2, y2, z2"]);
    }
  },
  class Point extends PositionedFunction {
    constructor() {
      super(["x, y, [z]", "coordinate_vector"]);
    }
  },
  class Quad extends PositionedFunction {
    constructor() {
      super([
        "x1, y1, x2, y2, x3, y3, x4, y4, [detailX], [detailY]",
        "x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4, [detailX], [detailY]",
      ]);
    }
  },
  class Rect extends PositionedFunction {
    constructor() {
      super([
        "x, y, w, [h], [tl], [tr], [br], [bl]",
        "x, y, w, h, [detailX], [detailY]",
      ]);
    }
  },
  class Square extends PositionedFunction {
    constructor() {
      super(["x, y, s, [tl], [tr], [br], [bl]"]);
    }
  },
  class Triangle extends PositionedFunction {
    constructor() {
      const overloads = ["x1, y1, x2, y2, x3, y3"];
      super(overloads);
    }
  },
  class Bezier extends PositionedFunction {
    constructor() {
      super([
        "x1, y1, x2, y2, x3, y3, x4, y4",
        "x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4",
      ]);
    }
  },
  class BezierPoint extends P5Function {
    constructor() {
      super(["a, b, c, d, t", "x1, y1, x2, y2, x3, y3, x4, y4, t"]);
    }
    returnsVal = true;
  },
  class BezierTangent extends P5Function {
    constructor() {
      super(["a, b, c, d, t", "x1, y1, x2, y2, x3, y3, x4, y4, t"]);
    }
    returnsVal = true;
  },
  class Curve extends PositionedFunction {
    constructor() {
      super([
        "x1, y1, x2, y2, x3, y3, x4, y4",
        "x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4",
      ]);
    }
  },
  class CurvePoint extends P5Function {
    constructor() {
      super(["a, b, c, d, t", "x1, y1, x2, y2, x3, y3, x4, y4, t"]);
    }
    returnsVal = true;
  },
  class CurveTangent extends P5Function {
    constructor() {
      super(["a, b, c, d, t", "x1, y1, x2, y2, x3, y3, x4, y4, t"]);
    }
    returnsVal = true;
  }
);
const pointTangentOverload = (fn) =>
  function () {
    const args = arguments;
    if (args.length !== 9) return fn(...args);
    return this.createVector(
      fn(args[0], args[2], args[4], args[6], args[8]),
      fn(args[1], args[3], args[5], args[7], args[8])
    );
  };
p5.prototype.bezierPoint = pointTangentOverload(p5.prototype.bezierPoint);
p5.prototype.bezierTangent = pointTangentOverload(p5.prototype.bezierTangent);
p5.prototype.curvePoint = pointTangentOverload(p5.prototype.curvePoint);
p5.prototype.curveTangent = pointTangentOverload(p5.prototype.curveTangent);
p5.prototype.yesSmooth = p5.prototype.smooth;

p5.prototype._defineProperties({
  ellipse_mode: {
    get: function () {
      return this._renderer?._ellipseMode;
    },
    set: function (val) {
      this.ellipseMode(val);
    },
  },
  smooth: {
    get: function () {
      if (this._renderer?.isP3D)
        return this._renderer._pInst._glAttributes?.antialias;
      return this.drawingContext?.imageSmoothingEnabled;
    },
    set: function (val) {
      if (val) this.yesSmooth();
      else this.noSmooth();
    },
  },
  stroke_cap: {
    get: function () {
      if (this._renderer?.isP3D) return this._renderer.strokeCap();
      return this.drawingContext?.lineCap;
    },
    set: function (val) {
      this.strokeCap(val);
    },
  },
  stroke_join: {
    get: function () {
      if (this._renderer?.isP3D) return this._renderer.strokeJoin();
      return this.drawingContext?.lineJoin;
    },
    set: function (val) {
      this.strokeJoin(val);
    },
  },
  stroke_weight: {
    get: function () {
      if (this._renderer?.isP3D) return this._renderer.curStrokeWeight;
      return this.drawingContext?.lineWidth;
    },
    set: function (val) {
      this.strokeWeight(val);
    },
  },
  bezier_detail: {
    get: function () {
      return this._renderer?._pInst._bezierDetail;
    },
    set: function (val) {
      this.bezierDetail(val);
    },
  },
  curve_detail: {
    get: function () {
      return this._renderer?._pInst._curveDetail;
    },
    set: function (val) {
      this.curveDetail(val);
    },
  },
  curve_tightness: {
    get: function () {
      return this._renderer?._curveTightness;
    },
    set: function (val) {
      this.curveTightness(val);
    },
  },
});
