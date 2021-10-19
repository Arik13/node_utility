"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
// import { dirMapFromPath } from "./src/fse/DirMapInitializer";
// dirMapFromPath("./test");
const fse_1 = require("@node/fse");
const fs = require("fs");
fs.rmSync("./test2", { recursive: true, force: true });
fs.mkdirSync("./test2");
fse_1.copyDirectoryInto("./test", "./test2");
//# sourceMappingURL=app.js.map