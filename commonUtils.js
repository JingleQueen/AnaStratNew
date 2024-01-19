import AppConstants from './AppConstants';
import moment from 'moment';
import DbConstants from './DbConstants';

class CommonUtils {
  static getTradeClosingDate(tradeDate) {
    return {
      bin:
        Object.keys(AppConstants.BIN).find(
          (d) =>
            tradeDate.hour() >= AppConstants.BIN[d]['minHour'] &&
            tradeDate.hour() < AppConstants.BIN[d]['maxHour']
        ) || '9am-11am',
      month: tradeDate.format('MM'),
      week: tradeDate.isoWeek(),
      quarter: tradeDate.quarter(),
      trading_hour: tradeDate.hour() === 5 ? 9 : tradeDate.hour(), // Default time is 5 and IIFL has not time data so if default 5 setting it to 9
      trading_day: tradeDate.day(),
      date: tradeDate.format('DD-MM-YYYY'),
      day: tradeDate.format('DD'),
      year: tradeDate.format('YYYY'),
    };
  }
  static getFiscalYear() {
    let currentFinancialYear, nextFinancialYear;
    if (moment().quarter() === 2) {
      currentFinancialYear = moment().format('YYYY');
      nextFinancialYear = moment().add(1, 'year').format('YYYY');
    } else {
      currentFinancialYear = moment().subtract(1, 'year').format('YYYY');
      nextFinancialYear = moment().format('YYYY');
    }
    return {
      currentFinancialYear,
      nextFinancialYear,
    };
  }

  static getDBqueryForSegment(segment, dbQuery) {
    if (segment && segment != 'All') {
      if (segment === DbConstants.SEGMENT.OPTIONS) {
        dbQuery['tradePair_segment'] = {
          $in: [
            DbConstants.SEGMENT.TRADE_OPTIONS['INDEX OPTIONS'],
            DbConstants.SEGMENT.TRADE_OPTIONS['MCX OPTIONS'],
            DbConstants.SEGMENT.TRADE_OPTIONS['EQUITY OPTIONS'],
          ],
        };
      } else if (segment === DbConstants.SEGMENT.FUTURES) {
        dbQuery['tradePair_segment'] = {
          $in: [
            DbConstants.SEGMENT.TRADE_OPTIONS['INDEX FUTURES'],
            DbConstants.SEGMENT.TRADE_OPTIONS['MCX FUTURES'],
            DbConstants.SEGMENT.TRADE_OPTIONS['EQUITY FUTURES'],
          ],
        };
      } else if (DbConstants.SEGMENT.TRADE_OPTIONS[segment]) {
        dbQuery['tradePair_segment'] = { $eq: DbConstants.SEGMENT.TRADE_OPTIONS[segment] };
        // Check for Intraday Trades
        if (segment === DbConstants.SEGMENT.EQUITY_INTRADAY) {
          dbQuery['tradeTerm'] = { $eq: DbConstants.TRADE_TERM.INTRADAY };
        }
      }
    }
  }

  static getDBQueryForTags(tags, dbQuery) {
    if (tags && tags?.length > 0) {
      dbQuery['tags'] = { $in: tags };
    }
  }

  static getDBQueryForDurations(duration, dbQuery) {
    if (duration == AppConstants.DURATION.TODAY) {
      dbQuery['closingTrade.tradeDate'] = {
        $gte: moment().startOf('day').toDate(),
        $lte: moment().endOf('day').toDate(),
      };
    } else if (duration == AppConstants.DURATION.YESTERDAY) {
      dbQuery['closingTrade.tradeDate'] = {
        $gte: moment().subtract(1, 'days').startOf('day').toDate(),
        $lte: moment().subtract(1, 'days').endOf('day').toDate(),
      };
    } else if (duration == AppConstants.DURATION.THIS_WEEK) {
      dbQuery['closingTrade.tradeDate'] = {
        $gte: moment().subtract(moment().weekday(), 'days').toDate(),
      };
    } else if (duration == AppConstants.DURATION.LAST_WEEK) {
      dbQuery['closingTrade.tradeDate'] = {
        $gte: moment()
          .subtract(7 + moment().weekday(), 'days')
          .toDate(),
        $lte: moment().subtract(moment().weekday(), 'days').toDate(),
      };
    } else if (duration == AppConstants.DURATION.THIS_MONTH) {
      dbQuery['closingTrade.tradeDate'] = {
        $gte: moment().subtract(moment().date(), 'days').toDate(),
      };
    } else if (duration == AppConstants.DURATION.LAST_MONTH) {
      dbQuery['closingTrade.tradeDate'] = {
        $gte: moment().startOf('month').subtract(1, 'month').toDate(),
        $lte: moment().subtract(moment().date(), 'days').toDate(),
      };
    } else if (duration == AppConstants.DURATION.THIS_QUARTER) {
      dbQuery['closingTrade.tradeDate'] = {
        $gte: moment().startOf('quarter').toDate(),
        $lt: moment().endOf('quarter').toDate(),
      };
    } else if (duration == AppConstants.DURATION.LAST_QUARTER) {
      dbQuery['closingTrade.tradeDate'] = {
        $gte: moment().subtract(1, 'quarter').startOf('quarter').toDate(),
        $lt: moment().subtract(1, 'quarter').endOf('quarter').toDate(),
      };
    }
  }

  static getDBQueryForTradePattern(tradePattern, dbQuery) {
    if (tradePattern === DbConstants.TRADE_PATTERN.LONG) {
      dbQuery['tradePattern'] = { $eq: DbConstants.TRADE_PATTERN.LONG };
    } else if (tradePattern === DbConstants.TRADE_PATTERN.SHORT) {
      dbQuery['tradePattern'] = { $eq: DbConstants.TRADE_PATTERN.SHORT };
    }
  }

  static getDBQueryforProfitOrLoss(type, dbQuery) {
    if (type === AppConstants.PROFIT) {
      dbQuery['tradeReturn'] = { $gt: 0 };
    } else if (type === AppConstants.LOSS) {
      dbQuery['tradeReturn'] = { $lt: 0 };
    }
  }

  static getDBQueryFortradeTerm(tradeTerm, dbQuery) {
    if (tradeTerm === DbConstants.TRADE_TERM.INTRADAY) {
      dbQuery['tradeTerm'] = { $eq: DbConstants.TRADE_TERM.INTRADAY };
    } else if (tradeTerm === AppConstants.EXPIRY) {
      dbQuery['tradeTerm'] = {
        $in: [DbConstants.TRADE_TERM.MONTHLY_EXPIRE, DbConstants.TRADE_TERM.WEEKLY_EXPIRE],
      };
    } else if (tradeTerm === AppConstants.POSITION) {
      dbQuery['tradeTerm'] = { $in: [DbConstants.TRADE_TERM.WEEK_POSITION] };
    }
  }

  static getDBQueryForTradePairs(userId, filters) {
    const { time_period, segment, tags, tradePattern, tradeType, tradeTerm } = filters;
    let dbQuery = {
      userId,
    };
    dbQuery['closingTrade.orderId'] = { $exists: true, $nin: ['', null] };

    this.getDBqueryForSegment(segment, dbQuery);
    this.getDBQueryForTags(tags, dbQuery);
    this.getDBQueryForDurations(time_period, dbQuery);
    this.getDBQueryForTradePattern(tradePattern, dbQuery);
    this.getDBQueryforProfitOrLoss(tradeType, dbQuery);
    this.getDBQueryFortradeTerm(tradeTerm, dbQuery);

    return dbQuery;
  }

  static getQuarterIntervals() {
    let quarterInterval = [];
    let { currentFinancialYear } = this.getFiscalYear();
    for (let i = 0; i < 5; i++) {
      let endRange =
        quarterInterval.length > 0
          ? moment(quarterInterval[0].range[0], 'DD/MM/YYYY').subtract(1, 'day')
          : moment();
      let startRange =
        quarterInterval.length > 0
          ? moment(quarterInterval[0].range[0], 'DD/MM/YYYY').subtract(90, 'day')
          : moment().subtract(90, 'days');
      // Check if range is in current fiscal year
      if (endRange.isAfter(moment(`01/04/${currentFinancialYear}`, 'DD/MM/YYYY'))) {
        if (startRange.isAfter(moment(`01/04/${currentFinancialYear}`, 'DD/MM/YYYY'))) {
          quarterInterval.unshift({
            range: [startRange.format('DD/MM/YYYY'), endRange.format('DD/MM/YYYY')],
            fiscalYear: currentFinancialYear,
          });
          continue;
        } else {
          quarterInterval.unshift({
            range: [
              moment(`01/04/${currentFinancialYear}`, 'DD/MM/YYYY').format('DD/MM/YYYY'),
              endRange.format('DD/MM/YYYY'),
            ],
            fiscalYear: currentFinancialYear,
          });
          continue;
        }
      }
      // Check if range is before last fiscal year
      if (startRange.isBefore(moment(`01/04/${currentFinancialYear - 1}`, 'DD/MM/YYYY'))) {
        if (!endRange.isBefore(moment(`01/04/${currentFinancialYear - 1}`, 'DD/MM/YYYY'))) {
          quarterInterval.unshift({
            range: [`01/04/${currentFinancialYear - 1}`, endRange.format('DD/MM/YYYY')],
            fiscalYear: currentFinancialYear - 1,
          });
        }
        break;
      }
      quarterInterval.unshift({
        range: [startRange.format('DD/MM/YYYY'), endRange.format('DD/MM/YYYY')],
        fiscalYear: currentFinancialYear - 1,
      });
    }

    return quarterInterval;
  }
}

export default CommonUtils;
