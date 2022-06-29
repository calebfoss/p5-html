import primitives2D from "./modules/shape.js";

(() => {

  const els = [
    class Setting extends P5El {
      constructor() {
        super();
      }
    },
    class Sketch extends P5Function {
      constructor() {
        const overloads = ["width, height, [renderer]"];
        super(overloads);
      }
      codeString(tabs) {
        return `${this.setStr(tabs)}
        ${this.childStr(tabs)}`;
      }
    },
    class Iterate extends P5BlockStarter {
      constructor() {
        super(["test", "init, test, update"]);
      }
      get fnName() {
        if (this.params[0] === "test") return "while";
        return "for";
      }
    },
    class If extends P5BlockStarter {
      constructor() {
        super(["condition"]);
      }
    },
    class Else extends P5BlockStarter {
      constructor() {
        super([]);
      }
      fnStr(tabs) {
        return tabs + "else";
      }
    },
    class ElseIf extends P5BlockStarter {
      constructor() {
        super(["condition"]);
      }
      fnStr(tabs) {
        return `${tabs}else if(${this.condition})`;
      }
    },
    class State extends P5El {
      constructor() {
        super();
      }
      codeString(tabs) {
        return Array.from(this.attributes)
          .map((a) => `${tabs}${a.name} = ${this.getAttribute(a.name)};`)
          .join("\n");
      }
    },

    class Background extends P5ColorFunction {
      constructor() {
        const overloads = ["colorstring, [a]", "gray, [a]", "v1, v2, v3, [a]"];
        super(overloads);
      }
    },
    ...primitives2D,
  ];
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
