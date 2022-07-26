//  casing converters
export const camelToKebab = (camelStr) =>
  camelStr.replace(/(?<!^)[A-Z]/g, (letter) => "-" + letter).toLowerCase();
export const kebabToCamel = (kebabStr) =>
  kebabStr.replace(/-./g, (s) => s[1].toUpperCase());
export const pascalToCamel = (pascalStr) =>
  pascalStr.slice(0, 1).toLowerCase() + pascalStr.slice(1);
export const pascalToSnake = (pascalStr) =>
  pascalToCamel(pascalStr).replaceAll(/[A-Z]/g, (c) => "_" + c.toLowerCase());
export const snakeToCamel = (snakeStr) =>
  snakeStr
    .split("_")
    .map((s, i) => (i > 0 ? s.slice(0, 1).toUpperCase() + s.slice(1) : s))
    .join("");
