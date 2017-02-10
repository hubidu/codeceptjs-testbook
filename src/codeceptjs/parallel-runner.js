const EventEmitter = require('events')
const CodeceptRunner = require('./runner')

const phantomjsCtrl = require('../phantom-ctrl')

const DEVICES = ['desktop', 'mobile']
const PORTS = ['4444', '4445']

let runnerInstances

class TestbookEventEmitter extends EventEmitter {}
const eventEmitter = new TestbookEventEmitter()
eventEmitter.setMaxListeners(20)

module.exports = {
  eventTypes: () => {
    return CodeceptRunner.EVENT_TYPES
  },

  events: () => {
    return eventEmitter
  },

  run: (options) => {
    if (runnerInstances) return
    if (options.continuous) throw new Error('Continuous mode currently not supported, please implement')

    phantomjsCtrl.start(PORTS).then(() => {
      // TODO Fix environment and device
      runnerInstances = DEVICES.map(device => new CodeceptRunner(Object.assign({
        device, environment: 'production'
      }, options)))

      runnerInstances.forEach(runner => runner.subscribe(eventEmitter))
      runnerInstances.forEach(runner => runner.run())
    }).catch(err => {
      console.log('Failed to start phantomjs', err)
    })
  },

  stop: () => {
    if (!runnerInstances) return

    phantomjsCtrl.stop()

    runnerInstances.forEach(runner => runner.stop())
    runnerInstances.forEach(runner => runner.unsubscribe())
    runnerInstances = undefined
  }
}
