"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chart = void 0;
const Chart1 = require("chart.js-image");
const fs = require("fs");
let chartData = (title, data) => ({
    type: "scatter",
    data: {
        datasets: [
            {
                label: title,
                data
            },
        ]
    },
    options: {
        title: {
            display: false,
            text: "Chart.js Line Chart"
        },
        scales: {
            xAxes: [
                {
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: "X"
                    }
                }
            ],
            yAxes: [
                {
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Y"
                    }
                }
            ]
        }
    }
});
class Chart {
    constructor(options) {
        // @ts-ignore
        let c = new Chart1(options);
        this.ch = c;
    }
    backgroundColor(value) {
        return Chart.init(this.ch.backgroundColor(value));
    }
    bkg(value) {
        return Chart.init(this.ch.bkg(value));
    }
    c(value) {
        return Chart.init(this.ch.c(value));
    }
    encoding(value) {
        return Chart.init(this.ch.encoding(value));
    }
    icac(value) {
        return Chart.init(this.ch.icac(value));
    }
    ichm(value) {
        return Chart.init(this.ch.ichm(value));
    }
    icretina(value) {
        return Chart.init(this.ch.icretina(value));
    }
    toURL(value) {
        return Chart.init(this.ch.toURL(value));
    }
    height(value) {
        return Chart.init(this.ch.height(value));
    }
    width(value) {
        return Chart.init(this.ch.width(value));
    }
    chart(value) {
        return Chart.init(this.ch.chart(value));
    }
    toBuffer() { return this.ch.toBuffer(); }
    toDataURI(string) { return this.ch.toDataURI(string); }
    plot(data, title, color, width, height) {
        let c = this.chart(chartData(title, data.map(x => ({ x: x[0], y: x[1] }))))
            .backgroundColor(color)
            .width(width)
            .height(height);
        return Chart.init(c);
    }
    write(path) {
        return __awaiter(this, void 0, void 0, function* () {
            fs.writeFileSync(path, yield this.toBuffer());
        });
    }
    static init(c) {
        let chart = new Chart();
        chart.ch = c;
        return chart;
    }
}
exports.Chart = Chart;
//# sourceMappingURL=chart.js.map