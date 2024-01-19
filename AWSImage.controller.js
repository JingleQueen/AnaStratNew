import Joi from 'joi';
import AWSImageService from '../services/AWSImage.service';
import ApiValidator from '../utils/ApiValidator';

const aws_bucket_url = 'https://anastrat-blogimages.s3.ap-south-1.amazonaws.com'

class AWSImageController {
  static async uploadImage(req, res, next) {
    try {
      ApiValidator.validate(
        req.file,
        Joi.object({
          mimetype: Joi.string().valid(
            'image/webp',
            'image/gif',
            'image/jpeg',
            'image/pjpeg',
            'image/x-png',
            'image/png',
            'image/svg+xml'
          ),
        })
          .unknown(true)
          .required()
          .label('file')
      );
      const result = await AWSImageService.uploadImage(
        req.file.originalname,
        req.file.mimetype,
        Buffer.from(req.file.buffer)
      );
      res.json({
        data: {
          path: `${aws_bucket_url}/${result.key}`,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getImage(req, res, next) {
    try {
      ApiValidator.validate(
        req.params,
        Joi.object({ imageKey: Joi.string().required() }).unknown(true)
      );
      const imageKey = req.params.imageKey;
      const image = await AWSImageService.getImage(imageKey);
      image.on('httpHeaders',(statusCode,headers)=>{
        res.setHeader(
          'Content-Type',headers['content-type'],
        )
      })
      const imageStream = image.createReadStream();
      imageStream.pipe(res);
    } catch (err) {
      next(err);
    }
  }
}

export default AWSImageController;
