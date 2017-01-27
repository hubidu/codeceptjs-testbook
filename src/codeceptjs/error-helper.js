let Helper = codecept_helper // eslint-disable-line

/**
 * TODO
 * Would like to get the console errors, but unfortunately this
 * does not work
 */
class ErrorHelper extends Helper {
  _getI () {
    return this.helpers['WebDriverIO']
  }

  _beforeStep (step) {
    let client = this._getI()
    if (!client) {
      console.log('WARN Browser not yet initialized - Can not get errors')
      return
    }

    return client.executeAsyncScript(function (done) {
      window.onerror = function (messageOrEvent, source, lineno, colno, error) {
        window._errors = window._errors || [];
        window._errors.push({
          msg: messageOrEvent,
          error: error
        })
      }
      done()
    })
  }

  _afterStep (step) {
    let client = this._getI()
    if (!client) {
      console.log('WARN Browser not yet initialized - Can not get errors')
      return
    }

    return client.executeAsyncScript(function (done) {
      done(window._errors)
    }).then(val => {
      console.log(val)
    })
    .catch(err => console.log('eRROR', err))
  }
}

module.exports = ErrorHelper
