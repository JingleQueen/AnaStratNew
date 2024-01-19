import {
  KiteConnect
} from 'kiteconnect';
import _ from 'lodash';
import moment from 'moment';
import config from '../utils/config';
import logger from '../utils/logger';
import ZerodhaTradeModel from '../models/ZerodhaTrade';
import ZerodhaTradePairStatModel from '../models/ZerodhaTradePairStat';
import DbConstants from '../utils/DbConstants';
import CommonUtils from '../utils/commonUtils';
import { calculateTradePairs } from '../utils/SyncTrades';

const apiKey = config.get('providers:zerodha:apiKey');
const apiSecret = config.get('providers:zerodha:apiSecret');
const baseUrl = config.get('providers:zerodha:baseUrl');
const redirectUrl = `${config.get('server:url')}/api/providers/zerodha/auth/callback`;

class ZerodhaService {
  static getLoginUrl() {
    return `${baseUrl}/connect/login?api_key=${apiKey}&v=3`;
  }

  static async getProfileAndAccessToken(requestToken) {
    try {
      const kc = new KiteConnect({
        api_key: apiKey,
      });

      const response = await kc.generateSession(requestToken, apiSecret);

      return {
        accessToken: response.access_token,
        email: response.email,
        name: response.user_name,
        id: response.user_id,
      };
    } catch (err) {
      logger.error({
        message: 'Error while getting Zerodha access token',
        err
      });

      return null;
    }
  }

  static async syncDailyTrades(accessToken) {
    try {
      const kc = new KiteConnect({
        api_key: apiKey,
      });

      kc.setAccessToken(accessToken);

      const trades = await kc.getTrades();

      // Todo normalize trades and sync trades
    } catch (err) {
      logger.error({
        message: 'Error while getting Zerodha daily trades',
        err
      });
    }
  }

  static async syncTrades(trades, userId) {
    console.time("syncTrades")
    const bulkTrades = _.map(trades, (trade) => {
      let tradeDate = moment(trade.order_execution_time);     
      return {
        updateOne: {
          filter: {
            userId,
            orderId: trade.trade_id,
          },
          update: {
            $set: {
              tradeDate: tradeDate,
              segment: trade.segment,
              symbol: trade.symbol,
              tradeType: trade.trade_type,
              quantity: trade.quantity,
              tradePrice: trade.price,
              orderId: trade.trade_id,
              userId,
            },
          },
          upsert: true,
        },
      };
    });

    if (bulkTrades.length > 0) {
      await ZerodhaTradeModel.bulkWrite(bulkTrades);
    }
   
    const userZerodhaTrades = await ZerodhaTradeModel.find({
      userId
    }).lean().exec();

    const userZerodhaTradePairs = await calculateTradePairs(userZerodhaTrades,DbConstants.PROVIDERS.ZERODHA);

    const bulkTradePairs = _.map(userZerodhaTradePairs, (tradePair) => {
      return {
        updateOne: {
          filter: {
            'openingTrade.orderId': tradePair.openingTrade.orderId,
            'closingTrade.orderId': tradePair.closingTrade?.orderId,
          },
          update: {
            $set: {
              ...tradePair,
              userId,
            },
          },
          upsert: true,
        },
      };
    });

    if (bulkTradePairs.length > 0) {
      await ZerodhaTradePairStatModel.bulkWrite(bulkTradePairs);
    }
    console.timeEnd("syncTrades")
  }

  static async getTradePairs(userId, filters, offset, limit, { sort='openingTrade.tradeDate', order='asc'}) {
    const dbQuery = CommonUtils.getDBQueryForTradePairs(userId,filters);
    let tradePairs;
    if (limit){
      tradePairs = await ZerodhaTradePairStatModel.find(dbQuery).sort({[sort]: order === 'des' ? -1 : 1}).skip(Number(offset)).limit(Number(limit)).lean().exec();
      let size = await ZerodhaTradePairStatModel.find(dbQuery).count()
      return {data:tradePairs,size}
    }
    else {
      tradePairs = await ZerodhaTradePairStatModel.find(dbQuery).lean().exec();
    }
    return tradePairs;
  }

  static async getDashboardData(userId, duration) {
    let overallReturns = {
      returnToday: 0,
      returnYesterday: 0,
      returnInDuration: 0,
    };

    let todayCount = 0;
    let yesterdayCount = 0;

    let callStats = {
      total: 0,
      profit: 0,
      lowProfit: 0,
      averageProfit: 0,
      highProfit: 0,
      loss: 0,
      lowLoss: 0,
      averageLoss: 0,
      highLoss: 0,
      noReturn: 0,
    };

    let traits = {
      riskAppetite: 'Medium',
      tradeSegments: new Set(),
      tradePatterns: new Set(),
      tradeTerms: new Set(),
      aggression: null,
      calculative: null,
    };

    let anastratScore = 0;

    let { data:tradePairs } = await this.getTradePairs(userId,{duration});
    tradePairs = tradePairs.filter((trade) => !!trade.closingTrade)

    _.forEach(tradePairs, (tradePair) => {
      anastratScore += tradePair.tradeScore;
      callStats.total++;

      if (tradePair.tradeReturn > 0) {
        callStats.profit++;

        if (tradePair.tradeReturn >= 3) {
          callStats.highProfit++;
        } else if (tradePair.tradeReturn >= 2) {
          callStats.averageProfit++;
        } else {
          callStats.lowProfit++;
        }
      } else if (tradePair.tradeReturn < 0) {
        callStats.loss++;

        if (
          (tradePair.tradeReturn <= -2 && tradePair.tradeSegment == DbConstants.SEGMENT.FUTURES) ||
          (tradePair.tradeReturn <= -5 && tradePair.tradeSegment == DbConstants.SEGMENT.OPTIONS)
        ) {
          callStats.highLoss++;
        } else if (
          (tradePair.tradeReturn <= -1.5 &&
            tradePair.tradeSegment == DbConstants.SEGMENT.FUTURES) ||
          (tradePair.tradeReturn <= -4 && tradePair.tradeSegment == DbConstants.SEGMENT.OPTIONS)
        ) {
          callStats.averageLoss++;
        } else {
          callStats.lowLoss++;
        }
      } else {
        callStats.noReturn++;
      }

      if (moment(tradePair.openingTrade.tradeDate).dayOfYear() == moment().dayOfYear()) {
        todayCount++;
        overallReturns.returnToday += tradePair.tradeReturn;
      }
      if (moment(tradePair.openingTrade.tradeDate).dayOfYear() == moment().dayOfYear() - 1) {
        yesterdayCount++;
        overallReturns.returnYesterday += tradePair.tradeReturn;
      }

      overallReturns.returnInDuration += tradePair.tradeReturn;

      traits.tradeSegments.add(tradePair.tradeSegment);
      traits.tradePatterns.add(tradePair.tradePattern);
      traits.tradeTerms.add(tradePair.tradeTerm);
    });

    if (todayCount != 0) {
      overallReturns.returnToday /= todayCount;
    }

    if (yesterdayCount != 0) {
      overallReturns.returnYesterday /= yesterdayCount;
    }

    if (tradePairs.length != 0) {
      overallReturns.returnInDuration /= tradePairs.length;
      anastratScore /= tradePairs.length;
    }

    if (anastratScore >= 4) {
      traits.aggression = 5;
      traits.calculative = 6;
    }

    if (anastratScore >= 6) {
      traits.aggression = 7;
      traits.calculative = 7;
    }

    if (anastratScore >= 8) {
      traits.aggression = 8;
      traits.calculative = 9;
    }

    if (anastratScore == 0) {
      traits.riskAppetite = null;
    }

    traits.tradeSegments = Array.from(traits.tradeSegments);
    traits.tradePatterns = Array.from(traits.tradePatterns);
    traits.tradeTerms = Array.from(traits.tradeTerms);
    anastratScore = anastratScore.toFixed(2);
    overallReturns.returnInDuration = overallReturns.returnInDuration.toFixed(2);
    overallReturns.returnYesterday = overallReturns.returnYesterday.toFixed(2);
    overallReturns.returnToday = overallReturns.returnToday.toFixed(2);

    return {
      anastratScore,
      overallReturns,
      traits,
      callStats,
    };
  }

  static async updateTradePairTags(tradePairId, tags){
    const data = await ZerodhaTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$addToSet:{tags:tags}},{new: true})
    return data;
  }

  static async updateTradePairImages(tradePairId, images){
    const data = await ZerodhaTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$set:{images:images}},{new: true})
    return data;
  }

  static async deleteTradePairTags(tradePairId, tags){
    const data = await ZerodhaTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$pull:{tags:tags}})
    return data;
  }

  static async bulkUpdateTradePairsTag({tradePairs,tag}) {
    const bulkUpdate = tradePairs.map(({id})=>({
      updateOne: {
        filter:{
          _id:id
        },
        update: {
            $addToSet :{tags:tag}
        }
      }
    }));
    return await ZerodhaTradePairStatModel.bulkWrite(bulkUpdate);
}

  static async updateTradePairComment(tradePairId, comment){
    const data = await ZerodhaTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$set:{comment:comment}},{new: true})
    return data;
  }
}

export default ZerodhaService;