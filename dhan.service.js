import axios from 'axios';
import config from '../utils/config';
import _ from 'lodash';
import DhanTradeModel from '../models/DhanTrade';
import { calculateTradePairs } from '../utils/SyncTrades';
import DhanTradePairStatModel from '../models/DhanTradePairStat';
import moment from 'moment';
import DbConstants from '../utils/DbConstants';
import CommonUtils from '../utils/commonUtils';
import map from '../utils/getSymbolDhan';

const authUrl = config.get('providers:dhan:loginUrl');
const partner_id = config.get('providers:dhan:partnerId');
const partner_secret = config.get('providers:dhan:partnerSecret');
const baseUrl = config.get('providers:dhan:baseUrl');

class DhanService {
  static async generateConsent() {
    var config = {
      method: 'get',
      url: `${authUrl}/partner/generate-consent`,
      headers: {
        partner_id: partner_id,
        partner_secret: partner_secret,
      },
    };

    let response = await axios(config);
    console.log(response.data);
    return response.data;
  }

  static getRedirectUrl(consentID) {
    return `${authUrl}/consent-login?consentId=${consentID}`;
  }

  static async getAccessToken(tokenId) {
    var config = {
      method: 'get',
      url: `${authUrl}/partner/consume-consent?tokenId=${tokenId}`,
      headers: {
        partner_id: partner_id,
        partner_secret: partner_secret,
      },
    };
    const response = await axios(config);
    console.log(response.data);
    return response.data;
  }

  // from date, to date format : yyyy-mm-dd
  static async getMonthlyTrades(fromDate, toDate, accessToken) {
    let trades = [];
    let i = 0;
    // looping to check for all pages of data
    do {
      var config = {
        method: 'get',
        url: `${baseUrl}/tradeHistory/${fromDate}/${toDate}/${i}`,
        headers: {
          'access-token': accessToken,
        },
      };
      var { data } = await axios(config);
      if (data.length > 0) {
        data.forEach((d) => {
           // Assigning the year for options and futures trades
          function getMonthInt(mon){
            let month;
            switch (mon) {
              case 'JAN':
                month = 1;
                break;
              case 'FEB':
                month = 2;
                break;
              case 'MAR':
                month = 3;
                break;
              case 'APR':
                month = 4;
                break;
              case 'MAY':
                month = 5;
                break;
              case 'JUN':
                month = 6;
                break;
              case 'JUL':
                month = 7;
                break;
              case 'AUG':
                month = 8;
                break;
              case 'SEP':
                month = 9;
                break;
              case 'OCT':
                month = 10;
                break;
              case 'NOV':
                month = 11;
                break;
              case 'DEC':
                month = 12;
            }
            return month;
          }
          let month;
          let tem = d.customSymbol.split(' ');
          if (d.exchangeSegment == 'NSE_FNO' || d.exchangeSegment == 'MCX_COMM') {
            if (d.drvOptionType == 'CALL' || d.drvOptionType == 'PUT') {
               month = getMonthInt(tem[2]);
            }
            // futures are either NIFTY JUN FUT / NIFTY 02 JUN FUT. So taking second last element as month after splitting on space
            else{
              month = getMonthInt(tem[tem.length-2]);
            }
            if (month < parseInt(fromDate.split('-')[1]))
                d.year = (parseInt(fromDate.split('-')[0].slice(2)) + 1).toString();
              else d.year = fromDate.split('-')[0].slice(2);
          }
        });
        //pushing the trades
        trades.push(...data);
      }
      //console.log(trades);
      i++;
    } while (data.length > 0);

    return trades;
  }

  static transformTradeData(data) {
    let symbol = '';
    if (data.exchangeSegment == 'NSE_FNO' || data.exchangeSegment == 'MCX_COMM' ) {
      if (data.drvOptionType == 'CALL' || data.drvOptionType == 'PUT') {
        let tem = data.customSymbol.split(' ');
        let month = '';
        switch (tem[2]) {
          case 'JAN':
            month = '01';
            break;
          case 'FEB':
            month = '02';
            break;
          case 'MAR':
            month = '03';
            break;
          case 'APR':
            month = '04';
            break;
          case 'MAY':
            month = '05';
            break;
          case 'JUN':
            month = '06';
            break;
          case 'JUL':
            month = '07';
            break;
          case 'AUG':
            month = '08';
            break;
          case 'SEP':
            month = '09';
            break;
          case 'OCT':
            month = '10';
            break;
          case 'NOV':
            month = '11';
            break;
          case 'DEC':
            month = '12';
        }
        symbol = tem[0] + data.year + month + tem[1] + tem[3] +(data.drvOptionType == 'CALL'?'CE':'PE');
      } else {
        // ignore date if present and add year in dd format to the futures trade
        let tem = data.customSymbol.split(" ");
        symbol = tem[0] + data.year + tem[tem.length-2] + tem[tem.length-1];
      }
    } else {
      symbol = data.customSymbol;
    }
    return {
      tradeDate: moment(data.exchangeTime).add(330,'minutes'), // Dhan API gives time with 330minutes offset
      segment: data.exchangeSegment,
      symbol: symbol,
      tradeType:
        data.transactionType == 'SELL' ? DbConstants.TRADE_TYPE.SELL : DbConstants.TRADE_TYPE.BUY,
      quantity: data.tradedQuantity,
      tradePrice: data.tradedPrice,
      orderId: data.orderId,
    };
  }

  static async syncTrades(userId, accessToken) {
    let allTrades = [];

    let month =
      new Date().getMonth().toString().length == 1
        ? '0' + (new Date().getMonth() + 1).toString()
        : new (Date().getMonth() + 1).toString();
    let day =
      new Date().getDate().toString().length == 1
        ? '0' + new Date().getDate().toString()
        : new Date().getDate().toString();
    let year = new Date().getFullYear().toString();

    // getting trades for the current month
    allTrades.push(
      ...(await this.getMonthlyTrades(
        `${year}-${month}-01`,
        `${year}-${month}-${day}`,
        accessToken
      ))
    );

    // getting trades for the rest of months as far as an year back
    year = parseInt(year) - 1;
    let nextYear = year;
    month = parseInt(month);
    let nextMonth = month + 1;
    if (month == 12) {
      nextMonth = 1;
      nextYear = year + 1;
    }
    let c = 1;
    while (c <= 12) {
      let startDate = `${year}-${month / 10 < 1 ? '0' + month : month}-01`;
      let endDate = `${nextYear}-${nextMonth / 10 < 1 ? '0' + nextMonth : nextMonth}-01`;
      allTrades.push(...(await this.getMonthlyTrades(startDate, endDate, accessToken)));
      if (month == 12) {
        month = 1;
        year++;
      } else {
        month++;
      }
      if (month == 12) {
        nextMonth = 1;
        nextYear = year + 1;
      } else {
        nextMonth = month + 1;
      }
      c++;
    }

    // saving the trades
    let trades = [];
    allTrades.forEach((trade) => {
      if (map[trade.securityId] != undefined) trades.push(this.transformTradeData(trade));
    });

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
      await DhanTradeModel.bulkWrite(bulkTrades);
    }

    // Calculating trade pairs

    const userDhanTrades = await DhanTradeModel.find({
      userId,
    })
      .lean()
      .exec();

    // Get list of trade pairs from these trades

    const userDhanTradePairs = await calculateTradePairs(
      userDhanTrades,
      DbConstants.PROVIDERS.DHAN
    );
    const bulkTradePairs = _.map(userDhanTradePairs, (tradePair) => {
      return {
        updateOne: {
          filter: {
            'openingTrade._id': tradePair.openingTrade._id,
            'closingTrade._id': tradePair.closingTrade?._id,
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
      await DhanTradePairStatModel.bulkWrite(bulkTradePairs);
    }
  }

  static async getTradePairs(
    userId,
    filters,
    offset,
    limit,
    { sort = 'openingTrade.tradeDate', order = 'asc' }
  ) {
    const dbQuery = CommonUtils.getDBQueryForTradePairs(userId, filters);
    let tradePairs;
    if (limit) {
      tradePairs = await DhanTradePairStatModel.find(dbQuery)
        .sort({ [sort]: order === 'des' ? -1 : 1 })
        .skip(Number(offset))
        .limit(Number(limit));
      let size = await DhanTradePairStatModel.find(dbQuery).count();
      return { data: tradePairs, size };
    } else {
      tradePairs = await DhanTradePairStatModel.find(dbQuery).lean().exec();
    }
    return { data: tradePairs };
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

    let { data: tradePairs } = await this.getTradePairs(userId, duration);
    tradePairs = tradePairs.filter((trade) => !!trade.closingTrade);
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

  static async updateTradePairTags(tradePairId, tags) {
    const data = await DhanTradePairStatModel.findOneAndUpdate(
      { _id: tradePairId },
      { $push: { tags: tags } },
      { new: true }
    );
    return data;
  }

  static async deleteTradePairTags(tradePairId, tags) {
    const data = await DhanTradePairStatModel.findOneAndUpdate(
      { _id: tradePairId },
      { $pull: { tags: tags } }
    );
    return data;
  }

  static async bulkUpdateTradePairsTag({ tradePairs, tag }) {
    const bulkUpdate = tradePairs.map(({ id }) => ({
      updateOne: {
        filter: {
          _id: id,
        },
        update: {
          $addToSet: { tags: tag },
        },
      },
    }));
    return await DhanTradePairStatModel.bulkWrite(bulkUpdate);
  }

  static async updateTradePairComment(tradePairId, comment) {
    const data = await DhanTradePairStatModel.findOneAndUpdate(
      { _id: tradePairId },
      { $set: { comment: comment } },
      { new: true }
    );
    return data;
  }

  static async updateTradePairImages(tradePairId, images) {
    const data = await DhanTradePairStatModel.findOneAndUpdate(
      { _id: tradePairId },
      { $set: { images: images } },
      { new: true }
    );
    return data;
  }
}

export default DhanService;
