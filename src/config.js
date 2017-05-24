const mkdirp = require('mkdirp')
const fs = require('fs')
const path = require('path')

const CONFIG_FILE = path.join(process.cwd(), `/.testbook/testbook.config.js`)
const DEFAULT_CONFIG = {
  settings: {
    outputDir: './.testbook',

    // Keep last n testrun directories
    keepLast: 3
  },

  /**
   * Values will be set as NODE_ENV environment variable
   */
  environments: {
    production: {
      display: 'Production Site'
    },
    integration: {
      display: 'Integration Site'
    }
  },

  /**
   * Values will be set as DEVICE environment variable
   */
  devices: {
    desktop: {
      screenSize: '1900x800'
    }
  }
}

const CONFIG_FILE_TEMPLATE = `
        module.exports = {

          environments: {
            production: {
              display: 'Production Site'
            },
            integration: {
              display: 'Integration Site'
            }
          },

          devices: {
            desktop: {
              screenSize: '1900x800'
            }
          }

        }
`

module.exports = {
  get () {
    if (!fs.existsSync(CONFIG_FILE)) {
      mkdirp('./.testbook')
      // Create a default config
      fs.writeFile(CONFIG_FILE, CONFIG_FILE_TEMPLATE)

      return Object.assign({}, DEFAULT_CONFIG)
    } else {
      const cfg = require(CONFIG_FILE)

      return Object.assign({}, DEFAULT_CONFIG, cfg)
    }
  }
}
