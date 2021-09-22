/// <reference types="node" />
export interface ChartOptions {
    timeout?: number;
    secret?: string;
    host?: string;
    protocol?: string;
    port?: number;
    pathname?: string;
}
export interface I_Chart {
    new (options: ChartOptions): I_Chart;
    backgroundColor(string: string): I_Chart;
    bkg(string: string): I_Chart;
    c(string: string): I_Chart;
    chart(string: string | any): I_Chart;
    encoding(string: string): I_Chart;
    icac(string: string): I_Chart;
    ichm(string: string): I_Chart;
    icretina(string: string): I_Chart;
    toBuffer(): Promise<Buffer>;
    toDataURI(string: string): Promise<string>;
    toURL(string: string): I_Chart;
    height(value: string | number): I_Chart;
    width(value: string | number): I_Chart;
}
export declare class Chart {
    ch: Chart;
    constructor(options?: ChartOptions | any);
    backgroundColor(value: string): Chart;
    bkg(value: string): Chart;
    c(value: string): Chart;
    encoding(value: string): Chart;
    icac(value: string): Chart;
    ichm(value: string): Chart;
    icretina(value: string): Chart;
    toURL(value: string): Chart;
    height(value: string | number): Chart;
    width(value: string | number): Chart;
    chart(value: string | any): Chart;
    toBuffer(): Promise<Buffer>;
    toDataURI(string: string): Promise<string>;
    plot(data: number[][], title: string, color: string, width: number, height: number): Chart;
    write(path: string): Promise<void>;
    private static init;
}
