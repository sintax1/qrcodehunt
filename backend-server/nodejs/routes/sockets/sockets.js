var socketio = require('socket.io')

module.exports.listen = function(server) {
  let io = socketio.listen(server);

  io.on('connection', (socket) => {
    console.log('websocket connection');
    socket.emit('test', 'test');

    socket.on('test', (data) => {
      console.log('test: ' + data);
    });
  });

  return io;
}

