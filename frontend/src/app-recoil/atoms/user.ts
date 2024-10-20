import { atom } from 'recoil';
import { UserData } from '../../containers/UserManagement/models';

export const userStateKey = 'User';

export type Role = {
  id: number;
  name: string;
  key: string;
};

export type UserInfo = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  role: Role;
  email: string;
};

export const userState = atom<UserInfo | UserData>({
  key: userStateKey,
});
