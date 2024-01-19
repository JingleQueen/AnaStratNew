import BlogModel from '../models/Blog';
import BlogUtils from '../utils/BlogUtils';

class BlogService {
  static async createBlog({ sectionId }) {
    try {
      let blog;
      if (sectionId) {
        blog = await new BlogModel({
          title: '',
          content: '',
          description: '',
          sectionId,
        });
      } else {
        blog = await new BlogModel({
          title: '',
          content: '',
          description: '',
          isNormalBlog: true,
        });
      }
      await blog.save();
      return blog;
    } catch (err) {
      throw err;
    }
  }

  static async updateBlog({ blogId, title, content, sectionId, slug }) {
    try {
      const blog = await BlogModel.findByIdAndUpdate(
        blogId,
        {
          title,
          content,
          sectionId,
          slug,
        },
        { new: true }
      );

      return blog;
    } catch (err) {
      throw err;
    }
  }

  static async getAllBlogs() {
    try {
      const blogs = await BlogModel.find({
        isNormalBlog: true,
        isDeleted: {
          $ne: true,
        },
      }).sort({ createdAt: 1 });
      return blogs;
    } catch (err) {
      throw err;
    }
  }

  static async getBlog(blogId) {
    try {
      const blog = await BlogModel.findById(blogId);
      return blog;
    } catch (err) {
      throw err;
    }
  }

  static async deleteBlog(blogId) {
    try {
      await BlogModel.findByIdAndUpdate(blogId, {
        isDeleted: true,
      });
    } catch (err) {
      throw err;
    }
  }

  static async publishBlog({ blogId, description, author }) {
    try {
      await BlogModel.findByIdAndUpdate(blogId, {
        published: true,
        description,
        author,
      });
    } catch (err) {
      throw err;
    }
  }

  static async unpublishBlog({ blogId }) {
    try {
      const blog = await BlogModel.findByIdAndUpdate(
        blogId,
        {
          published: false,
        },
        { new: true }
      );

      return blog;
    } catch (err) {
      throw err;
    }
  }

  static async getBlogsBySectionId(sectionId) {
    try {
      const blogs = await BlogModel.find({
        sectionId,
        isDeleted: {
          $ne: true,
        },
      }).sort({
        createdAt: 1,
      });
      return blogs;
    } catch (err) {
      throw err;
    }
  }

  static async getCommentsWithBlogTitles(comments) {
    try {
      const commentsWithBlogTitle = await Promise.all(
        comments.map(async (comment) => {
          const blog = await BlogModel.findById(comment.blogId);
          return { ...comment._doc, blogTitle: blog.title };
        })
      );
      return commentsWithBlogTitle;
    } catch (err) {
      throw err;
    }
  }

  static async getRecentBlogs(limit) {
    console.log({ limit });
    try {
      const blogs = await BlogModel.find({
        published: true,
        isDeleted: { $ne: true },
        isNormalBlog: true,
      })
        .sort({ createdAt: -1 })
        .limit(Number(limit));
      return blogs;
    } catch (err) {
      throw err;
    }
  }

  static async deleteBlogsBySectionId(sectionId) {
    try {
      await BlogModel.findByIdAndUpdate(sectionId, {
        isDeleted: true,
      });
    } catch (err) {
      throw err;
    }
  }

  static async getSectionsRecentBlogs(limit) {
    try {
      const blogs = await BlogModel.find({
        published: true,
        isDeleted: { $ne: true },
        isNormalBlog: { $ne: true },
      })
        .sort({ createdAt: -1 })
        .limit(Number(limit));
      return blogs;
    } catch (err) {
      throw err;
    }
  }

  static async getBlogBySlug(slug) {
    try {
      const blog = await BlogModel.findOne({
        slug,
        isDeleted: { $ne: true },
      });
      return blog;
    } catch (err) {
      throw err;
    }
  }

  static async addSlugAllBlogs() {
    try {
      const blogs = await BlogModel.find({
        isDeleted: { $ne: true },
      });
      await Promise.all(
        blogs.map(async (blog) => {
          const slug = BlogUtils.slugify(blog.title);
          await BlogModel.findByIdAndUpdate(blog._id, { slug });
        })
      );
    } catch (err) {
      throw err;
    }
  }
}

export default BlogService;
