let Helper = codecept_helper // eslint-disable-line

/**
 * Helper to save a screenshot after each step
 */
class MetaHelper extends Helper {
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
    if (!client.getTitle || !client.getUrl) {
      console.log('WARN Driver does not support getTitle, getUrl')
      return
    }

    return Promise.all([
      client.getTitle(),
      client.getUrl()
    ]).then(values => {
      step._title = values[0]
      step._url = values[1]
    })
  }
}

module.exports = MetaHelper
