import { DirectoryMap, Directory } from "ts_utility/Directory";
import * as fs from "fs";
import * as Path from "path";
import { readObject } from "./index";
import { Options } from "./visitors";
import * as YAML from "yaml";

interface WriteOptions {
    to: string;
    dataCB: (dir: Directory) => string;
    subpath?: string;
    ext?: string | ((dir: Directory) => string);
}
export class NodeDirectoryMap extends DirectoryMap {
    rootPath: string = "";
    writeTo({to, subpath, dataCB, ext}: WriteOptions) {
        if (!fs.existsSync(`${to}`)) {
            fs.mkdirSync(`${to}`, {recursive: true});
        }
        this.traverse(dir => {
            let path = dir.path.replace(subpath, "");
            if (dir.ext) {
                let data = dataCB(dir);
                let extVal = typeof ext === "string"? ext : ext? ext(dir) : "";
                if (data !== null && data !== undefined)
                    fs.writeFileSync(`${to}${path}${extVal}`, data, "utf-8");
            }
            else if (!fs.existsSync(`${to}${path}`)) {
                fs.mkdirSync(`${to}${path}`);
            }
        }, subpath);
    }
    loadFromPath(rootPath: string, options: DirMapFromPathOptions = {}) {
        this.rootPath = rootPath;
        let rootPD = Path.parse(rootPath);
        let rootStem = rootPD.dir.substring(1);
        let {subpath, replacer} = options;

        let handler = (subHandler: (pd: Path.ParsedPath, parent: Directory) => void) => (path: string) => {
            if (replacer) {
                path = replacer(path);
            }
            let pd = Path.parse(path);
            let parentPath = pd.dir.substring(1).replace(rootStem, "");
            let parent = this.get(parentPath);
            subHandler(pd, parent);
        }
        traverseDirPaths(
            rootPath,
            handler((pd, parent) => this.createDir(pd.name, parent.id)),
            handler((pd, parent) => this.createAssetDir(pd.name, parent.id, pd.name, pd.ext)),
        );
        let rootName = rootPath.substring(1);
        this.map(dir => dir.path = dir.path.replace(rootName, ""))

        let root = this.root.children[0];
        delete root.parentID;
        this.reset(root);
        return this;
    }
    visitYamlFiles(handler: (options: Options<any>) => void) {
        this.visitAssets(dir => {
            let path = `${this.rootPath}${dir.path}`;
            if (dir.ext !== ".yaml") return;
            try {
                let data = readObject(path);
                handler({
                    data,
                    rootPath: this.rootPath,
                    path,
                    dir,
                    dirMap: this,
                });
            }
            catch (error) {
                console.error(path.substring(2))
                throw error;
            }
        });
    }
}

export let traverseDirPaths = (path: string, visitDir: (path: string) => void, visitFile: (path: string) => void) => {
    visitDir(path);
    let paths = fs.readdirSync(path, {withFileTypes: true});
    paths.forEach(f => {
        let newPath = `${path}/${f.name}`;
        if (f.isFile())
            visitFile(newPath);
        else if (f.isDirectory())
            traverseDirPaths(newPath, visitDir, visitFile);
    });
}

export interface DirMapFromPathOptions {
    subpath?: string;
    replacer?: (val: string) => string, loadSubPath?: string;
}
export let dirMapFromPath = (rootPath: string, options: DirMapFromPathOptions = {}) => {
    let dirMap = new DirectoryMap();
    let rootPD = Path.parse(rootPath);
    let rootStem = rootPD.dir.substring(1);
    let {subpath, replacer} = options;

    let handler = (subHandler: (pd: Path.ParsedPath, parent: Directory) => void) => (path: string) => {
        if (replacer) {
            path = replacer(path);
        }
        let pd = Path.parse(path);
        let parentPath = pd.dir.substring(1).replace(rootStem, "");
        let parent = dirMap.get(parentPath);
        subHandler(pd, parent);
    }
    traverseDirPaths(
        rootPath,
        handler((pd, parent) => dirMap.createDir(pd.name, parent.id)),
        handler((pd, parent) => dirMap.createAssetDir(pd.name, parent.id, pd.name, pd.ext)),
    );
    let rootName = rootPath.substring(1);
    dirMap.map(dir => dir.path = dir.path.replace(rootName, ""))

    let root = dirMap.root.children[0];
    delete root.parentID;
    dirMap.reset(root);
    return dirMap;
}