import mongoose from 'mongoose';

// feedback model
export const schema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  feedback: {
    type: String,
  },
});

const FeedbackModel = mongoose.model('Feedback', schema);

export default FeedbackModel;
