p5.prototype.mouse_down = false;

p5.prototype.mouse_up = false;

p5.prototype.mouse_dragging = false;

p5.prototype.key_down = false;

p5.prototype.key_up = false;

p5.prototype._onmousedownbase = p5.prototype._onmousedown;
p5.prototype._onmousedown = function (e) {
  this._onmousedownbase(e);
  this._setProperty("mouse_down", true);
};

p5.prototype._onmousemovebase = p5.prototype._onmousemove;
p5.prototype._onmousemove = function (e) {
  this._onmousemovebase(e);
  this._setProperty("mouse_dragging", this.mouseIsPressed);
};

p5.prototype._onkeyupbase = p5.prototype._onkeyup;
p5.prototype._onkeyup = function (e) {
  this._onkeyupbase(e);
  this._setProperty("key_up", true);
  this._setProperty("key_held", false);
};

p5.prototype._onkeydownbase = p5.prototype._onkeydown;
p5.prototype._onkeydown = function (e) {
  this._onkeydownbase(e);
  this._setProperty("key_down", true);
};

p5.prototype.registerMethod("pre", function () {
  this._setProperty(
    "mouse_up",
    this.mouseIsPressed == false && this.mouse_held == true
  );
  this._setProperty("mouse_held", this.mouseIsPressed);
  this._setProperty("key_held", this.key_down);
});

p5.prototype.registerMethod("post", function () {
  this._setProperty("mouse_down", false);
  this._setProperty("mouse_dragging", false);
  this._setProperty("key_up", false);
  this._setProperty("key_down", false);
});

p5.prototype._defineProperties({
  firstFrame: {
    get: function () {
      return this.frameCount === 1;
    },
  },
});
