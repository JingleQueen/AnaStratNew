import mongoose from 'mongoose';

export const DhanTradeSchema = new mongoose.Schema(
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
  { timestamps: true, collection: 'DhanTrades' }
);

DhanTradeSchema.index({ userId: 1 });
DhanTradeSchema.index({ userId: 1, orderId: 1 });

const DhanTradeModel = mongoose.model('DhanTrade', DhanTradeSchema);

export default DhanTradeModel;