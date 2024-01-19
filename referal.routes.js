import express from 'express'
import ReferalController from '../controllers/referal.controller';

const ReferalRouter = express.Router();

ReferalRouter.post('/createReferal', ReferalController.handleCreateReferal);
export default ReferalRouter;