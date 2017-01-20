/**
 * Create a mocha runner instance which listens for test events
 * and passes them to a websocket
 */
function reporterFactoryFn (runner, opts) {
  runner.on('start', function () {
  })

  runner.on('suite', function (suite) {
  })

  runner.on('fail', function (test, err) {
  })

  runner.on('pending', function (test) {
  })

  runner.on('pass', function (test) {
  })

  runner.on('test', function (test) {
  })

  runner.on('end', () => {})

  return runner
}

module.exports = reporterFactoryFn
