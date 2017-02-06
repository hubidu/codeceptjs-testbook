const EventEmitter = require('events')
const CodeceptRunner = require('./runner')

const DEVICES = ['desktop', 'mobile']

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

    runnerInstances = DEVICES.map(device => new CodeceptRunner(Object.assign({ device }, options)))

    runnerInstances.forEach(runner => runner.subscribe(eventEmitter))
    runnerInstances.forEach(runner => runner.run())
  },

  stop: () => {
    if (!runnerInstances) return

    runnerInstances.forEach(runner => runner.stop())
    runnerInstances.forEach(runner => runner.unsubscribe())
    runnerInstances = undefined
  }
}
