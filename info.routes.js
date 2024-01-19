import express from 'express'
import InfoController from '../controllers/info.controller';
import Auth from '../middlewares/auth';

const infoRouter = new express.Router();

//routes for pre trade analytics related CRUD operations
infoRouter.get('/pre-trade-analytics',InfoController.getPreTradeAnalytics);
infoRouter.post('/pre-trade-analytics',/*Auth.ensureAuthenticated,Auth.ensureAdmin,*/InfoController.updatePreTradeAnalytics);
infoRouter.delete('/pre-trade-analytics',/*Auth.ensureAuthenticated,Auth.ensureAdmin,*/InfoController.deletePreTradeAnalytics);

//routes for global bytes related CRUD operations
infoRouter.get('/global-bytes',InfoController.getGlobalBytes);
infoRouter.post('/global-bytes',/*Auth.ensureAuthenticated,Auth.ensureAdmin,*/InfoController.updateGlobalBytes);
infoRouter.delete('/global-bytes',/*Auth.ensureAuthenticated,Auth.ensureAdmin,*/InfoController.deleteGlobalBytes);



export default infoRouter;