import { PaginationQueryParams } from '../../../shared/models/requests';

export type ViewPointPaginateRequest = {
  keyword?: string;
  pagination?: PaginationQueryParams;
};


export type CreateViewPointPayloadRequest = {
  name: string;
  description: string;
  lat: number;
  long: number;
};


export type EditViewPointPayloadRequest = {
  name: string;
  description: string;
  lat: number;
  long: number;
};
