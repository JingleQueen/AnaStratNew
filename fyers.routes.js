import express from 'express';
import FyersController from '../controllers/fyers.controller';
import Auth from '../middlewares/auth';

const fyersRouter = express.Router();

fyersRouter.get('/auth', FyersController.handleAuth);
fyersRouter.get('/auth/callback', FyersController.handleAuthCallback);
fyersRouter.put('/sync', Auth.ensureAuthenticated, FyersController.syncTrades);
fyersRouter.get('/dashboard', Auth.ensureAuthenticated, FyersController.getDashboard);
fyersRouter.get('/tradepairs',Auth.ensureAuthenticated,FyersController.tradePairs);
fyersRouter.get('/funds',Auth.ensureAuthenticated,FyersController.getFunds);
fyersRouter.put('/tradepairs/tags',Auth.ensureAuthenticated,FyersController.updateTradePairTags)
fyersRouter.delete('/tradepairs/tags',Auth.ensureAuthenticated,FyersController.deleteTradePairTags)
fyersRouter.put('/tradepairs/tags/bulk',Auth.ensureAuthenticated,FyersController.bulkUpdateTradePairsTag)
fyersRouter.put('/tradepairs/comment',Auth.ensureAuthenticated,FyersController.updateTradePairComment)
fyersRouter.put('/tradepairs/images', Auth.ensureAuthenticated, FyersController.updateTradePairImages)

export default fyersRouter;
