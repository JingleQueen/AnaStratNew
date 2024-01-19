import express from 'express';
import OthersController from '../controllers/others.controller';
import Auth from '../middlewares/auth'
import multer from 'multer';

const othersRouter = express.Router();

othersRouter.put(
    '/sync',
    multer({
      dest: '/tmp/uploads',
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }).single('file'),
    Auth.ensureAuthenticated,
    OthersController.syncTrades
  );
othersRouter.get('/dashboard', Auth.ensureAuthenticated, OthersController.getDashboard);
othersRouter.get('/tradepairs',Auth.ensureAuthenticated,OthersController.tradePairs); 
othersRouter.put('/tradepairs/tags',Auth.ensureAuthenticated,OthersController.updateTradePairTags);
othersRouter.delete('/tradepairs/tags',Auth.ensureAuthenticated,OthersController.deleteTradePairTags);
othersRouter.put('/tradepairs/tags/bulk',Auth.ensureAuthenticated,OthersController.bulkUpdateTradePairsTag);
othersRouter.put('/tradepairs/comment',Auth.ensureAuthenticated,OthersController.updateTradePairComment);

export default othersRouter;