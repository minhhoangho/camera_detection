import { atom } from 'recoil';

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

export const userState = atom<UserInfo | null>({
  key: userStateKey,
  default: null,
});
