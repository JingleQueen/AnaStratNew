import OthersService from '../services/others.service';
import UserService from '../services/user.service';
import JwtUtils from '../utils/JwtUtils';
import DbConstants from '../utils/DbConstants';
import config from '../utils/config';
import ApiValidator from '../utils/ApiValidator';
import Joi from 'joi';
import _ from 'lodash';
import logger from '../utils/logger';
import Hashing from '../utils/Hashing';
import Mailer from '../utils/Mailer';


class OthersController {
  // Add some sort of encryption, add API validator using JOI

  /*
  static async syncDailyTrades(req, res, next) {
    try {
      const { providerAccessToken , user } = req;

      await OthersService.syncDailyTrades(user._id, providerAccessToken);
      res.json({
        success: true,
        message: 'Sync successfull',
      });
    } catch (err) {
      next(err);
    }
  } */

  static async syncTrades(req, res, next) {
    try {

      ApiValidator.validate(
        req.file,
        Joi.object({
          mimetype: Joi.string().valid('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
        })
          .unknown(true)
          .required()
          .label('file')
      );


      const file = req.file;
      let trades = [];

      //change provider here
      switch (req._params.provider) {

        case 'samco': trades = OthersService.parseSAMCO(file);
          await OthersService.syncTradesSAMCO(trades, req.user._id);
          break;

      }

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
      const {
        duration
      } = req.query;

      switch (req._params.provider) {

        case 'samco': var dashboardData = await OthersService.getDashboardDataSAMCO(userId, duration);
          break;

      }

      res.json({
        success: true,
        dashboardData,
      });

    }
    catch (err) {
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
          limit: Joi.number()
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

      switch (req._params.provider) {
        case 'samco': var tradePairs = await OthersService.getTradePairsSAMCO(userId, { time_period, segment, tags: JSON.parse(tags), tradePattern, tradeType, tradeTerm }, offset, limit, {sort,order});
          break;

      }



      res.json(tradePairs);
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
      const {
        tradePairId
      } = req.query;
      const userId = req.user._id;
      const {
        tag
      } = req.body;

      switch (req._params.provider) {

        case 'samco': var data = await OthersService.updateTradePairTagsSAMCO(tradePairId, tag);
          break;

      }

      await UserService.updateUserTags(userId, tag)
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  static async updateTradePairComment(req, res, next) {
    try {
      const {
        tradePairId
      } = req.query;
      const {
        comment
      } = req.body;
      switch (req._params.provider) {

        case 'samco': var data = await OthersService.updateTradePairCommentSAMCO(tradePairId, comment);
          break;

      }

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
            tag
        } = req.body;
        switch (req._params.provider) {
          case 'samco': var data = await OthersService.deleteTradePairTags(tradePairId, tag);
                        break;
        }
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
      switch (req._params.provider) {
        case 'samco': var response = await OthersService.bulkUpdateTradePairsTagSAMCO(data);
          break;
      }
      await UserService.updateUserTags(userId, data?.tag)
      res.json(response);
    } catch (err) {
      next(err);
    }
  }



}

export default OthersController;
