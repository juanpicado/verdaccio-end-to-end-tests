const kill  = require('tree-kill');
const {
  runE2E,
  initRegistry, 
  waitOnRegistry, 
  workspacesPackagesList, 
  buildAndInstallApplication,
  publishPackages,
  cleanUpTemp,
  createTempFolder
} = require('./utils');

let registryChildProcess;
let childApp;

(async function() {

  const tmpFolder = createTempFolder('foo-');  
  try {
    
    // 1. initialize the registry
    registryChildProcess = await initRegistry();   
    waitOnRegistry();
    
    // 2. publish packages to registry
    publishPackages(workspacesPackagesList())
    
    // 3. clean build
    childApp = await buildAndInstallApplication(tmpFolder);
    
    // 4. run the E2E
    await runE2E();    
    

    // kill all process
    childApp.kill();
    registryChildProcess.kill();
    // clean up folder
    cleanUpTemp('end', tmpFolder);
  } catch (err) {
    cleanUpTemp('catch', tmpFolder);
    registryChildProcess.kill();
  }

  process.on('SIGINT', () => {
    cleanUpTemp('signint', tmpFolder);
    registryChildProcess.kill();
    kill(childApp.pid);    
  });
  
})();