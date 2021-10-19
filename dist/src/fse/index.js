"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyDirectoryInto = exports.writeDirectory = exports.clearFolder = exports.clearExtensionFromFolder = exports.readDirectoryFiles = exports.writeObject = exports.readObject = exports.readDirectoryWithStatsSync = exports.readDirectoryWithStats = exports.setFolderStats = exports.setFileStats = exports.formatBytes = exports.linearizeFiles = exports.linearizeDirectory = exports.dirDataCreator = exports.traverseDirLtR = exports.traverseDirDFS = exports.getFileData = exports.getFilesData = exports.readFiles = exports.readDirectory = void 0;
const fs = require("fs");
const YAML = require("yaml");
const Path = require("path");
// import { stringify } from "@node/stringifier";
const DirMapInitializer_1 = require("./DirMapInitializer");
exports.readDirectory = (path) => {
    try {
        let paths = fs.readdirSync(path, { withFileTypes: true });
        // console.log(`Scanning: ${path}`);
        return {
            name: path.split("/").pop(),
            path,
            dirs: paths.filter(p => !p.isFile()).map(f => exports.readDirectory(`${path}/${f.name}`)),
            files: paths.filter(p => p.isFile()).map(p => ({ name: p.name, path: `${path}/${p.name}` })),
        };
    }
    catch (err) {
        return {
            name: path.split("/").pop(),
            path,
            dirs: [],
            files: [],
        };
    }
};
exports.readFiles = (path) => exports.linearizeFiles(exports.readDirectory(path));
exports.getFilesData = (path) => exports.readFiles(path).map(x => exports.readObject(x.path));
exports.getFileData = (dir) => {
    return exports.traverseDirDFS(dir, null, f => f.buffer = fs.readFileSync(f.path, "utf-8"));
};
exports.traverseDirDFS = (dir, folderHandler, fileHandler) => {
    let helper = (dir, folderHandler, fileHandler) => {
        dir.dirs.forEach(subdir => {
            if (folderHandler)
                folderHandler(subdir, dir);
            helper(subdir, folderHandler, fileHandler);
        });
        if (fileHandler)
            dir.files.forEach(file => fileHandler(file, dir));
        return dir;
    };
    if (folderHandler)
        folderHandler(dir, null);
    return helper(dir, folderHandler, fileHandler);
};
exports.traverseDirLtR = (dir, folderHandler, fileHandler) => {
    if (fileHandler)
        dir.files.forEach(fileHandler);
    dir.dirs.forEach(subdir => exports.traverseDirLtR(subdir, folderHandler, fileHandler));
    if (folderHandler)
        folderHandler(dir);
    return dir;
};
exports.dirDataCreator = (folderHandler, fileHandler) => (path) => {
    let dir = exports.readDirectory(path);
    return exports.traverseDirLtR(dir, f => f.data = folderHandler(f), f => f.data = fileHandler(f));
};
exports.linearizeDirectory = (dir) => {
    let dirs = [];
    exports.traverseDirDFS(dir, f => dirs.push(f), f => { });
    return dirs;
};
exports.linearizeFiles = (dir) => {
    let files = [];
    exports.traverseDirDFS(dir, null, f => files.push(f));
    return files;
};
const BLOCK_SIZE = 512;
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
exports.formatBytes = formatBytes;
exports.setFileStats = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    let promises = [];
    exports.traverseDirLtR(dir, null, f => {
        promises.push(new Promise((resolve, reject) => {
            fs.stat(f.path, (err, stats) => {
                if (err) {
                    console.log(err);
                    f.data = {
                        size: 0,
                        blocks: 0,
                    };
                    console.log(f);
                }
                f.data = stats;
                resolve(stats);
            });
        }));
    });
    yield Promise.all(promises);
    return dir;
});
exports.setFolderStats = (f) => {
    try {
        let fileSizesTotal = f.files.reduce((p, c) => p + c.data.size, 0);
        let dirSizesTotal = f.dirs.reduce((p, c) => p + c.data.size.raw, 0);
        let size = fileSizesTotal + dirSizesTotal;
        let fileBlocksTotal = f.files.reduce((p, c) => p + c.data.blocks, 0);
        let dirBlocksTotal = f.dirs.reduce((p, c) => p + c.data.blocks, 0);
        let blocks = fileBlocksTotal + dirBlocksTotal;
        let sizeOnDisk = BLOCK_SIZE * blocks;
        return {
            size: {
                raw: size,
                unit: formatBytes(size),
            },
            sizeOnDisk: {
                raw: sizeOnDisk,
                unit: formatBytes(sizeOnDisk),
            },
            blocks,
        };
    }
    catch (err) {
        console.log(f);
        return {
            size: {
                raw: 0,
                unit: "",
            },
            sizeOnDisk: {
                raw: 0,
                unit: ""
            },
            blocks: 0,
        };
    }
};
exports.readDirectoryWithStats = (path) => __awaiter(void 0, void 0, void 0, function* () {
    let dir = exports.readDirectory(path);
    yield exports.setFileStats(dir);
    exports.traverseDirLtR(dir, f => f.data = exports.setFolderStats(f));
    return dir;
});
exports.readDirectoryWithStatsSync = exports.dirDataCreator(exports.setFolderStats, f => fs.statSync(f.path));
let parserDict = { ".yaml": YAML, ".yml": YAML, ".json": JSON };
exports.readObject = (path) => {
    let { ext } = Path.parse(path);
    let data = fs.readFileSync(path, { encoding: "utf-8" });
    return parserDict[ext].parse(data);
};
exports.writeObject = (path, data) => {
    let { ext } = Path.parse(path);
    let dataString = parserDict[ext].stringify(data, null, "\t");
    fs.writeFileSync(path, dataString, { encoding: "utf-8" });
};
exports.readDirectoryFiles = (path) => fs.readdirSync(path, { withFileTypes: true })
    .filter(p => p.isFile())
    .map(p => ({ name: p.name.split(".")[0], file: exports.readObject(`${path}/${p.name}`) }));
exports.clearExtensionFromFolder = (path, extension = ".json") => {
    let subPaths = fs.readdirSync(path);
    subPaths.forEach(subPath => {
        let fileExtension = subPath.split(".")[1];
        if (!fileExtension && fileExtension != extension)
            return exports.clearExtensionFromFolder(`${path}/${subPath}`);
        return fs.unlinkSync(`${path}/${subPath}`);
    });
};
exports.clearFolder = (path) => {
    let subPaths = fs.readdirSync(path, { withFileTypes: true });
    subPaths.forEach(subPath => {
        if (subPath.isFile())
            return fs.unlinkSync(`${path}/${subPath.name}`);
        return exports.clearFolder(`${path}/${subPath.name}`);
    });
};
exports.writeDirectory = (dir, path) => {
    console.log("UNIMLPEMENTED");
};
exports.copyDirectoryInto = (from, to) => {
    let dirMap = DirMapInitializer_1.dirMapFromPath(from);
    dirMap.traverse(dir => {
        if (dir.ext)
            fs.writeFileSync(`${to}${dir.path}`, fs.readFileSync(`${from}${dir.path}`), "utf-8");
        else
            fs.mkdirSync(`${to}${dir.path}`);
    });
};
//# sourceMappingURL=index.js.map