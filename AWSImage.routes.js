import express from 'express';
import multer from 'multer';
import AWSImageController from '../controllers/AWSImage.controller';
import Auth from '../middlewares/auth';

const AWSImageRouter = express.Router();

AWSImageRouter.post(
  '/image',
  Auth.ensureAuthenticated,
  multer().single('file'),
  AWSImageController.uploadImage
);
AWSImageRouter.get('/image/:imageKey', AWSImageController.getImage);

export default AWSImageRouter;
