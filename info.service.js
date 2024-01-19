import PreTradeAnalyticsModel from '../models/PreTradeAnalytics';
import GlobalBytesModel from '../models/GlobalBytes';

class InfoService {
  static async getPreTradeAnalytics() {
    return await PreTradeAnalyticsModel.find({}).sort({
      createdAt: 1,
    });
  }

  static async updatePreTradeAnalytics(analytics) {
    await PreTradeAnalyticsModel.insertMany({ dailyAnalysis: analytics });
    return this.getPreTradeAnalytics();
  }

  static async deletePreTradeAnalytics(id) {
    await PreTradeAnalyticsModel.findByIdAndDelete(id);
    return this.getPreTradeAnalytics();
  }

  static async getGlobalBytes() {
    return await GlobalBytesModel.find({}).sort({
      createdAt: 1,
    });
  }

  static async updateGlobalBytes(analytics) {
    await GlobalBytesModel.insertMany({ globalBytes: analytics });
    return this.getGlobalBytes();
  }

  static async deleteGlobalBytes(id) {
    await GlobalBytesModel.findByIdAndDelete(id);
    return this.getGlobalBytes();
  }
}

export default InfoService;
