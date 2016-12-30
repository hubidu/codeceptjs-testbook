const codeceptRunner = require('./src/codeceptjs/runner');
const commands = require('./src/commands');

var app = require('express')();

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
})

app.get('/screenshots/:fileName', function (req, res) {
  res.sendFile(process.cwd() + '/.testbook/' + req.params.fileName);
})


/**
 * Start the web server
 */
const server = app.listen(3000, function () {
  console.log('Edit your testbook on http://localhost:3000/')
})

/**
 * Start the websocket server
 */
const io = require('socket.io')(server);

io.on('connection', function(socket) {
    console.log('New socket connection with id', socket.id);

    codeceptRunner.subscribe(socket);
    commands.attach(socket);

    socket.on('disconnect', () => {
      console.log('Socket connection closed ', socket.id);
      commands.detach(socket);
      codeceptRunner.unsubscribe(socket);
    });
});
