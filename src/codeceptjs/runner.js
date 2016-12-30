const util  = require('util'),
    spawn = require('child_process').spawn;
const fsPath = require('path');

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

  run: () => {
    if (isRunning) return;

    isRunning = true;
    // TODO return a promise
    fireEvent('codecept.start_run');

    let testrun;
    try {
      testrun = spawn(CODECEPT_CMD, CODECEPT_OPTS);
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
      isRunning = false;
    });

    testrun.on('end', function (code) {
      fireEvent('codecept.finish_run', { code });
      isRunning = false;
    });
  }
}
