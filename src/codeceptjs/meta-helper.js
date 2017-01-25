let Helper = codecept_helper // eslint-disable-line

/**
 * Helper to save a screenshot after each step
 */
class ScreenshotHelper extends Helper {
  _getI () {
    return this.helpers['WebDriverIO']
  }

  _beforeStep (step) {
    let client = this._getI().browser

    return Promise.all([
      client.getTitle(),
      client.getUrl()
    ]).then(values => {
      step._title = values[0]
      step._url = values[1]
    })
  }
}

module.exports = ScreenshotHelper
