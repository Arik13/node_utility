import "module-alias/register";

// import { dirMapFromPath } from "./src/fse/DirMapInitializer";

// dirMapFromPath("./test");

import { copyDirectoryInto } from "@node/fse";

import * as fs from "fs";
let from = "./test/inner";
let to = "./test2";
fs.rmSync(to, { recursive: true, force: true });
copyDirectoryInto(from, to);