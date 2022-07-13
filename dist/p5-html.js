//  CASING CONVERTERS
const $b68a3fd635640d2f$export$e12f55f9c91df96a = (camelStr)=>camelStr.replace(/(?<!^)[A-Z]/g, (letter)=>"-" + letter).toLowerCase();
const $b68a3fd635640d2f$export$b70dcce1c70696bf = (snakeStr)=>snakeStr.replace(/-./g, (s)=>s[1].toUpperCase());
//  p5 functions that set transfromation, style, modes, etc.
const $b68a3fd635640d2f$export$79786cd53acde640 = [
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


class $c3ced10543a97d52$export$285e69c7b059ee7 extends HTMLElement {
    constructor(){
        super();
        //  Save settings with atributes
        this.settings = (0, $b68a3fd635640d2f$export$79786cd53acde640).filter((s)=>this.hasAttribute((0, $b68a3fd635640d2f$export$e12f55f9c91df96a)(s)));
        //  Create property for each setting and assign attribute value
        this.settings.forEach((setting)=>this[setting] = this.getAttribute((0, $b68a3fd635640d2f$export$e12f55f9c91df96a)(setting)));
    }
    //  Create string to call functions for each setting
    setStr(tabs) {
        return this.settings.length ? this.settings.map((s)=>`${tabs}${s}(${this[s]})`).join(";\n") + ";\n" : "";
    }
    codeString(tabs) {
        return this.setStr(tabs);
    }
}
class $c3ced10543a97d52$export$d546242e33fb8131 extends $c3ced10543a97d52$export$285e69c7b059ee7 {
    constructor(overloads){
        super();
        let overloadMatch = false;
        //  Start with overloads with most parameters
        overloads.reverse();
        this.params = [];
        if (overloads.length === 0) overloadMatch = true;
        for(const i in overloads){
            const overloadParams = overloads[i].split(",").map((s)=>s.trim());
            //  Check every required parameter has an attribute
            overloadMatch = overloadParams.every((p)=>this.hasAttribute(p) || p.slice(0, 1) === "[" && p.slice(-1) === "]");
            //  If matched overload found
            if (overloadMatch) {
                //  Save parameters with attributes
                this.params = overloadParams.filter((p)=>this.hasAttribute(p));
                //  Create property for each parameter and assign attribute value
                this.params.forEach((param)=>this[param] = this.getAttribute(param));
                break;
            }
        }
        if (!overloadMatch) console.error(`No overloads for ${this.fnName} match provided parameters:`, this.attributes);
    }
    childStr(tabs) {
        return this.children.length ? Array.from(this.children).map((child)=>child instanceof $c3ced10543a97d52$export$285e69c7b059ee7 ? child.codeString(tabs) : "").join("\n") + "\n" : "";
    }
    codeString(tabs) {
        //  Concat settings and function between push and pop
        return `${tabs}push();\n${this.setStr(tabs)}` + `${this.fnStr(tabs)}${this.childStr(tabs)}${tabs}pop();`;
    }
    get fnName() {
        return this.constructor.name.toLowerCase();
    }
    //  Create string to call function with provided arguments
    fnStr(tabs) {
        return `${tabs}${this.fnName}(${this.params.map((p)=>this[p])});\n`;
    }
}
class $c3ced10543a97d52$export$800a87ba475d5e7d extends $c3ced10543a97d52$export$d546242e33fb8131 {
    constructor(overloads){
        super(overloads);
    }
    codeString(tabs) {
        const innerTabs = tabs + "	";
        //  Concat settings and function between push and pop
        return `${this.fnStr(tabs)} {\n${innerTabs}push();\n` + `${this.setStr(innerTabs)}${this.childStr(innerTabs)}` + `${innerTabs}pop();\n${tabs}}`;
    }
    //  Create string to call function with provided arguments
    fnStr(tabs) {
        return `${tabs}${this.fnName}(${this.params.map((p)=>this[p]).join("; ")})`;
    }
}
var $c3ced10543a97d52$export$2e2bcd8739ae039 = [
    class Setting extends $c3ced10543a97d52$export$285e69c7b059ee7 {
        constructor(){
            super();
        }
    },
    class Sketch extends $c3ced10543a97d52$export$d546242e33fb8131 {
        constructor(){
            const overloads = [
                "width, height, [renderer]"
            ];
            super(overloads);
        }
        codeString(tabs) {
            return `${this.setStr(tabs)}${this.childStr(tabs)}`;
        }
    },
    class State extends $c3ced10543a97d52$export$285e69c7b059ee7 {
        constructor(){
            super();
        }
        assignStr(tabs) {
            return Array.from(this.attributes).map((a)=>`${tabs}${a.name} = ${this.getAttribute(a.name)};`).join("\n");
        }
        codeString(tabs) {
            return `${this.setStr(tabs)}${this.assignStr(tabs)}`;
        }
    }, 
];



class $ab14b61b7680f5c8$var$P5ColorFunction extends (0, $c3ced10543a97d52$export$d546242e33fb8131) {
    constructor(overloads){
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
var $ab14b61b7680f5c8$export$2e2bcd8739ae039 = [
    class Background extends $ab14b61b7680f5c8$var$P5ColorFunction {
        constructor(){
            const overloads = [
                "colorstring, [a]",
                "gray, [a]",
                "v1, v2, v3, [a]"
            ];
            super(overloads);
        }
    }, 
];



const $1d55177ed90d18c3$var$ifElement = class If extends (0, $c3ced10543a97d52$export$800a87ba475d5e7d) {
    constructor(){
        super([
            "condition"
        ]);
    }
};
var $1d55177ed90d18c3$export$2e2bcd8739ae039 = [
    class Iterate extends (0, $c3ced10543a97d52$export$800a87ba475d5e7d) {
        constructor(){
            super([
                "test",
                "init, test, update"
            ]);
        }
        get fnName() {
            if (this.params[0] === "test") return "while";
            return "for";
        }
    },
    $1d55177ed90d18c3$var$ifElement,
    class Else extends (0, $c3ced10543a97d52$export$800a87ba475d5e7d) {
        constructor(){
            super([]);
        }
        fnStr(tabs) {
            return tabs + "else";
        }
    },
    class ElseIf extends $1d55177ed90d18c3$var$ifElement {
        constructor(){
            super();
        }
        fnStr(tabs) {
            return `${tabs}else if(${this.condition})`;
        }
    }, 
];



var $a823b045b564fdba$export$2e2bcd8739ae039 = [
    class Arc extends (0, $c3ced10543a97d52$export$d546242e33fb8131) {
        constructor(){
            const overloads = [
                "x, y, w, h, start, stop, [mode], [detail], image, [a]", 
            ];
            super(overloads);
        }
    },
    class Ellipse extends (0, $c3ced10543a97d52$export$d546242e33fb8131) {
        constructor(){
            const overloads = [
                "x, y, w, [h]",
                "x, y, w, h, [detail]"
            ];
            super(overloads);
        }
    },
    class Circle extends (0, $c3ced10543a97d52$export$d546242e33fb8131) {
        constructor(){
            const overloads = [
                "x, y, d"
            ];
            super(overloads);
        }
    },
    class Line extends (0, $c3ced10543a97d52$export$d546242e33fb8131) {
        constructor(){
            const overloads = [
                "x1, y1, x2, y2",
                "x1, y1, z1, x2, y2, z2"
            ];
            super(overloads);
        }
    },
    class Point extends (0, $c3ced10543a97d52$export$d546242e33fb8131) {
        constructor(){
            const overloads = [
                "x, y, [z]",
                "coordinate_vector"
            ];
            super(overloads);
        }
    },
    class Quad extends (0, $c3ced10543a97d52$export$d546242e33fb8131) {
        constructor(){
            const overloads = [
                "x1, y1, x2, y2, x3, y3, x4, y4, [detailX], [detailY]",
                "x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4, [detailX], [detailY]", 
            ];
            super(overloads);
        }
    },
    class Rect extends (0, $c3ced10543a97d52$export$d546242e33fb8131) {
        constructor(){
            const overloads = [
                "x, y, w, [h], [tl], [tr], [br], [bl]",
                "x, y, w, h, [detailX], [detailY]", 
            ];
            super(overloads);
        }
    },
    class Square extends (0, $c3ced10543a97d52$export$d546242e33fb8131) {
        constructor(){
            const overloads = [
                "x, y, s, [tl], [tr], [br], [bl]"
            ];
            super(overloads);
        }
    },
    class Triangle extends (0, $c3ced10543a97d52$export$d546242e33fb8131) {
        constructor(){
            const overloads = [
                "x1, y1, x2, y2, x3, y3"
            ];
            super(overloads);
        }
    }, 
];



//  Create an HTML element for every class from modules
[
    (0, $ab14b61b7680f5c8$export$2e2bcd8739ae039),
    (0, $c3ced10543a97d52$export$2e2bcd8739ae039),
    (0, $1d55177ed90d18c3$export$2e2bcd8739ae039),
    (0, $a823b045b564fdba$export$2e2bcd8739ae039)
].map((module)=>Object.entries(module).map(([key, value])=>value)).flat().forEach((el)=>{
    customElements.define(`p5-${(0, $b68a3fd635640d2f$export$e12f55f9c91df96a)(el.name)}`, el);
});
const $95930220612465e5$var$sketch = document.querySelector("p5-sketch");
p5.prototype.test = 123;
window["setup"] = function setup() {
    createCanvas($95930220612465e5$var$sketch.width, $95930220612465e5$var$sketch.height).parent($95930220612465e5$var$sketch);
};
window["draw"] = function draw() {
    Function($95930220612465e5$var$sketch.codeString("	"))();
    for(let i = 0; i < $95930220612465e5$var$sketch.children.length; i++)if ($95930220612465e5$var$sketch.children[i].hasAttribute("self-destruct")) $95930220612465e5$var$sketch.children[i].remove();
};


//# sourceMappingURL=p5-html.js.map
