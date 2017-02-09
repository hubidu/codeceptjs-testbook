const path = require('path')

const commands = require('./src/commands')
const eventProxy = require('./src/event-proxy')
require('./src/email-reporter')({})

const express = require('express')
const app = express()
app.use(express.static(path.join(__dirname, 'testbook-app/dist')))

// API routes
require('./src/api')(app)

/**
 * Start the web server
 */
const server = app.listen(3333, function () {
  console.log('Your <testbook/> server is running on http://localhost:3333/')
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
