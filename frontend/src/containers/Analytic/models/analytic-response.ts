import { ViewPointData } from '../../GisMap/models';

export type ViewPointDataAnalyticItem = {
  viewPoint: ViewPointData;
  data: Record<string, number>;
}

export type AnalyticResponse = {
  analyticData: ViewPointDataAnalyticItem[];
}
