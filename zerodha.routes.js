import express from 'express';
import multer from 'multer';
import ZerodhaController from '../controllers/zerodha.controller';
import Auth from '../middlewares/auth';

const zerodhaRouter = express.Router();

zerodhaRouter.get('/auth', ZerodhaController.handleAuth);
zerodhaRouter.get('/auth/callback', ZerodhaController.handleAuthCallback);
zerodhaRouter.put(
  '/sync',
  multer({
    dest: '/tmp/uploads',
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  }).single('file'),
  Auth.ensureAuthenticated,
  ZerodhaController.syncTrades
);
zerodhaRouter.get('/dashboard', Auth.ensureAuthenticated, ZerodhaController.getDashboard);
zerodhaRouter.get('/tradepairs',Auth.ensureAuthenticated,ZerodhaController.tradePairs);
zerodhaRouter.put('/tradepairs/tags',Auth.ensureAuthenticated,ZerodhaController.updateTradePairTags)
zerodhaRouter.delete('/tradepairs/tags',Auth.ensureAuthenticated,ZerodhaController.deleteTradePairTags)
zerodhaRouter.put('/tradepairs/tags/bulk',Auth.ensureAuthenticated,ZerodhaController.bulkUpdateTradePairsTag)
zerodhaRouter.put('/tradepairs/comment',Auth.ensureAuthenticated,ZerodhaController.updateTradePairComment)
zerodhaRouter.put('/tradepairs/images', Auth.ensureAuthenticated, ZerodhaController.updateTradePairImages)

export default zerodhaRouter;
