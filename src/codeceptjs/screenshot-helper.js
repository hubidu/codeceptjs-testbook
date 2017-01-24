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
   *
   * @param step
   */
  _afterStep (step) {
    return this._getI().saveScreenshot('screenshot.current.png')
  }
}

module.exports = ScreenshotHelper
