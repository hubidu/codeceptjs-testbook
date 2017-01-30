const path = require('path')
const codeceptRunner = require('./src/codeceptjs/runner')
const commands = require('./src/commands')

var app = require('express')()

// Add routes
require('./src/api')(app)

/**
 * Start the web server
 */
const server = app.listen(3000, function () {
  console.log('Edit your testbook on http://localhost:3000/')
})

/**
 * Start the websocket server
 */
const io = require('socket.io')(server)

io.on('connection', function (socket) {
  console.log('New socket connection with id', socket.id)

  codeceptRunner.subscribe(socket)
  commands.attach(socket)

  socket.on('disconnect', () => {
    console.log('Socket connection closed ', socket.id)
    commands.detach(socket)
    codeceptRunner.unsubscribe(socket)
  })
})
