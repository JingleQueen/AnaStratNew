import mongoose from 'mongoose';
import {
  IIFLTradeSchema
} from './IIFLTrade';

const IIFLTradePairStatSchema = new mongoose.Schema({
  openingTrade: {
    type: IIFLTradeSchema
  },
  closingTrade: {
    type: IIFLTradeSchema
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
  images:[String],
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
  collection: 'IIFLTradePairStats',
});

IIFLTradePairStatSchema.index({
  userId: 1
});
IIFLTradePairStatSchema.index({
  'openingTrade.tradeDate': 1
});
IIFLTradePairStatSchema.index({
  'closingTrade.tradeDate': 1
});
IIFLTradePairStatSchema.index({
  'openingTrade.tradeDate': 1,
  userId: 1
});
IIFLTradePairStatSchema.index({
  'closingTrade.tradeDate': 1,
  userId: 1
});

const IIFLTradePairStatModel = mongoose.model('IIFLTradePairStat', IIFLTradePairStatSchema);

export default IIFLTradePairStatModel;