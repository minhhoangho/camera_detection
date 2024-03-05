import { PaginationQueryParams } from '../../../shared/models/requests';

export type ListUserPaginateRequest = {
  keyword?: string;
  pagination?: PaginationQueryParams;
};
