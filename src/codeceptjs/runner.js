const util  = require('util'),
    spawn = require('child_process').spawn,
    exec = require('child_process').exec;
const fsPath = require('path');
const shortid = require('shortid');

/**
 * Run codeceptjs out-of-process and read events from stdout
 */
const opts = JSON.stringify({
  helpers: {
    ScreenshotSaverHelper: {
      require: fsPath.join(__dirname, './screenshot-saver-helper.js').replace(/\\/g, '\\\\')
    }
  }
});
const CODECEPT_CMD = 'sh';
const CODECEPT_OPTS = [
  './node_modules/.bin/codeceptjs',
  'run', '--reporter',
  fsPath.join(__dirname, './cli-event-reporter.js'),
  '-o',
  opts
];

/**
 * Keep track of websockets
 */
const sockets = {};
let isRunning = false;
let testrun;

/**
 * Pass on reporter output to subscribed websockets
 */
function fireEvent(type, payload = {}) {
  console.log('EVT', type, payload);
  Object.keys(sockets).forEach(k => sockets[k].emit(type, payload));
}


module.exports = {
  subscribe: (socket) => {
    sockets[socket.id] = socket;
  },

  unsubscribe: (socket) => {
    delete sockets[socket.id];
  },

  run: (options) => {
    if (isRunning) return;

    isRunning = true;
    // TODO return a promise from this function
    fireEvent('codecept.start_run', Object.assign(options, { id: shortid.generate() }));

    const opts = CODECEPT_OPTS.slice();

    if (options.grep) {
      opts.push('--grep');
      opts.push(options.grep);
    }

    try {
      testrun = spawn(CODECEPT_CMD, opts, { detached: true });
    } catch (err) {
      isRunning = false;
      console.log();
      return;
    }

    testrun.stdout.on('data', function (data) {
      const lines = data.toString().split('\n');

      lines.forEach(line => {
        line = line.trim();
        if (line === '') return;
        if (line.indexOf('codecept') < 0) {
          console.log(`# ${line}`);
          return;
        }

        const l = line.split(/ (.+)/);
        fireEvent(l[0], JSON.parse(l[1]));
      })
    });

    testrun.stderr.on('data', function (data) {
      fireEvent('codecept.error_run', { message: data.toString() });
    });

    testrun.on('exit', function (code) {
      fireEvent('codecept.finish_run', { code });

      testrun = undefined;
      isRunning = false;
    });

    testrun.on('end', function (code) {
      fireEvent('codecept.finish_run', { code });

      testrun = undefined;
      isRunning = false;
    });
  },

  stop: () => {
    if (!testrun) return;

    const os = require('os');
    if(os.platform() === 'win32'){
        exec('taskkill /pid ' + testrun.pid + ' /T /F')
    }else{
        ps.kill();
    }    // process.kill(-testrun.pid, 'SIGINT');
  }
}
