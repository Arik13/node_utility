import { Primitive } from "@util/Types";

export let searchForNonASCII = (str: string) => {
    let codes = str.split("")
        .filter(c => c.charCodeAt(0) > 255)
        .sort()
        .filter((x, i, a) => (i == 0 || a[i-1] != x));
    console.log(codes);
}
export let convertToASCII = (str: string) => str.split("").map(c => nonASCIIMap[c]? nonASCIIMap[c] : c).join("");

const nonASCIIMap: {[key: string]: string} = {
    '×': "x",
    '‐': "-",
    '–': "-",
    '−': "-",
    '‑': "-",
    '’': "'",
    '“': "\"",
}

interface Options {
    useFlatRows?: boolean;
    flatKeys?: string[];
    flattenSingleKeyObjects?: boolean;
    numSpaces?: number,
    useTabs?: boolean,
}

let genOptions = (...o: Options[]): Options => {
    let options: Options = {
        useFlatRows: false,
        flatKeys: [],
        flattenSingleKeyObjects: false,
        numSpaces: 4,
    }
    if (!o) return options;
    o.forEach(optionsArg => options = Object.assign(options, optionsArg))
    return options;
}

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

let charToCode = (c: string) => {
    c = nonASCIIMap[c] ?? c;
    let code = c.charCodeAt(0);
    if (code > 256) throw new Error(`Non ascii character: ${c} ${code}`);
    return ESCAPE_CHARACTERS.includes(c)? [BACKSLASH, code] : code;
}
let primToCodes = (num: Primitive, o: Options) => String(num).split("").map(x => charToCode(x));

let stringToCodes = (str: string, o: Options) => [QUOTE, ...primToCodes(str, o), QUOTE];

let createIndent = (depth: number, o: Options) => {
    return o.useTabs? Array(depth).fill(TAB) : Array(depth * o.numSpaces).fill(SPACE);
};
let genFlatCollectionFormatting = () => ({
    first: [] as any[],
    last: [] as any[],
    prefix: [] as any[],
    suffix: [COMMA, SPACE],
});
let genDefaultCollectionFormatting = (depth: number, o: Options) => ({
    first:  [RETURN],
    last: [RETURN, ...createIndent(depth, o)],
    prefix: createIndent(depth + 1, o),
    suffix: [COMMA, RETURN],
});

let collectionToCodes = (rows: any[], depth: number, left: number, right: number, o: Options) => {
    let f = o.useFlatRows? genFlatCollectionFormatting() : genDefaultCollectionFormatting(depth, o);
    let formattedRows = rows.map(x => [f.prefix, x, f.suffix]).flat(Infinity);
    f.suffix.forEach(x => formattedRows.pop());
    return [left, f.first, formattedRows, f.last, right].flat(Infinity);
}

let arrayToCodes = (arr: any[], depth: number, o: Options) => {
    let rowCodes = Object.entries(arr)
        .filter(x => x[1] !== undefined)
        .map(x => {
            let options = genOptions(o, {useFlatRows: arr.some(x => Array.isArray(x))})
            return elementHandler(x[1], depth + 1, options);
        })
    return collectionToCodes(rowCodes, depth, LEFT_SQUARE_BRACKET, RIGHT_SQUARE_BRACKET, o);
}


let objToCodes = (obj: any, depth: number, o: Options) => {
    let rowCodes = Object.entries(obj)
        .filter(x => x[1] !== undefined)
        .map(x => {
            let options = genOptions(o, {useFlatRows: o.flatKeys.includes(x[0])});
            return objRowToCodes(x[0], x[1], depth, options)
        });
    let options = genOptions(o);
    options.useFlatRows = (rowCodes.length == 1 && typeof Object.values(obj)[0] != "object" && o.flattenSingleKeyObjects) || rowCodes.length == 0;
    return collectionToCodes(rowCodes, depth, LEFT_CURLY_BRACE, RIGHT_CURLY_BRACE, options);
}

let objRowToCodes = (key: string, val: any, depth: number, o: Options) => [stringToCodes(key, o), COLON, SPACE, elementHandler(val, depth + 1, o)]

let elementHandler = (el: any, depth: number, o: Options): any[] => {
    let type = Array.isArray(el)? "array" : typeof el;
    switch (type) {
        case "string": return stringToCodes(el, o);
        case "number": return primToCodes(el, o);
        case "boolean": return primToCodes(el, o);
        case "array": return arrayToCodes(el, depth, o);
        case "object": return objToCodes(el, depth, o);
    }
}

let convertToASCIICodes = (obj: any, options: Options) => elementHandler(obj, 0, options).flat(Infinity);

export let stringify = (obj: any, options?: Options) => {
    let o = genOptions(options);
    let asciiCodes = convertToASCIICodes(obj, o);
    let buffer = Buffer.from(asciiCodes);
    return buffer.toLocaleString();
}