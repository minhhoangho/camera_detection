import AWS from 'aws-sdk';
import S3 from 'aws-sdk/clients/s3';
import { S3Config } from '../../constants';

const config = {
  bucketName: S3Config.bucketName,
  region: S3Config.region,
  accessKeyId: S3Config.accessKeyId,
  secretAccessKey: S3Config.secretAccessKey,
};


AWS.config.update(config);

const S3Client = new S3({
  params: { Bucket: config.bucketName },
  region: config.region,
});


export { S3Client };
