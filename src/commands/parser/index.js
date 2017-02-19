const glob = require('glob')
const esprima = require('esprima')
const fs = require('fs')

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
    .map(statement => ({
      name: statement.expression.callee.name,
      arg: _first(statement.expression.arguments).value
    }))

  return featuresAndScenarios
}

module.exports = {
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

