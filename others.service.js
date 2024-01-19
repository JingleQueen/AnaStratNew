import DbConstants from '../utils/DbConstants';
import SAMCOTradeModel from '../models/SAMCOTrade';
import SAMCOTradePairStatModel from '../models/SAMCOTradePairStat';
import _ from 'lodash';
import logger from '../utils/logger';
import { calculateTradePairs } from '../utils/SyncTrades';
import CommonUtils from '../utils/commonUtils';
import moment from 'moment';
import UserModel from '../models/User';
import bcrypt from 'bcrypt';
import xlsx from 'xlsx';
import AppConstants from '../utils/AppConstants';

class OthersService {
  
  /** Logging in using the  */
  static async loginService({ email, password }) {
    try {

      let user = await UserModel
                .findOne({email:email})
                .lean()
                .exec();

      if(_.isEmpty(user) || user.providers.others == undefined){
        return("No user exists");
      }
      else{
        let data = user.providers.others; 
        if(!user.isVerified)
          return("Validate Email first");
        else if(await bcrypt.compare(password,data.password))
          return user;
        else
          return("Password not valid");
      }
    }
    catch(err){
      throw err;
    }
  }

  // parsing CSV fro SAMCO trades

  static parseSAMCO(file){

          //Parsing the Excel worksheet
          const parsedData = xlsx.readFile(file.path);
          const worksheet = parsedData.Sheets["Trade Book"];
          // getting the no of rows
    
          let rows = parseInt(worksheet["!ref"].split(':')[1].slice(1));
          //getting the headers from csv
    
          let headers=[],c=0;
          let columns = ['A','B','C','D','E','F','G','H','I','J','K'];
              columns.forEach((col)=>{
                headers[c++] = worksheet[`${col}8`].v;
              });
          
          // checking if the headers are valid
    
          AppConstants.SAMCO_CSV_HEADERS.forEach((h) => {
              if(!headers.includes(h))
                throw new httpErrors.BadRequest(`Invalid XLSX format`);
          });
    
          // seperating the trades from the parsed data
          let trades=[];c=0;
          for(let i=9;i<=rows;i++){
            if(worksheet[`B${i}`]){
               trades.push({
                "Sr. No.": worksheet[`A${i}`].v,
                "Trade Date": worksheet[`B${i}`].v +" "+worksheet[`C${i}`].v,
                //"Trade Time": , 
                "Exchange": worksheet[`D${i}`].v,
                "Contract": worksheet[`E${i}`].v,
                "Series": worksheet[`F${i}`].v,
                "Buy/Sell": worksheet[`G${i}`].v,
                "Quantity": worksheet[`H${i}`].v,
                "Rate": worksheet[`I${i}`].v,
                "Order Number": worksheet[`J${i}`].v,
                "Trade Number": worksheet[`K${i}`].v
               })
              }
          }
          return trades;
  }
  
  /** Transform SMACO Trade data **/
  static transformTradeDataSAMCO(data) {
    return {
      tradeDate: Date.parse(data['Trade Date']), //doubt
      segment: data['Series'], 
      symbol: data['Contract'],
      tradeType:
        data['Buy/Sell'] == 'Buy' ? DbConstants.TRADE_TYPE.BUY : DbConstants.TRADE_TYPE.SELL,
      quantity: data['Quantity'],
      tradePrice: data['Rate'],
      orderId: data['Order Number'], // doubt
    };
  }

  static async syncTradesSAMCO(trades,userId){

    logger.debug({
      message: `SAMCO syncTrades: syncing ${trades.length} trades for user ${userId}`,
      userId,
      tradeCount: trades.length,
    });

    // Create/Update trades in SAMCO traders collection
    const bulkTrades = _.map(trades, (trade) => {
      return {
        updateOne: {
          filter: {
            userId,
            orderId: trade['Order Number'],
          },
          update: {
            $set: {
              ...this.transformTradeDataSAMCO(trade),
              userId,
            },
          },
          upsert: true,
        },
      };
    });
    if (bulkTrades.length > 0) {
      await SAMCOTradeModel.bulkWrite(bulkTrades);
    }

     // Get all trades of current user from SAMCO collection
     const userSAMCOTrades = await SAMCOTradeModel.find({
      userId,
    })
      .lean()
      .exec();
    
    // Get list of trade pairs from these trades
    const userSAMCOTradePairs = await calculateTradePairs(userSAMCOTrades,DbConstants.PROVIDERS.SAMCO);

    const bulkTradePairs = _.map(userSAMCOTradePairs, (tradePair) => {
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
      await SAMCOTradePairStatModel.bulkWrite(bulkTradePairs);
    }
    
  }

  static async getTradePairsSAMCO(userId, filters, offset, limit, { sort='openingTrade.tradeDate', order='asc'}) {
    const dbQuery = CommonUtils.getDBQueryForTradePairs(userId,filters);
    let tradePairs;
    if (limit){
      tradePairs = await SAMCOTradePairStatModel.find(dbQuery).sort({[sort]: order === 'des' ? -1 : 1}).skip(Number(offset)).limit(Number(limit)).lean().exec();
      let size = await SAMCOTradePairStatModel.find(dbQuery).count()
      return {data:tradePairs,size}
    }
    else {
      tradePairs = await SAMCOTradePairStatModel.find(dbQuery).lean().exec();
    }
    return tradePairs;
  }

  static async getDashboardDataSAMCO(userId, duration) {
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

    let tradePairs = await this.getTradePairsSAMCO(userId,{duration}); // doubt
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

      traits.tradeSegments.add(tradePair.tradePair_segment); //doubt
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

  static async updateTradePairTagsSAMCO(tradePairId, tags){
    try{
      const data = await SAMCOTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$addToSet:{tags:tags}},{new: true});
      return data;
    }
    catch(err){
      throw err;
    }
  }

  static async deleteTradePairTags(tradePairId, tags){
    const data = await SAMCOTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$pull:{tags:tags}})
    return data;
  }

  static async bulkUpdateTradePairsTagSAMCO({tradePairs, tag}) {
    const bulkUpdate = tradePairs.map(({id,tag})=>({
      updateOne: {
        filter:{
          _id:id
        },
        update: {
            $addToSet:{tags:tag}
        }
      }
    }));
    return await SAMCOTradePairStatModel.bulkWrite(bulkUpdate);
  }

  static async updateTradePairCommentSAMCO(tradePairId, comment){
    try{
      const data = await SAMCOTradePairStatModel.findOneAndUpdate({'_id':tradePairId},{$set:{comment:comment}},{new: true})
      return data;
    }
    catch(err){
      throw err;
    }
   
  }

}

export default OthersService;
