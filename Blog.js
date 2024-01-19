import mongoose from 'mongoose';

export const BlogSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    content: { type: String },
    published: { type: Boolean, default: false },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
    author: { type: String },
    isNormalBlog: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    slug: { type: String },
  },
  {
    timestamps: true,
    collection: 'Blogs',
  }
);

const BlogModel = mongoose.model('Blogs', BlogSchema);

export default BlogModel;
