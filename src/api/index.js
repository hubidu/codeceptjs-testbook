const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')


module.exports = function (app) {
  app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'))
  })

  app.get('/screenshots/:runId/:fileName', function (req, res) {
    res.sendFile(path.join(process.cwd(), '.testbook', req.params.runId, req.params.fileName))
  })

  app.get('/html-source/:runId/:fileName', function (req, res) {
    const selector = req.query.selector

    const htmlFileName = path.join(process.cwd(), '.testbook', req.params.runId, req.params.fileName)
    let $ = cheerio.load(fs.readFileSync(htmlFileName))

    let html
    if ($('body').has(selector)) {
      console.log('Found selector in body', selector)
      $(selector).css('border', '2px solid red')
      html = $.html()
    } else {
      console.log('Looking for selector in text', selector)
      html = html.replace(new RegExp(selector, 'g'), `<strong style="color: red">${selector}</strong>`)
    }

    res.send(html)
  })
}
