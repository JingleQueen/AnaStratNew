import S3 from 'aws-sdk/clients/s3';
import config from '../utils/config';
const s3 = new S3({
  accessKeyId: config.get('aws:accessKey'),
  secretAccessKey: config.get('aws:secretAccessKey'),
  region: 'ap-south-1'
});

const bucket = config.get('aws:bucket');

class AWSImageService {
  static async uploadImage(filename, fileType, data) {
    const params = {
      Bucket: bucket,
      Body: data,
      Key: filename.split('.').slice(0,-1) + '_' + (Math.random() + 1).toString(36).substring(7)+'.'+filename.split('.').slice(-1),
      ContentType:fileType
    };
    return s3.upload(params).promise();
  }

  static async getImage(imageKey) {
    const params = {
      Key: imageKey,
      Bucket: bucket,
    };
    return await s3.getObject(params);
  }
}

export default AWSImageService;
