const EventEmitter = require('events')
const spawn = require('child_process').spawn
const exec = require('child_process').exec
const path = require('path')
const shortid = require('shortid')

/**
 * Add custom helpers by overriding the codeceptjs config on command line
 */
const opts = JSON.stringify({
  helpers: {
    ScreenshotHelper: {
      require: path.join(__dirname, './helpers/screenshot-helper.js').replace(/\\/g, '\\\\')
    },
    MetaHelper: {
      require: path.join(__dirname, './helpers/meta-helper.js').replace(/\\/g, '\\\\')
    }
  }
})

/**
 * Run codeceptjs out-of-process and read events from stdout
 */
// TODO Actually I would rather invoke codeceptjs directly
const CODECEPT_CMD = 'node'
const CODECEPT_OPTS = [
  './node_modules/codeceptjs/bin/codecept.js',
  'run',
  '--reporter', path.join(__dirname, './testbook-reporter.js').replace(/\\/g, '\\\\'),
  '-o',
  opts,
  '--sort',
  '--debug'

  // '--grep', '@UserConvert'
]

/**
 * Keep track of websockets
 */
let isRunning = false
let testrun

class TestbookEventEmitter extends EventEmitter {}

const eventEmitter = new TestbookEventEmitter()
eventEmitter.setMaxListeners(20)

/**
 * Pass on reporter output to subscribed websockets
 */
function fireEvent (type, payload = {}) {
  // console.log('EVT', type, payload)
  eventEmitter.emit(type, payload)
}

module.exports = {
  eventTypes: () => {
    return [
      'codecept.start_run', 'codecept.finish_run',
      'codecept.start', 'codecept.suite', 'codecept.suite',
      'codecept.fail', 'codecept.pending', 'codecept.pass', 'codecept.test.start',
      'codecept.test.after', 'codecept.test', 'codecept.step', 'codecept.end'
    ]
  },

  events: () => {
    return eventEmitter
  },

  /**
   * Start a testrun
   */
  // TODO return a promise from this function
  run: (options) => {
    function escapeRegExp (str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line
    }

    function capitalize (str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

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

    // Don't execute tests marked with tag @Not<Environment>
    opts.push('--grep')
    opts.push(`.*(?!@Not${capitalize(process.env.NODE_ENV)}).*`)

    // Run the specified test suite
    if (options.suite) {
      opts.push('--grep')
      const escapedGrep = escapeRegExp(options.suite)
      opts.push(escapedGrep)
    }

    // Use grep to only run a specific test
    if (options.grep) {
      opts.push('--grep')
      const escapedGrep = escapeRegExp(options.grep)
      opts.push(escapedGrep)

      console.log('Running with grep', options.grep)
    }

    try {
      testrun = spawn(CODECEPT_CMD, opts, {
        detached: true,
        env: process.env
      })
    } catch (err) {
      isRunning = false
      console.log('Failed to run codeceptjs', err)
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
      fireEvent('codecept.finish_run', Object.assign({ code }, options))

      testrun = undefined
      isRunning = false

      if (options.continuous) {
        console.log('Running in continuous mode. Next run in ', options.interval)
        setTimeout(() => module.exports.run(options), options.interval)
      }
    })

    testrun.on('end', function (code) {
      fireEvent('codecept.finish_run', Object.assign({ code }, options))

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
      ps.kill(testrun.pid)
    }
  }
}
