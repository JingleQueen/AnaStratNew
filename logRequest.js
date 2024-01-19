import logger from '../utils/logger';

export default function logRequest(req, res, next) {
  const startedAt = Date.now();

  const logResponse = () => {
    const endedAt = Date.now();

    // res['responseTime'] = `${endedAt - startedAt} ms`;

    const responseTime = endedAt - startedAt;

    logger.info({
      message: `${req.method} ${req.originalUrl} ${responseTime} ms`,
      responseTime,
      originalUrl: req.originalUrl,
      baseUrl: req.baseUrl,
    });

    // console.dir(req, { depth: null });

    res.removeListener('finish', logResponse);
    res.removeListener('close', logResponse);
  };

  res.on('finish', logResponse);
  res.on('close', logResponse);

  next();
}
