import ProxyService from '../services/proxy.service';
import dbConstants from '../utils/DbConstants';
import logger from '../utils/logger';

class ProxyController {
  static async initialize(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.initialize({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
  static async anastratScore(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.anastratScore({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: Anastrat Score',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async comparisons(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.comparisons({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: Comparisons',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async statstics(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.statstics({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: statstics',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async traits(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.traits({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: traits',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async dayAnalysis(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.dayAnalysis({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: dayAnalysis',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async timeAnalysis(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.timeAnalysis({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: timeAnalysis',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async profitCalls(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.profitCalls({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: profitCalls',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async lossCalls(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.lossCalls({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: lossCalls',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async longCalls(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.longCalls({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: longCalls',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async shortCalls(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.shortCalls({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: shortCalls',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async returns(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.returns({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: Returns',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async insights(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.insights({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: Insights',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async getChartingData(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { tradePairId } = req.query;
      const user = req.user._id;
      const { data } = await ProxyService.getChartingData({
        user,
        trade_id: tradePairId,
        collection_name,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: getChartingData',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async mergeMarketData(req, res, next) {
    try {
      const collection_name = dbConstants.TRADEPAIR_STATS_COLLECTION_MAPPING[req._params.provider];
      const { time_period, segment, tags = JSON.stringify([]) } = req.query;
      const user = req.user._id;
      ProxyService.mergeMarketData({
        time_period,
        segment,
        user,
        collection_name,
        tags,
      });
      res.json({
        message: 'Market data merged successfully',
      });
    } catch (e) {
      logger.info({
        message: 'BackendApi: mergeMarketData',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }

  static async getChartDataStatus(req, res, next) {
    try {
      const user = req.user._id;
      const { data } = await ProxyService.getChartDataStatus({
        user,
      });
      res.json(data);
    } catch (e) {
      logger.info({
        message: 'BackendApi: getChartDataStatus',
        details: JSON.stringify(e),
      });
      next(e);
    }
  }
}

export default ProxyController;
