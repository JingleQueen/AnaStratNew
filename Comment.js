import mongoose from 'mongoose';

export const CommentSchema = new mongoose.Schema(
  {
    content: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: { type: String },
    createdAt: { type: Date, default: Date.now },
    replies: [
      {
        content: { type: String },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
  },
  {
    timestamps: true,
    collection: 'Comments',
  }
);

const CommentModel = mongoose.model('Comments', CommentSchema);

export default CommentModel;
