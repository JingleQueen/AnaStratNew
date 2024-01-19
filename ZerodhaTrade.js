import mongoose from 'mongoose';

export const ZerodhaTradeSchema = new mongoose.Schema(
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
  { timestamps: true, collection: 'ZerodhaTrades' }
);

ZerodhaTradeSchema.index({ userId: 1 });
ZerodhaTradeSchema.index({ userId: 1, orderId: 1 });

const ZerodhaTradeModel = mongoose.model('ZerodhaTrade', ZerodhaTradeSchema);

export default ZerodhaTradeModel;
