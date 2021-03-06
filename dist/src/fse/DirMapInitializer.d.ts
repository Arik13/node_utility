import { DirectoryMap } from "@util/Directory";
export declare let traverseDirPaths: (path: string, visitDir: (path: string) => void, visitFile: (path: string) => void) => void;
export declare let dirMapFromPath: (rootPath: string) => DirectoryMap;
