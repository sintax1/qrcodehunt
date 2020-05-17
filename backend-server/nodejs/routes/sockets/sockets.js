var socketio = require('socket.io')

module.exports.listen = function(server) {
  let io = socketio.listen(server);

  io.on('connection', (socket) => {
    console.log('websocket connection');
    socket.emit('connected');

    socket.on('joinHunt', (data) => {
      console.log('joinHunt: ' + data);
    });
  });

  return io;
}

