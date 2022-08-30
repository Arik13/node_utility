import * as Path from "path";
import { traverseDirPaths } from "./DirMapInitializer";
import * as fs from "fs";

let generateLibraryExports = (root: string, buildPath: string) => {
    let data = {
        exports: {} as {[key: string]: string},
        typesVersions: {} as {[key: string]: [string]},
    }
    traverseDirPaths(root,
        path => {},
        path => {
            let pd = Path.parse(path);
            if (pd.ext != ".ts") return;
            // console.log(pd);
            let exportKey = path.replace(root, ".").replace(".ts", "");
            let exportValue = path.replace(".", buildPath).replace(".ts", ".js");
            if (pd.name == "index") {
                exportKey = exportKey.replace("/index", "");
                // exportValue = exportValue.replace("/index.js", "");
            }

            data.exports[exportKey] = exportValue;
            data.typesVersions[exportKey.replace("./", "")] = [exportValue.replace(".js", ".d.ts")];
        }
    );
    return data;
}
export let buildLibraryExports = (root: string = "./src", buildPath: string = "./lib", packagePath: string = "package.json") => {
    if (!root.startsWith("./")) {
        root = `./${root}`
    }
    let result = generateLibraryExports(root, buildPath);
    let pkgString = fs.readFileSync(packagePath, "utf-8");
    let pkgJson = JSON.parse(pkgString);
    pkgJson.exports = result.exports;
    pkgJson.typesVersions["*"] = result.typesVersions;
    fs.writeFileSync(packagePath, JSON.stringify(pkgJson, null, 4));
}