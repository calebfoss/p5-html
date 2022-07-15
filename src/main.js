import Base from "./modules/base.js";
import Color from "./modules/color.js";
import Logic from "./modules/logic.js";
import Shape from "./modules/shape.js";
import "./modules/events.js";

//  Create an HTML element for every class from modules
[Color, Base, Logic, Shape]
  .map((module) => Object.entries(module).map(([key, value]) => value))
  .flat()
  .forEach((el) => {
    customElements.define(el.elementName, el);
  });
