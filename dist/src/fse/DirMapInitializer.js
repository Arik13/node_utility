"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dirMapFromPath = exports.traverseDirPaths = void 0;
const Directory_1 = require("@util/Directory");
const fs = require("fs");
const Path = require("path");
const Functions_1 = require("@util/Functions");
exports.traverseDirPaths = (path, visitDir, visitFile) => {
    visitDir(path);
    let paths = fs.readdirSync(path, { withFileTypes: true });
    paths.forEach(f => {
        let newPath = `${path}/${f.name}`;
        if (f.isFile())
            visitFile(newPath);
        else if (f.isDirectory())
            exports.traverseDirPaths(newPath, visitDir, visitFile);
    });
};
exports.dirMapFromPath = (rootPath) => {
    let dirMap = new Directory_1.DirectoryMap();
    exports.traverseDirPaths(rootPath, path => {
        let pd = Path.parse(path);
        let parentPath = pd.dir.substring(1);
        let parent = dirMap.get(parentPath);
        dirMap.createDir(pd.name, parent.id);
    }, path => {
        let pd = Path.parse(path);
        let parentPath = pd.dir.substring(1);
        let parent = dirMap.get(parentPath);
        dirMap.createAssetDir({
            id: pd.name,
            name: pd.name,
        }, pd.ext, parent.id);
    });
    Functions_1.deeplog(dirMap.root);
};
//# sourceMappingURL=DirMapInitializer.js.map