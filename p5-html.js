import * as Base from "./modules/base.js";
import * as Color from "./modules/color.js";
import * as Logic from "./modules/logic.js";
import * as Shape from "./modules/shape.js";
import { camelToSnake } from "./modules/utils.js";

(() => {
  const els = [Color, Base, Logic, Shape]
    .map((module) => Object.entries(module).map(([key, value]) => value))
    .flat();
  console.log(els);
  for (const i in els) {
    customElements.define(`p5-${camelToSnake(els[i].name)}`, els[i]);
  }
})();

const sketch = document.querySelector("p5-sketch");

function setup() {
  createCanvas(sketch.width, sketch.height).parent(sketch);
  print(sketch.codeString("\t"));
}

function draw() {
  Function(sketch.codeString("\t"))();
  for (let i = 0; i < sketch.children.length; i++) {
    if (sketch.children[i].hasAttribute("self-destruct")) {
      sketch.children[i].remove();
    }
  }
}
