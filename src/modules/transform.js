p5.prototype._defaultAnchor = p5.prototype.createVector();
p5.prototype._anchorStack = [p5.prototype._defaultAnchor];

p5.prototype._defaultAngle = 0;
p5.prototype._angleStack = [p5.prototype._defaultAngle];

p5.prototype._defaultScale = p5.prototype.createVector(1);
p5.prototype._scaleStack = [p5.prototype._defaultScale];

p5.prototype._pushBase = p5.prototype.push;
p5.prototype.push = function () {
  this._anchorStack.push(this._defaultAnchor);
  this._angleStack.push(this._defaultAngle);
  this._scaleStack.push(this._defaultScale);
  this._pushBase();
};

p5.prototype._popBase = p5.prototype.pop;
p5.prototype.pop = function () {
  this._anchorStack.pop();
  this._angleStack.pop();
  this._scaleStack.pop();
  this._popBase();
};

p5.prototype.registerMethod("pre", function () {
  this._setProperty("_anchorStack", [this._defaultAnchor]);
  this._setProperty("_angleStack", [this._defaultAngle]);
  this._setProperty("_scaleStack", [this._defaultScale]);
});

p5.prototype.setScale = p5.prototype.scale;

p5.prototype._defineProperties({
  anchor: {
    get: function () {
      return this._anchorStack.slice(-1)[0];
    },
    set: function (val) {
      if (typeof val === "array")
        this._anchorStack[this._anchorStack.length - 1].set(...val);
      else this._anchorStack[this._anchorStack.length - 1].set(val);
      this.translate(this.anchor);
    },
  },
  angle: {
    get: function () {
      return this._angleStack.slice(-1)[0];
    },
    set: function (val) {
      this._angleStack[this._anchorStack.length - 1] = val;
      this.rotate(this.angle);
    },
  },
  scale: {
    get: function () {
      return this._scaleStack.slice(-1)[0];
    },
    set: function (val) {
      if (typeof val === "array")
        this._scaleStack[this._scaleStack.length - 1].set(...val);
      else this._scaleStack[this._scaleStack.length - 1].set(val);
      this.scale(this.scaling);
    },
  },
});
