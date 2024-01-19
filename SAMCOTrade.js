import mongoose from 'mongoose';

export const SAMCOTradeSchema = new mongoose.Schema(
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
  { timestamps: true, collection: 'SAMCOTrades' }
);

SAMCOTradeSchema.index({ userId: 1 });
SAMCOTradeSchema.index({ userId: 1, orderId: 1 });

const SAMCOTradeModel = mongoose.model('SAMCOTrade', SAMCOTradeSchema);

export default SAMCOTradeModel;