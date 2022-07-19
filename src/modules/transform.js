p5.prototype._defaultAnchor = p5.prototype.createVector();
p5.prototype._anchor = [p5.prototype._defaultAnchor];

p5.prototype._defaultRotation = 0;
p5.prototype._rotation = [p5.prototype._defaultRotation];

p5.prototype._defaultScaling = p5.prototype.createVector(1);
p5.prototype._scaling = [p5.prototype._defaultScaling];

p5.prototype._pushBase = p5.prototype.push;
p5.prototype.push = function () {
  this._anchor.push(this._defaultAnchor);
  this._rotation.push(this._defaultRotation);
  this._scaling.push(this._defaultScaling);
  this._pushBase();
};

p5.prototype._popBase = p5.prototype.pop;
p5.prototype.pop = function () {
  this._anchor.pop();
  this._rotation.pop();
  this._scaling.pop();
  this._popBase();
};

p5.prototype.registerMethod("pre", function () {
  this._setProperty("_anchor", [this._defaultAnchor]);
  this._setProperty("_rotation", [this._defaultRotation]);
  this._setProperty("_scaling", [this._defaultScaling]);
  if (typeof this.scaling === "undefined")
    Object.defineProperty(this._isGlobal ? window : this, "scaling", {
      get: function () {
        return this._scaling.slice(-1)[0];
      },
      set: function (val) {
        if (typeof val === "array") this.scaling.set(...val);
        else this.scaling.set(val);
        this.scale(this.scaling);
      },
    });
});

p5.prototype._gettersAndSetters.push(
  {
    name: "anchor",
    get: function () {
      return this._anchor.slice(-1)[0];
    },
    set: function (val) {
      if (typeof val === "array")
        this._anchor[this._anchor.length - 1].set(...val);
      this._anchor[this._anchor.length - 1].set(val);
      this.translate(this.anchor);
    },
  },
  {
    name: "rotation",
    get: function () {
      return this._rotation.slice(-1)[0];
    },
    set: function (angle) {
      this._rotation[this._rotation.length - 1] = angle;
      this.rotate(this.rotation);
    },
  }
);
