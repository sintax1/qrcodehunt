var socketio = require('socket.io')
const { Hunt } = require('../../models/QRHunt');

module.exports.listen = function(server) {
  let io = socketio.listen(server);
  RoomStates = {};

  // Populate the room state with hunt data
  async function getHuntData(huntID) {
    return await Hunt.findById(huntID, (err, doc) => {
        if (err) {
          console.log(err);
        }
        console.log('doc: ' + JSON.stringify(doc))
        return processSteps(doc).then(hunt => {
          console.log('processed: ' + JSON.stringify(hunt));
          return hunt;
        })
    });
  }

  // format Steps/Hints and randomize, if necessary
  async function processSteps(hunt) {
    hunt.steps.forEach(function(step, sid, steps) {
      steps[sid].hints.forEach(function(hint, hid, hints) {
        console.log('hint: ' + JSON.stringify(hint));
      });
    });
    return hunt;
  }

  async function getPlayerHint(roomID, playerID) {
    let step = 1;
    let hint = 1;

    console.log('getPlayerHint: ' + JSON.stringify(RoomStates[roomID].hunt));

    for (var i in RoomStates[roomID].players) {
      if (RoomStates[roomID].players[i].id == playerID) {
          step = RoomStates[roomID].players[i].step;
          hint = RoomStates[roomID].players[i].hint;

          console.log('step: ' + step);
          console.log('hint: ' + hint);

          console.log('getPlayerHint.steps: ' + JSON.stringify(RoomStates[roomID].hunt.steps));
          console.log('getPlayerHint.hints: ' + JSON.stringify(RoomStates[roomID].hunt.steps[step].hints));
          console.log('getPlayerHint.hint: ' + JSON.stringify(RoomStates[roomID].hunt.steps[step].hints[hint]));

          //TODO: Check if player reached last hint/step
          return RoomStates[roomID].hunt.steps[step].hints[hint];
      }
    }
  }

  /*
  function playerExistsInRoom(roomID, playerID) {
    for (var i in RoomStates[roomID].players) {
      if (RoomStates[roomID].players[i].id == playerID) {
          return true;
      }
    }
    return false;
  }
  */

  function roomIsEmpty(roomID) {
    return !RoomStates[roomID].players.length > 0;
  }

  async function removePlayerFromRoom(roomID, playerID) {
    for (var i in RoomStates[roomID].players) {
      if (RoomStates[roomID].players[i].id == playerID) {
          // Remove the player
          delete RoomStates[roomID].players[i];
          return true;
      }
    }
    
    throw Error(playerID + " not found in " + roomID);
  }

  function updatePlayerReady(roomID, playerID, isReady) {
    for (var i in RoomStates[roomID].players) {
      if (RoomStates[roomID].players[i].id == playerID) {
          RoomStates[roomID].players[i].isReady = isReady;
          break;
      }
    }
  }

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

        io.in(roomID).emit('beginHunt');
      }

      count--;
    }, 1000);
  }

  

  io.on('connection', (socket) => {
    console.log('websocket connection');
    socket.emit('connected');

    // Disconnect
    socket.on('disconnect', () => {
      console.log('Disconnect: ' + socket.id);
    });

    // Leave
    socket.on('leave', (data) => {
      console.log("Leave: " + JSON.stringify(data));
    });

    // Player left the Hunt
    socket.on('leaveHunt', (data) => {
      let roomID = data.id;
      let player = data.player;

      removePlayerFromRoom(roomID, player.id)
        .then(res => {
          //TODO: socket.to(roomID).emit('playerReady', JSON.stringify({
          io.in(roomID).emit('playerLeft', JSON.stringify({
            name: player.name
          }))
        })
        .catch(err => {
          console.log(err)
        })
        .then(() => {
          // Leave the room
          socket.leave(roomID);
        })
        .then(() => {
          // Delete the room if this was the last player in it
          if (roomIsEmpty(roomID)) {
            console.log("Room " + roomID + " is empty.");
            delete RoomStates[roomID];
          }
          return true;
        });
    });

    // New player joined Hunt
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
          hunt: null,
          players: [{
            id: data.player.id,
            name: data.player.name,
            isReady: false,
            socket: socket.id,
            step: 1,
            hint: 1
          }]
        };

        // Populate the room with the Hunt Steps and Hints
        getHuntData(huntID).then(hunt => {
          console.log('processed hunt: ' + JSON.stringify(hunt));
          RoomStates[huntID].hunt = hunt;
        });

      } else {
        // Add player to existing room
        // Todo: Avoid pushing a duplicate entry by first checking if one exists.
        /*
        if (playerExistsInRoom()) {
          RoomStates[huntID].players.push({
            name: data.player.name,
            isReady: false,
            socket: socket.id
          })
        }
        */
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
      socket.emit('players',
        RoomStates[huntID].players.map((player) => {
          return {
            name: player.name,
            isReady: player.isReady
          }
        })
      )

      console.log('joinHunt: ' + JSON.stringify(data));
    });

    // Listen for general messages
    // 
    
    // Get the Hunt Status
    socket.on('getStatus', () => {
      // get the rooms that this player is in
      let rooms = Object.keys(socket.rooms).filter(item => item!=socket.id);

      // Send the status of the room
      socket.emit('update', {
        status: RoomStates[rooms[0]].status
      })
    });

    // Player Ready
    socket.on('ready', () => {
      // get the rooms that this player is in
      let rooms = Object.keys(socket.rooms).filter(item => item!=socket.id);
      let roomID = huntID = rooms[0];
      let player = getPlayerBySocket(roomID, socket.id);

      updatePlayerReady(roomID, player.id, true);

      // Acknowledge player ready
      socket.emit('update', {
        isReady: true
      })

      // Notify the room that the player is ready
      // TODO: update this so everyone except the new player receives the message
      //socket.to(roomID).emit('playerReady', JSON.stringify({
      io.in(roomID).emit('playerReady', JSON.stringify({
        name: player.name,
        isReady: true
      }))

      console.log('RoomStates[roomID].players: ' + JSON.stringify(RoomStates[roomID].players));

      let ready = Object.values(RoomStates[roomID].players)
        .reduce((result, { isReady }) => result && isReady, true);

      console.log('all players ready: ' + ready);

      if (ready) {
        console.log('Not waiting on any players. start the hunt.')

        RoomStates[roomID].status = 'All players are ready!';

        io.in(roomID).emit('update', {
          status: RoomStates[roomID].status
        });

        setTimeout(() => {
          startHunt(huntID);
        }, 2000);
      }
    });

    // ws messages used while Hunt is in progress

    // Get a Hint
    socket.on('getHint', () => {
      console.log('getHint');

      // get the rooms that this player is in
      let rooms = Object.keys(socket.rooms).filter(item => item!=socket.id);
      let roomID = rooms[0];
      let player = getPlayerBySocket(roomID, socket.id);

      // Send the next available hint to the player
      getPlayerHint(roomID, player.id)
      .then(hint => {
        console.log('Got a hint for player: ' + JSON.stringify(hint));
        socket.emit('hint', {
          hint: hint
        })
      })
      
    });
  });


  return io;
}

