(() => {
  //  CASING CONVERTERS
  const camelToSnake = (camelStr) =>
    camelStr.replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
  const snakeToCamel = (snakeStr) =>
    snakeStr.replace(/-./g, (s) => s[1].toUpperCase());
  const allSettings = [
    "translate",
    "rotate",
    "rotateX",
    "rotateY",
    "rotateZ",
    "scale",
    "shearX",
    "shearY",
    "colorMode",
    "erase",
    "noErase",
    "fill",
    "noFill",
    "noStroke",
    "stroke",
    "ellipseMode",
    "noSmooth",
    "rectMode",
    "smooth",
    "strokeCap",
    "strokeJoin",
    "strokeWeight",
  ];

  class P5El extends HTMLElement {
    constructor() {
      super();
      els.push(this);
    }
  }

  class P5Function extends P5El {
    constructor(overloads) {
      super();

      //  Save settings with atributes
      this.settings = allSettings.filter((s) =>
        this.hasAttribute(camelToSnake(s))
      );
      //  Create getter for each setting attribute
      this.settings.forEach((setting) =>
        Object.defineProperty(this, setting, {
          get: () => this.getAttribute(camelToSnake(setting)),
        })
      );

      let overloadMatch = false;
      //  Start with overloads with most parameters
      overloads.reverse();
      if (overloads.length === 0) {
        this.params = [];
        this.settings = [];
        overloadMatch = true;
      }
      for (const i in overloads) {
        const overloadParams = overloads[i].split(",").map((s) => s.trim());
        //  Check every required parameter has an attribute
        overloadMatch = overloadParams.every(
          (p) =>
            this.hasAttribute(p) ||
            (p.slice(0, 1) === "[" && p.slice(-1) === "]")
        );
        //  If matched overload found
        if (overloadMatch) {
          //  Save parameters with attributes
          this.params = overloadParams.filter((p) => this.hasAttribute(p));
          //  Create getter for each parameter attribute
          this.params.forEach((param) =>
            Object.defineProperty(this, param, {
              get: () => this.getAttribute(param),
            })
          );
          break;
        }
      }
      if (!overloadMatch)
        console.error(
          `No overloads for ${this.fnName} match provided parameters:`,
          this.attributes
        );
      console.log(this.constructor.name, this.codeString);
    }
    get childStr() {
      return this.children.length
        ? Array.from(this.children)
            .map((child) => child.codeString)
            .join(";\n") + ";"
        : "";
    }
    get codeString() {
      //  Concat settings and function between push and pop
      return `push(); 
        ${this.setStr}; 
        ${this.fnStr};
        ${this.childStr};
        pop();`;
    }
    get fnName() {
      return this.constructor.name.toLowerCase();
    }
    //  Create string to call function with provided arguments
    get fnStr() {
      return `${this.fnName}(${this.params.map((p) => this[p])})`;
    }
    //  Create string to call functions for each setting
    get setStr() {
      return this.settings.length
        ? this.settings.map((s) => `${s}(${this[s]})`).join(";\n") + ";"
        : "";
    }
  }

  class P5ColorFunction extends P5Function {
    constructor(overloads) {
      overloads = [
        "v1, v2, v3, [alpha]",
        "value",
        "gray, [alpha]",
        "values",
        "color",
        ...overloads,
      ];
      super(overloads);
    }
  }

  class P5BlockStarter extends P5Function {
    constructor(overloads) {
      super(overloads);
    }
    get codeString() {
      //  Concat settings and function between push and pop
      return `${this.fnStr} {
          push();
          ${this.setStr}
          ${this.childStr};
          pop();
        }`;
    }
    //  Create string to call function with provided arguments
    get fnStr() {
      return `${this.fnName}(${this.params.map((p) => this[p]).join(";")})`;
    }
  }
  const els = [
    class Sketch extends P5Function {
      constructor() {
        const overloads = ["width, height, [renderer]"];
        super(overloads);
      }
      get codeString() {
        return Array.from(this.children)
          .map((c) => c.codeString)
          .join("\n");
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
      get fnStr() {
        return "else";
      }
    },
    class State extends P5El {
      constructor() {
        super();
      }
      get codeString() {
        return (
          Array.from(this.attributes)
            .map((a) => `${a.name} = ${this.getAttribute(a.name)}`)
            .join(";") + ";"
        );
      }
    },

    class Background extends P5ColorFunction {
      constructor() {
        const overloads = ["colorstring, [a]", "gray, [a]", "v1, v2, v3, [a]"];
        super(overloads);
      }
    },

    class Arc extends P5Function {
      constructor() {
        const overloads = [
          "x, y, w, h, start, stop, [mode], [detail], image, [a]",
        ];
        super(overloads);
      }
    },
    class Ellipse extends P5Function {
      constructor() {
        const overloads = ["x, y, w, [h]", "x, y, w, h, [detail]"];
        super(overloads);
      }
    },
    class Circle extends P5Function {
      constructor() {
        const overloads = ["x, y, d"];
        super(overloads);
      }
    },
    class Line extends P5Function {
      constructor() {
        const overloads = ["x1, y1, x2, y2", "x1, y1, z1, x2, y2, z2"];
        super(overloads);
      }
    },
    class Point extends P5Function {
      constructor() {
        const overloads = ["x, y, [z]", "coordinate_vector"];
        super(overloads);
      }
    },
    class Quad extends P5Function {
      constructor() {
        const overloads = [
          "x1, y1, x2, y2, x3, y3, x4, y4, [detailX], [detailY]",
          "x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4, [detailX], [detailY]",
        ];
        super(overloads);
      }
    },
    class Rect extends P5Function {
      constructor() {
        const overloads = [
          "x, y, w, [h], [tl], [tr], [br], [bl]",
          "x, y, w, h, [detailX], [detailY]",
        ];
        super(overloads);
      }
    },
    class Square extends P5Function {
      constructor() {
        const overloads = ["x, y, s, [tl], [tr], [br], [bl]"];
        super(overloads);
      }
    },
    class Triangle extends P5Function {
      constructor() {
        const overloads = ["x1, y1, x2, y2, x3, y3"];
        super(overloads);
      }
    },
  ];
  for (const i in els) {
    customElements.define(`p5-${els[i].name.toLowerCase()}`, els[i]);
  }
})();

const sketch = document.querySelector("p5-sketch");

function setup() {
  createCanvas(sketch.width, sketch.height).parent(sketch);
  console.log(sketch.codeString);
}

function draw() {
  Function(sketch.codeString)();
  for (let i = 0; i < sketch.children.length; i++) {
    if (sketch.children[i].hasAttribute("self-destruct")) {
      sketch.children[i].remove();
    }
  }
}
