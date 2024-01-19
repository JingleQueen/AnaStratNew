import mongoose from 'mongoose';
import d from 'debug';
import config from './config';

const debug = d('server:database');

export default class MongoUtils {
  static getMongoUri() {
    const host = config.get('database:host');
    const port = config.get('database:port');
    const username = config.get('database:username');
    const password = config.get('database:password');
    const schema = config.get('database:schema');
    const uri = `mongodb://${username}:${password}@${host}:${port}/${schema}`;

    return uri;
  }

  static async connect() {
    debug('Connecting to MongoDB database');
    const mongoUri = MongoUtils.getMongoUri();
    const sslEnabled = config.get('database:sslEnabled');
    const sslPath = config.get('database:sslPath');
    const options = {
      useNewUrlParser: true,
      authSource: 'admin',
      keepAlive: true,
      keepAliveInitialDelay: 5 * 60 * 100,
      connectTimeoutMS: 30 * 1000,
      retryWrites: false,
    };

    if (sslEnabled) {
      options['sslCA'] = sslPath;
      options['ssl'] = true;
    }

    await mongoose.connect(mongoUri, options);
    debug('Connected to MongoDB database');
  }

  static async closeConnection() {
    debug('Closing MongoDB connection');
    await mongoose.connection.close();
    debug('Closed MongoDB connection');
  }

  static async getConnectionStatus() {
    return mongoose.connection.readyState;
  }
}
