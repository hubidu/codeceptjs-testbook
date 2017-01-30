const spawn = require('child_process').spawn
const exec = require('child_process').exec
const fsPath = require('path')
const shortid = require('shortid')

/**
 * Add custom helpers by overriding the codeceptjs config on command line
 */
const opts = JSON.stringify({
  helpers: {
    ScreenshotHelper: {
      require: fsPath.join(__dirname, './screenshot-helper.js').replace(/\\/g, '\\\\')
    },
    MetaHelper: {
      require: fsPath.join(__dirname, './meta-helper.js').replace(/\\/g, '\\\\')
    }
  }
})

/**
 * Run codeceptjs out-of-process and read events from stdout
 */
// TODO Actually I would rather invoke codeceptjs directly
const CODECEPT_CMD = 'sh'
const CODECEPT_OPTS = [
  './node_modules/.bin/codeceptjs',
  'run',
  '--reporter', fsPath.join(__dirname, './testbook-reporter.js').replace(/\\/g, '\\\\'),
  '-o',
  opts,
  '--sort',
  '--debug'

  // '--grep', 'it should convert my anonymous'
]

/**
 * Keep track of websockets
 */
const sockets = {}
let isRunning = false
let testrun

/**
 * Pass on reporter output to subscribed websockets
 */
function fireEvent (type, payload = {}) {
  console.log('EVT', type, payload)
  Object.keys(sockets).forEach(k => sockets[k].emit(type, payload))
}

function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line
}

module.exports = {
  subscribe: (socket) => {
    sockets[socket.id] = socket
  },

  unsubscribe: (socket) => {
    delete sockets[socket.id]
  },

  /**
   * Start a testrun
   */
  // TODO return a promise from this function
  run: (options) => {
    if (isRunning) return

    isRunning = true

    // Set environment variable defaults
    if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production'
    if (!process.env.DEVICE) process.env.DEVICE = 'desktop'

    fireEvent('codecept.start_run',
      Object.assign(options, {
        id: shortid.generate(),
        environment: process.env.NODE_ENV,
        device: process.env.DEVICE
      }))

    const opts = CODECEPT_OPTS.slice()

    // Use grep to only run a specific test
    if (options.grep) {
      opts.push('--grep')
      opts.push(escapeRegExp(options.grep))
    }

    try {
      testrun = spawn(CODECEPT_CMD, opts, {
        detached: true,
        env: process.env
      })
    } catch (err) {
      isRunning = false
      console.log()
      return
    }

    testrun.stdout.on('data', function (data) {
      const lines = data.toString().split('\n')

      lines.forEach(line => {
        line = line.trim()
        if (line === '') return
        if (line.indexOf('codecept') !== 0) {
          console.log(`# ${line}`)
          return
        }

        const l = line.split(/ (.+)/)
        fireEvent(l[0], JSON.parse(l[1]))
      })
    })

    testrun.stderr.on('data', function (data) {
      fireEvent('codecept.error_run', { message: data.toString() })
    })

    testrun.on('exit', function (code) {
      fireEvent('codecept.finish_run', { code })

      testrun = undefined
      isRunning = false
    })

    testrun.on('end', function (code) {
      fireEvent('codecept.finish_run', { code })

      testrun = undefined
      isRunning = false
    })
  },

  stop: () => {
    if (!testrun) return

    const os = require('os')
    const ps = require('process')
    if (os.platform() === 'win32') {
      exec('taskkill /pid ' + testrun.pid + ' /T /F')
    } else {
      ps.kill()
    }
  }
}
