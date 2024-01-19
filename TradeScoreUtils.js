import DbConstants from './DbConstants';

class TradeScoreUtils {
  static getTimeFactorScore(tradeTerm) {
    if (tradeTerm == DbConstants.TRADE_TERM.INTRADAY || tradeTerm == DbConstants.TRADE_TERM.BTST) {
      return 3;
    }

    if (
      tradeTerm == DbConstants.TRADE_TERM.WEEK_POSITION ||
      tradeTerm == DbConstants.TRADE_TERM.WEEKLY_EXPIRE
    ) {
      return 2.5;
    }

    if (tradeTerm == DbConstants.TRADE_TERM.MONTHLY_EXPIRE) {
      return 2;
    }

    return 0;
  }

  static getReturnFactorScore(tradeReturn, tradeTerm, tradeSegment) {
    switch (tradeSegment) {
      case DbConstants.SEGMENT.TRADE_OPTIONS.FUTURES:
      case DbConstants.SEGMENT.TRADE_OPTIONS['INDEX FUTURES']:
      case DbConstants.SEGMENT.TRADE_OPTIONS['EQUITY FUTURES']:
      case DbConstants.SEGMENT.TRADE_OPTIONS['MCX FUTURES']: {
        switch (tradeTerm) {
          case DbConstants.TRADE_TERM.INTRADAY:
          case DbConstants.TRADE_TERM.BTST: {
            if (tradeReturn >= 1.9) {
              return 4;
            }

            if (tradeReturn >= 1.6) {
              return 3;
            }

            if (tradeReturn >= 1.3) {
              return 2;
            }

            if (tradeReturn >= 1) {
              return 1;
            }

            return 0;
          }

          case DbConstants.TRADE_TERM.WEEKLY_EXPIRE:
          case DbConstants.TRADE_TERM.WEEK_POSITION: {
            if (tradeReturn >= 6) {
              return 4;
            }

            if (tradeReturn >= 5) {
              return 3;
            }

            if (tradeReturn >= 4) {
              return 2;
            }

            if (tradeReturn >= 3) {
              return 1;
            }

            return 0;
          }

          case DbConstants.TRADE_TERM.MONTHLY_EXPIRE: {
            if (tradeReturn >= 9.5) {
              return 4;
            }

            if (tradeReturn >= 8) {
              return 3;
            }

            if (tradeReturn >= 6.5) {
              return 2;
            }

            if (tradeReturn >= 5) {
              return 1;
            }

            return 0;
          }

          default: {
            return 0;
          }
        }
      }

      case DbConstants.SEGMENT.TRADE_OPTIONS.OPTIONS:
      case DbConstants.SEGMENT.TRADE_OPTIONS['INDEX OPTIONS']:
      case DbConstants.SEGMENT.TRADE_OPTIONS['EQUITY OPTIONS']:
      case DbConstants.SEGMENT.TRADE_OPTIONS['MCX OPTIONS']: {
        switch (tradeTerm) {
          case DbConstants.TRADE_TERM.INTRADAY:
          case DbConstants.TRADE_TERM.BTST: {
            if (tradeReturn >= 4.5) {
              return 4;
            }

            if (tradeReturn >= 4) {
              return 3;
            }

            if (tradeReturn >= 3.5) {
              return 2;
            }

            if (tradeReturn >= 3) {
              return 1;
            }

            return 0;
          }

          case DbConstants.TRADE_TERM.WEEKLY_EXPIRE:
          case DbConstants.TRADE_TERM.WEEK_POSITION: {
            if (tradeReturn >= 16) {
              return 4;
            }

            if (tradeReturn >= 12) {
              return 3;
            }

            if (tradeReturn >= 8) {
              return 2;
            }

            if (tradeReturn >= 4) {
              return 1;
            }

            return 0;
          }

          case DbConstants.TRADE_TERM.MONTHLY_EXPIRE: {
            if (tradeReturn >= 30) {
              return 4;
            }

            if (tradeReturn >= 24) {
              return 3;
            }

            if (tradeReturn >= 18) {
              return 2;
            }

            if (tradeReturn >= 12) {
              return 1;
            }
            return 0;
          }

          default: {
            return 0;
          }
        }
      }
      case DbConstants.SEGMENT.EQUITY:
        switch (tradeTerm) {
          case DbConstants.TRADE_TERM.INTRADAY:
          case DbConstants.TRADE_TERM.BTST: {
            if (tradeReturn >= 1.9) {
              return 4;
            }
            if (tradeReturn >= 1.6) {
              return 3;
            }
            if (tradeReturn >= 1.3) {
              return 2;
            }
            if (tradeReturn >= 1) {
              return 1;
            }
            return 0;
          }
        default:
          return 0;
        }
    default:
      return 0;
    }
  }
}
export default TradeScoreUtils;