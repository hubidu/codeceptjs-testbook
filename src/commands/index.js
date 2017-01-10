const codeceptRunner = require('../codeceptjs/runner');

const cmdRunTests = (options) => {
  codeceptRunner.run(options);
}

const cmdStopTests = () => {
  codeceptRunner.stop();
}

module.exports = {
  attach: (socket) => {
    socket.on('cmd.run', cmdRunTests);
    socket.on('cmd.stop', cmdStopTests);
  },

  detach: (socket) => {
    socket.removeListener('cmd.run', cmdRunTests);
  }
}
