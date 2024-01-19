import express from 'express';
import IIFLController from '../controllers/iifl.controller';
import Auth from '../middlewares/auth';

const iiflRouter = express.Router();

iiflRouter.get('/auth', IIFLController.handleAuth);
iiflRouter.post('/auth/callback', IIFLController.handleAuthCallback);
iiflRouter.put('/sync', Auth.ensureAuthenticated, IIFLController.syncTrades);
iiflRouter.get('/dashboard', Auth.ensureAuthenticated, IIFLController.getDashboard);
iiflRouter.get('/tradepairs',Auth.ensureAuthenticated,IIFLController.tradePairs);
iiflRouter.put('/tradepairs/tags',Auth.ensureAuthenticated,IIFLController.updateTradePairTags)
iiflRouter.delete('/tradepairs/tags',Auth.ensureAuthenticated,IIFLController.deleteTradePairTags)
iiflRouter.put('/tradepairs/tags/bulk',Auth.ensureAuthenticated,IIFLController.bulkUpdateTradePairsTag)
iiflRouter.put('/tradepairs/comment',Auth.ensureAuthenticated,IIFLController.updateTradePairComment)
iiflRouter.put('/tradepairs/images', Auth.ensureAuthenticated, IIFLController.updateTradePairImages)

export default iiflRouter;
