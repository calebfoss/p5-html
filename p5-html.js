import * as Base from "./modules/base.js";
import * as Color from "./modules/color.js";
import * as Logic from "./modules/logic.js";
import * as Shape from "./modules/shape.js";
import { camelToSnake } from "./modules/utils.js";

//  Create an HTML element for every class from modules
[Color, Base, Logic, Shape]
  .map((module) => Object.entries(module).map(([key, value]) => value))
  .flat()
  .forEach((el) => customElements.define(`p5-${camelToSnake(el.name)}`, el));

const sketch = document.querySelector("p5-sketch");

p5.prototype.test = 123;

window["setup"] = function setup() {
  createCanvas(sketch.width, sketch.height).parent(sketch);
  console.log(test);
};

window["draw"] = function draw() {
  Function(sketch.codeString("\t"))();
  for (let i = 0; i < sketch.children.length; i++) {
    if (sketch.children[i].hasAttribute("self-destruct")) {
      sketch.children[i].remove();
    }
  }
};
