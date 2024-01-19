import BlogService from '../services/blog.service';
import CommentService from '../services/comment.service';
import SectionService from '../services/section.service';
import logger from '../utils/logger';
import BlogUtils from '../utils/BlogUtils';

class BlogController {
  static async createBlog(req, res, next) {
    const { sectionId } = req.body;
    try {
      logger.debug({ message: `Creating  blog` });
      const blog = await BlogService.createBlog({ sectionId });
      return res.status(200).json({
        status: 'success',
        data: blog,
      });
    } catch (err) {
      logger.error({ message: `Error in creating or updating blog`, err });
      return next(err);
    }
  }

  static async updateBlog(req, res, next) {
    try {
      const { blogId, title, content, sectionId } = req.body;
      let slug;
      if (title) {
        slug = BlogUtils.slugify(title);
      }
      logger.debug({ message: `Updating blog with blogId: ${blogId}` });
      await BlogService.updateBlog({ blogId, title, content, sectionId, slug });
      return res.status(200).json({
        status: 'success',
        message: 'Blog updated successfully',
      });
    } catch (err) {
      logger.error({ message: `Error in creating or updating blog`, err });
      return next(err);
    }
  }

  static async getAllBlogs(req, res, next) {
    try {
      logger.debug({ message: `Getting all blogs` });
      const blogs = await BlogService.getAllBlogs();
      return res.status(200).json({
        status: 'success',
        data: blogs,
      });
    } catch (err) {
      logger.error({ message: `Error in getting all blogs`, err });
      return next(err);
    }
  }

  static async getBlog(req, res, next) {
    try {
      const { blogId } = req.params;

      if (!blogId) {
        return res.status(400).json({
          status: 'error',
          message: 'Blog id is required',
        });
      }

      logger.debug({ message: `Getting blog with blogId: ${blogId}` });
      const blog = await BlogService.getBlog(blogId);
      const comments = await CommentService.getBlogComments(blogId);

      if (!blog) {
        return res.status(404).json({
          status: 'error',
          message: 'Blog not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          blog,
          comments,
        },
      });
    } catch (err) {
      logger.error({ message: `Error in getting blog with blogId: ${blogId}`, err });
      return next(err);
    }
  }

  static async deleteBlog(req, res, next) {
    try {
      const { blogId } = req.params;
      logger.debug({ message: `Deleting blog with blogId: ${blogId}` });
      await BlogService.deleteBlog(blogId);
      return res.status(200).json({
        status: 'success',
        message: 'Blog deleted successfully',
      });
    } catch (err) {
      logger.error({ message: `Error in deleting blog with blogId: ${blogId}`, err });
      return next(err);
    }
  }

  static async publishBlog(req, res, next) {
    try {
      const { blogId, description, author } = req.body;
      logger.debug({ message: `Publishing blog with blogId: ${blogId}` });
      await BlogService.publishBlog({ blogId, description, author });

      return res.status(200).json({
        status: 'success',
        message: 'Blog published successfully',
      });
    } catch (err) {
      logger.error({ message: `Error in publishing blog with blogId: ${blogId}`, err });
      return next(err);
    }
  }

  static async getRecentBlogs(req, res, next) {
    try {
      const { limit } = req.query;
      logger.debug({ message: `Getting recent blogs` });
      const blogs = await BlogService.getRecentBlogs(limit);
      return res.status(200).json({
        status: 'success',
        data: blogs,
      });
    } catch (err) {
      logger.error({ message: `Error in getting recent blogs`, err });
      return next(err);
    }
  }

  static async unpublishBlog(req, res, next) {
    const { blogId } = req.body;
    try {
      logger.debug({ message: `Unpublishing blog with blogId: ${blogId}` });
      const blog = await BlogService.unpublishBlog({ blogId });

      if (!blog) {
        return res.status(404).json({
          status: 'error',
          message: 'Blog not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Blog unpublished successfully',
        data: blog,
      });
    } catch (err) {
      logger.error({ message: `Error in unpublishing blog with blogId: ${blogId}`, err });
      return next(err);
    }
  }

  static async getBlogBySlug(req, res, next) {
    try {
      const { slug } = req.query;

      if (!slug) {
        return res.status(400).json({
          status: 'error',
          message: 'Blog slug is required',
        });
      }

      logger.debug({ message: `Getting blog with slug: ${slug}` });
      const blog = await BlogService.getBlogBySlug(slug);

      if (!blog) {
        return res.status(404).json({
          status: 'error',
          message: 'Blog not found',
        });
      }

      const comments = await CommentService.getBlogComments(blog?._id);
      return res.status(200).json({
        status: 'success',
        data: {
          blog,
          comments,
        },
      });
    } catch (err) {
      logger.error({ message: `Error in getting blog with title: ${title}`, err });
      return next(err);
    }
  }

  static async addSlugAllBlogs(req, res, next) {
    try {
      logger.debug({ message: `Adding slug to all blogs` });
      await BlogService.addSlugAllBlogs();
      return res.status(200).json({
        status: 'success',
        message: 'Slug added to all blogs successfully',
      });
    } catch (err) {
      logger.error({ message: `Error in adding slug to all blogs`, err });
      return next(err);
    }
  }
}
export default BlogController;
