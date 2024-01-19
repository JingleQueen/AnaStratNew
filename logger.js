import winston from 'winston';
import safeStringify from 'json-stringify-safe';
import colors from 'colors';
import config from './config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const color = {
  error: 'red',
  warn: 'magenta',
  info: 'cyan',
  http: 'white',
  debug: 'grey',
};

winston.addColors(color);

const format = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.printf((info) => {
    const { level, timestamp, message, stack } = info;

    const infoStr = safeStringify(info);

    if (stack) {
      return `[${colors.white(timestamp)}] ${colors.white(level.toUpperCase())} ${colors.white(
        message
      )} \n${stack}`;
    }

    if (message) {
      return `[${colors.white(timestamp)}] ${colors.white(level.toUpperCase())} ${colors.white(
        message
      )} ${infoStr}`;
    }

    return `[${colors.white(timestamp)}] ${colors.white(level.toUpperCase())} ${infoStr}`;
  }),
  winston.format.colorize({ all: true })
);

const fileFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

const transports = [new winston.transports.Console({ format })];

const fileLogLevel = config.get('logger:transports:file:level') || 'info';
const rootDir = process.cwd();

if (levels[fileLogLevel] > 0) {
  transports.push(
    new winston.transports.File({
      filename: `${rootDir}/logs/anastrat_api.errors.log`,
      level: 'error',
      format: fileFormat,
    })
  );

  transports.push(
    new winston.transports.File({
      filename: `${rootDir}/logs/anastrat_api.log`,
      level: fileLogLevel,
      format: fileFormat,
    })
  );
} else {
  transports.push(
    new winston.transports.File({
      filename: `${rootDir}/logs/anastrat_api.errors.log`,
      level: 'error',
      format: fileFormat,
    })
  );
}

const logger = winston.createLogger({
  level: config.get('logger:level'),
  levels,
  transports,
  defaultMeta: { service: 'anastrat-api' },
});

export default logger;
