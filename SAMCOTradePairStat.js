import mongoose from 'mongoose';
import {
  SAMCOTradeSchema
} from './SAMCOTrade';

const SAMCOTradePairStatSchema = new mongoose.Schema({
  openingTrade: {
    type: SAMCOTradeSchema
  },
  closingTrade: {
    type: SAMCOTradeSchema
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tradeScore: {
    type: Number
  },
  returnFactorScore: {
    type: Number
  },
  timeFactorScore: {
    type: Number
  },
  tradeReturn: {
    type: Number
  },
  tradePattern: {
    type: String
  },
  tradeSegment: {
    type: String
  },
  tradeTerm: {
    type: String
  },
  buyAmount: {
    type: Number
  },
  sellAmount: {
    type: Number
  },
  tags: [ String ],
  tradePair_segment:{type: String},
  comment:{ type: String },
  closingDate: {
    bin: {
      type: String,
      enum: ["9am-11am", "11am-1pm", "1pm-3pm", "3pm-5pm", "5pm-7pm", "7pm-9pm", "9pm-11pm"]
    },
    month: {
      type: Number
    },
    week: {
      type: Number
    },
    quarter: {
      type: Number,
    },
    trading_hour: {
      type: Number,
    },
    trading_day: {
      type: Number
    },
    date:{
      type: String
    },
    day:{
      type:Number
    },
    year:{
      type:Number
    }
  }
}, {
  timestamps: true,
  collection: 'SAMCOTradePairStats',
});

SAMCOTradePairStatSchema.index({
  userId: 1
});
SAMCOTradePairStatSchema.index({
  'openingTrade.tradeDate': 1
});
SAMCOTradePairStatSchema.index({
  'closingTrade.tradeDate': 1
});
SAMCOTradePairStatSchema.index({
  'openingTrade.tradeDate': 1,
  userId: 1
});
SAMCOTradePairStatSchema.index({
  'closingTrade.tradeDate': 1,
  userId: 1
});

const SAMCOTradePairStatModel = mongoose.model('SAMCOTradePairStat', SAMCOTradePairStatSchema);

export default SAMCOTradePairStatModel;