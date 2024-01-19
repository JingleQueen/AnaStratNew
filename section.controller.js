import SectionService from '../services/section.service';
import BlogService from '../services/blog.service';
import logger from '../utils/logger';
import CommentService from '../services/comment.service';
import BlogUtils from '../utils/BlogUtils';

class SectionController {
  static async createSection(req, res, next) {
    const { title, description } = req.body;
    try {
      logger.debug({ message: `Creating  section` });
      const slug = BlogUtils.slugify(title);
      const section = await SectionService.createSection({ title, description, slug });
      return res.status(200).json({
        status: 'success',
        data: section,
      });
    } catch (err) {
      logger.error({ message: `Error in creating or updating section`, err });
      return next(err);
    }
  }

  static async updateSection(req, res, next) {
    try {
      const { sectionId, title, description, published } = req.body;
      logger.debug({ message: `Updating section with sectionId: ${sectionId}` });

      let slug;

      if (title) {
        slug = BlogUtils.slugify(title);
      }

      const section = await SectionService.updateSection({
        sectionId,
        title,
        description,
        slug,
        published,
      });
      return res.status(200).json({
        status: 'success',
        message: 'Section updated successfully',
        data: section,
      });
    } catch (err) {
      logger.error({ message: `Error in creating or updating section`, err });
      return next(err);
    }
  }

  static async getAllSections(req, res, next) {
    try {
      logger.debug({ message: `Getting all sections` });
      const sections = await SectionService.getAllSections();
      return res.status(200).json({
        status: 'success',
        data: sections,
      });
    } catch (err) {
      logger.error({ message: `Error in getting all sections`, err });
      return next(err);
    }
  }

  static async getSection(req, res, next) {
    try {
      const { sectionId } = req.params;

      if (!sectionId) {
        return res.status(400).json({
          status: 'error',
          message: 'Section id is required',
        });
      }

      logger.debug({ message: `Getting section with sectionId: ${sectionId}` });
      const section = await SectionService.getSection(sectionId);

      if (!section) {
        return res.status(404).json({
          status: 'error',
          message: 'Section not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: section,
      });
    } catch (err) {
      logger.error({ message: `Error in getting section`, err });
      return next(err);
    }
  }

  static async deleteSection(req, res, next) {
    try {
      const { sectionId } = req.query;
      logger.debug({ message: `Deleting section with sectionId: ${sectionId}` });
      await SectionService.deleteSection(sectionId);
      await BlogService.deleteBlogsBySectionId(sectionId);
      return res.status(200).json({
        status: 'success',
        message: 'Section deleted successfully',
      });
    } catch (err) {
      logger.error({ message: `Error in deleting section`, err });
      return next(err);
    }
  }

  static async getAllBlogsOfSection(req, res, next) {
    try {
      const { sectionId } = req.query;
      logger.debug({ message: `Getting blogs of section with sectionId: ${sectionId}` });
      const section = await SectionService.getSection(sectionId);

      if (!section) {
        return res.status(404).json({
          status: 'error',
          message: 'Section not found',
        });
      }

      const blogs = await BlogService.getBlogsBySectionId(sectionId);
      return res.status(200).json({
        status: 'success',
        data: {
          section,
          blogs,
        },
      });
    } catch (err) {
      logger.error({ message: `Error in getting blogs of section`, err });
      return next(err);
    }
  }

  static async getBlogOfSection(req, res, next) {
    const { sectionId, blogId } = req.query;
    logger.debug({ message: `Getting blog of section with sectionId: ${sectionId}` });

    if (!sectionId || !blogId) {
      return res.status(400).json({
        status: 'error',
        message: 'Section id and blog id are required',
      });
    }
    try {
      const section = await SectionService.getSection(sectionId);
      const blog = await BlogService.getBlog(blogId);
      const comments = await CommentService.getBlogComments(blogId);
      return res.status(200).json({
        status: 'success',
        data: {
          section,
          blog,
          comments,
        },
      });
    } catch (err) {
      logger.error({ message: `Error in getting blog of section`, err });
      return next(err);
    }
  }

  static async getRecentBlogs(req, res, next) {
    const { limit } = req.query;
    try {
      logger.debug({ message: `Getting recent blogs` });
      const blogs = await BlogService.getSectionsRecentBlogs(limit);
      const blogWithSectionTitle = await SectionService.getBlogsWithSectionTitles(blogs);
      return res.status(200).json({
        status: 'success',
        data: blogWithSectionTitle,
      });
    } catch (err) {
      logger.error({ message: `Error in getting recent blogs`, err });
      return next(err);
    }
  }

  static async getSectionBySlug(req, res, next) {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({
        status: 'error',
        message: 'slug is required',
      });
    }

    try {
      logger.debug({ message: `Getting section with slug: ${slug}` });
      const section = await SectionService.getSectionBySlug(slug);

      if (!section) {
        return res.status(404).json({
          status: 'error',
          message: 'Section not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: section,
      });
    } catch (err) {
      logger.error({ message: `Error in getting section`, err });
      return next(err);
    }
  }

  static async addSlugToAllSections(req, res, next) {
    try {
      logger.debug({ message: `Adding slug to all sections` });
      await SectionService.addSlugToAllSections();
      return res.status(200).json({
        status: 'success',
        message: 'Slug added to all sections successfully',
      });
    } catch (err) {
      logger.error({ message: `Error in adding slug to all sections`, err });
      return next(err);
    }
  }
}

export default SectionController;
