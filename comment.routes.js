import express from 'express';

import CommentController from '../controllers/comment.controller';
import Auth from '../middlewares/auth';

const commentRouter = express.Router();

commentRouter.post('/reply', Auth.ensureAuthenticated, CommentController.replyComment);
commentRouter.post('/', Auth.ensureAuthenticated, CommentController.commentBlog);
commentRouter.get('/recent', CommentController.getRecentComments);
commentRouter.get('/:blogId', CommentController.getBlogComments);

export default commentRouter;
