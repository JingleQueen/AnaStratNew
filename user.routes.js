import express from 'express';
import UserController from '../controllers/user.controller';
import Auth from '../middlewares/auth';

const userRouter = express.Router();

userRouter.get('/profile/tags', Auth.ensureAuthenticated, UserController.getTags);
userRouter.get('/profile', Auth.ensureAuthenticated, UserController.getProfile)
userRouter.put('/profile', Auth.ensureAuthenticated, UserController.updateProfile)
userRouter.post('/strategy', Auth.ensureAuthenticated, UserController.createStrategy)
userRouter.delete('/strategy', Auth.ensureAuthenticated, UserController.deleteStrategy)

export default userRouter;
