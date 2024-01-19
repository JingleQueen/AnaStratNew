import SectionModel from '../models/Section';
import BlogUtils from '../utils/BlogUtils';

class SectionService {
  static async createSection({ title, description, slug }) {
    try {
      const section = await new SectionModel({
        title,
        description,
        slug,
      });
      await section.save();
      return section;
    } catch (err) {
      throw err;
    }
  }

  static async updateSection({ sectionId, title, description, slug, published }) {
    try {
      const section = await SectionModel.findByIdAndUpdate(
        sectionId,
        {
          title,
          description,
          slug,
          published,
        },
        { new: true }
      );

      return section;
    } catch (err) {
      throw err;
    }
  }

  static async getAllSections() {
    try {
      // only return the title and description
      const sections = await SectionModel.find({
        isDeleted: {
          $ne: true,
        },
      }).sort({
        createdAt: 1,
      });
      return sections;
    } catch (err) {
      throw err;
    }
  }

  static async getSection(sectionId) {
    try {
      const section = await SectionModel.findById(sectionId);
      return section;
    } catch (err) {
      throw err;
    }
  }

  static async deleteSection(sectionId) {
    try {
      await SectionModel.findByIdAndUpdate(sectionId, { isDeleted: true });
    } catch (err) {
      throw err;
    }
  }

  static async getBlogsWithSectionTitles(blogs) {
    try {
      const blogWithSectionTitle = await Promise.all(
        blogs.map(async (blog) => {
          const section = await SectionModel.findById(blog.sectionId);
          return {
            ...blog._doc,
            sectionTitle: section.title,
          };
        })
      );
      return blogWithSectionTitle;
    } catch (err) {
      throw err;
    }
  }

  static async getSectionBySlug(slug) {
    try {
      const section = await SectionModel.findOne({ slug });
      return section;
    } catch (err) {
      throw err;
    }
  }

  static async addSlugToAllSections() {
    try {
      const sections = await SectionModel.find({});
      await Promise.all(
        sections.map(async (section) => {
          const slug = BlogUtils.slugify(section.title);
          await SectionModel.findByIdAndUpdate(section._id, { slug });
        })
      );
    } catch (err) {
      throw err;
    }
  }
}

export default SectionService;
