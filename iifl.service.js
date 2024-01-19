import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import config from '../utils/config';
import logger from '../utils/logger';
import DbConstants from '../utils/DbConstants';
import CommonUtils from '../utils/commonUtils';
import EncryptionClient from '../utils/Encryption';
import IIFLTradeModel from '../models/IIFLTrade';
import IIFLTradePairStatModel from '../models/IIFLTradePairStat';
import { calculateTradePairs } from '../utils/SyncTrades';
const appName = config.get('providers:iifl:appName');
const appKey = config.get('providers:iifl:userKey');
const baseUrl = config.get('providers:iifl:baseUrl');
const userId = config.get('providers:iifl:userId');
const password = config.get('providers:iifl:password');
const encryptionKey = config.get('providers:iifl:encryptionKey');
const subscriptionKey = config.get('providers:iifl:subscriptionKey');

class IIFLService {
    static STATE = 'anastrat';

    static getMergedTransaction(trades, segment) {
        return trades.map((currentTrade, i) => {
            if (currentTrade) {
                let temp = {
                    ...currentTrade,
                    segment
                }
                temp = {...this.transformTradeData(temp)}
                let weightedValue = temp.tradePrice * temp.quantity;
                for (let j = i + 1; j <= trades.length; j++) {
                    if (trades[j]) {
                        let current = this.transformTradeData(trades[j]);
                        if (current.orderId == temp.orderId) {
                            temp["quantity"] += current.quantity;
                            weightedValue += current.quantity * current.tradePrice;
                            trades[j] = null
                        }
                    }
                }
                temp["tradePrice"] = (weightedValue / temp["quantity"]).toFixed(2);
                return temp
            }
        }).filter((a) => a)
    }

    static getRequestBodyHead(requestCode) {
        return {
            "appName": appName,
            "appVer": "1.0",
            "key": appKey,
            "osName": "Android",
            "requestCode": requestCode,
            "userId": userId,
            "password": password
        }
    }

    /**
     * Get access token of authenticated Fyers user for subsequent requests
     * @param {Object}
     * {
     *  ClientCode: String
     *  Password: String
     *  My2PIN: String
     * }
     */
    static async authenticate({
        ClientCode,
        Password,
        My2PIN
    }) {
        try {
            const encryption = new EncryptionClient(encryptionKey)
            const body = {
                ClientCode: encryption.encrypt(ClientCode),
                Password: encryption.encrypt(Password),
                HDSerialNumber: "",
                MACAddress: "",
                MachineID: "",
                VersionNo: "1.0.16.0",
                RequestNo: 1,
                My2PIN: encryption.encrypt(My2PIN),
                ConnectionType: "1"
            }
            const response = await axios({
                url: `${baseUrl}/LoginRequest`,
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": subscriptionKey
                },
                data: {
                    head: this.getRequestBodyHead("IIFLMarRQLoginForVendor"),
                    body
                }
            });
            // Extract Token from Respone from cookie
            if (response.data.body && response.data.body.Token) {
                logger.info({
                    message: 'IIFL: authentication succesfull'
                })
                return {
                    Token: response
                        .headers["set-cookie"][0]
                        .split(";")[0]
                }
            }
            logger.warn({
                message: 'IIFL: authentication failed',
                details: response.data
            })
            throw new Error(response.data.body.Msg)
        } catch (err) {
            logger.info({
                message: 'IIFL: authentication failed',
                details: JSON.stringify(err)
            })
            throw err;
        }
    }

    /**
     * IIFL client profile
     * @param {string} Token
     * @param {string} ClientCode
     */
    static async clientProfile(Token, ClientCode) {
        try {
            const {
                data
            } = await axios({
                url: `${baseUrl}/BackoffClientProfile`,
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": subscriptionKey,
                    "Cookie": "IIFLMarcookie=" + Token
                },
                data: {
                    head: this.getRequestBodyHead("IIFLMarRQBackoffClientProfile"),
                    body: {
                        ClientCode
                    }
                }
            });
            if (data.body && data.body.Status != 0) {
                logger.info({
                    details: 'IIFL: Failed to fetch user profile',
                    message: data.body
                })
                throw new Error(data.body.message)
            }
            return data.body;
        } catch (err) {
            logger.info({
                details: 'IIFL: Failed to fetch user profile',
                message: JSON.stringify(err)
            })
            throw err;
        }
    }

    /** Transform IIFL Trade data **/
    static transformTradeData(data) {
        return {
            tradeDate: moment(data.TradeTime),
            segment: data.segment,
            symbol: data.segment == DbConstants.SEGMENT.IIFL.OPTIONS ?
                    data.Symbol+(data.ExpiryDate).slice(2)+data.StrikePrice+(data.OptionType == 'C'?'CE':'PE'):data.Symbol,
            tradeType: data.BuyQty ?
                DbConstants.TRADE_TYPE.BUY : DbConstants.TRADE_TYPE.SELL,
            quantity: data.BuyQty ?
                data.BuyQty : data.SellQty,
            tradePrice: data.BuyQty ?
                data.BuyRate : data.SellRate,
            orderId: data.OrderNo
        }
    }

    /**
     * IIFL Client Trade Data
     * @param {string} Token
     * @param {string} ClientCode
     */
    static async getAllTrades(Token, ClientCode, tradeEndpoint) {
        try {
            const {
                currentFinancialYear,
                nextFinancialYear
            } = CommonUtils.getFiscalYear()
            const fromDate = `01/04/${currentFinancialYear-1}`;
            const toDate = `31/03/${nextFinancialYear}`;
            const {
                data
            } = await axios({
                url: `${baseUrl}/${tradeEndpoint}`,
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": subscriptionKey,
                    "Cookie": "IIFLMarcookie=" + Token
                },
                data: {
                    head: this.getRequestBodyHead("IIFLMarRQ"+tradeEndpoint),
                    body: {
                        ClientCode,
                        FromDate: fromDate,
                        ToDate: toDate
                    }
                }
            });
            if(data?.body?.Status==1 && data?.body?.message!=="No record found."){
                throw data?.body
            }
            return data?.body;
        } catch (err) {
            logger.info({
                details: 'IIFL: Failed to fetch trade data',
                message: JSON.stringify(err)
            })
            throw err;
        }
    }

    static async syncTrades(userId, Token, ClientCode) {
        // Get All trades from IIFL service
        const { FutureTransaction } = await this.getAllTrades(Token, ClientCode, 'BackoffFutureTransaction');
        const { ackoffEquitytransaction } = await this.getAllTrades(Token, ClientCode,'BackoffEquitytransaction')
        const { OptionTransactionRes } = await this.getAllTrades(Token, ClientCode, 'BackoffoptionTransaction');
        const tradesData = [...this.getMergedTransaction(OptionTransactionRes,'OPT'),...this.getMergedTransaction(FutureTransaction,'FUT'),...this.getMergedTransaction(ackoffEquitytransaction,'EQ')];
        logger.debug({
            message: `IIFL syncTrades: syncing ${tradesData.length} trades for user ${userId}`,
            userId,
            tradeCount: tradesData.length
        });
       
        // Create/Update trades in IIFL traders collection
        const bulkTrades = _.map(tradesData,(trade) => {
            return {
                updateOne: {
                    filter: {
                        userId,
                        orderId: trade.orderId
                    },
                    update: {
                        $set: {
                            ...trade,
                            userId
                        }
                    },
                    upsert: true
                }
            };
        });  
        if (bulkTrades.length > 0) {
            await IIFLTradeModel.bulkWrite(bulkTrades);
        }
        // Get all trades of current user from IIFL collection
        const userIIFLTrades = await IIFLTradeModel
            .find({
                userId
            })
            .lean()
            .exec();
       // Get list of trade pairs from these trades
        const userIIFLTradePairs = await calculateTradePairs(userIIFLTrades, DbConstants.PROVIDERS.IIFL);
        const bulkTradePairs = _.map(userIIFLTradePairs, (tradePair) => {
            return {
                updateOne: {
                    filter: {
                        'openingTrade._id': tradePair.openingTrade._id,
                        'closingTrade._id': tradePair.closingTrade?._id
                    },
                    update: {
                        $set: {
                            ...tradePair,
                            userId
                        }
                    },
                    upsert: true
                }
            };
        });
        if (bulkTradePairs.length > 0) {
            await IIFLTradePairStatModel.bulkWrite(bulkTradePairs);
        }
    }
      
    static async getTradePairs(userId, filters,offset,limit, {sort='openingTrade.tradeDate', order='asc'}) {
        const dbQuery = CommonUtils.getDBQueryForTradePairs(userId, filters);
        let tradePairs;
        if (limit){
            tradePairs = await IIFLTradePairStatModel.find(dbQuery).sort({[sort]: order === 'des' ? -1 : 1}).skip(Number(offset)).limit(Number(limit));
            let size = await IIFLTradePairStatModel.find(dbQuery).count()
            return {data:tradePairs,size}
          }
          else{
            tradePairs = await IIFLTradePairStatModel.find(dbQuery).lean().exec();
          }
          return {data:tradePairs};
    }

    static async getDashboardData(userId, duration) {
        let overallReturns = {
            returnToday: 0,
            returnYesterday: 0,
            returnInDuration: 0
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
            noReturn: 0
        };

        let traits = {
            riskAppetite: 'Medium',
            tradeSegments: new Set(),
            tradePatterns: new Set(),
            tradeTerms: new Set(),
            aggression: null,
            calculative: null
        };

        let anastratScore = 0;

        let {data:tradePairs} = await this.getTradePairs(userId, {duration});
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

                if ((tradePair.tradeReturn <= -2 && tradePair.tradeSegment == DbConstants.SEGMENT.FUTURES) || (tradePair.tradeReturn <= -5 && tradePair.tradeSegment == DbConstants.SEGMENT.OPTIONS)) {
                    callStats.highLoss++;
                } else if ((tradePair.tradeReturn <= -1.5 && tradePair.tradeSegment == DbConstants.SEGMENT.FUTURES) || (tradePair.tradeReturn <= -4 && tradePair.tradeSegment == DbConstants.SEGMENT.OPTIONS)) {
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

            traits
                .tradeSegments
                .add(tradePair.tradeSegment);
            traits
                .tradePatterns
                .add(tradePair.tradePattern);
            traits
                .tradeTerms
                .add(tradePair.tradeTerm);
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
        overallReturns.returnInDuration = overallReturns
            .returnInDuration
            .toFixed(2);
        overallReturns.returnYesterday = overallReturns
            .returnYesterday
            .toFixed(2);
        overallReturns.returnToday = overallReturns
            .returnToday
            .toFixed(2);

        return {
            anastratScore,
            overallReturns,
            traits,
            callStats
        };
    }

    static async updateTradePairTags(tradePairId, tags){
        const data = await IIFLTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$addToSet:{tags:tags}},{new: true})
        return data;
    }


    static async updateTradePairImages(tradePairId, images){
      const data = await IIFLTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$set:{images:images}},{new: true})
      return data;
  }


    static async deleteTradePairTags(tradePairId, tags){
        const data = await IIFLTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$pull:{tags:tags}})
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
        return await IIFLTradePairStatModel.bulkWrite(bulkUpdate);
    }

    static async updateTradePairComment(tradePairId, comment){
        const data = await IIFLTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$set:{comment:comment}},{new: true})
        return data;
    }
}

export default IIFLService;