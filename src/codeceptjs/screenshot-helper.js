const fs = require('fs')

let Helper = codecept_helper // eslint-disable-line

/**
 * Helper to save a screenshot after each step
 */
class ScreenshotHelper extends Helper {
  _getI () {
    return this.helpers['WebDriverIO']
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
      fs.writeFile('./output/source.current.html', values[1])
    })  
  }
}

module.exports = ScreenshotHelper
