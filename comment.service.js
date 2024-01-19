import CommentModel from '../models/Comment';
import logger from '../utils/logger';

class CommentService {
  static async commentBlog({ blogId, content, userId, userName }) {
    try {
      logger.debug({ message: `Commenting blog with blogId: ${blogId}` });
      const comment = await new CommentModel({
        content,
        userId,
        userName,
        blogId,
        replies: [],
      }).save();
      return comment;
    } catch (err) {
      logger.error({ message: `Error in commenting blog`, err });
      throw err;
    }
  }

  static async replyComment({ commentId, content, userId, userName }) {
    try {
      logger.debug({ message: `Replying comment with commentId: ${commentId}` });
      const comment = await CommentModel.findByIdAndUpdate(
        commentId,
        {
          $push: { replies: { content, userId, userName } },
        },
        { new: true }
      );
      return comment;
    } catch (err) {
      logger.error({ message: `Error in replying comment`, err });
      throw err;
    }
  }

  static async getRecentComments(limit) {
    try {
      logger.debug({ message: `Getting recent comments` });
      const comments = await CommentModel.find().sort({ createdAt: -1 }).limit(Number(limit));
      return comments;
    } catch (err) {
      logger.error({ message: `Error in getting recent comments`, err });
      throw err;
    }
  }

  static async getBlogComments(blogId) {
    try {
      logger.debug({ message: `Getting blog comments with blogId: ${blogId}` });
      const comments = await CommentModel.find({ blogId });
      return comments;
    } catch (err) {
      logger.error({ message: `Error in getting blog comments`, err });
      throw err;
    }
  }
}

export default CommentService;
