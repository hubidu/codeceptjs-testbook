const fs = require('fs')
const path = require('path')
const del = require('del')
const EventEmitter = require('events')
const CodeceptCtrl = require('./codecept-ctrl')
const testrun = require('./testrun')

class TestbookEventEmitter extends EventEmitter {}

function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line
}

function cleanupDirs (outputDir, keepLast) {
  function getDirectories (srcpath) {
    return fs.readdirSync(srcpath).filter(file => fs.statSync(path.join(srcpath, file)).isDirectory())
  }

  const dirs = getDirectories(outputDir)
  while (dirs.length > keepLast) {
    const dir = dirs.pop()
    const testrunDirectory = path.join(outputDir, dir)
    console.log('Deleting', testrunDirectory)
    del.sync([testrunDirectory])
  }
}

const EVENT_TYPES = [
  'codecept.start_run', 'codecept.finish_run',
  'codecept.start', 'codecept.suite', 'codecept.suite',
  'codecept.fail', 'codecept.pending', 'codecept.pass', 'codecept.test.start',
  'codecept.test.after', 'codecept.test', 'codecept.step', 'codecept.end'
]

class CodeceptRunner {
  constructor (options) {
    this.options = options
    this.id = undefined
    this.isRunning = false
    this.proc = undefined

    this.eventEmitter = new TestbookEventEmitter()
    this.eventEmitter.setMaxListeners(20)
    this.codeceptCtrl = new CodeceptCtrl(options.environment, options.device, options.port)
  }

  get events () {
    return this.eventEmitter
  }

  _beforeStart (config) {
    // Cleanup testrun directories
    const keepLast = (config.settings && config.settings.keepLast) || 2
    const outputDir = (config.settings && config.settings.outputDir) || './.testbook'
    cleanupDirs(outputDir, keepLast)
  }

  _fireEvent (type, payload = {}) {
    if (!this.isRunning) return

    // Always add device and environment to events
    this.eventEmitter.emit(type, Object.assign({
      _id: this.id,
      _device: this.options.device,
      _environment: this.options.environment
    }, payload))
  }

  _handleStdout (proc) {
    proc.stdout.on('data', (data) => {
      const lines = data.toString().split('\n')

      lines.forEach(line => {
        line = line.trim()
        if (line === '') return
        if (line.indexOf('codecept') !== 0) {
          console.log(`# ${line}`)
          return
        }

        const l = line.split(/ (.+)/)
        this._fireEvent(l[0], JSON.parse(l[1]))
      })
    })

    proc.stderr.on('data', (data) => {
      this._fireEvent('codecept.error_run', { message: data.toString() })
    })

    proc.on('close', (code) => {
      this._fireEvent('codecept.finish_run', { code })

      this.codeceptCtrl = undefined
      this.isRunning = false
    })

    proc.on('exit', (code) => {
      this._fireEvent('codecept.finish_run', { code })

      this.codeceptCtrl = undefined
      this.isRunning = false
    })

    proc.on('end', (code) => {
      this._fireEvent('codecept.finish_run', { code })

      this.codeceptCtrl = undefined
      this.isRunning = false
    })
  }

  startTestRun () {
    this.id = testrun.startRun()
  }

  subscribe (listener) {
    EVENT_TYPES.forEach(event => {
      this.eventEmitter.on(event, (payload) => {
        listener.emit(event, payload)
      })
    })
  }

  unsubscribe () {
    EVENT_TYPES.forEach(event => {
      this.eventEmitter.removeAllListeners(event)
    })
  }

  run (config) {
    if (this.isRunning) return

    this.isRunning = true

    this._beforeStart(config)

    // TODO: Fix this: There is no correlation between testruns here and in testbook-reporter
    this._fireEvent('codecept.start_run',
      Object.assign({
        id: this.startTestRun()
      }, this.options))

    const cmdOpts = this.codeceptCtrl.cmd_opts

    // TODO Make this work
    // Don't execute tests marked with tag @Not<Environment>
    // cmdOpts.push('--grep')
    // cmdOpts.push(`.*(?!@Not${capitalize(process.env.NODE_ENV)}).*`)

    // Run the specified test suite
    if (this.options.suite) {
      console.log('Running suite', this.options.suite)
      cmdOpts.push('--grep')
      const escapedGrep = escapeRegExp(this.options.suite)
      cmdOpts.push(escapedGrep)
    }

    // Use grep to only run a specific test
    if (this.options.grep) {
      cmdOpts.push('--grep')
      const escapedGrep = escapeRegExp(this.options.grep)
      cmdOpts.push(escapedGrep)

      console.log('Running with grep', this.options.grep)
    }

    try {
      this.proc = this.codeceptCtrl.start()
      this._handleStdout(this.proc)
    } catch (err) {
      this.isRunning = false
      console.log('Failed to run codeceptjs', err)
    }
  }

  stop () {
    if (!this.codeceptCtrl) return
    this.codeceptCtrl.stop()
  }
}

CodeceptRunner.EVENT_TYPES = EVENT_TYPES

module.exports = CodeceptRunner
