import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from 'src/constants';


function getHeaders() {
  return {
    // 'X-HTTP-App-Id': getAppID(),
    // 'X-HTTP-Mode': 'G',
    // 'Accept-Language': 'ja',
    // 'X-Mobile-Device-Type': 'web',
  };
}

function getApi(path: string, option = {}): Promise<AxiosResponse> {
  return axios.get(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
    ...option,
    withCredentials: true,
  });
}

function postApi(
  path: string,
  body: Record<string,any>,
  option = {},
): Promise<AxiosResponse> {
  return axios.post(`${API_BASE_URL}/${path.replace(/^\//, '')}`, body, {
    headers: getHeaders(),
    ...option,
    withCredentials: true,
  });
}

function putApi(
  path: string,
  body: Record<string,any>,
  option = {},
): Promise<AxiosResponse> {
  return axios.put(`${API_BASE_URL}/${path.replace(/^\//, '')}`, body, {
    headers: getHeaders(),
    ...option,
    withCredentials: true,
  });
}

function deleteApi(path: string, option = {}): Promise<AxiosResponse> {
  return axios.delete(`${API_BASE_URL}/${path.replace(/^\//, '')}`, {
    headers: getHeaders(),
    ...option,
    withCredentials: true,
  });
}

function patchApi(
  path: string,
  body: Record<string,any>,
  option = {},
): Promise<AxiosResponse> {
  return axios.patch(`${API_BASE_URL}/${path.replace(/^\//, '')}`, body, {
    headers: getHeaders(),
    ...option,
    withCredentials: true,
  });
}

const Api = {
  get: getApi,
  post: postApi,
  put: putApi,
  patch: patchApi,
  delete: deleteApi,
};

export default Api;
