const startVerdaccioServer = require('verdaccio').default;
const debug = require('debug')('e2e:registry');
const detectFreePort = require('detect-port');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const initiRegistry = (port) => {
  return new Promise((resolve) => {
    const cache = path.join(__dirname, '..', 'verdaccio', 'verdaccio');
    console.log('cache:', cache);
    const verdaccioConfigFile = path.normalize(path.join(__dirname, '../', 'verdaccio', 'verdaccio.yaml'));
    console.log('verdaccioConfigFile:', verdaccioConfigFile);
    const configAsObject = yaml.load(fs.readFileSync(verdaccioConfigFile, 'utf8'));
    const config = {
      ...configAsObject,
      self_path: cache,
    }

    const onReady = (webServer) => {
      console.log('verdaccio port', port);
      webServer.listen(port, () => {
        resolved = true;
        resolve(webServer);
      });
    }
    debug('startVerdaccioServer');
    startVerdaccioServer(config, 6000, cache, '1.0.0', 'verdaccio', onReady);
  });
};


(async function() {
  try {
    const port = await detectFreePort(5000);
    await initiRegistry(port);
  } catch (err) {
    debug('registry failed');
    console.error('exec failed registry', err);
  }
})();