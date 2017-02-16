let Helper = codecept_helper // eslint-disable-line

class ErrorHelper extends Helper {
  constructor (config) {
    super(config)
    this.errors = []
  }

  _before () {
    this.errors = []

    const wd = this.helpers['WebDriverIO']
    if (!wd) return

    wd.browser.on('error', (e) => (this.errors.push(e)))
  }

  _afterStep () {
    if (this.errors.length > 0) throw new Error('There have been errors on the console - ' + this.errors)
  }
}

module.exports = ErrorHelper
