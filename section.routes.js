import express from 'express';

import SectionController from '../controllers/section.controller';
import Auth from '../middlewares/auth';

const sectionRouter = express.Router();

sectionRouter.put(
  '/add-slug',
  Auth.ensureAuthenticated,
  Auth.ensureAdmin,
  SectionController.addSlugToAllSections
);

sectionRouter.get('/blogs/recent', SectionController.getRecentBlogs);

// Getting All Blogs of Section
sectionRouter.get('/blogs', SectionController.getAllBlogsOfSection);

// Getting a Blog Of Section
sectionRouter.get('/blog', SectionController.getBlogOfSection);

sectionRouter.get('/section', SectionController.getSectionBySlug);

// Get a Section
sectionRouter.get('/:sectionId', SectionController.getSection);

// Getting All Sections
sectionRouter.get('/', SectionController.getAllSections);

// Create a Section
sectionRouter.post(
  '/',
  Auth.ensureAuthenticated,
  Auth.ensureAdmin,
  SectionController.createSection
);

// Update a Section
sectionRouter.put('/', Auth.ensureAuthenticated, Auth.ensureAdmin, SectionController.updateSection);

// Delete a Section
sectionRouter.delete(
  '/',
  Auth.ensureAuthenticated,
  Auth.ensureAdmin,
  SectionController.deleteSection
);

export default sectionRouter;
