// import * as Chart1 from 'chart.js-image';
// import * as fs from 'fs';


// let chartData = (title: string, data: {x: number, y: number}[]) => ({
//     type: "scatter",
//     data: {
//         datasets: [
//             {
//                 label: title,
//                 data
//             },
//         ]
//     },
//     options: {
//         title: {
//             display: false,
//             text: "Chart.js Line Chart"
//         },
//         scales: {
//             xAxes: [
//                 {
//                     stacked: true,
//                     scaleLabel: {
//                         display: true,
//                         labelString: "X"
//                     }
//                 }
//             ],
//             yAxes: [
//                 {
//                     stacked: true,
//                     scaleLabel: {
//                         display: true,
//                         labelString: "Y"
//                     }
//                 }
//             ]
//         }
//     }
// })

// export interface ChartOptions {
//     timeout?: number;
//     secret?: string;
//     host?: string;
//     protocol?: string;
//     port?: number;
//     pathname?: string;
// }
// export interface I_Chart {
//     new(options: ChartOptions): I_Chart;
//     backgroundColor(string: string): I_Chart;
//     bkg(string: string): I_Chart;
//     c(string: string): I_Chart;
//     chart(string: string | any): I_Chart;
//     encoding(string: string): I_Chart;
//     icac(string: string): I_Chart;
//     ichm(string: string): I_Chart;
//     icretina(string: string): I_Chart;
//     toBuffer(): Promise<Buffer>;
//     toDataURI(string: string): Promise<string>;
//     toURL(string: string): I_Chart;
//     height(value: string | number): I_Chart;
//     width(value: string | number): I_Chart;
// }

// export class Chart {
//     ch: Chart;
//     constructor(
//         options?: ChartOptions | any
//     ) {
//         // @ts-ignore
//         let c = new Chart1(options) as Chart;
//         this.ch = c;
//     }
//     backgroundColor(value: string): Chart {
//         return Chart.init(this.ch.backgroundColor(value))
//     }
//     bkg(value: string): Chart {
//         return Chart.init(this.ch.bkg(value))
//     }
//     c(value: string): Chart {
//         return Chart.init(this.ch.c(value))
//     }
//     encoding(value: string): Chart {
//         return Chart.init(this.ch.encoding(value))
//     }
//     icac(value: string): Chart {
//         return Chart.init(this.ch.icac(value))
//     }
//     ichm(value: string): Chart {
//         return Chart.init(this.ch.ichm(value))
//     }
//     icretina(value: string): Chart {
//         return Chart.init(this.ch.icretina(value))
//     }
//     toURL(value: string): Chart {
//         return Chart.init(this.ch.toURL(value))
//     }
//     height(value: string | number): Chart {
//         return Chart.init(this.ch.height(value))
//     }
//     width(value: string | number): Chart {
//         return Chart.init(this.ch.width(value))
//     }
//     chart(value: string | any): Chart {
//         return Chart.init(this.ch.chart(value))
//     }
//     toBuffer(): Promise<Buffer> {return this.ch.toBuffer() as Promise<Buffer>}
//     toDataURI(string: string): Promise<string> {return this.ch.toDataURI(string) as Promise<string>}
//     plot(data: number[][], title: string, color: string, width: number, height: number) {
//         let c = this.chart(chartData(title, data.map(x => ({x: x[0], y: x[1]}))))
//             .backgroundColor(color)
//             .width(width)
//             .height(height)
//         return Chart.init(c);
//     }
//     async write(path: string) {
//         fs.writeFileSync(path, await this.toBuffer());
//     }
//     private static init(c: Chart) {
//         let chart = new Chart();
//         chart.ch = c;
//         return chart;
//     }
// }