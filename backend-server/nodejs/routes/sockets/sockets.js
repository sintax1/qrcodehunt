var socketio = require('socket.io')
const { Hunt } = require('../../models/QRHunt');
const { getPhotoById } = require('../api/photo');

// Get Hunt Data from the DB
async function getHuntData(huntID) {
  let hunt = await Hunt.findById(huntID, undefined, {lean: true}, (err, doc) => {
      if (err) {
        console.log(err);
      }
      return doc;
  });

  // Populate hunt hint photos
  hunt.steps.forEach(async function(step, sid, steps) {
    Object.keys(steps[sid].hints).forEach(async function(hid) {
      steps[sid].hints[hid].photo = await getPhotoById(steps[sid].hints[hid].photo);
    });
  });

  return hunt;
}

module.exports.listen = function(server) {
  let io = socketio.listen(server);
  RoomStates = {};

  function allPlayersReady(roomID) {
    console.log('checking ready status');
    let ready = Object.values(RoomStates[roomID].players)
      .reduce((result, { isReady }) => result && isReady, true);
    return ready;
  }

  function getPlayerStepHint(roomID, playerID) {
    let stepid = 0;
    let hintid = 0;

    for (var i in RoomStates[roomID].players) {
      if (RoomStates[roomID].players[i].id == playerID) {
        stepid = RoomStates[roomID].players[i].step;
        hintid = RoomStates[roomID].players[i].hint;
      }
    }

    return { stepid: stepid, hintid: hintid }
  }

  async function sendPlayerHint(socket, roomID, playerID) {
    const { hintid, stepid } = getPlayerStepHint(roomID, playerID);
    let timer = RoomStates[roomID].hunt.timer;

    console.log('sendPlayerHint stepid: ' + stepid + ', hintid: ' + hintid);

    if (hintid < 3) {
      getPlayerHint(roomID, stepid, hintid)
      .then(hint => {
        socket.emit('hint', {
          hint: hint
        })
      })
      .then(() => {
        socket.emit('update', {
          status: 'You have ' + timer + ' ' + ((timer > 1) ? 'minutes' : 'minute') + ' until your next hint...',
          message: 'Use the hints to find and scan the hidden code.'
        })
      })

      // Increment player hint
      console.log("increment player hint")
      for (var i in RoomStates[roomID].players) {
        if (RoomStates[roomID].players[i].id == playerID) {
          RoomStates[roomID].players[i].hint++;
          console.log("hint: " + RoomStates[roomID].players[i].hint)
        }
      }

      console.log('Setting timer: ' + timer);

      let countdown = setInterval(() => {
        console.log('timer: ' + timer);
        timer -= 1;
        if (timer <= 0) {
          clearInterval(countdown);
        } else {
          socket.emit('update', {
            status: 'You have ' + timer + ' ' + ((timer > 1) ? 'minutes' : 'minute') + ' until your next hint...',
          })
        }
      }, 60000);

      console.log("Settimerout for next hint");

      // Set time for the next hint
      setTimeout(() => {
        sendPlayerHint(socket, roomID, playerID);
      }, timer * 60000);
    } else {
      socket.emit('update', {
        status: 'No more hints. Find the code!'
      })
    }
  }

  async function getPlayerHint(roomID, stepid, hintid) {
    return RoomStates[roomID].hunt.steps[stepid].hints[hintid];
  }

  function playerExistsInRoom(roomID, playerID) {
    for (var i in RoomStates[roomID].players) {
      if (RoomStates[roomID].players[i].id == playerID) {
          return true;
      }
    }
    return false;
  }

  function roomIsEmpty(roomID) {
    return (RoomStates[roomID].players.length <= 0);
  }

  async function removePlayerFromRoom(roomID, playerID) {
    for (var i in RoomStates[roomID].players) {
      if (RoomStates[roomID].players[i].id == playerID) {
          // Remove the player
          RoomStates[roomID].players.splice(i, 1);
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
    console.log('getPlayerBySocket: ' + roomID + ', ' + socketID);

    try {
      const player = RoomStates[roomID].players.find(player => player.socket == socketID);
      console.log(player);
      return player;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  function startHunt(huntId) {
    console.log('start hunt func');

    let count = 5;
    let roomID = huntId;

    let countdown = setInterval(function() {
      RoomStates[roomID].status = 'Hunt starting in ' + count + '...';
      RoomStates[roomID].inProgress = true;
      
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

  function updatePlayerSocket(playerID, socketID) {
    for (var i in RoomStates[roomID].players) {
      if (RoomStates[roomID].players[i].id == playerID) {
          RoomStates[roomID].players[i].socket = socketID;
          break;
      }
    }
  }

  io.on('connection', (socket) => {
    socket.emit('connected');
    console.log('connected');

    // Disconnect
    socket.on('disconnect', () => {
      console.log('Disconnect: ' + socket.id);
    });

    // A player is leaving the Hunt
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
      console.log('New player: ' + JSON.stringify(data));

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
          inProgress: false,
          players: [{
            id: player.id,
            name: player.name,
            isReady: false,
            socket: socket.id,
            step: 0,
            hint: 0
          }]
        };

        // Populate the room with the Hunt Steps and Hints
        getHuntData(huntID).then(hunt => {
          RoomStates[huntID].hunt = hunt;
        });

      } else {
        // Add player to existing room
        if (!playerExistsInRoom(huntID, player.id)) {
          RoomStates[huntID].players.push({
            id: data.player.id,
            name: data.player.name,
            isReady: false,
            socket: socket.id,
            step: 0,
            hint: 0
          })
        } else {
          // Player is already in the room
          console.log('Player was already in room before')
          console.log('update player socket')
          updatePlayerSocket(player.id, socket.id);
          socket.emit('beginHunt');
        }

      }

      // join the room
      socket.join(huntID);

      // Notify everyone in the room that a new player joined
      // TODO: update this so everyone except the new player receives the message
      //socket.to(huntID).emit('playerJoin', JSON.stringify({
      io.in(huntID).emit('playerJoin', JSON.stringify({
        name: player.name,
        isReady: false
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
    });

    // Listen for messages
    // 
    
    // Get the Hunt Status
    socket.on('getStatus', () => {
      // get the rooms that this player is in
      let rooms = Object.keys(socket.rooms).filter(item => item!=socket.id);

      console.log('getStatus: ' + JSON.stringify(rooms[0]));

      // Send the status of the room
      socket.emit('update', {
        status: RoomStates[rooms[0]].status
      })
    });

    // Player Ready
    socket.on('ready', () => {
      console.log('ready');
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

      if (allPlayersReady(roomID)) {
        console.log('All players are ready. start the hunt.')

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
      sendPlayerHint(socket, roomID, player.id);

    });

    // Verify code
    socket.on('code', (data) => {
      console.log('code: ' + JSON.stringify(data));
      let rooms = Object.keys(socket.rooms).filter(item => item!=socket.id);
      let roomID = huntID = rooms[0];
      let player = getPlayerBySocket(roomID, socket.id);
      let invalid = true;

      for (var i in RoomStates[roomID].players) {
        if (RoomStates[roomID].players[i].id == player.id) {
          stepid = RoomStates[roomID].players[i].step;

          //TODO: Check if player reached last hint/step
          let qrcode = RoomStates[roomID].hunt.steps[stepid].qrcode;

          console.log('Comparing ' + qrcode + ' and ' + data.code);

          if (qrcode == data.code) {
            // Player submitted the correct QR Code
            invalid = false;

            if (stepid >= RoomStates[roomID].hunt.steps.length-1) {
              // Player just completed the last step
              socket.emit('update', {
                status: 'Congratulations. You completed the Hunt!'
              })
              // Send the finish signal
              socket.emit('fin');

            } else {
              // Increment the players current step and reset hint number to 0
              RoomStates[roomID].players[i].step++
              RoomStates[roomID].players[i].hint=0

              // Update the players message
              socket.emit('update', {
                status: 'Nice Job! Here comes your next Hint...'
              })

              setTimeout(() => {
                // Send the next available hint to the player
                sendPlayerHint(socket, roomID, player.id);
              }, 2000);
            }
          }
        }
      }

      if (invalid) {
        socket.emit('update', {
          status: 'Try Again!'
        })
      }
    })
  });


  return io;
}

