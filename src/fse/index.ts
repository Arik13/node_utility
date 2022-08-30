import * as fs from "fs";
import * as YAML from "yaml";
import * as Path from "path";
import { Dict } from "ts_utility/dist/src/Types";
import { dirMapFromPath, traverseDirPaths } from "./DirMapInitializer";

YAML.scalarOptions.str.fold = {lineWidth: 0, minContentWidth: 0};

//______________________________________________________________________________________________________
//______________________________________________________________________________________________________


export interface Size {
    raw: number;
    unit: string;
}

export interface FolderStats {
    size: Size;
    sizeOnDisk: Size;
    blocks: number;
}

export interface File<T> {
    name: string;
    path: string;
    buffer?: any;
    data?: T;
}

export interface Dir<T = any, U = any> {
    name: string;
    path: string;
    dirs: Dir<T, U>[];
    files?: File<U>[];
    data?: T;
}

export type StatDir = Dir<FolderStats, fs.Stats>;
export interface FilteredDir {
    path: string;
    name: string;
    data: FolderStats;
}

export let readDirectory = (path: string): Dir<any, any> => {
    try {
        let paths = fs.readdirSync(path, {withFileTypes: true});
        // console.log(`Scanning: ${path}`);
        return {
            name: path.split("/").pop(),
            path,
            dirs: paths.filter(p => !p.isFile()).map(f => readDirectory(`${path}/${f.name}`)),
            files: paths.filter(p => p.isFile()).map(p => ({name: p.name, path: `${path}/${p.name}`})),
        }
    }
    catch (err) {
        return {
            name: path.split("/").pop(),
            path,
            dirs: [],
            files: [],
        }
    }
}

export let readFiles = (path: string) => linearizeFiles(readDirectory(path));
export let getFilesData = (path: string) => readFiles(path).map(x => readObject(x.path))

export let getFileData = (dir: Dir<any, any>) => {
    return traverseDirDFS(dir, null, f => f.buffer = fs.readFileSync(f.path, "utf-8"))
}

export let traverseDirDFS = <T, U>(
    dir: Dir<T, U>,
    folderHandler?: (dir: Dir<T, U>, parent?: Dir<T, U>) => void,
    fileHandler?: (file: File<U>, parent?: Dir<T, U>) => void,
) => {
    let helper = <T, U>(
        dir: Dir<T, U>,
        folderHandler?: (dir: Dir<T, U>, parent?: Dir<T, U>) => void,
        fileHandler?: (file: File<U>, parent?: Dir<T, U>) => void,
    ) => {
        dir.dirs.forEach(subdir => {
            if (folderHandler)
                folderHandler(subdir, dir);
            helper(subdir, folderHandler, fileHandler)
        });
        if (fileHandler)
            dir.files.forEach(file => fileHandler(file, dir));
        return dir;
    }
    if (folderHandler)
        folderHandler(dir, null);
    return helper(dir, folderHandler, fileHandler)
}
export let traverseDirLtR = <T, U>(
    dir: Dir<T, U>,
    folderHandler?: (dir: Dir<T, U>) => void,
    fileHandler?: (file: File<U>) => void,
) => {
    if (fileHandler)
        dir.files.forEach(fileHandler);
    dir.dirs.forEach(subdir => traverseDirLtR(subdir, folderHandler, fileHandler));
    if (folderHandler)
        folderHandler(dir);
    return dir;
}
export let dirDataCreator = <T, U>(
    folderHandler: (dir: Dir<T, U>) => T,
    fileHandler: (file: File<U>) => U,
) => (path: string): Dir<T, U> => {
    let dir: Dir<T, U> = readDirectory(path);
    return traverseDirLtR(dir, f => f.data = folderHandler(f), f => f.data = fileHandler(f));
}

export let linearizeDirectory = <T, U>(dir: Dir<T, U>) => {
    let dirs: Dir<T, U>[] = [];
    traverseDirDFS(dir, f => dirs.push(f), f => {});
    return dirs;
}
export let linearizeFiles = <T, U>(dir: Dir<T, U>) => {
    let files: File<U>[] = [];
    traverseDirDFS(dir, null, f => files.push(f));
    return files;
}


const BLOCK_SIZE = 512;

export function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export let setFileStats = async (dir: Dir<any, any>): Promise<Dir<null, fs.Stats>> => {
    let promises: Promise<any>[] = [];
    traverseDirLtR(dir, null, f => {
        promises.push(new Promise((resolve, reject) => {
            fs.stat(f.path, (err, stats) => {
                if (err) {
                    console.log(err);
                    f.data = {
                        size: 0,
                        blocks: 0,
                    }
                    console.log(f);
                }
                f.data = stats;
                resolve(stats);
            });
        }))
    });
    await Promise.all(promises);
    return dir;
}

export let setFolderStats = (f: StatDir) => {
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
        }
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
        }
    }
}

export let readDirectoryWithStats = async (path: string): Promise<StatDir> => {
    let dir: StatDir = readDirectory(path);
    await setFileStats(dir);
    traverseDirLtR(dir, f => f.data = setFolderStats(f));
    return dir;
}
export let readDirectoryWithStatsSync: (path: string) => StatDir = dirDataCreator<FolderStats, fs.Stats>(setFolderStats, f => fs.statSync(f.path));

// OLD FILE MODULE

type Parser = typeof YAML | typeof JSON;
let parserDict: Dict<Parser> = {".yaml": YAML, ".yml": YAML, ".json": JSON};
export let readObject = (path: string) => {
    let {ext} = Path.parse(path);
    let data = fs.readFileSync(path, {encoding: "utf-8"});
    return parserDict[ext].parse(data);
}
export let writeObject = (path: string, data: any) => {
    let {ext} = Path.parse(path);
    let options = ext == ".yaml"? {

    } : null;
    let dataString = parserDict[ext].stringify(data, null, "\t");
    fs.writeFileSync(path, dataString, {encoding: "utf-8"});
}

export let readDirectoryFiles = (path: string) => fs.readdirSync(path, {withFileTypes: true})
        .filter(p => p.isFile())
        .map(p => ({name: p.name.split(".")[0], file: readObject(`${path}/${p.name}`)}));

export let clearExtensionFromFolder = (path: string, extension: string = ".json") => {
    let subPaths = fs.readdirSync(path);
    subPaths.forEach(subPath => {
        let fileExtension = subPath.split(".")[1];
        if (!fileExtension && fileExtension != extension) return clearExtensionFromFolder(`${path}/${subPath}`);
        return fs.unlinkSync(`${path}/${subPath}`);
    });
}
export let clearFolder = (path: string) => {
    let subPaths = fs.readdirSync(path, {withFileTypes: true});
    subPaths.forEach(subPath => {
        if (subPath.isFile())
            return fs.unlinkSync(`${path}/${subPath.name}`);
        return clearFolder(`${path}/${subPath.name}`);
    });
}

export let writeDirectory = (dir: Dir, path: string) => {
    console.log("UNIMPLEMENTED");
}
export let copyDirectoryInto = (from: string, to: string) => {
    let dirMap = dirMapFromPath(from);
    dirMap.traverse(dir => {
        if (dir.ext)
            fs.writeFileSync(`${to}${dir.path}`, fs.readFileSync(`${from}${dir.path}`), "utf-8");
        else
            fs.mkdirSync(`${to}${dir.path}`);
    });
}

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
            let exportKey = path.replace(root, ".").replace(".ts", "");
            let exportValue = path.replace(".", buildPath).replace(".ts", ".js");
            if (pd.name == "index") {
                exportKey = exportKey.replace("/index", "");
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