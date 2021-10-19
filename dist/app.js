"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
// import { dirMapFromPath } from "./src/fse/DirMapInitializer";
// dirMapFromPath("./test");
const fse_1 = require("@node/fse");
const fs = require("fs");
let from = "./test/inner";
let to = "./test2";
fs.rmSync(to, { recursive: true, force: true });
fse_1.copyDirectoryInto(from, to);
//# sourceMappingURL=app.js.map