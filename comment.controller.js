import BlogService from '../services/blog.service';
import CommentService from '../services/comment.service';
import logger from '../utils/logger';

class CommentController {
  static async commentBlog(req, res, next) {
    try {
      const { blogId, content } = req.body;
      const { name, _id } = req.user;
      logger.debug({ message: `Commenting blog with blogId: ${blogId}` });
      const comment = await CommentService.commentBlog({
        blogId,
        content,
        userName: name,
        userId: _id,
      });
      return res.status(200).json({
        status: 'success',
        data: comment,
      });
    } catch (err) {
      logger.error({ message: `Error in commenting blog`, err });
      return next(err);
    }
  }

  static async replyComment(req, res, next) {
    const { commentId, content } = req.body;
    try {
      const { name, _id } = req.user;
      logger.debug({ message: `Replying comment with commentId: ${commentId}` });
      const comment = await CommentService.replyComment({
        commentId,
        content,
        userName: name,
        userId: _id,
      });
      return res.status(200).json({
        status: 'success',
        data: comment,
      });
    } catch (err) {
      logger.error({ message: `Error in replying comment`, err });
      return next(err);
    }
  }

  static async getRecentComments(req, res, next) {
    try {
      const { limit } = req.query;
      logger.debug({ message: `Getting recent comments` });
      const comments = await CommentService.getRecentComments(limit);
      const commentsWithBlogTitles = await BlogService.getCommentsWithBlogTitles(comments);
      return res.status(200).json({
        status: 'success',
        data: commentsWithBlogTitles,
      });
    } catch (err) {
      logger.error({ message: `Error in getting recent comments`, err });
      return next(err);
    }
  }

  static async getBlogComments(req, res, next) {
    const { blogId } = req.params;
    try {
      logger.debug({ message: `Getting blog comments with blogId: ${blogId}` });
      const comments = await CommentService.getBlogComments(blogId);
      return res.status(200).json({
        status: 'success',
        data: comments,
      });
    } catch (err) {
      logger.error({ message: `Error in getting blog comments with blogId: ${blogId}`, err });
      return next(err);
    }
  }
}

export default CommentController;
