export const ENV = process.env['NEXT_PUBLIC_ENV'] ?? '';
export const API_BASE_URL = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? '';
export const FE_URL = process.env['NEXT_PUBLIC_URL'] ?? '';
export const CLOUD_FRONT = process.env['NEXT_PUBLIC_CLOUD_FRONT'] ?? '';
export const Environment = {
  Local: 'local',
  Dev: 'dev',
  Qa: 'qa',
  Stg: 'stg',
  Prod: 'prod',
};
