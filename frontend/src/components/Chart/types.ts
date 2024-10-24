// Typescript declarations for Apex class and module.
// Note: When you have a class and a module with the same name; the module is merged
// with the class.  This is necessary since apexcharts exports the main ApexCharts class only.
//
// This is a sparse typed declarations of chart interfaces.  See Apex Chart documentation
// for comprehensive API:  https://apexcharts.com/docs/options
//
// There is on-going work to provide a comprehensive typed definition for this component.
// See https://github.com/DefinitelyTyped/DefinitelyTyped/pull/28733


import { ApexOptions } from 'apexcharts';

export interface ApexChartProps {
  type?:
    | "line"
    | "area"
    | "bar"
    | "pie"
    | "donut"
    | "radialBar"
    | "scatter"
    | "bubble"
    | "heatmap"
    | "candlestick"
    | "boxPlot"
    | "radar"
    | "polarArea"
    | "rangeBar"
    | "rangeArea"
    | "treemap";
  series?: ApexOptions["series"];
  width?: string | number;
  height?: string | number;
  options?: Omit<ApexOptions, 'theme'>;
  [key: string]: any;
}
