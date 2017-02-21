const codeceptRunner = require('./codeceptjs/parallel-runner')
const continuousRunner = require('./codeceptjs/continuous-runner')

function proxyEvents (sockets) {
  const EventTypes = codeceptRunner.eventTypes()

  EventTypes.forEach(eventType => {
    const emitSocketEvent = (eventType, payload) => {
      const socketList = Object.keys(sockets).map(k => sockets[k])

      socketList.forEach(socket => {
        console.log('PROXYING event', eventType, payload)
        socket.emit(eventType, payload)
      })
    }

    // TODO: Should also remove event listeners
    codeceptRunner.events().on(eventType, payload => emitSocketEvent(eventType, payload))
    continuousRunner.events().on(eventType, payload => emitSocketEvent(eventType, payload))
  })
}

module.exports = {
  proxyEvents
}
