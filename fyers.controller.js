import Joi from 'joi';
import _ from 'lodash';
import FyersService from '../services/fyers.service';
import ApiValidator from '../utils/ApiValidator';
import UserService from '../services/user.service';
import JwtUtils from '../utils/JwtUtils';
import config from '../utils/config';
import DbConstants from '../utils/DbConstants';
import logger from '../utils/logger';

class FyersController {
  static async handleAuth(req, res, next) {
    try {
      const fyersRedirectUrl = FyersService.getLoginUrl();

      res.redirect(fyersRedirectUrl);
    } catch (err) {
      next(err);
    }
  }

  static async handleAuthCallback(req, res, next) {
    try {
      ApiValidator.validate(
        req.query,
        Joi.object({
          auth_code: Joi.string().required(),
          state: Joi.string().required(),
        }).unknown(true)
      );

      const { auth_code, state } = req.query;

      const accessToken = await FyersService.getAccessToken(auth_code, state);
      const anastratAuthFailureUrl = `${config.get('anastratAppUrl')}/auth/failure`;

      if (!accessToken) {
        return res.redirect(anastratAuthFailureUrl);
      }

      const profileDetails = await FyersService.getProfileDetails(accessToken);

      if (!profileDetails) {
        return res.redirect(anastratAuthFailureUrl);
      }

      const user = await UserService.createOrUpdateUserForFyers(profileDetails);
      const userWithoutTags = _.omit(user, ['tags']);
      const jwtToken = await JwtUtils.generateAccessToken({
        user: { ...userWithoutTags },
        provider: DbConstants.PROVIDERS.FYERS,
        providerAccessToken: accessToken,
      });

      const anastratAuthSuccessUrl = `${config.get(
        'anastratAppUrl'
      )}/auth/success?token=${jwtToken}`;

      // Running tradebook sync in background
      setImmediate(async () => {
        try {
          logger.info({
            message: `Running fyers sync in background for user ${user._id}`,
          });
          await FyersService.syncTrades(user._id, accessToken);
        } catch (err) {
          logger.error({
            message: `Error in running fyers sync in background for user ${user._id}`,
          });
        }
      });
      //console.log(anastratAuthSuccessUrl);
      return res.redirect(anastratAuthSuccessUrl);
    } catch (err) {
      next(err);
    }
  }

  static async syncTrades(req, res, next) {
    try {
      const providerAccessToken = req.providerAccessToken;
      const userId = req.user._id;

      await FyersService.syncTrades(userId, providerAccessToken);

      res.json({
        success: true,
        message: 'Sync successfull',
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDashboard(req, res, next) {
    try {
      const userId = req.user._id;
      const { duration } = req.query;

      const dashboardData = await FyersService.getDashboardData(userId, duration);

      res.json({
        success: true,
        dashboardData,
      });
    } catch (err) {
      next(err);
    }
  }

  static async tradePairs(req, res, next) {
    try {
      ApiValidator.validate(
        req.query,
        Joi.object({
          time_period: Joi.string(),
          segment: Joi.string(),
          tags: Joi.string(),
          offset: Joi.number(),
          limit: Joi.number(),
        }).unknown(true)
      );
      const userId = req.user._id;
      const {
        time_period,
        segment,
        tags = '[]',
        offset,
        limit,
        tradePattern,
        tradeType,
        tradeTerm,
        sort,
        order,
      } = req.query;
      const tradePairs = await FyersService.getTradePairs(
        userId,
        { time_period, segment, tags: JSON.parse(tags), tradePattern, tradeType, tradeTerm },
        offset,
        limit,
        { sort, order }
      );
      res.json(tradePairs);
    } catch (err) {
      next(err);
    }
  }

  static async updateTradePairImages(req, res, next) {
    try {
      ApiValidator.validate(
        req.query,
        Joi.object({
          tradePairId: Joi.string().required(),
        }).unknown(true)
      );
      ApiValidator.validate(
        req.body,
        Joi.object({
          images: Joi.required(),
        }).unknown(true)
      );

      const { tradePairId } = req.query;
      const { images } = req.body;
      const data = await FyersService.updateTradePairImages(tradePairId, images);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  static async updateTradePairTags(req, res, next) {
    try {
      ApiValidator.validate(
        req.query,
        Joi.object({
          tradePairId: Joi.string().required(),
        }).unknown(true)
      );
      ApiValidator.validate(
        req.body,
        Joi.object({
          tag: Joi.string().required(),
        }).unknown(true)
      );

      const { tradePairId } = req.query;
      const userId = req.user._id;
      const { tag } = req.body;
      const data = await FyersService.updateTradePairTags(tradePairId, tag);
      await UserService.updateUserTags(userId, tag);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  static async deleteTradePairTags(req, res, next) {
    try {
      ApiValidator.validate(
        req.query,
        Joi.object({
          tradePairId: Joi.string().required(),
        }).unknown(true)
      );
      ApiValidator.validate(
        req.body,
        Joi.object({
          tag: Joi.string().required(),
        }).unknown(true)
      );

      const { tradePairId } = req.query;
      const { tag = null } = req.body;
      const data = await FyersService.deleteTradePairTags(tradePairId, tag);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  static async bulkUpdateTradePairsTag(req, res, next) {
    try {
      const { data } = req.body;
      const userId = req.user._id;
      const response = await FyersService.bulkUpdateTradePairsTag(data);
      await UserService.updateUserTags(userId, data?.tag);
      res.json(response);
    } catch (err) {
      next(err);
    }
  }

  static async updateTradePairComment(req, res, next) {
    try {
      const { tradePairId } = req.query;
      const { comment } = req.body;
      const data = await FyersService.updateTradePairComment(tradePairId, comment);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  static async getFunds(req, res, next) {
    const providerAccessToken = req.providerAccessToken;
    try {
      let { fund_limit } = await FyersService.fetchFunds(providerAccessToken);
      res.json({
        success: true,
        data: fund_limit,
      });
    } catch (err) {
      next(err);
    }
  }
}

export default FyersController;
