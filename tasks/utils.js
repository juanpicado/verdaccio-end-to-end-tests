const {execSync, spawn} = require('child_process');
const debug = require('debug')('e2e');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fse = require('fs-extra');

const initRegistry = () => {
  const registryPath = require.resolve('./registry.js');
  const childProcess = spawn(process.execPath, [registryPath], {
    env: {
      'DEBUG': 'e2e*'
    },
    stdio: 'ignore'
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
    const child = spawn(process.execPath, execArgs, {cwd: tmpdir, 
      //stdio: 'inherit'
    });
    child.on('spawn', () => {
      resolve(child);
    })
    // child.on('data', (data) => {
    //   process.stdout.write(chalk.green(data.toString()));
    // })

    // child.on('error', (error) => {
    //   console.log('NEXT ERROR', error);
    // })

    // child.on('close', (code) => {
    //   console.log(`NEXT child process exited with code ${code}`);
    // });
 
  })
}

function executeNpm(tmpdir, execArgs) {
  return new Promise((resolve) => {
   debug('execute npm script');
    const child = spawn('npm', execArgs, {cwd: tmpdir, stdio: 'inherit'});
    child.on('spawn', () => {
      debug('npm has been spawn');
    })
    // child.on('data', (data) => {
    //   process.stdout.write(chalk.green(data.toString()));
    // })

    child.on('close', () => {
      debug(`npm script ${execArgs.join(' ')} done on ${tmpdir}`);
      resolve();
    })
  })
}

function executeYarn(tmpdir, execArgs) {
  return new Promise((resolve, rejects) => {
   debug('execute yarn script on %s', tmpdir);
    const child = spawn('yarn', execArgs, {cwd: tmpdir, stdio: 'inherit'});
    child.on('spawn', () => {
      debug('yarn has been spawn');
    })

    // child.on('data', (data) => {
    //   debug('yarn data %s', data?.toString())
    //   process.stdout.write(chalk.green(data.toString()));
    // })

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
  const childServer = await getNpmChild(tmpdir, ['node_modules/.bin/next', 'start'])
  return childServer;
}

async function runE2E() {  
  debug('run e2e cypress');
  await executeYarn(process.cwd(),['e2e:run']);
}

const cleanUpTemp = (origin, tmpFolder) => {
  debug('cleaning tmp folder: %s', origin);
  fse.rmdirSync(tmpFolder, {recursive: true});
}

const createTempFolder = (prefix) => {
  return fse.mkdtempSync(path.join(os.tmpdir(), prefix));
}

module.exports = {
  runE2E,
  initRegistry, 
  waitOnRegistry, 
  workspacesPackagesList, 
  buildAndInstallApplication,
  publishPackages,
  cleanUpTemp,
  createTempFolder
}