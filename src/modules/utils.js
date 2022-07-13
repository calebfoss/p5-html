//  CASING CONVERTERS
const camelToSnake = (camelStr) =>
  camelStr.replace(/(?<!^)[A-Z]/g, (letter) => "-" + letter).toLowerCase();
const snakeToCamel = (snakeStr) =>
  snakeStr.replace(/-./g, (s) => s[1].toUpperCase());

//  p5 functions that set transfromation, style, modes, etc.
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

export { allSettings, camelToSnake, snakeToCamel };
