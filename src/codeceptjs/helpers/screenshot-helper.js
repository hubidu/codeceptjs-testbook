const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const TEST_ROOT = process.cwd()
const event = require(path.join(TEST_ROOT, 'node_modules/codeceptjs/lib/event'))

let Helper = codecept_helper // eslint-disable-line

// Use codeceptjs output directory
const OUTPUT_DIR = global.output_dir

/**
 * Helper to save a screenshot after each step
 */
class ScreenshotHelper extends Helper {
  _getI () {
    // Expect first helper to be the driver
    const driver = Object.keys(this.helpers)[0]
    return this.helpers[driver]
  }

  _init () {
    // Make sure output dir exists
    mkdirp(OUTPUT_DIR)
  }

  /**
   * Hook executed after each step
   * TODO Would be better to wrap all these methods in try...catch . Otherwise it's very hard to troubleshoot
   *
   * @param step
   */
  _afterStep (step) {
    const client = this._getI().browser
    if (!client) {
      console.log('WARN Browser not yet initialized - Can not make a screenshot')
      return
    }

    Promise.all([
      this._getI().saveScreenshot(`screenshot.${process.env.device}.png`),
      client.getSource()
    ]).then(values => {
      // TODO: Experimental - save current html source
      return new Promise((resolve, reject) => {
        // TODO Make output configurable
        fs.writeFile(path.join(OUTPUT_DIR, `source.${process.env.DEVICE}.html`), values[1], (err, val) => {
          if (err) return reject(err)
          resolve(val)
        })
      })
    }).then(val => {
      event.dispatcher.emit('step.after.custom', step)
    })
    .catch(err => console.log('Error in ScreenshotHelper', err))
  }

  /**
   * Experimental
   * TODO Dont get it - does not run synchronously
   */
  comment (txt) {
    return Promise.resolve(txt)
  }
}

module.exports = ScreenshotHelper
