const EventEmitter = require('events')
const CodeceptCtrl = require('./codecept-ctrl')
const shortid = require('shortid')

class TestbookEventEmitter extends EventEmitter {}

function escapeRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') // eslint-disable-line
}

// function capitalize (str) {
//   return str.charAt(0).toUpperCase() + str.slice(1)
// }

const EVENT_TYPES = [
  'codecept.start_run', 'codecept.finish_run',
  'codecept.start', 'codecept.suite', 'codecept.suite',
  'codecept.fail', 'codecept.pending', 'codecept.pass', 'codecept.test.start',
  'codecept.test.after', 'codecept.test', 'codecept.step', 'codecept.end'
]

class CodeceptRunner {
  constructor (options) {
    this.options = options
    this.isRunning = false
    this.proc = undefined

    this.eventEmitter = new TestbookEventEmitter()
    this.eventEmitter.setMaxListeners(20)
    this.codeceptCtrl = new CodeceptCtrl(options.environment, options.device, options.port)
  }

  get events () {
    return this.eventEmitter
  }

  _fireEvent (type, payload = {}) {
    // Always add device and environment to events
    this.eventEmitter.emit(type, Object.assign({
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

  run () {
    if (this.isRunning) return

    this.isRunning = true

    this._fireEvent('codecept.start_run',
      Object.assign({
        id: shortid.generate()
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
