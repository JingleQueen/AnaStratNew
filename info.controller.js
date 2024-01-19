import InfoService from '../services/info.service';

class InfoController {
  // Pre trade analytics related controllers

  static async getPreTradeAnalytics(req, res, next) {
    try {
      const analytics = await InfoService.getPreTradeAnalytics();
      res.json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  }
  static async updatePreTradeAnalytics(req, res, next) {
    try {
      const { analytics } = req.body;
      const data = await InfoService.updatePreTradeAnalytics(analytics);
      res.json({ success: true, data: data });
    } catch (err) {
      next(err);
    }
  }
  static async deletePreTradeAnalytics(req, res, next) {
    try {
      const { id } = req.query;
      const data = await InfoService.deletePreTradeAnalytics(id);
      res.json({ success: true, data: data });
    } catch (err) {
      next(err);
    }
  }

  // Global bytes related controllers

  static async getGlobalBytes(req, res, next) {
    try {
      const analytics = await InfoService.getGlobalBytes();
      res.json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  }
  static async updateGlobalBytes(req, res, next) {
    try {
      const { analytics } = req.body;
      const data = await InfoService.updateGlobalBytes(analytics);
      res.json({ success: true, data: data });
    } catch (err) {
      next(err);
    }
  }
  static async deleteGlobalBytes(req, res, next) {
    try {
      const { id } = req.query;
      const data = await InfoService.deleteGlobalBytes(id);
      res.json({ success: true, data: data });
    } catch (err) {
      next(err);
    }
  }
}

export default InfoController;
