import logger from '../utils/logger';
import FeedbackService from '../services/feedback.service';
import ApiValidator from '../utils/ApiValidator';
import Joi from 'joi';

class FeedbackController {
  static async createFeedback(req, res, next) {
    const { user } = req;
    const { feedback } = req.body;

    try {
      ApiValidator.validate(
        req.body,
        Joi.object({
          feedback: Joi.string().required(),
        }).unknown(true)
      );

      logger.debug({ message: `Creating  feedback` });
      const feedbackData = await FeedbackService.createFeedback({ feedback, user });
      return res.status(200).json({
        status: 'success',
        data: feedbackData,
      });
    } catch (err) {
      logger.error({ message: `Error in creating or updating feedback ${feedback}`, err });
      return next(err);
    }
  }
}
export default FeedbackController;
