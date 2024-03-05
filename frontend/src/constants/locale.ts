import { Environment } from './app-config';

export const LOCALE = {
  JAPANESE: 'ja',
  ENGLISH: 'en',
};

export const ErrorMessageType = {
  Detailed: 'detail',
  Wrapped: 'wrapped',
};

export const Environment2ErrorMessageType = {
  [Environment.Local]: ErrorMessageType.Detailed,
  [Environment.Dev]: ErrorMessageType.Detailed,
  [Environment.Qa]: ErrorMessageType.Detailed,
  [Environment.Stg]: ErrorMessageType.Wrapped,
  [Environment.Prod]: ErrorMessageType.Wrapped,
};

export const PREFIX = 'error-message-';