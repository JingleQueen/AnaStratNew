import Joi from 'joi';
import httpErrors from 'http-errors';
import _ from 'lodash';
import UserService from '../services/user.service';
import ZerodhaService from '../services/zerodha.service';
import ApiValidator from '../utils/ApiValidator';
import DbConstants from '../utils/DbConstants';
import JwtUtils from '../utils/JwtUtils';
import config from '../utils/config';
import CSVParser from '../utils/CSVParser';
import AppConstants from '../utils/AppConstants';
import logger from '../utils/logger';

class ZerodhaController {
  static handleAuth(req, res, next) {
    try {
      const zerodhaRedirectUrl = ZerodhaService.getLoginUrl();

      res.redirect(zerodhaRedirectUrl);
    } catch (err) {
      next(err);
    }
  }

  static async handleAuthCallback(req, res, next) {
    try {
      ApiValidator.validate(
        req.query,
        Joi.object({
          request_token: Joi.string().required(),
        }).unknown(true)
      );

      const { request_token } = req.query;

      const profileDetails = await ZerodhaService.getProfileAndAccessToken(request_token);
      const anastratAuthFailureUrl = `${config.get('anastratAppUrl')}/auth/failure`;

      if (!profileDetails) {
        return res.redirect(anastratAuthFailureUrl);
      }

      const user = await UserService.createOrUpdateUserForZerodha({
        email: profileDetails.email,
        name: profileDetails.name,
        id: profileDetails.id,
      });
      const userWithoutTags = _.omit(user, ['tags']);
      const jwtToken = await JwtUtils.generateAccessToken({
        user: { ...userWithoutTags },
        provider: DbConstants.PROVIDERS.ZERODHA,
        providerAccessToken: profileDetails.accessToken,
      });

      const anastratAuthSuccessUrl = `${config.get(
        'anastratAppUrl'
      )}/auth/success?token=${jwtToken}`;

      // Running tradebook sync in background
      setImmediate(async () => {
        try {
          logger.info({
            message: `Running zerodha sync in background for user ${user._id}`,
          });
          await ZerodhaService.syncDailyTrades(profileDetails.accessToken);
        } catch (err) {
          logger.error({
            message: `Error in running zerodha sync in background for user ${user._id}`,
          });
        }
      });

      return res.redirect(anastratAuthSuccessUrl);
    } catch (err) {
      next(err);
    }
  }

  static async syncTrades(req, res, next) {
    try {
      ApiValidator.validate(
        req.file,
        Joi.object({
          mimetype: Joi.string().valid(
            'text/csv',
            'text/comma-separated-values',
            'application/vnd.ms-excel'
          ),
        })
          .unknown(true)
          .required()
          .label('file')
      );

      const file = req.file;

      const csvParser = new CSVParser(file.path);

      await csvParser.parse();

      const isValid = csvParser.isValidHeaders(AppConstants.ZERODHA_CSV_HEADERS);

      if (!isValid) {
        throw new httpErrors.BadRequest(`Invalid CSV format`);
      }

      const trades = csvParser.rows;

      await ZerodhaService.syncTrades(trades, req.user._id);

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

      const dashboardData = await ZerodhaService.getDashboardData(userId, duration);

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
      const { time_period, segment,  tags="[]", offset, limit, tradePattern, tradeType, tradeTerm, sort, order } = req.query;

      const tradePairs = await ZerodhaService.getTradePairs(
        userId,
        {
          time_period,
          segment,
          tags: JSON.parse(tags),
          tradePattern,
          tradeType,
          tradeTerm
        },
        offset,
        limit,
        {
          sort,
          order
        }
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
          images: Joi.string().required(),
        }).unknown(true)
      );
      const { tradePairId } = req.query;
      const { images } = req.body;
      const data = await ZerodhaService.updateTradePairImages(tradePairId, images);
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
      const data = await ZerodhaService.updateTradePairTags(tradePairId, tag);
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
      const data = await ZerodhaService.deleteTradePairTags(tradePairId, tag);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  static async updateTradePairComment(req, res, next) {
    try {
      const { tradePairId } = req.query;
      const { comment } = req.body;
      const data = await ZerodhaService.updateTradePairComment(tradePairId, comment);
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
      const response = await ZerodhaService.bulkUpdateTradePairsTag(data);
      await UserService.updateUserTags(userId, data?.tag)
      res.json(response);
    } catch (err) {
      next(err);
    }
}

}

export default ZerodhaController;
