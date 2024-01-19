import mongoose from 'mongoose';

const UserBlogMetaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    blogsRead: [
      {
        blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
      },
    ],
    lastBlogRead: {
      blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
    },
  },
  {
    timestamps: true,
    collection: 'UserBlogMeta',
  }
);

const UserBlogMetaModel = mongoose.model('UserBlogMeta', UserBlogMetaSchema);

export default UserBlogMetaModel;
