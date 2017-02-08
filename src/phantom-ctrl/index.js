const phantomjs = require('phantomjs-prebuilt')

const programs = []

module.exports = {
  start: (ports) => {
    if (programs.length > 0) {
      module.exports.stop()
    }
    const promises = ports.map(port => phantomjs.run(`--webdriver=${port}`).then(program => programs.push(program)))

    return Promise.all(promises)
  },

  stop: () => {
    programs.forEach(program => program.kill())
    programs.length = 0
  }
}
