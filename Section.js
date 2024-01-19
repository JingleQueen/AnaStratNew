import mongoose from 'mongoose';

export const SectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    slug: { type: String },
    published: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: 'Sections',
  }
);

const SectionModel = mongoose.model('Sections', SectionSchema);

export default SectionModel;
