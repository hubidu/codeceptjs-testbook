const process = require('process')

/**
 * Log event data to console
 */
function log (evtName, evt = {}) {
  console.log(evtName, JSON.stringify(evt))
}

/**
 * MD5 hash a string
 */
function hash (str) {
  var crypto = require('crypto')
  return crypto.createHash('md5').update(str).digest('hex')
}

/**
 * Strip current working directory from file path
 * @param  {[type]} filePath [description]
 * @return {[type]}          [description]
 */
function stripCwd (filePath) {
  return '.' + filePath.replace(process.cwd(), '')
}

/**
 * Extract tags from the given string and remove them
 */
function parseTags (str) {
  let tags = str.match(/(@\w+\W)/g) || []
  tags = tags.map(t => t.trim()).map(t => t.replace('@', ''))

  let title = str
  tags.forEach(t => (title = title.replace(`@${t}`, '').trim()))

  return {
    tags,
    originalTitle: str,
    title
  }
}

module.exports = {
  hash,
  log,
  stripCwd,
  parseTags
}
