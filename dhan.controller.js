import DhanService from '../services/dhan.service';
import UserService from '../services/user.service';
import config from '../utils/config';
import DbConstants from '../utils/DbConstants';
import _ from 'lodash';
import JwtUtils from '../utils/JwtUtils';
import ApiValidator from '../utils/ApiValidator';
import Joi from 'joi';

class DhanController {
  static async handleAuth(req, res, next) {
    try {
      let { consentId } = await DhanService.generateConsent();
      res.redirect(DhanService.getRedirectUrl(consentId));
    } catch (err) {
      next(err);
    }
  }

  static async handleAuthCallback(req, res, next) {
    try {
      const { tokenId } = req.query;
      const profile = await DhanService.getAccessToken(tokenId);
      const { accessToken } = profile;
      const user = await UserService.createOrUpdateUserForDhan(profile);
      const userWithoutTags = _.omit(user, ['tags']);
      // Generate JWT token
      const jwtToken = await JwtUtils.generateAccessToken({
        user: { ...userWithoutTags },
        provider: DbConstants.PROVIDERS.DHAN,
        providerAccessToken: accessToken,
      });
      const anastratAuthSuccessUrl = `${config.get(
        'anastratAppUrl'
      )}/auth/success?token=${jwtToken}`;
      return res.redirect(anastratAuthSuccessUrl);
    } catch (err) {
      next(err);
    }
  }

  static async syncTrades(req, res, next) {
    try {
      await DhanService.syncTrades(req.user, req.providerAccessToken);
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
      const dashboardData = await DhanService.getDashboardData(userId, duration);
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
          tags="[]",
          offset,
          limit,
          tradePattern,
          tradeType,
          tradeTerm,
          sort,
          order
      } = req.query;

      const tradePairs = await DhanService.getTradePairs(userId, { time_period, segment, tags: JSON.parse(tags), tradePattern, tradeType, tradeTerm }, offset, limit, { sort, order});

      res.json(tradePairs);
  } catch (err) {
      next(err);
  }
  }

  static async updateTradePairTags(req, res, next) {
    try {
      const { tradePairId } = req.query;
      const userId = req.user._id;
      const { tag } = req.body;
      const data = await DhanService.updateTradePairTags(tradePairId, tag);
      await UserService.updateUserTags(userId, tag);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  static async deleteTradePairTags(req, res, next) {
    try {
        const {
            tradePairId
        } = req.query;
        const {
            tag =null,
        } = req.body;
        const data = await DhanService.deleteTradePairTags(tradePairId, tag);
        res.json(data);
    } catch (err) {
        next(err);
    }
  }

  static async bulkUpdateTradePairsTag(req, res, next) {
    try {
      const {
        data
      } = req.body;
      const userId = req.user._id;
      const response = await DhanService.bulkUpdateTradePairsTag(data);
      await UserService.updateUserTags(userId, data?.tag)
      res.json(response);
    } catch (err) {
      next(err);
    }
}

  static async updateTradePairComment(req, res, next) {
    try {
      const { tradePairId } = req.query;
      const { comment } = req.body;
      const data = await DhanService.updateTradePairComment(tradePairId, comment);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  static async updateTradePairImages(req, res, next) {
    try {
        const {
            tradePairId
        } = req.query;
        const {
            images
        } = req.body;
        const data = await DhanService.updateTradePairImages(tradePairId, images)
        res.json(data);
    } catch (err) {
        next(err);
    }
  }
}

export default DhanController;
