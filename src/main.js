import Base from "./modules/base.js";
import Color from "./modules/color.js";
import Logic from "./modules/logic.js";
import Shape from "./modules/shape.js";

//  Create an HTML element for every class from modules
[Color, Base, Logic, Shape]
  .map((module) => Object.entries(module).map(([key, value]) => value))
  .flat()
  .forEach((el) => {
    customElements.define(el.elementName, el);
  });

p5.prototype.anchor = function () {
  this.translate(...arguments);
};

p5.prototype.mouseDown = false;

p5.prototype._basemousedown = p5.prototype._onmousedown;

p5.prototype._onmousedown = function (e) {
  this._basemousedown(e);
  this._setProperty("mouseDown", true);
};

p5.prototype.mouseHeld = p5.prototype.mouseIsPressed;

p5.prototype.registerMethod("post", function () {
  this.mouseDown = false;
});
