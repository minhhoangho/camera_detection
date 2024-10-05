import { S3Config } from '../../constants';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const S3 = require("react-aws-s3")

const config = {
  bucketName: S3Config.bucketName,
  region: S3Config.region,
  accessKeyId: S3Config.accessKeyId,
  secretAccessKey: S3Config.secretAccessKey,
};

const S3Client = new S3(config);

export { S3Client };
