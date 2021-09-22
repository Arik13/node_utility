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
const stringifier_1 = require("@node/stringifier");
let readDirectory = (path) => {
    try {
        let paths = fs.readdirSync(path, { withFileTypes: true });
        // console.log(`Scanning: ${path}`);
        return {
            name: path.split("/").pop(),
            path,
            dirs: paths.filter(p => !p.isFile()).map(f => (0, exports.readDirectory)(`${path}/${f.name}`)),
            files: paths.filter(p => p.isFile()).map(p => ({ name: p.name, path: `${path}/${p.name}` })),
        };
    }
    catch (err) {
        console.log(err);
        return {
            name: path.split("/").pop(),
            path,
            dirs: [],
            files: [],
        };
    }
};
exports.readDirectory = readDirectory;
let readFiles = (path) => (0, exports.linearizeFiles)((0, exports.readDirectory)(path));
exports.readFiles = readFiles;
let getFilesData = (path) => (0, exports.readFiles)(path).map(x => (0, exports.readObject)(x.path));
exports.getFilesData = getFilesData;
let getFileData = (dir) => {
    return (0, exports.traverseDirDFS)(dir, null, f => f.buffer = fs.readFileSync(f.path, "utf-8"));
};
exports.getFileData = getFileData;
let traverseDirDFS = (dir, folderHandler, fileHandler) => {
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
exports.traverseDirDFS = traverseDirDFS;
let traverseDirLtR = (dir, folderHandler, fileHandler) => {
    if (fileHandler)
        dir.files.forEach(fileHandler);
    dir.dirs.forEach(subdir => (0, exports.traverseDirLtR)(subdir, folderHandler, fileHandler));
    if (folderHandler)
        folderHandler(dir);
    return dir;
};
exports.traverseDirLtR = traverseDirLtR;
let dirDataCreator = (folderHandler, fileHandler) => (path) => {
    let dir = (0, exports.readDirectory)(path);
    return (0, exports.traverseDirLtR)(dir, f => f.data = folderHandler(f), f => f.data = fileHandler(f));
};
exports.dirDataCreator = dirDataCreator;
let linearizeDirectory = (dir) => {
    let dirs = [];
    (0, exports.traverseDirDFS)(dir, f => dirs.push(f), f => { });
    return dirs;
};
exports.linearizeDirectory = linearizeDirectory;
let linearizeFiles = (dir) => {
    let files = [];
    (0, exports.traverseDirDFS)(dir, null, f => files.push(f));
    return files;
};
exports.linearizeFiles = linearizeFiles;
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
// export let setFileStats = async (dir: Dir<any, any>): Promise<Dir<null, fs.Stats>> => {
//     let files = linearizeFiles(dir);
//     let promises = files.map(f => fs.promises.stat(f.path))
//     await Promise.all(promises);
//     console.log(promises);
//     files.forEach((f, i) => f.data = promises[i])
//     return dir;
// }
// export let setFileStats = async (dir: Dir<any, any>): Promise<Dir<null, fs.Stats>> => {
//     let files = linearizeFiles(dir);
//     let promises = files.map(f => new Promise((resolve, reject) => {
//         fs.stat(f.path, (err, stats) => {
//             f.data = stats;
//             if (err) throw err;
//             resolve(true);
//         })
//     }))
//     await Promise.all(promises);
//     return dir;
// }
// export let setFileStats = async (dir: Dir<any, any>): Promise<Dir<null, fs.Stats>> => {
//     let folderCount = 0;
//     let finishedCount = 0;
//     let finished = (resolve: (value: any) => void) => {
//         finishedCount++;
//         if (finishedCount != folderCount) return;
//         resolve(true);
//     }
//     await new Promise((resolve, reject) => {
//         traverseDirLtR(dir, null, f => {
//             folderCount++;
//             fs.stat(f.path, (err, stats) => {
//                 if (err) {
//                     throw new Error(err.message);
//                 }
//                 f.data = stats;
//                 finished(resolve);
//             });
//         });
//     });
//     return dir;
// }
let setFileStats = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    let promises = [];
    (0, exports.traverseDirLtR)(dir, null, f => {
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
exports.setFileStats = setFileStats;
let setFolderStats = (f) => {
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
exports.setFolderStats = setFolderStats;
let readDirectoryWithStats = (path) => __awaiter(void 0, void 0, void 0, function* () {
    let dir = (0, exports.readDirectory)(path);
    yield (0, exports.setFileStats)(dir);
    (0, exports.traverseDirLtR)(dir, f => f.data = (0, exports.setFolderStats)(f));
    return dir;
});
exports.readDirectoryWithStats = readDirectoryWithStats;
exports.readDirectoryWithStatsSync = (0, exports.dirDataCreator)(exports.setFolderStats, f => fs.statSync(f.path));
// OLD FILE MODULE
let readObject = (path) => JSON.parse(fs.readFileSync(path, { encoding: "utf-8" }));
exports.readObject = readObject;
// export let writeObject = (path: string, data: any) => fs.writeFileSync(path, JSON.stringify(data, null, 4), {encoding: "utf-8"});
let writeObject = (path, data, options) => fs.writeFileSync(path, (0, stringifier_1.stringify)(data, options), { encoding: "utf-8" });
exports.writeObject = writeObject;
let readDirectoryFiles = (path) => fs.readdirSync(path, { withFileTypes: true })
    .filter(p => p.isFile())
    .map(p => ({ name: p.name.split(".")[0], file: (0, exports.readObject)(`${path}/${p.name}`) }));
exports.readDirectoryFiles = readDirectoryFiles;
// interface Dir {
//     name: string;
//     folders: Dir[];
//     files: {name: string, file: any}[];
// }
let clearExtensionFromFolder = (path, extension = ".json") => {
    let subPaths = fs.readdirSync(path);
    subPaths.forEach(subPath => {
        let fileExtension = subPath.split(".")[1];
        if (!fileExtension && fileExtension != extension)
            return (0, exports.clearExtensionFromFolder)(`${path}/${subPath}`);
        return fs.unlinkSync(`${path}/${subPath}`);
    });
};
exports.clearExtensionFromFolder = clearExtensionFromFolder;
let clearFolder = (path) => {
    let subPaths = fs.readdirSync(path, { withFileTypes: true });
    subPaths.forEach(subPath => {
        if (subPath.isFile())
            return fs.unlinkSync(`${path}/${subPath.name}`);
        return (0, exports.clearFolder)(`${path}/${subPath.name}`);
    });
};
exports.clearFolder = clearFolder;
// export let readDirectory = (path: string): Dir => {
//     let paths = fs.readdirSync(path, {withFileTypes: true})
//     return {
//         name: path.split("/").pop(),
//         folders: paths.filter(p => !p.isFile()).map(f => readDirectory(`${path}/${f.name}`)),
//         files: paths.filter(p => p.isFile()).map(p => ({name: p.name.split(".")[0], file: readObject(`${path}/${p.name}`)})),
//     }
// }
let writeDirectory = (dir, path) => {
    console.log("UNIMLPEMENTED");
    // traverseDirDFS(dir, )
    // let newPath = `${path}/${dir.name}`;
    // fs.mkdirSync(newPath);
    // dir.folders.forEach(folder => {writeDirectory(folder, newPath)});
    // dir.files.forEach(file => writeObject(`${newPath}/${file.name}.json`, file.file));
};
exports.writeDirectory = writeDirectory;
let copyDirectoryInto = (from, to) => {
    let descriptionDir = (0, exports.readDirectory)(from);
    (0, exports.writeDirectory)(descriptionDir, to);
};
exports.copyDirectoryInto = copyDirectoryInto;
//# sourceMappingURL=fse.js.map