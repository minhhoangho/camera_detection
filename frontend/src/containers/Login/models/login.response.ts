import { UserData } from '../../UserManagement/models';

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expirationTime: number;
  user?: UserData;
  expiredAt?: string
};
