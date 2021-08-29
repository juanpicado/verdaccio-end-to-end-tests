const {execSync, spawn} = require('child_process');
const kill  = require('tree-kill');
const debug = require('debug')('e2e');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fse = require('fs-extra');
const detectFreePort = require('detect-port');
const { rejects } = require('assert');

const initRegistry = () => {
  const registryPath = require.resolve('./registry.js');
  const childProcess = spawn(process.execPath, [registryPath], {
    env: {
      // 'DEBUG': 'verdaccio*'
    }
  });
  return childProcess;
}

const waitOnRegistry = () => {
  debug('waiting on registry ...');
  execSync('yarn wait-on http://localhost:5000');
  debug('registry detected on por 5000');
}

function workspacesPackagesList() {
  const listPackages = execSync('yarn workspaces list --json').toString().split('\n');
  return listPackages.filter((value) => Boolean(value)).map((value) =>  JSON.parse(value))
  .filter((value) => value.location.match('components'))
}


function publishPackages(pkgs) {
  pkgs.forEach((pkg)=> {
      debug('publishing ... %s', pkg.location);
      const cwdPkg = path.join(process.cwd(), pkg.location)
      debug('publish on cwd %s', cwdPkg);
      const output = execSync(`yarn npm publish --tolerate-republish`, {cwd: cwdPkg} )
      debug('publish package stdout %s', output);
  })
}

function getNpmChild(tmpdir, execArgs) {
  return new Promise((resolve) => {
    debug('execute npm script');
    const child = spawn(process.execPath, execArgs, {cwd: tmpdir, stdio: 'inherit'});
    child.on('spawn', () => {
      resolve(child);
    })
    child.on('data', (data) => {
      process.stdout.write(chalk.green(data.toString()));
    })

    child.on('error', (error) => {
      console.log('NEXT ERROR', error);
    })

    child.on('close', (code) => {
      console.log(`NEXT child process exited with code ${code}`);
    });
 
  })
}

function executeNpm(tmpdir, execArgs) {
  return new Promise((resolve) => {
   debug('execute npm script');
    const child = spawn('npm', execArgs, {cwd: tmpdir, stdio: 'inherit'});
    child.on('spawn', () => {
      debug('npm has been spawn');
    })
    child.on('data', (data) => {
      process.stdout.write(chalk.green(data.toString()));
    })

    child.on('close', () => {
      debug(`npm script ${execArgs.join(' ')} done on ${tmpdir}`);
      resolve();
    })
  })
}

function executeYarn(tmpdir, execArgs) {
  return new Promise((resolve) => {
   debug('execute yarn script on %s', tmpdir);
    const child = spawn('yarn', execArgs, {cwd: tmpdir, stdio: 'inherit'});
    child.on('spawn', () => {
      debug('yarn has been spawn');
    })
    child.on('data', (data) => {
      debug('yarn data %s', data?.toString())
      process.stdout.write(chalk.green(data.toString()));
    })

    child.on('error', (error) => {
      debug('yarn error script')
      process.stdout.write(chalk.green(data.toString()));
      rejects(error);
    })

    child.on('close', () => {
      debug(`yarn script ${execArgs.join(' ')} done on ${tmpdir}`);
      resolve();
    })
  })
}

async function buildAndInstallApplication(tmpdir) {  
  fse.copySync(path.join(process.cwd(), 'test-app'), tmpdir);
  debug('app copied');
  await executeNpm(tmpdir, ['install', '--registry', 'http://localhost:5000']);
  await executeNpm(tmpdir, ['run', 'build'])
  // const port = await detectFreePort(3000);
  const childServer = await getNpmChild(tmpdir, ['node_modules/.bin/next', 'start'])
  return childServer;
}

async function runE2E() {  
  debug('run e2e cypress');
  await executeYarn(process.cwd(),['e2e:run']);
}

(async function() {
  let registryChildProcess;
  // const {fd, path, cleanup} = await tmpPromise.file();
  const tmpFolder = fse.mkdtempSync(path.join(os.tmpdir(), 'foo-'));  
  const cleanUpTemp = (origin) => {
    debug('cleaning tmp folder: %s', origin);
    // fse.rmdirSync(tmpFolder, {recursive: true});
  }
  try {    
    debug('temporal folder %s', tmpFolder);
    registryChildProcess = await initRegistry();
    registryChildProcess.stdout.on('data', (data) => {
      process.stdout.write(chalk.blue(data))
    });

    registryChildProcess.stderr.on('data', (data) => {
      process.stdout.write(chalk.yellow(data))
    });
    waitOnRegistry();
    publishPackages(workspacesPackagesList())
    const childApp = await buildAndInstallApplication(tmpFolder);
    await runE2E();    
    childApp.kill();
    registryChildProcess.kill();
    cleanUpTemp('end');
    process.on('SIGINT', () => {
      debug('killing registry');
      registryChildProcess.kill();
      debug('killing app');
      // childApp.stdin.pause();
      kill(childApp.pid);
      debug('all apps killed');
    });
  } catch (err) {
    console.error('error on execute', err);
    cleanUpTemp('catch');
    debug('exec failed %s', err);
    registryChildProcess.kill();
  }

  process.on('SIGINT', () => {
    cleanUpTemp('signint');
    debug('killing registry');
    registryChildProcess.kill();
  });
})();