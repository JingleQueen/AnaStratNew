  import axios from 'axios';
  import moment from 'moment';
  import _ from 'lodash';
  import crypto from 'crypto';
  import config from '../utils/config';
  import logger from '../utils/logger';
  import DbConstants from '../utils/DbConstants';
  import FyersTradeModel from '../models/FyersTrade';
  import FyersTradePairStatModel from '../models/FyersTradePairStat';
  import CommonUtils from '../utils/commonUtils';
  import { calculateTradePairs } from '../utils/SyncTrades';

  const appId = config.get('providers:fyers:appId');
  const appSecret = config.get('providers:fyers:appSecret');
  const baseUrl = config.get('providers:fyers:baseUrl');
  const redirectUrl = `${config.get('server:url')}/api/providers/fyers/auth/callback`;
  const RESPONSE_TYPE = 'code';
  const GRANT_TYPE = 'authorization_code';
  const OK = 'ok';

  // Generating SHA256 hash of 'appId:appSecret'
  const appIdHash = crypto.createHash('sha256').update(`${appId}:${appSecret}`).digest('hex');

  class FyersService {
    static STATE = 'anastrat';

    /**
     * Get login url, so that we can redirect user to authenticate via Fyers
     * @returns {string} url
     */
    static getLoginUrl() {
      return `${baseUrl}/api/v2/generate-authcode?client_id=${appId}&redirect_uri=${redirectUrl}&response_type=${RESPONSE_TYPE}&state=${this.STATE}`;
    }

    /**
     * Get access token of authenticated Fyers user for subsequent requests
     * @param {string} authCode
     * @param {string} state
     */
    static async getAccessToken(authCode, state) {
      try {
        if (state != this.STATE) {
          return null;
        }

        const response = await axios({
          url: `${baseUrl}/api/v2/validate-authcode`,
          method: 'POST',
          data: {
            grant_type: GRANT_TYPE,
            appIdHash,
            code: authCode,
          },
        });

        const {
          s,
          access_token
        } = response.data;

        if (s != OK) {
          logger.warn({
            message: 'Fyers: authentication failed',
            details: response.data
          });

          return null;
        }

        return access_token;
      } catch (err) {
        logger.error({
          message: 'Error while getting Fyers access token',
          err
        });

        return null;
      }
    }
    
    //fetch fund limits for the current user
    static async fetchFunds(accessToken){

      var config = {
        method: 'get',
        url: `${baseUrl}/api/v2/funds`,
        headers: { 
          'Authorization': `${appId}:${accessToken}`
        }
      };
        var funds = await axios(config);
        console.log(JSON.stringify(funds.data));
        return (funds.data);
      
    }
    /**
     * Get profile details of Fyers user
     * @param {string} accessToken
     * @returns
     */
    static async getProfileDetails(accessToken) {
      try {
        const response = await axios({
          url: `${baseUrl}/api/v2/profile`,
          method: 'GET',
          headers: {
            Authorization: `${appId}:${accessToken}`,
          },
        });

        const {
          s
        } = response.data;
        const {
          name,
          fy_id,
          email_id,
          pan
        } = response.data?.data;

        if (s != OK) {
          logger.warn({
            message: 'Fyers: profile details cannot be fetched'
          });

          return null;
        }

        return {
          name,
          id: fy_id,
          email: email_id,
          pan,
        };
      } catch (err) {
        logger.error({
          message: 'Error while getting Fyers user profile details',
          err
        });

        return null;
      }
    }

    static getMergedTransaction(trades) {
      return trades.map((currentTrade, i) => {
          if (currentTrade) {
              let temp = {
                  ...currentTrade
              }
              let weightedValue = currentTrade.trade_price * currentTrade.qty;
              for (let j = i + 1; j <= trades.length; j++) {
                  if (trades[j]) {
                      if (trades[j].order_id == currentTrade.order_id) {
                          temp["qty"] += trades[j].qty
                          weightedValue += trades[j].qty * trades[j].trade_price;
                          trades[j] = null
                      }
                  }
              }
              temp["weightedAverage"] = (weightedValue / temp["qty"]).toFixed(2);
              return temp
          }
      }).filter((a) => a)
  }

  static getMergedDailyTransaction(trades) {
    return trades.map((currentTrade, i) => {
        if (currentTrade) {
            let temp = {
                ...currentTrade
            }
            let weightedValue = currentTrade.tradedQty * currentTrade.tradePrice;
            for (let j = i + 1; j <= trades.length; j++) {
                if (trades[j]) {
                    if (trades[j].exchangeOrderNo == currentTrade.exchangeOrderNo) {
                        temp["tradedQty"] += trades[j].tradedQty
                        weightedValue += trades[j].tradedQty * trades[j].tradePrice;
                        trades[j] = null
                    }
                }
            }
            temp["weightedAverage"] = (weightedValue / temp["tradedQty"]).toFixed(2);
            return temp
        }
    }).filter((a) => a)
}
    /**
     * Get all trades for current financial year
     * @param {string} accessToken
     * @returns
     */
    static async getAllTrades(accessToken) {
      try {
        const { currentFinancialYear } = CommonUtils.getFiscalYear();
        const quarterIntervals = CommonUtils.getQuarterIntervals();
        let trades = [];
        await axios.all(quarterIntervals.map(async(interval,i)=>{
          const response = await axios({
            url: `${baseUrl}/myaccount/prod/report/tradebook?from_date=${interval.range[0]}&to_date=${interval.range[1]}&segment=${[
              DbConstants.SEGMENT.FYERS.BSE_CASH,
              DbConstants.SEGMENT.FYERS.CD_NSE,
              DbConstants.SEGMENT.FYERS.COMMODITY,
              DbConstants.SEGMENT.FYERS.FUTURES_OPTIONS,
              DbConstants.SEGMENT.FYERS.MF_BSE,
              DbConstants.SEGMENT.FYERS.NSE_CASH]}&fin_year=${interval.fiscalYear}`,
            method: 'GET',
            headers: {
              'access-token': accessToken,
            },
          });
          trades.push(...response?.data?.data?.DATA)
        }));
        const mergedTransaction = this.getMergedTransaction(trades)
        const tradeList = _.map(mergedTransaction, (trade) => {
            let tradeDate = moment(`${trade.date} ${trade.time}`, 'DD/MM/YYYY LT');
            return {
              tradeDate: tradeDate,
              segment: trade.segment,
              symbol: trade.symbol,
              tradeType: trade.type,
              quantity: trade.qty,
              tradePrice: trade.weightedAverage,
              orderId: trade.order_id,
            };
        });

        return tradeList;
      } catch (err) {
        logger.error({
          message: `Error while getting Fyers user trades data ${JSON.stringify(err?.response?.data) || err}`
        });
        throw err;
      }
    }

    static transformSegment(segment){
      switch(segment){
        case 20: return  DbConstants.SEGMENT.FYERS.COMMODITY_DERIVATIVE;
        case 10: return  DbConstants.SEGMENT.FYERS.EQUITY_INTRA;
        case 11: return  DbConstants.SEGMENT.FYERS.EQUITY_DERIVATIVE;
        case 12: return  DbConstants.SEGMENT.FYERS.CURRENCY_DERIVATIVE;
      }
    }

    static async getDailyTrades(accessToken){
      var config = {
        method: 'get',
        url: `${baseUrl}/api/v2/tradebook`,
        headers: { 
          'Authorization': `${appId}:${accessToken}`
        }
      };
        let { data } = await axios(config);
        let { tradeBook } = data;
        //console.log(JSON.stringify(tradeBook));
        if (tradeBook.length > 0) {
          const tradeList = _.map(this.getMergedDailyTransaction(tradeBook), (trade) => {
            let tradeDate = moment(trade.orderDateTime);
            let time = moment.duration("5:30:00");
            tradeDate.subtract(time);
            return {
              tradeDate: tradeDate,
              segment: this.transformSegment(trade.segment),
              symbol: trade.symbol,
              tradeType: trade.transactionType == 1? "Buy" : "Sell",
              quantity: trade.tradedQty,
              tradePrice: trade.weightedAverage,
              orderId: trade.exchangeOrderNo,
            };
          });
          return tradeList;
        }
        else{
          return [];
        }
    }
    /**
     * Sync Fyer user trades
     * @param {string} userId
     * @param {string} accessToken
     */
    static async syncTrades(userId, accessToken) {
      // Get all trades from fyers server
      let trades = await this.getAllTrades(accessToken);
      let dailyTrades = await this.getDailyTrades(accessToken);
      if(dailyTrades.length > 0) trades.push( ...dailyTrades);
      logger.debug({
        message: `Fyers syncTrades: syncing ${trades.length} trades for user ${userId}`,
        userId,
        tradeCount: trades.length,
      });
    
      // Create/Update trades in FyersTrades collection
      const bulkTrades = _.map(trades, (trade) => {
        return {
          updateOne: {
            filter: {
              userId,
              orderId: trade.orderId,
            },
            update: {
              $set: {
                ...trade,
              },
            },
            upsert: true,
          },
        };
      });

      if (bulkTrades.length > 0) {
        await FyersTradeModel.bulkWrite(bulkTrades);
      }

      // Get all trades of current user from FyersTraders collection
      const userFyersTrades = await FyersTradeModel.find({
        userId
      }).lean().exec();

      // Get list of trade pairs from these trades
      const userFyersTradePairs =await calculateTradePairs(userFyersTrades,DbConstants.PROVIDERS.FYERS);
      
      const bulkTradePairs = _.map(userFyersTradePairs, (tradePair) => {
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
        await FyersTradePairStatModel.bulkWrite(bulkTradePairs);
      }
    }

    static async getTradePairs(userId, filters, offset, limit, {sort='openingTrade.tradeDate', order = 'asc'}) {
      const dbQuery = CommonUtils.getDBQueryForTradePairs(userId,filters);
      let tradePairs;
      if (limit){
        tradePairs = await FyersTradePairStatModel.find(dbQuery).sort({[sort]: order === 'des' ? -1 : 1}).skip(Number(offset)).limit(Number(limit));
        let size = await FyersTradePairStatModel.find(dbQuery).count()
        return {data:tradePairs,size}
      }
      else{
        tradePairs = await FyersTradePairStatModel.find(dbQuery).limit(20).lean().exec();
      }
      return {data:tradePairs};
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

      let { data:tradePairs } = await this.getTradePairs(userId, {duration});
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
      const data = await FyersTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$addToSet:{tags:tags}},{new: true})
      return data;
    }

    static async updateTradePairImages(tradePairId, images){
      const data = await FyersTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$set:{images:images}},{new: true})
      return data;
    }

    static async deleteTradePairTags(tradePairId, tags){
      const data = await FyersTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$pull:{tags:tags}})
      return data;
    }

    static async bulkUpdateTradePairsTag({tradePairs,tag}) {
      const bulkUpdate = tradePairs.map(({id})=>({
        updateOne: {
          filter:{
            _id:id
          },
          update: {
            $addToSet:{tags:tag}
          }
        }
      }));
      return FyersTradePairStatModel.bulkWrite(bulkUpdate);
    }

    static async updateTradePairComment(tradePairId, comment){
      const data = await FyersTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$set:{"comment":comment}},{new:true})
      return data;
  }
  }

  export default FyersService;