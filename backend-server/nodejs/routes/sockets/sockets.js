var socketio = require('socket.io')

module.exports.listen = function(server) {
  let io = socketio.listen(server);

  io.on('connection', (socket) => {
    console.log('websocket connection');
    socket.emit('connected');

    // Listen for new players that join the hunt
    socket.on('joinHunt', (data) => {
      let huntID = data.id;
      let playerName = data.player;

      // Add this socket session to a room. Each Hunt has their own room.
      socket.join(huntID);

      // Notify everyone in the room that a new player joined
      io.sockets.in(huntID).emit('newPlayer', {
        name: playerName
      });

      console.log('joinHunt: ' + JSON.stringify(data));
    });
  });

  return io;
}

