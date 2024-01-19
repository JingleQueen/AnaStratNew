import express from 'express';
import ProxyController from '../controllers/proxy.controller';
import Auth from '../middlewares/auth';

const proxyRouter = express.Router();

proxyRouter.get('/subset_data', Auth.ensureAuthenticated, ProxyController.initialize);
proxyRouter.get('/anastrat_score', Auth.ensureAuthenticated, ProxyController.anastratScore);
proxyRouter.get('/comparisons', Auth.ensureAuthenticated, ProxyController.comparisons);
proxyRouter.get('/statistics', Auth.ensureAuthenticated, ProxyController.statstics);
proxyRouter.get('/traits', Auth.ensureAuthenticated, ProxyController.traits);
proxyRouter.get('/day_analysis', Auth.ensureAuthenticated, ProxyController.dayAnalysis);
proxyRouter.get('/time_analysis', Auth.ensureAuthenticated, ProxyController.timeAnalysis);
proxyRouter.get('/profit_calls', Auth.ensureAuthenticated, ProxyController.profitCalls);
proxyRouter.get('/loss_calls', Auth.ensureAuthenticated, ProxyController.lossCalls);
proxyRouter.get('/long_calls', Auth.ensureAuthenticated, ProxyController.longCalls);
proxyRouter.get('/short_calls', Auth.ensureAuthenticated, ProxyController.shortCalls);
proxyRouter.get('/returns', Auth.ensureAuthenticated, ProxyController.returns);
proxyRouter.get('/insights', Auth.ensureAuthenticated, ProxyController.insights);
proxyRouter.get('/charting_data', Auth.ensureAuthenticated, ProxyController.getChartingData);
proxyRouter.get('/merge_market_data', Auth.ensureAuthenticated, ProxyController.mergeMarketData);
proxyRouter.get('/chart_data_status', Auth.ensureAuthenticated, ProxyController.getChartDataStatus);

export default proxyRouter;
