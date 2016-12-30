const codeceptRunner = require('../codeceptjs/runner');

const cmdRunTests = () => {
  codeceptRunner.run();
}

module.exports = {
  attach: (socket) => {
    socket.on('cmd.run', cmdRunTests);
  },

  detach: (socket) => {
    socket.removeListener('cmd.run', cmdRunTests);
  }
}
