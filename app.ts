import "module-alias/register";

// import { dirMapFromPath } from "./src/fse/DirMapInitializer";

// dirMapFromPath("./test");

import { copyDirectoryInto } from "@node/fse";

import * as fs from "fs";
fs.rmSync("./test2", { recursive: true, force: true });
fs.mkdirSync("./test2");
copyDirectoryInto("./test", "./test2");