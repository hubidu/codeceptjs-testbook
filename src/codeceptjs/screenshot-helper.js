const fs = require('fs')
const path = require('path')

const TEST_ROOT = process.cwd()
const event = require(path.join(TEST_ROOT, 'node_modules/codeceptjs/lib/event'))

let Helper = codecept_helper // eslint-disable-line

/**
 * Helper to save a screenshot after each step
 */
class ScreenshotHelper extends Helper {
  _getI () {
    // Expect first helper to be the driver
    const driver = Object.keys(this.helpers)[0]
    return this.helpers[driver]
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
      this._getI().saveScreenshot('screenshot.current.png'),
      client.getSource()
    ]).then(values => {
      // TODO: Experimental - save current html source
      return new Promise((resolve, reject) => {
        fs.writeFile('./output/source.current.html', values[1], (err, val) => {
          if (err) return reject(err)
          resolve(val)
        })
      })
    }).then(val => {
      event.dispatcher.emit('step.after.custom', step)
    })
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
