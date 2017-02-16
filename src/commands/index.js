const path = require('path')
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

const sendInitialState = (socket) => {
  const cwd = process.cwd()

  const config = require(path.join(cwd, '.testbook', 'testbook.config.js'))
  socket.emit('testbook.config', config)
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
