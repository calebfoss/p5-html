p5.prototype.mouseDown = false;

p5.prototype.mouseUp = false;

p5.prototype.mouseHeld = false;

p5.prototype.mouseDragging = false;

p5.prototype.keyDown = false;

p5.prototype.keyUp = false;

p5.prototype._onkeyupbase = p5.prototype._onkeyup;
p5.prototype._onkeyup = function (e) {
  this._onkeyupbase(e);
  this._setProperty("keyUp", true);
};

p5.prototype.firstFrame = true;

p5.prototype.registerMethod("pre", function () {
  this._setProperty("mouseDown", this.mouseIsPressed && !this.mouseDown);
  this._setProperty(
    "mouseUp",
    this.mouseIsPressed == false && this.mouseHeld == true
  );
  this._setProperty("mouseHeld", this.mouseIsPressed);
  this._setProperty(
    "mouseDragging",
    this.mouseHeld && (this.movedX || this.movedY)
  );
  this._setProperty("keyDown", this.keyIsPressed && !this.keyDown);
});

p5.prototype.registerMethod("post", function () {
  this._setProperty("mouseDown", false);
  this._setProperty("firstFrame", false);
  this._setProperty("keyUp", false);
});
