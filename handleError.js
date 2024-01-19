import httpErrors from 'http-errors';
import logger from '../utils/logger';

export const notFoundErrorHandler = (req, res, next) => {
  next(new httpErrors.NotFound('Resource not found'));
};

// eslint-disable-next-line no-unused-vars
export const exceptionHandler = (err, req, res, next) => {
  if (err instanceof httpErrors.HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
    });
  }
  if(err && err.response && err.response.data && err.response.data.message){
    logger.error(`Handled Error Detail ${JSON.stringify(err.response.data)} with status ${err.response?.status}`)
    return res.status(err.response.status).json({
      ...err.response.data
    })
  }
  
  logger.error({ message: 'Internal Server Error', stack: err.stack});
  logger.error(`Error Detail ${JSON.stringify(err.response?.data)} with status ${err.response?.status}`)

  return res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    statusCode: 500,
  });
};
