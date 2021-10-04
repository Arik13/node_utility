import { DirectoryMap, Directory } from "@util/Directory";
import * as fs from "fs";
import * as Path from "path";
import { deeplog } from "@util/Functions";

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

export let dirMapFromPath = (rootPath: string) => {
    let dirMap = new DirectoryMap();
    traverseDirPaths(
        rootPath,
        path => {
            let pd = Path.parse(path);
            let parentPath = pd.dir.substring(1)
            let parent = dirMap.get(parentPath);
            dirMap.createDir(pd.name, parent.id);
        },
        path => {
            let pd = Path.parse(path);
            let parentPath = pd.dir.substring(1)
            let parent = dirMap.get(parentPath);
            dirMap.createAssetDir({
                id: pd.name,
                name: pd.name,
            }, pd.ext, parent.id);
        },
    )
    return dirMap
}