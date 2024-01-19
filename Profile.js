import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true, lowercase: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    isCompleted: { type: Boolean, default: false },
    timeFrames: { type: [String] },
    strategies: { type: [String] },
    code:{type:String}
  },
  { timestamps: true, collection: 'Profile' }
);

const ProfileModel = mongoose.model('Profile', ProfileSchema);

export default ProfileModel;
