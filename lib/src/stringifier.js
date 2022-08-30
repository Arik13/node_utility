"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = exports.convertToASCII = exports.searchForNonASCII = void 0;
const Types_1 = require("ts_utility/dist/src/Types");
let searchForNonASCII = (str) => {
    let codes = str.split("")
        .filter(c => c.charCodeAt(0) > 255)
        .sort()
        .filter((x, i, a) => (i == 0 || a[i - 1] != x));
    console.log(codes);
};
exports.searchForNonASCII = searchForNonASCII;
let convertToASCII = (str) => str.split("").map(c => nonASCIIMap[c] ? nonASCIIMap[c] : c).join("");
exports.convertToASCII = convertToASCII;
const nonASCIIMap = {
    '×': "x",
    '‐': "-",
    '–': "-",
    '−': "-",
    '‑': "-",
    '’': "'",
    '“': "\"",
};
let genOptions = (...o) => {
    let options = {
        useFlatRows: false,
        flatKeys: [],
        flattenSingleKeyObjects: false,
        numSpaces: 4,
    };
    if (!o)
        return options;
    o.forEach(optionsArg => options = Object.assign(options, optionsArg));
    return options;
};
const LEFT_PARENTHESES = "(".charCodeAt(0);
const RIGHT_PARENTHESES = ")".charCodeAt(0);
const LEFT_CURLY_BRACE = "{".charCodeAt(0);
const RIGHT_CURLY_BRACE = "}".charCodeAt(0);
const LEFT_SQUARE_BRACKET = "[".charCodeAt(0);
const RIGHT_SQUARE_BRACKET = "]".charCodeAt(0);
const BACKSLASH = "\\".charCodeAt(0);
const QUOTE = "\"".charCodeAt(0);
const COMMA = ",".charCodeAt(0);
const COLON = ":".charCodeAt(0);
const SPACE = " ".charCodeAt(0);
const TAB = "\t".charCodeAt(0);
const RETURN = "\r".charCodeAt(0);
const ESCAPE_CHARACTERS = [
    "\\",
    "\"",
];
let charToCode = (c) => {
    var _a;
    c = (_a = nonASCIIMap[c]) !== null && _a !== void 0 ? _a : c;
    let code = c.charCodeAt(0);
    if (code > 256)
        throw new Error(`Non ascii character: ${c} ${code}`);
    return ESCAPE_CHARACTERS.includes(c) ? [BACKSLASH, code] : code;
};
let primToCodes = (num, o) => String(num).split("").map(x => charToCode(x));
let stringToCodes = (str, o) => [QUOTE, ...primToCodes(str, o), QUOTE];
let createIndent = (depth, o) => {
    return o.useTabs ? Array(depth).fill(TAB) : Array(depth * o.numSpaces).fill(SPACE);
};
let genFlatCollectionFormatting = () => ({
    first: [],
    last: [],
    prefix: [],
    suffix: [COMMA, SPACE],
});
let genDefaultCollectionFormatting = (depth, o) => ({
    first: [RETURN],
    last: [RETURN, ...createIndent(depth, o)],
    prefix: createIndent(depth + 1, o),
    suffix: [COMMA, RETURN],
});
let collectionToCodes = (rows, depth, left, right, o) => {
    let f = o.useFlatRows ? genFlatCollectionFormatting() : genDefaultCollectionFormatting(depth, o);
    let formattedRows = rows.map(x => [f.prefix, x, f.suffix]).flat(Infinity);
    f.suffix.forEach(x => formattedRows.pop());
    return [left, f.first, formattedRows, f.last, right].flat(Infinity);
};
let arrayToCodes = (arr, depth, o) => {
    let rowCodes = Object.entries(arr)
        .filter(x => x[1] !== undefined)
        .map(x => {
        let options = genOptions(o, { useFlatRows: arr.some(x => Array.isArray(x)) });
        return elementHandler(x[1], depth + 1, options);
    });
    return collectionToCodes(rowCodes, depth, LEFT_SQUARE_BRACKET, RIGHT_SQUARE_BRACKET, o);
};
let objToCodes = (obj, depth, o) => {
    let rowCodes = Object.entries(obj)
        .filter(x => x[1] !== undefined)
        .map(x => {
        let options = genOptions(o, { useFlatRows: o.flatKeys.includes(x[0]) });
        return objRowToCodes(x[0], x[1], depth, options);
    });
    let options = genOptions(o);
    options.useFlatRows = (rowCodes.length == 1 && typeof Object.values(obj)[0] != "object" && o.flattenSingleKeyObjects) || rowCodes.length == 0;
    return collectionToCodes(rowCodes, depth, LEFT_CURLY_BRACE, RIGHT_CURLY_BRACE, options);
};
let objRowToCodes = (key, val, depth, o) => [stringToCodes(key, o), COLON, SPACE, elementHandler(val, depth + 1, o)];
let elementHandler = (el, depth, o) => {
    let type = Array.isArray(el) ? "array" : typeof el;
    switch (type) {
        case "string": return stringToCodes(el, o);
        case "number": return primToCodes(el, o);
        case "boolean": return primToCodes(el, o);
        case "array": return arrayToCodes(el, depth, o);
        case "object": return objToCodes(el, depth, o);
    }
};
let convertToASCIICodes = (obj, options) => elementHandler(obj, 0, options).flat(Infinity);
let stringify = (obj, options) => {
    let o = genOptions(options);
    let asciiCodes = convertToASCIICodes(obj, o);
    let buffer = Buffer.from(asciiCodes);
    return buffer.toLocaleString();
};
exports.stringify = stringify;
//# sourceMappingURL=stringifier.js.map