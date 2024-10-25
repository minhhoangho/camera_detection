import { request } from '../utils/request';
import { AnalyticResponse } from '../containers/Analytic/models/analytic-response';


export const getAnalyticData = async (): Promise<AnalyticResponse> => {
  return request.get(
    `/gis-maps/analytic`,
  );
};
