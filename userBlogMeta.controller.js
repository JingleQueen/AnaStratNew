import logger from '../utils/logger';

import UserBlogMetaService from '../services/userBlogMeta.service';

class UserBlogMetaController {
  static async addToUserBlogRead(req, res, next) {
    const { blogId } = req.params;
    const { userId } = req.user;
    if (!blogId) {
      return res.status(400).json({
        status: 'error',
        message: 'Blog id is required',
      });
    }
    try {
      const userBlogMeta = await UserBlogMetaService.addToUserBlogRead(userId, blogId);
      return res.status(200).json({
        status: 'success',
        data: userBlogMeta,
      });
    } catch (err) {
      logger.error({
        message: `Error in adding blog with blogId: ${blogId} in user read userId ${userId}`,
        err,
      });
      return next(err);
    }
  }

  static async addToUserLastBlogRead(req, res, next) {
    const { blogId } = req.params;
    const { userId } = req.user;
    if (!blogId) {
      return res.status(400).json({
        status: 'error',
        message: 'Blog id is required',
      });
    }
    try {
      const userBlogMeta = await UserBlogMetaService.addToUserLastBlogRead(userId, blogId);
      return res.status(200).json({
        status: 'success',
        data: userBlogMeta,
      });
    } catch (err) {
      logger.error({
        message: `Error in adding blog with blogId: ${blogId} in user last read userId ${userId}`,
        err,
      });
      return next(err);
    }
  }

  static async getUserBlogMeta(req, res, next) {
    const { userId } = req.user;
    try {
      const userBlogMeta = await UserBlogMetaService.getUserBlogMeta(userId);
      if (!userBlogMeta) {
        return res.status(404).json({
          status: 'error',
          message: 'User blog meta not found',
        });
      }
      return res.status(200).json({
        status: 'success',
        data: userBlogMeta,
      });
    } catch (err) {
      logger.error({
        message: `Error in getting user blog meta for userId ${userId}`,
        err,
      });
      return next(err);
    }
  }
}

export default UserBlogMetaController;
