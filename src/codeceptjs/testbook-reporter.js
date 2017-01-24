const fs = require('fs')
const path = require('path')

const utils = require('./utils')
const testrun = require('./testrun')

// NOTE Need to load the same event module instance than the running codeceptjs inst
// in order to get the step events
const TEST_ROOT = process.cwd()
const codeceptUtils = require(path.join(TEST_ROOT, 'node_modules/codeceptjs/lib/command/utils'))
const event = require(path.join(TEST_ROOT, 'node_modules/codeceptjs/lib/event'))

/**
 * The test title could contain tags (denoted by @).
 */
function parseTestTitle (title) {
  return Object.assign({
    id: utils.hash(title)
  }, utils.parseTags(title))
}

function parseSuiteTitle (title) {
  return Object.assign({ id: utils.hash(title) }, utils.parseTags(title))
}

/**
 * The step title could contain tags (denoted by @)
 */
function mapStep (step) {
  return {
    t: Date.now(),
    name: step.name,
    args: step.args,
    humanizedName: step.humanize(),
    humanizedArgs: step.humanizeArgs(),
    helper: step.helper.constructor.name,
    actor: step.actor,
    screenshot: step.screenshot
  }
}

/**
 * Create a mocha runner instance which listens for test events
 * and passes them to a websocket
 */
function reporterFactoryFn (runner, opts) {
  let currentSuite
  let currentTest

  runner.on('start', function () {
    const codeceptConfig = codeceptUtils.getConfig(TEST_ROOT, undefined)

    currentSuite = undefined
    currentTest = undefined

    testrun.startRun()

    utils.log('codecept.start', Object.assign({}, {
      name: codeceptConfig.name
    }))
  })

  runner.on('suite', function (suite) {
    if (suite.fullTitle() === '') return // root suite

    currentSuite = suite
    currentTest = undefined

    utils.log('codecept.suite', Object.assign({
      t: Date.now()
    }, parseSuiteTitle(suite.fullTitle())))
  })

  runner.on('fail', function (test, err) {
    utils.log('codecept.fail', Object.assign({
      t: Date.now(),
      err: {
        message: test.err
      },
      steps: test.steps.map(mapStep),
      screenshot: testrun.captureErrorScreenshot(test),
      file: utils.stripCwd(test.file),
      suiteId: utils.hash(currentSuite.fullTitle())
    }, parseTestTitle(test.title)))
  })

  runner.on('pending', function (test) {
    utils.log('codecept.pending', Object.assign({
      t: Date.now(),
      file: utils.stripCwd(test.file),
      steps: test.steps.map(mapStep),
      suiteId: utils.hash(currentSuite.fullTitle())
    }, parseTestTitle(test.title)))
  })

  runner.on('pass', function (test) {
    utils.log('codecept.pass', Object.assign({
      t: Date.now(),
      file: utils.stripCwd(test.file),
      steps: test.steps.map(mapStep),
      suiteId: utils.hash(currentSuite.fullTitle())
    }, parseTestTitle(test.title)))
  })

  runner.on('test', function (test) {
    if (!currentSuite) throw new Error('Expected to have a suite')

    currentTest = test

    utils.log('codecept.test', Object.assign({
      t: Date.now(),
      file: utils.stripCwd(test.file),
      steps: test.steps.map(mapStep),
      suiteId: utils.hash(currentSuite.fullTitle())
    }, parseTestTitle(test.title)))
  })

  event.dispatcher.on(event.step.started, function (step) {
    const suiteId = utils.hash(currentSuite.fullTitle())
    const testId = utils.hash(currentTest.title)

    step.screenshot = testrun.captureCurrentScreenshot()

    utils.log('codecept.step', Object.assign({
      suiteId,
      testId
    }, mapStep(step)))
  })

  runner.on('end', () => {
    utils.log('codecept.end', {})
  })

  return runner
}

module.exports = reporterFactoryFn
