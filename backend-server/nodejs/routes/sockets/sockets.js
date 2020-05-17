var socketio = require('socket.io')

module.exports.listen = function(server) {
  let io = socketio.listen(server);
  RoomStates = {};

  function getPlayerBySocket(roomID, socketID) {
    const player = RoomStates[roomID].players.find(player => player.socket == socketID);
    console.log('found player by socket: ' + JSON.stringify(player));
    return player;
  }

  function startHunt(huntId) {
    console.log('start hunt func');

    let count = 5;
    let roomID = huntId;

    let countdown = setInterval(function() {
      RoomStates[roomID].status = 'Hunt starting in ' + count + '...';
      
      io.in(roomID).emit('update', {
        status: RoomStates[roomID].status
      });

      if (count === 0) {
        RoomStates[roomID].status = 'Hunt in progress';
        io.in(roomID).emit('update', {
          status: 'GO!!!'
        });
        clearInterval(countdown);
      }

      count--;
    }, 1000);

    count--;
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

      if (room == undefined) {
        // Room does not exist

        // Populate the state data structure
        RoomStates[huntID] = {
          status: 'Waiting for all players to be ready',
          players: [{
            name: data.player.name,
            isReady: false,
            socket: socket.id
          }]
        };
      }

      // join the room
      socket.join(huntID);

      // Notify everyone in the room that a new player joined
      // TODO: update this so everyone except the new player receives the message
      //socket.to(huntID).emit('playerJoin', JSON.stringify({
      io.in(huntID).emit('playerJoin', JSON.stringify({
        name: player.name,
        ready: false
      }));

      // Send the playerlist to the new player
      socket.emit('update', {
        players: RoomStates[huntID].players.map((player) => {
          return {
            name: player.name,
            isReady: player.isReady
          }
        })
      })

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

    // Player is Ready
    socket.on('ready', () => {
      // get the rooms that this player is in
      let rooms = Object.keys(socket.rooms).filter(item => item!=socket.id);
      let player = getPlayerBySocket(rooms[0], socket.id);

      // Acknowledge player ready
      socket.emit('update', {
        isReady: true
      })

      // Notify the room that the player is ready
      io.in(rooms[0]).emit('playerReady', {
        name: player.name,
        isReady: true
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

