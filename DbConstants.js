const DbConstants = {
  SEGMENT: {
    FYERS: {
      COMMODITY: 'MCX',
      FUTURES_OPTIONS: 'NSE_FNO',
      BSE_CASH: 'BSE_CASH', 
      NSE_CASH: 'NSE_CASH',
      CD_NSE: 'CD_NSE',
      MF_BSE: 'MF_BSE',
      EQUITY_INTRA: 'EQUITY_INTRA',
      COMMODITY_DERIVATIVE: 'MCX_DERIVATIVE',
      EQUITY_DERIVATIVE: 'EQUITY_DERIVATIVE',
      CURRENCY_DERIVATIVE: 'CURRENCY_DERIVATIVE'
    },
    ZERODHA: {
      FUTURE_OPTIONS: 'FO',
      COMMODITY: 'COM',
      EQUITY: 'EQ'
    },
    IIFL:{
      FUTURES: 'FUT',
      OPTIONS: 'OPT',
      EQUITY: 'EQ'
    },
    SAMCO:[ "EQ","FUTCOM","FUTCUR","FUTIDX","FUTIRC","FUTIRT","FUTSTK","INDEX","OPTCOM","OPTCUR","OPTIDX","OPTIRC","OPTSTK"],
    DHAN:["NSE_EQ","NSE_FNO","BSE_EQ","MCX_COMM"],
    
    FUTURES: 'FUTURES',
    OPTIONS: 'OPTIONS',
    INDEX: 'INDEX',
    EQUITY: 'EQUITY',
    COMMODITY: 'MCX',
    EQUITY_INTRADAY:'EQUITY_INTRADAY',
    TRADE_OPTIONS:{
      'FUTURES': 'FUTURES',
      'OPTIONS': 'OPTIONS',
      'INDEX FUTURES': 'INDEX FUTURES',
      'INDEX OPTIONS': 'INDEX OPTIONS',
      'EQUITY FUTURES': 'EQUITY FUTURES',
      'EQUITY OPTIONS': 'EQUITY OPTIONS',
      'MCX FUTURES': 'MCX FUTURES',
      'MCX OPTIONS': 'MCX OPTIONS',
      'EQUITY_INTRADAY': 'EQUITY'
    }
  },
  TRADE_TYPE: {
    BUY: 'buy',
    SELL: 'sell',
  },
  TRADE_PATTERN: {
    LONG: 'long',
    SHORT: 'short',
  },
  TRADE_TERM: {
    INTRADAY: 'intraday',
    BTST: 'btst/stbt',
    WEEK_POSITION: 'week_position',
    WEEKLY_EXPIRE: 'weekly_expire',
    MONTHLY_EXPIRE: 'monthly_expire',
  },
  PROVIDERS: {
    FYERS: 'fyers',
    ZERODHA: 'zerodha',
    IIFL: 'iifl',
    SAMCO: 'samco',
    DHAN: 'dhan',
    OTHERS: 'others'
  },
  TRADEPAIR_STATS_COLLECTION_MAPPING:{
    fyers:"FyersTradePairStats",
    zerodha:"ZerodhaTradePairStats",
    iifl:"IIFLTradePairStats",
    samco:"SAMCOTradePairStats",
    dhan:"DhanTradePairStats"
  }
};

export default DbConstants;
