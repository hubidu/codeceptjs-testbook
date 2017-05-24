const path = require('path')

const utils = require('./utils')
const testrun = require('./testrun')

// NOTE Need to load the same event module instance than the running codeceptjs inst
// in order to get the step events
const TEST_ROOT = process.cwd()
const codeceptUtils = require(path.join(TEST_ROOT, 'node_modules/codeceptjs/lib/command/utils'))
const event = require(path.join(TEST_ROOT, 'node_modules/codeceptjs/lib/event'))
const AssertionFailedError = require(path.join(TEST_ROOT, 'node_modules/codeceptjs/lib/assert/error'))

/**
 * The test title could contain tags (denoted by @).
 */
function parseTestTitle (title) {
  return Object.assign({
    id: utils.hash(title.trim())
  }, utils.parseTags(title))
}

function parseTestTitleForType (type, title) {
  if (type === 'hook') {
    // TODO: Should also set the test type differently
    if (title.indexOf('BeforeSuite') >= 0 || title.indexOf('AfterSuite') >= 0) {
      return parseTestTitle('')
    }
    let m = title.match(/Before for "(.*?)"/) || title.match(/After for "(.*?)"/)
    if (!m) throw new Error(`Failed to extract test title from hook. Title=${title}`)

    return parseTestTitle(m[1])
  } else {
    return parseTestTitle(title)
  }
}

function parseSuiteTitle (title) {
  return Object.assign({ id: utils.hash(title) }, utils.parseTags(title))
}

function parseTestType (test) {
  if (test.type === 'hook') {
    if (test.title.indexOf('"before each"') === 0) {
      return 'hook:before'
    } else {
      return 'hook:after'
    }
  } else {
    return test.type
  }
}

function extractFileLineMethod (stack) {
  if (!stack) return

  const pageAndFeatureFiles = stack.split('\n').filter(l => l.indexOf('.page.js') >= 0 || l.indexOf('.feature.js') >= 0)
  if (pageAndFeatureFiles.length === 0) return

  const codeLine = pageAndFeatureFiles[0]
  const fileAndLine = codeLine.match(/\((.+):([0-9]+):([0-9]+)\)/)
  const method = codeLine.match(/at ([A-Za-z\.]+) \(/)
  return {
    file: fileAndLine ? fileAndLine[1] : undefined,
    fileName: fileAndLine ? path.basename(fileAndLine[1]) : undefined,
    lineNo: fileAndLine ? fileAndLine[2] : undefined,
    method: method ? method[1] : undefined
  }
}

/**
 * The step title could contain tags (denoted by @)
 */
function mapStep (step) {
  return Object.assign({
    t: Date.now(),
    name: step.name,
    args: step.args,
    prefix: step.prefix ? step.prefix : undefined,
    humanizedName: step.humanize(),
    humanizedArgs: step.humanizeArgs(),
    helper: step.helper.constructor.name,
    actor: step.actor,
    screenshot: step.screenshot,
    pageTitle: step._title,
    pageUrl: step._url,
    htmlSource: step._htmlSource
  }, extractFileLineMethod(step.stack))
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

    // TODO Use the same id as in runner
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
    let msg = err.message
    if (err instanceof AssertionFailedError) {
      msg = err.message = err.inspect()
    }

    utils.log('codecept.fail', Object.assign({
      t: Date.now(),
      errorMessage: msg,
      err: test.err,
      testType: parseTestType(test),
      steps: test.steps ? test.steps.map(mapStep) : undefined,
      screenshot: testrun.captureErrorScreenshot(test),
      file: utils.stripCwd(test.file),
      suiteId: utils.hash(currentSuite.fullTitle())
    }, parseTestTitleForType(test.type, test.title)))
  })

  runner.on('pending', function (test) {
    utils.log('codecept.pending', Object.assign({
      t: Date.now(),
      file: utils.stripCwd(test.file),
      steps: test.steps ? test.steps.map(mapStep) : undefined, // TODO: Remove them
      suiteId: utils.hash(currentSuite.fullTitle())
    }, parseTestTitle(test.title)))
  })

  runner.on('pass', function (test) {
    utils.log('codecept.pass', Object.assign({
      t: Date.now(),
      file: utils.stripCwd(test.file),
      steps: test.steps ? test.steps.map(mapStep) : undefined, // TODO: Remove them
      suiteId: utils.hash(currentSuite.fullTitle())
    }, parseTestTitle(test.title)))
  })

  event.dispatcher.on(event.test.started, function (test) {
    utils.log('codecept.test.start', Object.assign({
      t: Date.now(),
      suiteId: utils.hash(currentSuite.fullTitle()),
      testId: utils.hash(currentTest.title)
    }, parseTestTitle(currentTest.title)))
  })

  event.dispatcher.on(event.test.after, function (test) {
    utils.log('codecept.test.after', Object.assign({
      t: Date.now(),
      suiteId: utils.hash(currentSuite.fullTitle()),
      testId: utils.hash(currentTest.title)
    }, parseTestTitle(currentTest.title)))
  })

  runner.on('test', function (test) {
    if (!currentSuite) throw new Error('Expected to have a suite')

    currentTest = test

    utils.log('codecept.test', Object.assign({
      t: Date.now(),
      file: utils.stripCwd(test.file),
      steps: test.steps ? test.steps.map(mapStep) : undefined,                 // TODO: Remove them
      suiteId: utils.hash(currentSuite.fullTitle())
    }, parseTestTitle(test.title)))
  })

  event.dispatcher.on('step.after.custom', function (step) {
    const suiteId = utils.hash(currentSuite.fullTitle())
    const testId = utils.hash(currentTest.title)

    step.screenshot = testrun.captureCurrentScreenshot()
    step._htmlSource = testrun.captureCurrentHtml()

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

process.on('uncaughtException', function (err) {
  console.log('UNCAUGHT EXCEPTION', err)
})

process.on('unhandledRejection', function (reason, p) {
  console.log('UNHANDLED REJECTION at: Promise ', p, ' reason: ', reason)
})

module.exports = reporterFactoryFn
