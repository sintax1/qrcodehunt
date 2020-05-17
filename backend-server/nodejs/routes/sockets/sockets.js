var socketio = require('socket.io')

module.exports.listen = function(server) {
  let io = socketio.listen(server);
  let RoomStates = {};

  startHunt = (huntId) => {
    console.log('start hunt func');

    let count = 5;

    setInterval(function() {
      console.log('Hunt starting in ' + count + '...');
      io.sockets.in(huntId).emit(
        'Hunt starting in ' + count + '...'
      );
      count--;
      if (count === 0) {
        console.log('Go!!!')
        io.sockets.in(huntId).emit(
          'GO!!!'
        );
      }
    }, 1000);
  }

  io.on('connection', (socket) => {
    console.log('websocket connection');
    socket.emit('connected');

    // Listen for new players that join the hunt
    socket.on('joinHunt', (data) => {
      let huntID = data.id;
      let player = data.player;

      // Check if the room already exists
      let room = io.sockets.adapter.rooms[huntID];
      let isControl = false;

      if (room == undefined) {
        // Room does not exist, this player gets to control when the hunt starts
        isControl = true;

        // Populate the state data structure
        RoomStates[huntID] = {
          controlPlayer: player.id,
          status: 'Waiting for ' + player.name + ' to start the Hunt'
        };
      } else if (player.id == RoomStates[huntID].controlPlayer) {
        // The player that just joined is the control player
        isControl = true;
      }

      // join the room
      socket.join(huntID);

      if (isControl) {
        socket.emit('update', {
          isControl: isControl
        })
      }

      // Notify everyone in the room that a new player joined
      io.sockets.in(huntID).emit('newPlayer', JSON.stringify({
        name: player.name
      }));

      console.log('joinHunt: ' + JSON.stringify(data));
    });

    // Listen for general messages
    
    socket.on('getStatus', () => {
      // get the rooms that this player is in
      let rooms = Object.keys(socket.rooms).filter(item => item!=socket.id);

      // Send the status of the room
      socket.emit('update', {
        status: RoomStates[rooms[0]].status
      })
    });

    socket.on('startHunt', () => {
      console.log('start hunt');

      // get the rooms that this player is in
      let rooms = Object.keys(socket.rooms).filter(item => item!=socket.id);

      // Start the countdown then start the hunt
      startHunt(rooms[0]);
    })
  });


  return io;
}

