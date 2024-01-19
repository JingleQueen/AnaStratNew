import express from 'express';

import UserBlogMetaController from '../controllers/userBlogMeta.controller';
import Auth from '../middlewares/auth';

const userBlogMetaRouter = express.Router();

/**
 * @api {post} /read Add blog to user's read list
 * @api {post} /last Add blog to user's last read list
 * @api {get} / Get user's blog meta
 */
userBlogMetaRouter.post(
  '/read/:blogId',
  Auth.ensureAuthenticated,
  UserBlogMetaController.addToUserBlogRead
);

userBlogMetaRouter.post(
  '/last-read/:blogId',
  Auth.ensureAuthenticated,
  UserBlogMetaController.addToUserLastBlogRead
);

userBlogMetaRouter.get('/', Auth.ensureAuthenticated, UserBlogMetaController.getUserBlogMeta);

export default userBlogMetaRouter;
