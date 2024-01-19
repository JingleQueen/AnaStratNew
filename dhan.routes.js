import express from 'express';
import DhanController from '../controllers/dhan.controller';
import Auth from '../middlewares/auth';

const dhanRouter = express.Router();

dhanRouter.get('/auth',DhanController.handleAuth);
dhanRouter.get('/auth/callback',DhanController.handleAuthCallback);
dhanRouter.put('/sync',Auth.ensureAuthenticated,DhanController.syncTrades);
dhanRouter.get('/dashboard', Auth.ensureAuthenticated, DhanController.getDashboard);
dhanRouter.get('/tradepairs',Auth.ensureAuthenticated,DhanController.tradePairs);
dhanRouter.put('/tradepairs/tags',Auth.ensureAuthenticated,DhanController.updateTradePairTags);
dhanRouter.delete('/tradepairs/tags',Auth.ensureAuthenticated,DhanController.deleteTradePairTags);
dhanRouter.put('/tradepairs/tags/bulk',Auth.ensureAuthenticated,DhanController.bulkUpdateTradePairsTag);
dhanRouter.put('/tradepairs/comment',Auth.ensureAuthenticated,DhanController.updateTradePairComment);
dhanRouter.put('/tradepairs/images', Auth.ensureAuthenticated, DhanController.updateTradePairImages)

export default dhanRouter;