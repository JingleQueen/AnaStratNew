import mongoose from 'mongoose';

export const PreTradeAnalyticsSchema = new mongoose.Schema(
    {
        dailyAnalysis : {type: String, required: true}
    },
    {
        timestamps:true,
        collection:'PreTradeAnalytics'
    }
);

const PreTradeAnalyticsModel = mongoose.model('PreTradeAnalytics',PreTradeAnalyticsSchema);

export default PreTradeAnalyticsModel;