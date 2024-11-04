import { requestFile } from '../utils/request';



export const postBenchmark = async (modelType: string, formData: FormData): Promise<any> => {
  return requestFile.post(
    `/benchmark?model_type=${modelType}`, formData
  );
};
