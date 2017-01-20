const mkdirp = require('mkdirp')

// TODO Move that to config
const OUTPUT_DIR = './.testbook'
mkdirp(OUTPUT_DIR)

/**
 * TODO Encapsulate more data per testrun
 * @type {Object}
 */
module.exports = {
  outputDir: () => {
    // TODO: Have a directory for each testrun
    return OUTPUT_DIR
  }
}
