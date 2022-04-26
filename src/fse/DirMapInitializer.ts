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
    let rootPD = Path.parse(rootPath);
    let rootStem = rootPD.dir.substring(1);

    let handler = (subHandler: (pd: Path.ParsedPath, parent: Directory) => void) => (path: string) => {
        let pd = Path.parse(path);
        let parentPath = pd.dir.substring(1).replace(rootStem, "");
        let parent = dirMap.get(parentPath);
        subHandler(pd, parent);
    }
    traverseDirPaths(
        rootPath,
        handler((pd, parent) => dirMap.createDir(pd.name, parent.id)),
        handler((pd, parent) => dirMap.createAssetDir({
            id: pd.name,
            name: pd.name,
        }, pd.ext, parent.id)),
    );
    let rootName = rootPath.substring(1);
    dirMap.map(dir => dir.path = dir.path.replace(rootName, ""))
    let root = dirMap.root.children[0];
    delete root.parentID;
    dirMap.reset(root);
    return dirMap;
}