import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    providers: {
      type: Map,
      of: {
        name: { type: String },
        email: { type: String },
        id: { type: String },
        _id: false,
        password: { type: String },
      },
    },
    tags: [String],
    isVerified: { type: Boolean },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'Users' }
);

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
