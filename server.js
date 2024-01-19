import d from 'debug';
import http from 'http';
import { createTerminus } from '@godaddy/terminus';
import app from './app';
import config from './utils/config';
import MongoUtils from './utils/MongoUtils';
import './utils/axiosLogging';


// Setting default timezone to IST for moment objects
const moment = require('moment-timezone');
moment.tz.setDefault("Asia/Kolkata");

const debug = d('server:setup');

async function bootstrap() {
  debug('Starting server');

  const server = http.createServer(app);

  try {
    await MongoUtils.connect();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(-1);
  }

  const shutDownDebug = d('server:shutdown');

  /**
   * Terminus setup for gracefull shutdown of application when receiving terminate signal
   */
  createTerminus(server, {
    onSignal: async () => {
      shutDownDebug('server is starting cleanup');
      await MongoUtils.closeConnection();
      server.close();
    },
    onShutdown: () => {
      shutDownDebug('Cleanup finished, server is shutting down');
    },
  });

  server.listen(config.get('server:port'), () => {
    debug(`Server started on port ${config.get('server:port')}`);
  });
}

bootstrap();
