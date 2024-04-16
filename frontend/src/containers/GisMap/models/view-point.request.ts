import { PaginationQueryParams } from '../../../shared/models/requests';

export type ViewPointPaginateRequest = {
  keyword?: string;
  pagination?: PaginationQueryParams;
};
