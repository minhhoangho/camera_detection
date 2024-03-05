import { request } from '../utils/request';
import {
  ListUserPaginateResponse,
  ListUserPaginateRequest,
} from '../containers/UserManagement/models';

export const listUserPaginate = async ({
  pagination,
  keyword,
}: ListUserPaginateRequest): Promise<ListUserPaginateResponse> => {
  const offsetParam = `offset=${pagination?.offset ?? ''}`;
  const limitParam = `limit=${pagination?.limit ?? ''}`;
  const keywordParam = `keyword=${keyword ?? ''}`;
  return request.get(`/users/?${offsetParam}&${limitParam}&${keywordParam}`);
};
