export const ENV = process.env['NEXT_PUBLIC_ENV'] ?? '';
export const API_BASE_URL = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? '';
export const FE_URL = process.env['NEXT_PUBLIC_URL'] ?? '';
export const CLOUD_FRONT = process.env['NEXT_PUBLIC_CLOUD_FRONT'] ?? '';
export const S3Config = {
  secretAccessKey: process.env['NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY'] ?? '',
  accessKeyId: process.env['NEXT_PUBLIC_AWS_ACCESS_KEY_ID'] ?? '',
  region: process.env['NEXT_PUBLIC_AWS_S3_REGION'] ?? '',
  bucketName: process.env['NEXT_PUBLIC_AWS_S3_PUBLIC_BUCKET'] ?? '',
}
export const Environment = {
  Local: 'local',
  Dev: 'dev',
  Qa: 'qa',
  Stg: 'stg',
  Prod: 'prod',
};
