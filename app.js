import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from './utils/logger';
import { exceptionHandler, notFoundErrorHandler } from './middlewares/handleError';
import apiRoutes from './routes';
import logRequest from './middlewares/logRequest';

const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 


app.get('/', (req, res) => {
  logger.info({ message: 'Welcome to Anastrat!' });
  res.send('Welcome to Anastrat!');
});

app.use('/api', logRequest, apiRoutes);

app.use(notFoundErrorHandler);
app.use(exceptionHandler);

export default app;
