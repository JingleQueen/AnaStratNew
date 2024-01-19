import UserBlogMetaModel from '../models/UserBlogMeta';

class UserBlogMetaService {
  static async addToUserBlogRead(userId, blogId) {
    try {
      const userBlogMeta = await UserBlogMetaModel.findOne({ userId });
      if (!userBlogMeta) {
        const newUserBlogMeta = new UserBlogMetaModel({
          userId,
          blogsRead: [
            {
              blogId,
            },
          ],
        });
        await newUserBlogMeta.save();
        return newUserBlogMeta;
      }
      if (!userBlogMeta.blogsRead.find((blog) => blog.blogId.toString() === blogId)) {
        userBlogMeta.blogsRead.push({
          blogId,
        });
        await userBlogMeta.save();
      }
      return userBlogMeta;
    } catch (err) {
      throw err;
    }
  }

  static async addToUserLastBlogRead(userId, blogId) {
    try {
      const userBlogMeta = await UserBlogMetaModel.findOne({ userId });
      if (!userBlogMeta) {
        const newUserBlogMeta = new UserBlogMetaModel({
          userId,
          lastBlogRead: {
            blogId,
          },
        });
        await newUserBlogMeta.save();
        return newUserBlogMeta;
      }
      userBlogMeta.lastBlogRead = { blogId };
      await userBlogMeta.save();
      return userBlogMeta;
    } catch (err) {
      throw err;
    }
  }

  static async getUserBlogMeta(userId) {
    try {
      const userBlogMeta = await UserBlogMetaModel.findOne({ userId });
      return userBlogMeta;
    } catch (err) {
      throw err;
    }
  }
}

export default UserBlogMetaService;
