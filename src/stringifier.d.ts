export declare let searchForNonASCII: (str: string) => void;
export declare let convertToASCII: (str: string) => string;
interface Options {
    useFlatRows?: boolean;
    flatKeys?: string[];
    flattenSingleKeyObjects?: boolean;
    numSpaces?: number;
    useTabs?: boolean;
}
export declare let stringify: (obj: any, options?: Options) => string;
export {};
