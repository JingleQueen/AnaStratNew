import nconf from 'nconf';
import fs from 'fs';

function initialize() {
  const rootDir = process.cwd();
  const env = process.env.NODE_ENV || 'development';
  const envConfigFilePath = `${rootDir}/config/config.${env}.json`;

  if (!fs.existsSync(envConfigFilePath)) {
    // eslint-disable-next-line no-console
    console.error(`config file not found for ${env} environment in config/config.${env}.json`);
    process.exit(-1);
  }

  nconf.file(envConfigFilePath);
}

initialize();

export default nconf;
