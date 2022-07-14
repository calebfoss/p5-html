//  casing converters
export const camelToSnake = (camelStr) =>
  camelStr.replace(/(?<!^)[A-Z]/g, (letter) => "-" + letter).toLowerCase();
export const snakeToCamel = (snakeStr) =>
  snakeStr.replace(/-./g, (s) => s[1].toUpperCase());

//  functions that set style, modes, etc.
export const allSettings = [
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
  "angleMode",
];

// transformation functions
export const transforms = [
  "anchor",
  "rotate",
  "rotateX",
  "rotateY",
  "rotateZ",
  "scale",
  "shearX",
  "shearY",
];
