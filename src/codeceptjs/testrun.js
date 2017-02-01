const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const shortid = require('shortid')

// TODO Move that to config
const OUTPUT_DIR = './.testbook'

/**
 * Keep track of different test runs
 */
let runId

module.exports = {
  startRun: () => {
    runId = shortid.generate()

    const runDir = path.join(OUTPUT_DIR, runId)
    mkdirp(runDir)
    return runDir
  },

  outputDir: () => {
    const runDir = path.join(OUTPUT_DIR, runId)
    return runDir
  },

  /**
   * Move the current screenshot to the testrun output directory
   */
  captureCurrentScreenshot: () => {
    const screenshotPath = path.join(global.output_dir, 'screenshot.current.png')
    const destScreenshotName = `screenshot-${shortid.generate()}.png`
    const destScreenshotPath = path.join(OUTPUT_DIR, runId, destScreenshotName)

    try {
      if (fs.existsSync(screenshotPath)) {
        fs.renameSync(screenshotPath, destScreenshotPath)
      }
    } catch (err) {
      console.log('Error capturing screenshot', err)
    }
    return [runId, destScreenshotName].join('/')
  },

  /**
   * Move current html snapshot to the testrun output directory
   */
  captureCurrentHtml: () => {
    const screenshotPath = path.join(global.output_dir, 'source.current.html')
    const destHtmlSource = `source-${shortid.generate()}.html`
    const destHtmlSourcePath = path.join(OUTPUT_DIR, runId, destHtmlSource)

    try {
      if (fs.existsSync(screenshotPath)) {
        fs.renameSync(screenshotPath, destHtmlSourcePath)
      }
    } catch (err) {
      console.log('Error capturing HTML source', err)
    }
    return [runId, destHtmlSource].join('/')
  },

  /**
   * Move the error screenshot which codeceptjs created to the output directory
   */
  captureErrorScreenshot: (test) => {
    function codeceptErrorScreenshot (test) {
      return path.join(global.output_dir, test.title.replace(/ /g, '_') + '.failed.png')
    }
    const destScreenshotName = `screenshot-${shortid.generate()}.png`
    const destScreenshotPath = path.join(OUTPUT_DIR, runId, destScreenshotName)

    try {
      if (fs.existsSync(codeceptErrorScreenshot(test))) {
        fs.renameSync(codeceptErrorScreenshot(test), destScreenshotPath)
      }
    } catch (err) {
      console.log('Error capturing screenshot', err)
    }

    return [runId, destScreenshotName].join('/')
  }
}
