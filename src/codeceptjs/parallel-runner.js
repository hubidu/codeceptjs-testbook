const EventEmitter = require('events')
const CodeceptRunner = require('./runner')

const config = require('../config')
const phantomjsCtrl = require('../phantom-ctrl')

const PORTS = ['4444', '4445', '4446', '4447', '4448', '4449']

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
    if (runnerInstances) {
      module.exports.stop()
    }
    if (options.continuous) throw new Error('Continuous mode currently not supported, please implement')

    const cfg = config.get()
    const devices = Object.keys(cfg.devices)
    const ports = PORTS.slice(0, devices.length)

    console.log('DEVICES', devices)
    console.log('PORTS', ports)

    phantomjsCtrl.start(ports).then(() => {
      const defaultEnvironment = Object.keys(cfg.environments)[0]

      // Run tests for different devices in parallel
      runnerInstances = devices.map((device, i) => new CodeceptRunner(Object.assign({
        device,
        environment: defaultEnvironment,
        port: ports[i]
      }, options)))

      runnerInstances.forEach(runner => runner.subscribe(eventEmitter))
      runnerInstances.forEach(runner => runner.run())
    }).catch(err => {
      runnerInstances = undefined
      console.log('Failed to start phantomjs', err)
    })
  },

  stop: () => {
    if (!runnerInstances) return

    const cfg = config.get()
    const devices = Object.keys(cfg.devices)

    phantomjsCtrl.stop()

    runnerInstances.forEach(runner => runner.stop())

    // Wait until all runners have finished
    let deviceCount = 0
    eventEmitter.on('codecept.finish_run', () => {
      deviceCount++

      if (deviceCount === devices.length && runnerInstances) {
        runnerInstances.forEach(runner => runner.unsubscribe())
        runnerInstances = undefined
      }
    })
  }
}
