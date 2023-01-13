import { DirectoryMap } from "ts_utility/Directory";
export declare let traverseDirPaths: (path: string, visitDir: (path: string) => void, visitFile: (path: string) => void) => void;
export interface DirMapFromPathOptions {
    subpath?: string;
    replacer?: (val: string) => string;
    loadSubPath?: string;
}
export declare let dirMapFromPath: (rootPath: string, options?: DirMapFromPathOptions) => DirectoryMap;
