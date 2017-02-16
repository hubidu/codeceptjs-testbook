const path = require('path')
const spawn = require('child_process').spawn
const exec = require('child_process').exec

class CodeceptCtrl {
  constructor (environment, device, port) {
    // TODO Mix in process environment???
    this.env = {
      NODE_ENV: environment,
      DEVICE: device,
      PORT: port
    }

    this.cmd = 'node'
    this.cmd_opts = [
      './node_modules/codeceptjs/bin/codecept.js',
      'run',
      '--reporter', path.join(__dirname, './testbook-reporter.js').replace(/\\/g, '\\\\'),
      '-o',
      this.codeceptOptions,
      '--sort',
      '--debug' // Debug is of no use since using a custom reporter will disable all other output

      // '--grep', '@UserConvert'
    ]
    this.proc = undefined
  }

  /**
   * Add custom helpers by overriding the codeceptjs config on command line
   */
  get codeceptOptions () {
    // TODO: Override/ Add webdriver port per device
    return JSON.stringify({
      helpers: {
        WebDriverIO: {
          port: this.env.PORT
        },
        ScreenshotHelper: {
          require: path.join(__dirname, './helpers/screenshot-helper.js').replace(/\\/g, '\\\\')
        },
        MetaHelper: {
          require: path.join(__dirname, './helpers/meta-helper.js').replace(/\\/g, '\\\\')
        },
        ErrorHelper: {
          require: path.join(__dirname, './helpers/error-helper.js').replace(/\\/g, '\\\\')
        }
      }
    })
  }

  start () {
    console.log(`Running codeceptjs`, this.cmd, this.cmd_opts)
    this.proc = spawn(this.cmd, this.cmd_opts, {
      detached: true,
      env: Object.assign({}, process.env, this.env)
    })

    return this.proc
  }

  stop () {
    const os = require('os')
    const ps = require('process')
    if (os.platform() === 'win32') {
      exec('taskkill /pid ' + this.proc.pid + ' /T /F')
    } else {
      ps.kill(this.proc.pid)
    }
  }

}

module.exports = CodeceptCtrl
