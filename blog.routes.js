import express from 'express';

import BlogController from '../controllers/blog.controller';
import Auth from '../middlewares/auth';

const blogRouter = express.Router();

blogRouter.put(
  '/add-slug',
  Auth.ensureAuthenticated,
  Auth.ensureAdmin,
  BlogController.addSlugAllBlogs
);

// Getting Recent Blog
blogRouter.get('/recent', BlogController.getRecentBlogs);

// Publish A Blog
blogRouter.post('/publish', Auth.ensureAuthenticated, Auth.ensureAdmin, BlogController.publishBlog);

// UnPublish A Blog
blogRouter.post(
  '/unpublish',
  Auth.ensureAuthenticated,
  Auth.ensureAdmin,
  BlogController.unpublishBlog
);

blogRouter.get('/blog', BlogController.getBlogBySlug);

blogRouter.get('/:blogId', BlogController.getBlog);
blogRouter.delete(
  '/:blogId',
  Auth.ensureAuthenticated,
  Auth.ensureAdmin,
  BlogController.deleteBlog
);
blogRouter.get('/', BlogController.getAllBlogs);
blogRouter.post('/', Auth.ensureAuthenticated, Auth.ensureAdmin, BlogController.createBlog);
blogRouter.put('/', Auth.ensureAuthenticated, Auth.ensureAdmin, BlogController.updateBlog);

export default blogRouter;
