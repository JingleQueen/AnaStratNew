
import UserService from '../services/user.service';
import Joi from 'joi';
import ApiValidator from '../utils/ApiValidator';
import logger from '../utils/logger';

class UserController {
    static async getTags(req, res, next) {
        try {
            const userId = req.user._id;
            const data = await UserService.getUserTags(userId)
            res.json({
                tags: data
            });
        } catch (err) {
            logger.error({ message: `Error getting Tags: ${JSON.stringify(err)}` });
            next(err);
        }
    }

    static async getProfile(req, res, next) {
        try {
            const userId = req.user._id;
            const data = await UserService.getProfile(userId)
            if (!data) {
                res.status(404).json({
                    status: 'failure',
                    message: 'Not Found',
                });
            }
            const strategies = await UserService.getStrategies(userId);
            res.json({
                data: {
                    ...data,
                    strategiesOptions: strategies
                }
            });
        } catch (err) {
            logger.error({ message: `Error getting profile: ${JSON.stringify(err)} ` });
            next(err);
        }
    }

    static async updateProfile(req, res, next) {
        try {
            ApiValidator.validate(
                req.body,
                Joi.object({
                    firstName: Joi.string().min(1).max(20),
                    lastName: Joi.string().min(1).max(20),
                    email: Joi.string().email(),
                    phone: Joi.string().min(10).max(12),
                    city: Joi.string().min(1).max(20),

                }).unknown(true)
            );
            const userId = req.user._id;
            const data = req.body;
            const response = await UserService.updateProfile(userId, data)
            res.json({
                data: response
            });
        } catch (err) {
            logger.error({ message: `Error updating profile: ${JSON.stringify(err)} ` });
            next(err);
        }
    }

    static async createStrategy(req, res, next) {
        try {
            const userId = req.user._id;
            const { value } = req.body;
            const data = await UserService.createStrategy(userId, value);
            res.json({ data })
        } catch (err) {
            logger.error({ message: `Error creating Strategy: ${JSON.stringify(err)} ` });
            next(err);
        }
    }

    static async deleteStrategy(req, res, next) {
        try {
            const userId = req.user._id;
            const { value } = req.body;
            const data = await UserService.deleteStrategy(userId, value);
            res.json({ data })
        } catch (err) {
            logger.error({ message: `Error creating Strategy: ${JSON.stringify(err)} ` });
            next(err);
        }
    }
}
export default UserController