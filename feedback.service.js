import FeedbackModel from '../models/Feedback';

class FeedbackService {
  static async createFeedback({ feedback, user }) {
    try {
      const feedbackData = await new FeedbackModel({
        feedback,
        name: user.name,
        email: user.email,
        userId: user._id,
      });
      await feedbackData.save();
      return feedbackData;
    } catch (err) {
      throw err;
    }
  }
}

export default FeedbackService;
