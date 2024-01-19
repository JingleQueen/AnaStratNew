import mongoose from 'mongoose';

export const IIFLTradeSchema = new mongoose.Schema(
  {
    tradeDate: { type: Date, required: true },
    segment: { type: String },
    symbol: { type: String },
    tradeType: { type: String },
    quantity: { type: Number },
    tradePrice: { type: Number },
    orderId: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, collection: 'IIFLTrades' }
);

IIFLTradeSchema.index({ userId: 1 });
IIFLTradeSchema.index({ userId: 1, orderId: 1 });

const IIFLTradeModel = mongoose.model('IIFLTrade', IIFLTradeSchema);

export default IIFLTradeModel;
