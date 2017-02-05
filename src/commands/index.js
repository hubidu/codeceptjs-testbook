const codeceptRunner = require('../codeceptjs/runner')

const cmdRunTests = (options) => {
  codeceptRunner.run(options)
}

const cmdStopTests = () => {
  codeceptRunner.stop()
}

const cmdRunContinuously = () => {
  codeceptRunner.run({ continuous: true, interval: 60000 })
}

module.exports = {
  attach: (socket) => {
    socket.on('cmd.run-continuously', cmdRunContinuously)
    socket.on('cmd.run', cmdRunTests)
    socket.on('cmd.stop', cmdStopTests)
  },

  detach: (socket) => {
    socket.removeListener('cmd.run-continuously', cmdRunTests)
    socket.removeListener('cmd.run', cmdRunTests)
    socket.removeListener('cmd.stop', cmdRunTests)
  }
}
