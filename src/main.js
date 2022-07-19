import Base from "./modules/base.js";
import Environment from "./modules/environment.js";
import Color from "./modules/color.js";
import "./modules/math.js";
import Logic from "./modules/logic.js";
import Shape from "./modules/shape.js";
import "./modules/transform.js";
import "./modules/events.js";

//  Create an HTML element for every class from modules
[Environment, Color, Base, Logic, Shape].flat(Infinity).forEach((el) => {
  customElements.define(el.elementName, el);
});
