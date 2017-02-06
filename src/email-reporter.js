const codeceptRunner = require('./codeceptjs/parallel-runner')

const THRESHOLD = 0

// TODO limit history stored
const history = []

let stats = {}

let currentSuite

codeceptRunner.events().on('codecept.start_run', options => {
  // TODO: Support devices
  Object.assign(stats, {
    startedAt: new Date(),
    finishedAt: undefined,
    duration: 0,
    passed: [],
    failed: []
  })
})

codeceptRunner.events().on('codecept.finish_run', options => {
  stats.finishedAt = new Date()
  stats.duration = stats.finishedAt.getTime() - stats.startedAt.getTime()

  if (!options.continuous) return

  if (stats.failed.length > THRESHOLD) {
    console.log(`MORE THAN ${THRESHOLD} TESTS FAILED`, stats.duration)
    stats.failed.forEach(failedTest => {
      console.log(`  * ${failedTest.title}`)
      console.log(`    of suite '${failedTest._suiteTitle}'`)
      console.log(`    in file ${failedTest.file}`)
      console.log(`    error ${failedTest.errorMessage}`)
    })
  }

  history.push(stats)
  stats = {}
})

codeceptRunner.events().on('codecept.suite', suite => {
  currentSuite = suite
})

codeceptRunner.events().on('codecept.pass', t => {
  stats.passed.push(Object.assign({}, t, {
    _suiteTitle: currentSuite.title
  }))
})

codeceptRunner.events().on('codecept.fail', t => {
  stats.failed.push(Object.assign({}, t, {
    _suiteTitle: currentSuite.title
  }))
})

codeceptRunner.events().on('codecept.error_run', data => {
  console.log('ERROR', data.message)
})

module.exports = function (opts) {
}
