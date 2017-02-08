const commands = require('./src/commands')
const eventProxy = require('./src/event-proxy')
require('./src/email-reporter')({})

var app = require('express')()

// API routes
require('./src/api')(app)

/**
 * Start the web server
 */
const server = app.listen(3000, function () {
  console.log('testbook server running on http://localhost:3000/')
})

/**
 * Start the websocket server
 */
const io = require('socket.io')(server)
const sockets = {}

eventProxy.proxyEvents(sockets)

io.on('connection', function (socket) {
  console.log('New socket connection #', socket.id)
  sockets[socket.id] = socket

  commands.attach(socket)

  socket.on('disconnect', () => {
    console.log('Socket connection closed #', socket.id)
    commands.detach(socket)
    delete sockets[socket.id]
  })
})

process.on('uncaughtException', (error) => {
  console.log('UNHANDLED EXCEPTION', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
  console.log('UNHANDLED REJECTION', reason, p)
})
