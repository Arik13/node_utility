/// <reference types="node" />
import * as fs from "fs";
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
export declare type StatDir = Dir<FolderStats, fs.Stats>;
export interface FilteredDir {
    path: string;
    name: string;
    data: FolderStats;
}
export declare let readDirectory: (path: string) => Dir<any, any>;
export declare let readFiles: (path: string) => File<any>[];
export declare let getFilesData: (path: string) => any[];
export declare let getFileData: (dir: Dir<any, any>) => Dir<any, any>;
export declare let traverseDirDFS: <T, U>(dir: Dir<T, U>, folderHandler?: (dir: Dir<T, U>, parent?: Dir<T, U>) => void, fileHandler?: (file: File<U>, parent?: Dir<T, U>) => void) => Dir<T, U>;
export declare let traverseDirLtR: <T, U>(dir: Dir<T, U>, folderHandler?: (dir: Dir<T, U>) => void, fileHandler?: (file: File<U>) => void) => Dir<T, U>;
export declare let dirDataCreator: <T, U>(folderHandler: (dir: Dir<T, U>) => T, fileHandler: (file: File<U>) => U) => (path: string) => Dir<T, U>;
export declare let linearizeDirectory: <T, U>(dir: Dir<T, U>) => Dir<T, U>[];
export declare let linearizeFiles: <T, U>(dir: Dir<T, U>) => File<U>[];
export declare function formatBytes(bytes: number, decimals?: number): string;
export declare let setFileStats: (dir: Dir<any, any>) => Promise<Dir<null, fs.Stats>>;
export declare let setFolderStats: (f: StatDir) => {
    size: {
        raw: number;
        unit: string;
    };
    sizeOnDisk: {
        raw: number;
        unit: string;
    };
    blocks: number;
};
export declare let readDirectoryWithStats: (path: string) => Promise<StatDir>;
export declare let readDirectoryWithStatsSync: (path: string) => StatDir;
export declare let readObject: (path: string) => any;
export declare let writeObject: (path: string, data: any, options?: any) => void;
export declare let readDirectoryFiles: (path: string) => {
    name: string;
    file: any;
}[];
export declare let clearExtensionFromFolder: (path: string, extension?: string) => void;
export declare let clearFolder: (path: string) => void;
export declare let writeDirectory: (dir: Dir, path: string) => void;
export declare let copyDirectoryInto: (from: string, to: string) => void;
