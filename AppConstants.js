const AppConstants = {
  DURATION: {
    TODAY: 'today',
    YESTERDAY: 'yesterday',
    THIS_WEEK: 'this week',
    LAST_WEEK: 'last week',
    THIS_MONTH: 'this month',
    LAST_MONTH: 'last month',
    THIS_QUARTER: 'this quarter',
    LAST_QUARTER: 'last quarter'
  },
  BIN: {
    "9am-11am": {
      minHour: 9,
      maxHour: 11
    },
    "11am-1pm": {
      minHour: 11,
      maxHour: 13
    },
    "1pm-3pm": {
      minHour: 13,
      maxHour: 15
    },
    "3pm-5pm": {
      minHour: 15,
      maxHour: 17
    },
    "5pm-7pm": {
      minHour: 17,
      maxHour: 19
    },
    "7pm-9pm": {
      minHour: 19,
      maxHour: 21
    },
    "9pm-11pm": {
      minHour: 21,
      maxHour: 23
    }
  },
  ZERODHA_CSV_HEADERS: [
    'symbol',
    'isin',
    'trade_date',
    'exchange',
    'segment',
    'series',
    'trade_type',
    'quantity',
    'price',
    'trade_id',
    'order_id',
    'order_execution_time',
  ],
  SAMCO_CSV_HEADERS: [
    "Sr. No.",
    "Trade Date",
    "Trade  Time",
    "Exchange",
    "Contract",
    "Series",
    "Buy/Sell",
    "Quantity",
    "Rate",
    "Order Number",
    "Trade Number",
  ],
  PROFIT: 'profit',
  LOSS: 'loss',
  EXPIRY: 'expiry',
  POSITION: 'position',
  STRATEGIES: [
    "strategy-1",
    "strategy-2"
  ]
};

export default AppConstants;
