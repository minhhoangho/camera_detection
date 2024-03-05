import { PaginationMeta } from '../../../shared/models/responses';


export type UserData = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}
export type ListUserPaginateResponse = {
  data: UserData[];
  pagination: PaginationMeta;
};
