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
    const host = 'http://' + req.query.host + '/'

    function isRelPath (path) {
      return path.indexOf('//') < 0 && path.indexOf('http') < 0
    }

    const htmlFileName = path.join(process.cwd(), '.testbook', req.params.runId, req.params.fileName)
    let $ = cheerio.load(fs.readFileSync(htmlFileName))

    // Convert links
    $('link').map(function (index, el) {
      const href = $(this).attr('href')
      if (!href) return
      if (isRelPath(href)) $(this).attr('href', host + href)
    })
    $('img').map(function (index, el) {
      const src = $(this).attr('src')
      if (!src) return
      if (isRelPath(src)) $(this).attr('src', host + src)
    })
    $('script').map(function (index, el) {
      const src = $(this).attr('src')
      if (!src) return
      if (isRelPath(src)) $(this).attr('src', host + src)
    })

    const selectorElements = $(selector)
                              .css('border', '2px solid red')
                              .prepend(`<div style="position:relative; color: white; background-color: red ">${selector}</div>`)

    let html = $.html()
    if (selectorElements.length === 0) {
      console.log('Looking for selector in text', selector)
      html = html.replace(new RegExp(selector, 'g'), `<strong style="border: 2px solid red">${selector}</strong>`)
    }

    res.send(html)
  })
}
