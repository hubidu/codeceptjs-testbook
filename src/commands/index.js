const sendInitialState = require('./send-initial-state')

const codeceptRunner = require('../codeceptjs/parallel-runner')

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

    sendInitialState(socket)
  },

  detach: (socket) => {
    socket.removeListener('cmd.run-continuously', cmdRunTests)
    socket.removeListener('cmd.run', cmdRunTests)
    socket.removeListener('cmd.stop', cmdRunTests)
  }
}
