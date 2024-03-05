const CookieKeyPrefix = 'APP_PREFIX';
export const CookieKey = {
  AccessToken: `${CookieKeyPrefix}/accessToken`,
  RefreshToken: `${CookieKeyPrefix}/refreshToken`,
  UserInfo: `${CookieKeyPrefix}/userInfo`,
};

export const SessionStorageKey = {
  OauthExternalServiceCredentials: 'oauthExternalServiceCredentials',
  PastUrl: 'pastUrl',
  SsoCredentials: 'ssoCredentials',
};

export const StorageKey = {
  language: 'language',
  timezone: 'timezone',
  CurrentUser: 'user',
};
