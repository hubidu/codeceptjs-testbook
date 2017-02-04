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

  _beforeStep (step) {
    let client = this._getI().browser
    if (!client) {
      console.log('WARN Browser not yet initialized - Can not get meta data')
      return
    }
    if (!client.getTitle || !client.getUrl || !client.getSource) {
      console.log('WARN Driver does not support getTitle, getUrl, getSource')
      return
    }

    return Promise.all([
      client.getTitle(),
      client.getUrl(),
      client.getSource()
    ]).then(values => {
      step._title = values[0]
      step._url = values[1],
      step._source = values[2]
    })
  }
}

module.exports = ScreenshotHelper
