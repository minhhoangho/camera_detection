import axios from 'axios';
import get from 'lodash/get';
import qs from 'qs';
import humps from 'humps';
import { API_BASE_URL } from 'src/constants';
import { toast } from 'src/components/Toast';
import CookiesStorage from './cookie-storage';

export const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  },
  paramsSerializer: (params) =>
    qs.stringify(params, { arrayFormat: 'brackets' }),
});

request.interceptors.request.use(
  (config) => {
    // config.params = humps.decamelizeKeys(config.params);
    // config.data = humps.decamelizeKeys(config.data);

    const accessToken: string = CookiesStorage.getAccessToken(); // Get accessToken
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response): any => {
    return humps.camelizeKeys(response.data);
  },
  (error) => {
    const errorResponse = error?.response;
    if (errorResponse.status === 401) {
      toast('error', 'Token expired');
      CookiesStorage.clearSession();
      window.location.href = '/login';
      return Promise.reject(errorResponse?.data);
    }
    if (error.code === 'ECONNABORTED') {
      toast('error', 'Connection timeout');
      return Promise.reject(errorResponse?.data);
    }
    toast('error', get(<object>errorResponse, 'data.message', 'Unknown error'));
    return Promise.reject(errorResponse?.data);
  },
);
