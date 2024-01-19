import Express from 'express';

import FeedbackController from '../controllers/feedback.controller';
import Auth from '../middlewares/auth';
const FeedBackRouter = Express.Router();

FeedBackRouter.post('/add', Auth.ensureAuthenticated, FeedbackController.createFeedback);

export default FeedBackRouter;
