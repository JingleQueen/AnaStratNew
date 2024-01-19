import express from 'express';
import userRouter from './user.routes';
import fyersRouter from './fyers.routes';
import zerodhaRouter from './zerodha.routes';
import iiflRouter from './iifl.routes';
import proxyRouter from './proxy.routes';
import othersRouter from './others.routes';
import { handlSubRouteParams } from '../middlewares/handleSubRouteParams';
import authRouter from './auth.routes';
import blogRouter from './blog.routes';
import sectionRouter from './section.routes';
import AWSImageRouter from './AWSImage.routes';
import commentRouter from './comment.routes';
import dhanRouter from './dhan.routes';
import infoRouter from './info.routes';
import userBlogMetaRouter from './userBlogMeta.routes';
import FeedBackRouter from './feedback.routes';
import ReferalRouter from './referal.routes';

const apiRouter = express.Router();

// Authentication for Anastrat Native User
apiRouter.use('/auth', authRouter);

apiRouter.use('/user-blog-meta', userBlogMetaRouter);

// Blogs Routes
apiRouter.use('/blogs', blogRouter);
apiRouter.use('/sections', sectionRouter);
apiRouter.use('/comments', commentRouter);

// Information routes
apiRouter.use('/info', infoRouter);

apiRouter.use('/user', userRouter);
apiRouter.use('/providers/fyers', fyersRouter);
apiRouter.use('/providers/zerodha', zerodhaRouter);
apiRouter.use('/providers/iifl', iiflRouter);
apiRouter.use('/providers/dhan',dhanRouter);

// Other unknown broker routes
apiRouter.use('/providers/:provider', handlSubRouteParams, othersRouter);

// Proxy Routes to backend services
apiRouter.use('/providers/:provider/proxy', handlSubRouteParams, proxyRouter);

// Healthcheck endpoint for AWS
apiRouter.use('/healthcheck', (req, res) => {
  res.json({ healthcheck: true });
});

// AWS S3 bucket routes
apiRouter.use('/aws', AWSImageRouter);

//feedback Routes
apiRouter.use('/feedback', FeedBackRouter)



//referal routes
apiRouter.use('/referal', ReferalRouter);

export default apiRouter;
