import express from 'express';
import AuthController from '../controllers/auth.controller';

const authRouter = express.Router();

authRouter.post('/signUp',AuthController.handleRegistration);
authRouter.post('/signIn',AuthController.handleLogin);

export default authRouter;