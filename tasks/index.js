const {execSync, spawn, exec} = require('child_process');
const chalk = require('chalk');
const path = require('path');
const os = require('os');
const fse = require('fs-extra');

const initRegistry = () => {
  const registryPath = require.resolve('./registry.js');
  const childProcess = spawn(process.execPath, [registryPath], {
    // env: {
    //   'DEBUG': 'verdaccio*'
    // }
  });
  return childProcess;
}

const waitOnRegistry = () => {
  console.log(chalk.blue('waiting on registry ...'));
  execSync('yarn wait-on http://localhost:5000');
  console.log(chalk.blue('registry detected on por 5000'));
}

function workspacesPackagesList() {
  const listPackages = execSync('yarn workspaces list --json').toString().split('\n');
  return listPackages.filter((value) => Boolean(value)).map((value) =>  JSON.parse(value))
  .filter((value) => value.location.match('components'))
}


function publishPackages(pkgs) {
  pkgs.forEach((pkg)=> {
      const cwdPkg = path.join(process.cwd(), pkg.location)
      console.log('-->', cwdPkg)
      const output = execSync(`yarn npm publish --tolerate-republish`, {cwd: cwdPkg} )
      console.log('-->', output.toString());
  })
}

function getNpmChild(tmpdir, execArgs) {
  return new Promise((resolve) => {
    console.log(chalk.red('execute npm script'));
    const child = spawn('npm', execArgs, {cwd: tmpdir});
    child.on('spawn', () => {
      resolve(child);
    })
    child.on('data', (data) => {
      process.stdout.write(chalk.green(data.toString()));
    })
 
  })
}

function executeNpm(tmpdir, execArgs) {
  return new Promise((resolve) => {
    console.log(chalk.red('execute npm script'));
    const child = spawn('npm', execArgs, {cwd: tmpdir});
    child.on('spawn', () => {
      console.log(chalk.whiteBright('npm has been spawn'));
    })
    child.on('data', (data) => {
      process.stdout.write(chalk.green(data.toString()));
    })

    child.on('close', () => {
      console.log(chalk.red(`npm script ${execArgs.join(' ')} done on ${tmpdir}`));
      resolve();
    })
  })
}

async function buildAndInstallApplication(tmpdir) {
  
  fse.copySync(path.join(process.cwd(), 'test-app'), tmpdir);
  console.log(chalk.cyan('app copied'));
  await executeNpm(tmpdir, ['install', '--registry', 'http://localhost:5000']);
  await executeNpm(tmpdir, ['run', 'build'])
  const childServer = await getNpmChild(tmpdir, ['start'])
  return childServer;
}

/**
 * Group 1 (run-server.js)
 * 1. Ejecutar el registry (process correr en paralelo).
 * 2. Wait on puerto registry 
 * 
 * Group 2 (run-e2e.js)
 * 3. Instalar unos paquetes en un registry. 
 * 4. Install de los paquetes de la aplicacion.
 * 
 * 5.0 Copiar build en temporal folder.
 * 5.1. Hacer build de la aplication.
 * 6. Levantar un server con la aplicacion
 * 7. Ejecutar E2E a aplicacion. *Cypress*)
 * 
 * 9. Apagar el registry (1)
 * 10. Apagar el server. (6)
 * 
 */
 
(async function() {
  let child;
  // const {fd, path, cleanup} = await tmpPromise.file();
  const tmpFolder = fse.mkdtempSync(path.join(os.tmpdir(), 'foo-'));  
  const cleanUpTemp = (origin) => {
    console.log(chalk.yellowBright('cleaning tmp folder:'), origin);
    // fse.rmdirSync(tmpFolder, {recursive: true});
  }
  try {    
    console.log('temporal folder', chalk.magenta(tmpFolder));
    child = await initRegistry();
    child.stdout.on('data', (data) => {
      process.stdout.write(chalk.blue(data))
    });

    child.stderr.on('data', (data) => {
      process.stdout.write(chalk.yellow(data))
    });
    waitOnRegistry();
    publishPackages(workspacesPackagesList())
    const childApp = await buildAndInstallApplication(tmpFolder);
    console.log(chalk.greenBright('running e2e cypress'));
    process.on('SIGINT', () => {
      console.log(chalk.red('killing registry'));
      child.kill();
      console.log(chalk.red('killing app'));
      childApp.kill();
      console.log(chalk.red('all apps killed'));
    });
 
    // cleanUpTemp('end');
  } catch (err) {
    cleanUpTemp('catch');
    console.error('exec failed', err);
  }

  process.on('SIGINT', () => {
    cleanUpTemp('signint');
    console.log(chalk.red('killing registry'));
    child.kill();
  });
})();