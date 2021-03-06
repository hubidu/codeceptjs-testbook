const config = require('../config')

const parser = require('../codeceptjs/parser')
const getConfig = require('codeceptjs/lib/command/utils').getConfig
const getTestRoot = require('codeceptjs/lib/command/utils').getTestRoot

function _hash (str) {
  var crypto = require('crypto')
  return crypto.createHash('md5').update(str).digest('hex')
}

const getSuitesAndTests = () => {
  // const testRoot = getTestRoot(process.cwd())
  const testRoot = process.cwd()
  console.log(`Parsing tests in ${process.cwd()}/${testRoot}`)
  const codeceptjsConfig = getConfig(testRoot)

  return parser.parseFeatureFiles(codeceptjsConfig.tests)
    .then(parsedFiles => {
      const suitesAndTests = parsedFiles.map(f => {
        // TODO There could be multiple features/scenarios in a feature file
        const features = f.parsed.filter(item => item.type === 'Feature')
        if (features.length === 0) {
          console.log(`No feature in file ${f.file}`)
          return undefined
        }
        const feature = features[0]

        const scenarios = f.parsed.filter(item => item.type === 'Scenario')
        if (scenarios.length === 0) console.log(`No scenarios in file ${f.file}`)

        return {
          t: Date.now(),
          id: _hash(feature.originalTitle),
          title: feature.title,
          originalTitle: feature.originalTitle,
          state: 'not-run',
          tags: feature.tags,
          tests: scenarios.map(scenario => ({
            id: _hash(scenario.originalTitle),
            t: Date.now(),
            title: scenario.title,
            originalTitle: scenario.originalTitle,
            tags: scenario.tags,
            file: f.file,
            state: 'not-run',
            steps: [],
            stepsReverse: []
          }))
        }
      }).filter(item => !!item)

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
