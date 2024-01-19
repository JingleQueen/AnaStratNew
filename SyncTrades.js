
import DbConstants from "./DbConstants";
import TradeScoreUtils from "./TradeScoreUtils";
import CommonUtils from '../utils/commonUtils';
import logger from "./logger";
import moment from 'moment';

export const getDhanTradeSegment = (segment, symbol) => {
  if (segment == 'NSE_EQ' || segment == 'BSE_EQ') return DbConstants.SEGMENT.EQUITY;
  else if (segment == 'NSE_FNO') {
    const lastTwoChar = symbol.slice(-2);

    if (lastTwoChar && (lastTwoChar.toUpperCase() == 'PE' || lastTwoChar.toUpperCase() == 'CE')) {
      if (symbol.toUpperCase().includes('NIFTY'))
        return DbConstants.SEGMENT.TRADE_OPTIONS['INDEX OPTIONS'];
      else return DbConstants.SEGMENT.TRADE_OPTIONS['EQUITY OPTIONS'];
    } else {
      if (symbol.toUpperCase().includes('NIFTY'))
        return DbConstants.SEGMENT.TRADE_OPTIONS['INDEX FUTURES'];
      else return DbConstants.SEGMENT.TRADE_OPTIONS['EQUITY FUTURES'];
    }
  } else {
    const lastTwoChar = symbol.slice(-2);

    if (lastTwoChar && (lastTwoChar.toUpperCase() == 'PE' || lastTwoChar.toUpperCase() == 'CE')) {
      return DbConstants.SEGMENT.TRADE_OPTIONS['MCX OPTIONS'];
    } else {
      return DbConstants.SEGMENT.TRADE_OPTIONS['MCX FUTURES'];
    }
  }
};

/** Helper function to assign trade segments to SAMCO trades  */
export const getSAMCOTradeSegment = (instrument) =>{

  if(instrument == "EQ" )
  return DbConstants.SEGMENT.EQUITY;
  
  if(instrument.slice(0,3) == "FUT"){
    switch(instrument.slice(3)){
      case "COM" : return DbConstants.SEGMENT.TRADE_OPTIONS["MCX FUTURES"];

      case "STK" : return DbConstants.SEGMENT.TRADE_OPTIONS["EQUITY FUTURES"];

      case "IDX" : return DbConstants.SEGMENT.TRADE_OPTIONS["INDEX FUTURES"];

      default : return DbConstants.SEGMENT.FUTURES;
    }
  }
  else if(instrument.slice(0,3) == "OPT"){

    switch(instrument.slice(3)){
      case "COM" : return DbConstants.SEGMENT.TRADE_OPTIONS["MCX OPTIONS"];

      case "STK" : return DbConstants.SEGMENT.TRADE_OPTIONS["EQUITY OPTIONS"];

      case "IDX" : return DbConstants.SEGMENT.TRADE_OPTIONS["INDEX OPTIONS"];

      default : return DbConstants.SEGMENT.OPTIONS;
    }
  }
  else if(instrument.slice(0,5) == "INDEX")
    return DbConstants.SEGMENT.INDEX;

};

const getFyersTradeSegment = (symbol) => {
  const firstWord = symbol.split(' ')[0];

  if (firstWord[1] && firstWord[1].toUpperCase() == 'F') {
    return DbConstants.SEGMENT.FUTURES;
  }

  if (firstWord[1] && firstWord[1].toUpperCase() == 'O') {
    return DbConstants.SEGMENT.OPTIONS;
  }
}
export const getZerodhaTradeSegment = (symbol) => {
  const lastTwoChar = symbol.slice(-2);
  if (lastTwoChar && (lastTwoChar.toUpperCase() == 'PE' || lastTwoChar.toUpperCase() == 'CE')) {
    return DbConstants.SEGMENT.OPTIONS;
  } else {
    return DbConstants.SEGMENT.FUTURES;
  }
}

export const getIIFLTradeSegment = (segment,symbol) =>{
  switch(segment){
    case DbConstants.SEGMENT.IIFL.EQUITY : 
      return DbConstants.SEGMENT.EQUITY;
    case DbConstants.SEGMENT.IIFL.OPTIONS:
      if(symbol.includes('NIFTY') || symbol.includes('BANKNIFTY'))
       return DbConstants.SEGMENT.TRADE_OPTIONS["INDEX OPTIONS"];
      return DbConstants.SEGMENT.TRADE_OPTIONS["EQUITY OPTIONS"];
    case DbConstants.SEGMENT.IIFL.FUTURES:
      if(symbol.includes('NIFTY') || symbol.includes('BANKNIFTY'))
       return DbConstants.SEGMENT.TRADE_OPTIONS["INDEX FUTURES"]
      return DbConstants.SEGMENT.TRADE_OPTIONS["EQUITY FUTURES"];
    default: return segment;
  }
}

export const getSegmentType = (segment, symbol, broker) => {
  switch (broker) {
    case DbConstants.PROVIDERS.ZERODHA:
      if (segment === DbConstants.SEGMENT.ZERODHA.COMMODITY) {
        return DbConstants.SEGMENT.COMMODITY + " " + getZerodhaTradeSegment(symbol);
      } else if (segment == DbConstants.SEGMENT.ZERODHA.FUTURE_OPTIONS) {
        let segmentType = '';
        if (symbol.includes("NIFTY") || symbol.includes("BANKNIFTY")) {
          segmentType = DbConstants.SEGMENT.INDEX;
        } else {
          segmentType = DbConstants.SEGMENT.EQUITY;
        }
        return segmentType + " " + getZerodhaTradeSegment(symbol);
      } else if (segment === DbConstants.SEGMENT.ZERODHA.EQUITY) {
        return DbConstants.SEGMENT.EQUITY;
      }
      return segment;

    case DbConstants.PROVIDERS.FYERS:
      if (segment === DbConstants.SEGMENT.FYERS.COMMODITY) {
        return DbConstants.SEGMENT.COMMODITY + " " + getFyersTradeSegment(symbol);
      } else if (segment == DbConstants.SEGMENT.FYERS.FUTURES_OPTIONS) {
        let segmentType = '';
        if (symbol.includes("NIFTY") || symbol.includes("BANKNIFTY")) {
          segmentType = DbConstants.SEGMENT.INDEX;
        } else {
          segmentType = DbConstants.SEGMENT.EQUITY;
        }
        return segmentType + " " + getFyersTradeSegment(symbol);
      } else if (segment == "BSE_CASH" || segment == "NSE_CASH") {
        return DbConstants.SEGMENT.EQUITY;
      }
      else if(segment == DbConstants.SEGMENT.FYERS.EQUITY_INTRA)
        return DbConstants.SEGMENT.EQUITY;
      else if(segment == DbConstants.SEGMENT.FYERS.COMMODITY_DERIVATIVE){
        return DbConstants.SEGMENT.COMMODITY + " " + symbol.slice(-3)=="FUT"? DbConstants.SEGMENT.FUTURES:DbConstants.SEGMENT.OPTIONS;
      }
      else if(segment == DbConstants.SEGMENT.FYERS.EQUITY_DERIVATIVE){
        let segmentType = '';
        if (symbol.includes("NIFTY") || symbol.includes("BANKNIFTY")) {
          segmentType = DbConstants.SEGMENT.INDEX;
        } else {
          segmentType = DbConstants.SEGMENT.EQUITY;
        }
        if(symbol.slice(-3)=="FUT")
         return segmentType + " " + DbConstants.SEGMENT.FUTURES;
        else if(symbol.slice(-2) == "CE" || symbol.slice(-2) == "PE" )
          return segmentType + " " + DbConstants.SEGMENT.OPTIONS;
        else return segmentType;
      }
      return segment;

    case DbConstants.PROVIDERS.SAMCO:
      return getSAMCOTradeSegment(segment);
    case DbConstants.PROVIDERS.IIFL:
      return getIIFLTradeSegment(segment,symbol);
    case DbConstants.PROVIDERS.DHAN:
      try{
        let seg = getDhanTradeSegment(segment,symbol);
        return getDhanTradeSegment(segment,symbol);
      }
      catch(err){
        console.log(seg);
      }
    default:  return segment
  }
}

const isEnabledSegment = (trade, broker) => {
  switch (broker) {
    case DbConstants.PROVIDERS.ZERODHA:
      return trade.segment?.toUpperCase() == DbConstants.SEGMENT.ZERODHA.COMMODITY ||
        trade.segment?.toUpperCase() == DbConstants.SEGMENT.ZERODHA.FUTURE_OPTIONS ||
        trade.segment?.toUpperCase() == DbConstants.SEGMENT.ZERODHA.EQUITY

    case DbConstants.PROVIDERS.FYERS:
      return trade.segment == DbConstants.SEGMENT.FYERS.COMMODITY ||
        trade.segment == DbConstants.SEGMENT.FYERS.FUTURES_OPTIONS ||
        trade.segment == DbConstants.SEGMENT.FYERS.BSE_CASH ||
        trade.segment == DbConstants.SEGMENT.FYERS.NSE_CASH || 
        trade.segment == DbConstants.SEGMENT.FYERS.EQUITY_INTRA ||
        trade.segment == DbConstants.SEGMENT.FYERS.COMMODITY_DERIVATIVE ||
        trade.segment == DbConstants.SEGMENT.FYERS.EQUITY_DERIVATIVE;
    
    case DbConstants.PROVIDERS.SAMCO:
      return DbConstants.SEGMENT.SAMCO.includes(trade.segment);
    case DbConstants.PROVIDERS.IIFL:
      return DbConstants.SEGMENT.IIFL.EQUITY==trade.segment || DbConstants.SEGMENT.IIFL.FUTURES==trade.segment || DbConstants.SEGMENT.IIFL.OPTIONS==trade.segment;
    case DbConstants.PROVIDERS.DHAN:
      return DbConstants.SEGMENT.DHAN.includes(trade.segment);
    default:
      return false
  }
}

export const tradePairListWithStat = (tradePair, broker) => {
  let tradeScore = 0;
  let tradeReturn;
  let tradePattern;
  let tradeSegment;
  let tradeTerm;
  let timeFactorScore;
  let returnFactorScore;
  let buyAmount = 0;
  let sellAmount = 0;
  let closingDate = {};

  const {
    openingTrade,
    closingTrade
  } = tradePair;
  const tradePair_segment = getSegmentType(openingTrade?.segment?.toUpperCase(), openingTrade?.symbol?.toUpperCase(), broker);

  if (closingTrade) {
    tradeSegment = openingTrade.segment;

    if (openingTrade?.tradeType.toLowerCase() == DbConstants.TRADE_TYPE.BUY) {
      const minQuantity = Math.min(openingTrade.quantity, closingTrade.quantity);

      const capUsed = minQuantity * openingTrade.tradePrice;
      const capReceived = minQuantity * closingTrade.tradePrice;

      capUsed > 0 ? tradeReturn = ((capReceived - capUsed) / capUsed) * 100 : tradeReturn = 0;
      tradePattern = DbConstants.TRADE_PATTERN.LONG;
    } else {
      const minQuantity = Math.min(openingTrade.quantity, closingTrade.quantity);

      const capUsed = minQuantity * closingTrade.tradePrice;
      const capReceived = minQuantity * openingTrade.tradePrice;

      capUsed > 0 ? tradeReturn = ((capReceived - capUsed) / capUsed) * 100 : tradeReturn = 0;
      tradePattern = DbConstants.TRADE_PATTERN.SHORT;
    }

    const openingTradeDate = moment(openingTrade.tradeDate);
    const closingTradeDate = moment(closingTrade.tradeDate);

    const tradePeriod = closingTradeDate.diff(openingTradeDate, 'days');

    if (openingTradeDate.dayOfYear() == closingTradeDate.dayOfYear()) {
      tradeTerm = DbConstants.TRADE_TERM.INTRADAY;
      timeFactorScore = TradeScoreUtils.getTimeFactorScore(tradeTerm);
    } else if (tradePeriod <= 2) {
      tradeTerm = DbConstants.TRADE_TERM.BTST;
      timeFactorScore = TradeScoreUtils.getTimeFactorScore(tradeTerm);
    } else if (tradePeriod >= 3 && tradePeriod <= 7) {
      tradeTerm = DbConstants.TRADE_TERM.WEEKLY_EXPIRE;

      timeFactorScore = TradeScoreUtils.getTimeFactorScore(tradeTerm);
    } else if (tradePeriod >= 8 && tradePeriod <= 27) {
      tradeTerm = DbConstants.TRADE_TERM.MONTHLY_EXPIRE;
      timeFactorScore = TradeScoreUtils.getTimeFactorScore(tradeTerm);
    } else {
      tradeTerm = null;
      timeFactorScore = 0;
    }
    returnFactorScore = TradeScoreUtils.getReturnFactorScore(
      tradeReturn,
      tradeTerm,
      tradePair_segment
    );

    tradeScore += timeFactorScore;
    tradeScore += returnFactorScore;
    closingDate = CommonUtils.getTradeClosingDate(closingTradeDate);
  }
  if (openingTrade?.tradeType?.toLowerCase() === DbConstants.TRADE_TYPE.BUY && closingTrade) {
    buyAmount = openingTrade.quantity * openingTrade.tradePrice;
    sellAmount = closingTrade.quantity * closingTrade.tradePrice;
  } else if (closingTrade) {
    sellAmount = openingTrade.quantity * openingTrade.tradePrice;
    buyAmount = closingTrade.quantity * closingTrade.tradePrice;
  }
 
  if (tradePair_segment !== DbConstants.SEGMENT.EQUITY ||
    (tradePair_segment === DbConstants.SEGMENT.EQUITY &&
      (moment(openingTrade?.tradeDate).dayOfYear() === moment(closingTrade?.tradeDate).dayOfYear() || !closingTrade))) {
    return {
      ...tradePair,
      tradeScore: Number.isInteger(tradeScore) ? tradeScore + 1 : 0,
      returnFactorScore,
      timeFactorScore,
      tradeReturn,
      tradePattern,
      tradeSegment,
      tradeTerm,
      closingDate,
      buyAmount,
      sellAmount,
      tradePair_segment,
    };
  }
  return null;
}

const getFilteredQueue = (filteredTradeQueue)=>{
  let queue = [];
  filteredTradeQueue.forEach((trade) => {
    const lastQueue = queue[queue.length - 1];
    if (queue.length === 0) {
      queue.push(trade);
    } else {
      const tradeDate = moment(trade.tradeDate);
      const lastTradeDate = moment(lastQueue?.tradeDate);

      const timeGap = (tradeDate - lastTradeDate) / 1000;

      if (timeGap < 15) {
        const lastQueueTotalPrice = lastQueue.quantity * lastQueue.tradePrice;

        const tradeTotalPrice = trade.quantity * trade.tradePrice;

        const totalPrice = +lastQueueTotalPrice + +tradeTotalPrice;

        const totalQuantity = +lastQueue.quantity + +trade.quantity;

        const weightedAveragePrice = totalPrice / totalQuantity;

        lastQueue.quantity = totalQuantity;
        lastQueue.tradePrice = weightedAveragePrice;
      } else {
        queue.push(trade);
      }
    }
  });
  return queue;
}

export const calculateTradePairs = async (tradebookData, broker) => {
  /**
   * Getting tradebook data from CSV file as an array of objects
   * creating a map for storing the data on basis of symbol
   * and then pushing the data to the map on basis of symbol
   */
  try {
    console.time('calculateTradePairs');
    
    const tradesBySymbolMap = new Map();
    tradebookData.forEach((trade) => {
      const symbol = trade.symbol;
      if (isEnabledSegment(trade, broker)) {
        if (!tradesBySymbolMap.has(symbol)) {
          tradesBySymbolMap.set(symbol, []);
        }
        tradesBySymbolMap.get(symbol).push(trade);
      }
    });
  
    const tradesPair = [];
    const tradesPairWithStats = []

    const dateFormat = 'DD-MM-YYYY HH:mm:ss';

    /**
     * Getting the data from the tradesBySymbolMap and
     * and creating buyQueue and sellQueue for each symbol
     */

    for (const [symbol, trades] of tradesBySymbolMap) {
      const filteredBuyQueue = trades.filter((trade) => trade.tradeType.toLowerCase() === DbConstants.TRADE_TYPE.BUY);
      filteredBuyQueue.sort((a, b) => {
        const aDate = moment(a.tradeDate);
        const bDate = moment(b.tradeDate);
        return aDate - bDate;
      });
      const buyQueue = getFilteredQueue(filteredBuyQueue);
  
      const filteredSellQueue = trades.filter((trade) => trade.tradeType.toLowerCase() === DbConstants.TRADE_TYPE.SELL);
      filteredSellQueue.sort((a, b) => {
        const aDate = moment(a.tradeDate);
        const bDate = moment(b.tradeDate);
        return aDate - bDate;
      });
      const sellQueue = getFilteredQueue(filteredSellQueue);

      while (buyQueue.length && sellQueue.length) {
        const lastTradePair = tradesPair[tradesPair.length - 1];
        // if(lastTradePair?.opening_trade && lastTradePair?.closingTrade){
        if (moment(buyQueue[0].tradeDate) < moment(sellQueue[0].tradeDate)) {
          const tradeType = DbConstants.TRADE_PATTERN.LONG;

          const timeGapInSecondsForSell  =
          (moment(sellQueue[0].tradeDate) -
          moment(lastTradePair?.closing_trade.tradeDate)) /
        1000;

          if (
            lastTradePair &&
            lastTradePair?.openingTrade.orderId === buyQueue[0].orderId &&
            timeGapInSecondsForSell  < 15
          ) {
            let availableQuantity = buyQueue[0].quantity;

            if (availableQuantity > sellQueue[0].quantity) {
              availableQuantity = sellQueue[0].quantity;
            }

            const lastClosingTradeTotalPrice =
              lastTradePair.closingTrade.tradePrice * lastTradePair.closingTrade.quantity;

            const sellQueseTradeTotalPrice = sellQueue[0].tradePrice * availableQuantity;

            const weightedAveragePrice =
              (+lastClosingTradeTotalPrice + +sellQueseTradeTotalPrice) /
              (+lastTradePair.closingTrade.quantity + +availableQuantity);

            lastTradePair.closingTrade.tradePrice = weightedAveragePrice;
            lastTradePair.closingTrade.quantity = +availableQuantity + +lastTradePair.closingTrade.quantity;

            lastTradePair.openingTrade.quantity = +availableQuantity + +lastTradePair.openingTrade.quantity;

            sellQueue[0].quantity -= availableQuantity;

            if (sellQueue[0].quantity === 0) {
              sellQueue.shift();
            }
            buyQueue[0].quantity -= availableQuantity;

            if (buyQueue[0].quantity === 0) {
              buyQueue.shift();
            }
          } else if (+buyQueue[0].quantity == +sellQueue[0].quantity) {
            const buyAmount = buyQueue[0].quantity * buyQueue[0].tradePrice;
            const sellAmount = sellQueue[0].quantity * sellQueue[0].tradePrice;
            const tradeReturn = (sellAmount - buyAmount) / buyAmount;
            tradesPair.push({
              openingTrade: {
                ...buyQueue[0]
              },
              closingTrade: {
                ...sellQueue[0]
              },
              trade_type: tradeType,
            });
            buyQueue.shift();
            sellQueue.shift();
          } else if (+buyQueue[0].quantity > +sellQueue[0].quantity) {
            const leftOverQuantity = buyQueue[0].quantity - sellQueue[0].quantity;
            tradesPair.push({
              openingTrade: {
                ...buyQueue[0],
                quantity: sellQueue[0].quantity
              },
              closingTrade: {
                ...sellQueue[0]
              },
              trade_type: tradeType,
            });
            buyQueue[0].quantity = leftOverQuantity;
            sellQueue.shift();
          } else {
            const leftOverQuantity = sellQueue[0].quantity - buyQueue[0].quantity;
            tradesPair.push({
              openingTrade: {
                ...buyQueue[0]
              },
              closingTrade: {
                ...sellQueue[0],
                quantity: buyQueue[0].quantity
              },
              trade_type: tradeType,
            });
            sellQueue[0].quantity = leftOverQuantity;
            buyQueue.shift();
          }
        } else {
          const tradeType = DbConstants.TRADE_PATTERN.SHORT;

          const timeGapInSecondsForBuy  =
            (moment(buyQueue[0].tradeDate) -
              moment(lastTradePair?.closingTrade.tradeDate)) /
              1000;

          if (
            lastTradePair &&
            lastTradePair?.openingTrade.orderId === sellQueue[0].orderId &&
            timeGapInSecondsForBuy < 15
          ) {
            let availableQuantity = sellQueue[0].quantity;

            if (availableQuantity > buyQueue[0].quantity) {
              availableQuantity = buyQueue[0].quantity;
            }

            const lastClosingTradeTotalPrice =
              lastTradePair.closingTrade.tradePrice * lastTradePair.closingTrade.quantity;

            const buyQueseTradeTotalPrice = sellQueue[0].tradePrice * availableQuantity;

            const weightedAveragePrice =
              (+lastClosingTradeTotalPrice + +buyQueseTradeTotalPrice) /
              (+lastTradePair.closingTrade.quantity + +availableQuantity);

            lastTradePair.closingTrade.tradePrice = weightedAveragePrice;
            lastTradePair.closingTrade.quantity = +availableQuantity + +lastTradePair.closingTrade.quantity;

            lastTradePair.openingTrade.quantity = +availableQuantity + +lastTradePair.openingTrade.quantity;

            buyQueue.shift();

          } else if (+buyQueue[0].quantity == +sellQueue[0].quantity) {
            const buyAmount = buyQueue[0].quantity * buyQueue[0].tradePrice;
            const sellAmount = sellQueue[0].quantity * sellQueue[0].tradePrice;
            const tradeReturn = (sellAmount - buyAmount) / buyAmount;
            tradesPair.push({
              openingTrade: {
                ...sellQueue[0]
              },
              closingTrade: {
                ...buyQueue[0]
              },
              trade_type: tradeType,
            });
            buyQueue.shift();
            sellQueue.shift();
          } else if (+buyQueue[0].quantity > +sellQueue[0].quantity) {
            const leftOverQuantity = buyQueue[0].quantity - sellQueue[0].quantity;
            tradesPair.push({
              openingTrade: {
                ...sellQueue[0]
              },
              closingTrade: {
                ...buyQueue[0],
                quantity:sellQueue[0].quantity
              },
              trade_type: tradeType,
            });
            buyQueue[0].quantity = leftOverQuantity;
            sellQueue.shift();
          } else {
            const leftOverQuantity = sellQueue[0].quantity - buyQueue[0].quantity;
            tradesPair.push({
              openingTrade: {
                ...sellQueue[0],
                quantity: buyQueue[0].quantity
              },
              closingTrade: {
                ...buyQueue[0]
              },
              trade_type: tradeType,
            });
            sellQueue[0].quantity = leftOverQuantity;
            buyQueue.shift();
          }
        }
        const tradePairStat = tradePairListWithStat(tradesPair.pop(), broker)
        tradePairStat ? tradesPairWithStats.push(tradePairStat) : null;
        // }
      }
      buyQueue.forEach((trade) => {
        const tradePairStat = tradePairListWithStat({
          openingTrade: trade
        }, broker)
        tradePairStat ? tradesPairWithStats.push(tradePairStat) : null;
      })
      sellQueue.forEach((trade) => {
        const tradePairStat = tradePairListWithStat({
          openingTrade: trade
        }, broker)
        tradePairStat ? tradesPairWithStats.push(tradePairStat) : null;
      })
    }
    console.timeEnd('calculateTradePairs');
    return tradesPairWithStats;
  } catch (err) {
    logger.error({
      message: 'Error while calculating Trade Pairs',
      err
    });
  }
}