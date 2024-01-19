import axios from 'axios';
import logger from './logger';

// Number of nanoseconds per second
const NS_PER_SEC = 1e9;

// Number of nanoseconds per millisecond
const NS_PER_MS = 1e6;

axios.interceptors.request.use((request) => {
  const { url, data, method, headers, params } = request;

  request.meta = request.meta ?? {};

  request.meta.startTime = process.hrtime();

  logger.debug({
    request: {
      url,
      data,
      params,
      method,
      headers,
    },
    message: 'API call request...',
  });

  return request;
});

axios.interceptors.response.use((response) => {
  const { config, status, headers, statusText } = response;

  const startTime = config.meta?.startTime;

  const [seconds, nanoseconds] = process.hrtime(startTime);
  const durationMs = Math.round((seconds * NS_PER_SEC + nanoseconds) / NS_PER_MS);

  const requestPayload = {
    url: config.url,
    method: config.method,
    headers: config.headers,
  };

  const messagePayload = {
    request: requestPayload,
    response: {
      statusCode: status,
      statusText: statusText,
    },
    requestTimeMs: durationMs,
    message: 'API call response...',
  };

  const responseSizeInKb = headers['content-length'] / 1024;

  if (responseSizeInKb < 4) {
    messagePayload.response.body = response.data;
  }

  logger.debug(messagePayload);

  return { ...response, timings: { response: durationMs } };
});
