import mongoose from 'mongoose';

const dhanUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    id: { type: String, required: true, trim: true, lowercase: true },
    providers: {
      type: Map,
      of: {
        name: { type: String },
        id: { type: String },
        _id: false,
      },
    },
    tags: [String]
  },
  { timestamps: true, collection: 'dhanUsers' }
);

const dhanUserModel = mongoose.model('dhanUser', dhanUserSchema);

export default dhanUserModel;
