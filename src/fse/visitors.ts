import * as fs from "fs";
import { readObject } from "./index";
import { dirMapFromPath } from "./DirMapInitializer";
import { DirectoryMap, Directory } from "ts_utility/Directory";

export interface Options<T = string> {
    data: T;
    rootPath: string;
    path: string;
    dir: Directory;
    dirMap: DirectoryMap;
}


export let visitFilesAsync = (rootPath: string, handler: (options: Options) => void) => {
    let dirMap = dirMapFromPath(rootPath);
    dirMap.visitAssets(dir => {
        let path = `${rootPath}${dir.path}`;
        fs.readFile(path, "utf-8", (err, data) => handler({
            data,
            rootPath,
            path,
            dir,
            dirMap,
        }));
    });
}
export let visitFilesSync = (rootPath: string, handler: (options: Options) => void) => {
    let dirMap = dirMapFromPath(rootPath);
    dirMap.visitAssets(dir => {
        let path = `${rootPath}${dir.path}`;
        let data = fs.readFileSync(path, "utf-8");
        handler({
            data,
            rootPath,
            path,
            dir,
            dirMap,
        });
    });
}
export let visitYamlFiles = (rootPath: string, handler: (options: Options<any>) => void) => {
    // rootPath = `./${rootPath}`
    let dirMap = dirMapFromPath(rootPath);
    dirMap.visitAssets(dir => {
        let path = `${rootPath}${dir.path}`;
        if (dir.ext !== ".yaml") return;
        try {
            let data = readObject(path);
            handler({
                data,
                rootPath,
                path,
                dir,
                dirMap,
            });
        }
        catch (error) {
            console.error(path.substring(2))
            throw error;
        }
    });
}