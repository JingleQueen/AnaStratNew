import mongoose from 'mongoose';

export const FyersTradeSchema = new mongoose.Schema(
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
  { timestamps: true, collection: 'FyersTrades' }
);

FyersTradeSchema.index({ userId: 1 });
FyersTradeSchema.index({ userId: 1, orderId: 1 });

const FyersTradeModel = mongoose.model('FyersTrade', FyersTradeSchema);

export default FyersTradeModel;
