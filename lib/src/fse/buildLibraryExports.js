"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLibraryExports = void 0;
const Path = require("path");
const DirMapInitializer_1 = require("./DirMapInitializer");
const fs = require("fs");
let generateLibraryExports = (root, buildPath) => {
    let data = {
        exports: {},
        typesVersions: {},
    };
    (0, DirMapInitializer_1.traverseDirPaths)(root, path => { }, path => {
        let pd = Path.parse(path);
        if (pd.ext != ".ts")
            return;
        // console.log(pd);
        let exportKey = path.replace(root, ".").replace(".ts", "");
        let exportValue = path.replace(".", buildPath).replace(".ts", ".js");
        if (pd.name == "index") {
            exportKey = exportKey.replace("/index", "");
            // exportValue = exportValue.replace("/index.js", "");
        }
        data.exports[exportKey] = exportValue;
        data.typesVersions[exportKey.replace("./", "")] = [exportValue.replace(".js", ".d.ts")];
    });
    return data;
};
let buildLibraryExports = (root = "./src", buildPath = "./lib", packagePath = "package.json") => {
    if (!root.startsWith("./")) {
        root = `./${root}`;
    }
    let result = generateLibraryExports(root, buildPath);
    let pkgString = fs.readFileSync(packagePath, "utf-8");
    let pkgJson = JSON.parse(pkgString);
    pkgJson.exports = result.exports;
    pkgJson.typesVersions["*"] = result.typesVersions;
    fs.writeFileSync(packagePath, JSON.stringify(pkgJson, null, 4));
};
exports.buildLibraryExports = buildLibraryExports;
//# sourceMappingURL=buildLibraryExports.js.map