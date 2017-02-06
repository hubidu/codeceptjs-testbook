const path = require('path')
const spawn = require('child_process').spawn

class CodeceptCtrl {
  constructor () {
    /**
     * Run codeceptjs out-of-process and read events from stdout
     */
    // TODO Actually I would rather invoke codeceptjs directly
    this.cmd = 'node'
    this.cmd_opts = [
      './node_modules/codeceptjs/bin/codecept.js',
      'run',
      '--reporter', path.join(__dirname, './testbook-reporter.js').replace(/\\/g, '\\\\'),
      '-o',
      this.codeceptOptions,
      '--sort',
      '--debug'

      // '--grep', '@UserConvert'
    ]
    this.proc
  }

  /**
   * Add custom helpers by overriding the codeceptjs config on command line
   */
  get codeceptOptions () {
    // TODO: Override/ Add webdriver port per device
    return JSON.stringify({
      helpers: {
        ScreenshotHelper: {
          require: path.join(__dirname, './helpers/screenshot-helper.js').replace(/\\/g, '\\\\')
        },
        MetaHelper: {
          require: path.join(__dirname, './helpers/meta-helper.js').replace(/\\/g, '\\\\')
        }
      }
    })
  }


  start () {
    this.proc = spawn(this.cmd, this.cmd_opts, {
      detached: true,
      env: process.env
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
