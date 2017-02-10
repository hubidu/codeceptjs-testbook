let HOST
if (process.env.NODE_ENV === 'production') {
  HOST = ''
} else {
  HOST = 'http://localhost:3333'
}

module.exports = {
  screenshotUrl: function (screenshot) {
    return `${HOST}/screenshots/${screenshot}`
  },

  htmlSourceUrl: function (step) {
    const getLocation = function (href) {
      var l = document.createElement('a')
      l.href = href
      return l
    }

    let selector
    if (step.name === 'waitForElement') {
      selector = step.args[0]
    } else if (step.name === 'click') {
      selector = step.args[0]
    } else if (step.name === 'see' && step.args.length === 2) {
      selector = step.args[1]
    } else if (step.name === 'see' && step.args.length === 1) {
      selector = step.args[0]
    } else if (step.name === 'seeElement') {
      selector = step.args[0]
    } else if (step.name === 'fillField') {
      if (step.args[0].indexOf('input') === 0) {
        selector = step.args[0]
      } else {
        selector = 'input' + step.args[0]
      }
    } else if (step.name === 'waitForText') {
      if (step.args.length === 1) {
        selector = step.args[0]
      } else if (step.args.length === 3) {
        selector = step.args[2]
      }
    }
    selector = encodeURIComponent(selector)
    const host = encodeURIComponent(getLocation(step.pageUrl).hostname)
    return `${HOST}/html-source/${step.htmlSource}?selector=${selector}&host=${host}`
  }
}
