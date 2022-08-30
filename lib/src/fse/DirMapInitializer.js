"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dirMapFromPath = exports.traverseDirPaths = void 0;
const Directory_1 = require("ts_utility/dist/src/Directory");
const fs = require("fs");
const Path = require("path");
let traverseDirPaths = (path, visitDir, visitFile) => {
    visitDir(path);
    let paths = fs.readdirSync(path, { withFileTypes: true });
    paths.forEach(f => {
        let newPath = `${path}/${f.name}`;
        if (f.isFile())
            visitFile(newPath);
        else if (f.isDirectory())
            (0, exports.traverseDirPaths)(newPath, visitDir, visitFile);
    });
};
exports.traverseDirPaths = traverseDirPaths;
let dirMapFromPath = (rootPath) => {
    let dirMap = new Directory_1.DirectoryMap();
    let rootPD = Path.parse(rootPath);
    let rootStem = rootPD.dir.substring(1);
    let handler = (subHandler) => (path) => {
        let pd = Path.parse(path);
        let parentPath = pd.dir.substring(1).replace(rootStem, "");
        let parent = dirMap.get(parentPath);
        subHandler(pd, parent);
    };
    (0, exports.traverseDirPaths)(rootPath, handler((pd, parent) => dirMap.createDir(pd.name, parent.id)), handler((pd, parent) => dirMap.createAssetDir({
        id: pd.name,
        name: pd.name,
    }, pd.ext, parent.id)));
    let rootName = rootPath.substring(1);
    dirMap.map(dir => dir.path = dir.path.replace(rootName, ""));
    let root = dirMap.root.children[0];
    delete root.parentID;
    dirMap.reset(root);
    return dirMap;
};
exports.dirMapFromPath = dirMapFromPath;
//# sourceMappingURL=DirMapInitializer.js.map