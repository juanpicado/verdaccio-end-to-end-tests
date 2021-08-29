const startVerdaccioServer = require('verdaccio').default;
const debug = require('debug')('e2e:registry');
const detectFreePort = require('detect-port');
const os = require('os');
const yaml = require('js-yaml');
const fse = require('fs-extra');
const path = require('path');

/**
 * Initialize a registry in a temporary folder.
 * @param {*} port 
 * @returns 
 */
const initiRegistry = (port) => {
  return new Promise((resolve) => {
    const tmpFolder = fse.mkdtempSync(path.join(os.tmpdir(), 'e2e-registry-')); 
    debug('temp registry folder %s', tmpFolder) 
    const originCopyFile =  path.normalize(path.join(__dirname, '../', 'verdaccio', 'verdaccio.yaml'));
    const verdaccioConfigFile = path.join(tmpFolder, 'verdaccio.yaml');
    fse.copySync(originCopyFile, verdaccioConfigFile)
    const storagePath = path.join(path.dirname(verdaccioConfigFile), 'storage');
    fse.mkdirSync(storagePath);
    debug('verdaccioConfigFile: %s', verdaccioConfigFile);
    debug('verdaccioStoragePath: %s', storagePath);
    const configAsObject = yaml.load(fse.readFileSync(verdaccioConfigFile, 'utf8'));
    const config = {
      ...configAsObject,
      storage: storagePath,
      self_path: tmpFolder,
    }

    const onReady = (webServer) => {
      debug('verdaccio port %s', port);
      webServer.listen(port, () => {
        resolved = true;
        resolve(webServer);
      });
    }
    debug('startVerdaccioServer');
    startVerdaccioServer(config, 6000, storagePath, '1.0.0', 'verdaccio', onReady);
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