let Helper = codecept_helper // eslint-disable-line

const fs = require('fs')
const path = require('path')

// NOTE Need to load the same event module instance than the running codeceptjs inst
// in order to get the step events
const TEST_ROOT = process.cwd()
const codeceptUtils = require(path.join(TEST_ROOT, 'node_modules/codeceptjs/lib/command/utils'))

const utils = require('./utils')
const screenshotHelper = require('./screenshot-helper')
const testrun = require('./testrun')

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
 * Helper to save a screenshot before each test
 */
class TestbookHelper extends Helper {

  constructor (config) {
    super(config)

    this.currentSuite = undefined
    this.currentTest = undefined
  }

  /**
   * Abstract method to provide requried config options
   */
  static _config () {

  }

  /**
   * Hook executed before all tests
   */
  _init () {
    const codeceptConfig = codeceptUtils.getConfig(TEST_ROOT, undefined)

    this.currentSuite = undefined
    this.currentTest = undefined

    utils.log('codecept.start', Object.assign({}, {
      name: codeceptConfig.name
    }))
  }

  /**
   * Hook executed before each test.
   */
  _before () {
    console.log('BEFORE')
  }

  /**
   * Hook executed after each test
   */
  _after () {}

  /**
     * Hook provides a test details
     * Executed in the very beginning of a test
     *
     * @param test
     */
  _test (test) {
    console.log('TEST')
    this.currentTest = test

    utils.log('codecept.test', Object.assign({
      t: Date.now(),
      file: utils.stripCwd(test.file),
      steps: test.steps.map(mapStep),
      suiteId: utils.hash(this.currentSuite.fullTitle())
    }, parseTestTitle(test.title)))
  }

    /**
   * Hook executed after each failed test
   *
   * @param test
   */
  _failed (test) {
    console.log('FAILED')
    function codeceptErrorScreenshot (test) {
      return path.join(global.output_dir, test.title.replace(/ /g, '_') + '.failed.png')
    }

    // Move to function
    let screenshot
    try {
      screenshot = `${utils.hash(this.currentSuite.fullTitle())}-${utils.hash(test.title)}-${Date.now()}.failed.png`
      if (fs.existsSync(codeceptErrorScreenshot(test))) {
        fs.renameSync(codeceptErrorScreenshot(test), path.join(testrun.outputDir(), screenshot))
      }
    } catch (err) {
      console.log(`Failed to rename screenshot file ${err}`)
    }

    utils.log('codecept.fail', Object.assign({
      t: Date.now(),
      err: {
        message: test.err
      },
      steps: test.steps.map(mapStep),
      screenshot: screenshot,
      file: utils.stripCwd(test.file),
      suiteId: utils.hash(this.currentSuite.fullTitle())
    }, parseTestTitle(test.title)))
  }

  _getI () {
    // TODO Should not be limited to webdriver
    return this.helpers['WebDriverIO']
  }

  /**
   * Hook executed before each step
   *
   * @param step
   */
  _beforeStep (step) {
    console.log('BEFORE STEP')

    const screenshotFileName = screenshotHelper.createUniqueScreenshotName()
    // Attach screenshot path to step
    step.screenshot = screenshotFileName

    return this._getI().saveScreenshot(screenshotFileName)
      .then(() => {
        screenshotHelper.moveToTestrunDirectory(screenshotFileName)
      })
      .then(() => {
        const suiteId = utils.hash(this.currentSuite.fullTitle())
        const testId = utils.hash(this.currentTest.title)

        utils.log('codecept.step', Object.assign({
          suiteId,
          testId
        }, mapStep(step)))
      })
  }

  /**
   * Hook executed after each step
   *
   * @param step
   */
  _afterStep () {}

  /**
   * Hook executed before each suite
   *
   * @param suite
   */
  _beforeSuite (suite) {
    console.log('BEFORE SUITE', suite.title)
    if (suite.fullTitle() === '') return Promise.resolve()

    this.currentSuite = suite
    this.currentTest = undefined

    utils.log('codecept.suite', Object.assign({
      t: Date.now()
    }, parseSuiteTitle(suite.fullTitle())))
  }

  /**
   * Hook executed after each suite
   *
   * @param suite
   */
  _afterSuite (suite) {
    utils.log('codecept.suite.after', Object.assign({
      t: Date.now()
    }, parseSuiteTitle(suite.fullTitle())))
  }

}

module.exports = TestbookHelper
