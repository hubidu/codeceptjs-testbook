const config = require('../config')

const getConfig = require('codeceptjs/lib/command/utils').getConfig
const getTestRoot = require('codeceptjs/lib/command/utils').getTestRoot
const parser = require('./parser')

function _hash (str) {
  var crypto = require('crypto')
  return crypto.createHash('md5').update(str).digest('hex')
}

const getSuitesAndTests = () => {
  const testRoot = getTestRoot(undefined)
  const codeceptjsConfig = getConfig(testRoot, undefined)

  return parser.parseFeatureFiles(codeceptjsConfig.tests)
    .then(parsedFiles => {
      const suitesAndTests = parsedFiles.map(f => {
        const features = f.parsed.filter(item => item.name === 'Feature')
        if (features.length === 0) throw new Error(`No feature in file ${f.file}`)
        const feature = features[0]

        const scenarios = f.parsed.filter(item => item.name === 'Scenario')
        if (scenarios.length === 0) throw new Error(`No scenarios in file ${f.file}`)

        return {
          id: _hash(feature.arg),
          title: feature.arg,
          state: 'not-run',
          tags: [],
          tests: scenarios.map(scenario => ({
            id: _hash(scenario.arg),
            title: scenario.arg,
            tags: [],
            file: f.file,
            state: 'not-run'
          }))
        }
      })

      return {
        mobile: suitesAndTests,
        desktop: suitesAndTests
      }
    })
}

const sendInitialState = (socket) => {
  socket.emit('testbook.config', config.get())

  getSuitesAndTests()
    .then(suitesAndTests => socket.emit('testbook.suites', suitesAndTests))
}

module.exports = sendInitialState
