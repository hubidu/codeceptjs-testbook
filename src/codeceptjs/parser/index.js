const glob = require('glob')
const esprima = require('esprima')
const fs = require('fs')

const utils = require('../utils')

const _first = (arr) => {
  if (!arr) return undefined
  if (arr.length === 0) return undefined
  return arr[0]
}

const parseFile = (fileName) => {
  const sourceCode = fs.readFileSync(fileName, 'utf-8')

  const parsed = esprima.parse(sourceCode)

  const featuresAndScenarios = parsed.body
    .filter(statement => statement.type === 'ExpressionStatement')
    .filter(statement => statement.expression.type === 'CallExpression')
    .map(statement => {
      const type = statement.expression.callee.name
      const title = _first(statement.expression.arguments).value

      if (!title) {
        return { type }
      }

      return Object.assign({
        type
      }, utils.parseTags(title))
    })

  return featuresAndScenarios
}

module.exports = {
  /**
   * Find all codeceptjs feature files using the given
   * glob pattern and extract features/scenarios
   */
  parseFeatureFiles (globPattern) {
    return new Promise((resolve, reject) => {
      glob(globPattern, {}, (err, files) => {
        if (err) return reject(err)

        const result = files.map(f => ({
          file: f,
          parsed: parseFile(f)
        }))

        return resolve(result)
      })
    })
  }
}

