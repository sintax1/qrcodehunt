var socketio = require('socket.io')
const { Hunt } = require('../../models/QRHunt');
const { getPhotoById } = require('../api/photo');


function getTimestamp() {

  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min  = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  var sec  = date.getSeconds();
  sec = (sec < 10 ? "0" : "") + sec;

  return hour + ":" + min + ":" + sec;
}


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
    return {
      stepid: RoomStates[roomID].players[playerID].step,
      hintid: RoomStates[roomID].players[playerID].hint
    }
  }

  async function sendPlayerHint(roomID, playerID, timer) {
    console.log(getTimestamp() + ' sendPlayerHint: ' + playerID + ', timer: ' + timer)
    const { hintid, stepid } = getPlayerStepHint(roomID, playerID);
    let socket = RoomStates[roomID].players[playerID].socket;

    console.log(1);
 
    if (timer == 0) {
      console.log(2);
      // Reset timer
      timer = RoomStates[roomID].hunt.timer;

      await getPlayerHint(roomID, stepid, hintid)
      .then(hint => {
        console.log(3);
        // Send the hint
        socket.emit('hint', {
          hint: hint
        });
        // Increment player hint
        RoomStates[roomID].players[playerID].hint++;
      });

      console.log(4);

      // Last hint, stop loop
      if (hintid >= 2) {
        console.log(5);
        socket.emit('update', {
          status: 'Last hint. Find the code!'
        })
        return null;
      } else {
        console.log(6);
        socket.emit('update', {
          status: 'You have ' + timer + ' ' + ((timer > 1) ? 'minutes' : 'minute') + ' until your next hint...',
          message: 'Use the hints to find and scan the hidden code.'
        })
      }
    } else {
      console.log(7);
      socket.emit('update', {
        status: 'You have ' + timer + ' ' + ((timer > 1) ? 'minutes' : 'minute') + ' until your next hint...',
        message: 'Use the hints to find and scan the hidden code.'
      })
    }

    timer -= 1;

    // Set time for the next hint
    RoomStates[roomID].players[playerID].hintTimeout = setTimeout(() => {
      console.log(8);
      // Send the next available hint to the player
      console.log('scheduling next timer: ' + playerID + ', ' + timer);
      sendPlayerHint(roomID, playerID, timer);
    }, 60000);
  };

  async function getPlayerHint(roomID, stepid, hintid) {
    return RoomStates[roomID].hunt.steps[stepid].hints[hintid];
  }

  function playerExistsInRoom(roomID, playerID) {
    return playerID in RoomStates[roomID].players;
  }

  function roomIsEmpty(roomID) {
    return (RoomStates[roomID].players.length <= 0);
  }

  async function removePlayerFromRoom(roomID, playerID) {
    console.log('removePlayerFromRoom: ' + roomID + ', ' + playerID)
    delete RoomStates[roomID].players[playerID];
  }

  function updatePlayerReady(roomID, playerID, isReady) {
    return RoomStates[roomID].players[playerID].isReady = isReady;
  }

  function getPlayerBySocket(roomID, socketID) {
    //console.log('getPlayerBySocket: ' + roomID + ', ' + socketID);

    try {
      const player = RoomStates[roomID].players.find(player => player.socket.id == socketID);
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
      RoomStates[roomID].status = 'Hunt starts in ' + count + '...';
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

  function updatePlayerSocket(playerID, roomID, socket) {
    try {
      console.log('updating the player socket: ' + playerID + ', ' + socket.id);
      RoomStates[roomID].players[playerID].socket = socket;
    } catch (err) {
      console.log(err);
      socket.emit('error', {
        error: 'Server Error'
      })
    }
    
  }

  io.on('connection', (socket) => {
    socket.emit('connected');
    console.log('connected');

    // Reconnect
    socket.on('player-reconnected', (data) => {
      console.log('reconnect: ' + JSON.stringify(data));
      let huntID = data.hunt;
      let player = data.player;

      // re-join the player to the room
      socket.join(huntID);

      // TODO: is this necessary?
      updatePlayerSocket(player.id, huntID, socket)
    });


    // Disconnect
    socket.on('disconnect', () => {
      console.log('Disconnect: ' + socket.id);
    });

    // A player is leaving the Hunt
    socket.on('leaveHunt', (data) => {
      console.log('leaveHunt: ' + JSON.stringify(data));

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
    socket.on('joinReq', (data) => {
      console.log('joinReq: ' + JSON.stringify(data));
      let huntID = data.id;
      let player = data.player;

      // Don't let the player in if the Hunt is already in progress and they weren't in it before
      if ((huntID in RoomStates) && RoomStates[huntID].inProgress && !playerExistsInRoom(huntID, player.id)) {
        socket.emit('update', {
          message: 'Hunt already in progress. Wait until it\'s over or join a different Hunt.'
        });
      } else {
        socket.emit('joinAck', {
          hunt: huntID
        });
      }
    });

    // New player joined Hunt
    socket.on('joinHunt', (data) => {
      console.log('New player: ' + JSON.stringify(data));

      let huntID = data.id;
      let player = data.player;

      // Room does not exist
      if (io.sockets.adapter.rooms[huntID] == undefined) {
        
        // Populate the state data structure
        RoomStates[huntID] = {
          status: 'Waiting for all players to be ready',
          hunt: null,
          inProgress: false,
          players = {
            [player.id]: {
              name: player.name,
              isReady: false,
              socket: socket,
              step: 0,
              hint: 0,
              interval: null,
              stepSequence = []
            }
          }
        };

        // Populate the room with the Hunt Steps and Hints
        getHuntData(huntID)
        .then(hunt => {
          RoomStates[huntID].hunt = hunt;
        });

      } else { // Room already exists
        
        // Add player to existing room if they aren't already in it
        if (!playerExistsInRoom(huntID, player.id)) {
          RoomStates[huntID].players[data.player.id] = {
            name: data.player.name,
            isReady: false,
            socket: socket,
            step: 0,
            hint: 0,
            interval: null,
            stepSequence: []
          }
        } else {
          // Player is already in the room
          updatePlayerSocket(player.id, huntID, socket);
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
        Object.keys(RoomStates[huntID].players).map((key, idx) => {
          return {
            name: RoomStates[huntID].players[key].name,
            isReady: RoomStates[huntID].players[key].isReady
          }
        })
      );

      socket.emit('update', {
        status: RoomStates[huntID].status
      })

      // Hunt is already in progress, just have player join
      if(RoomStates[huntID].inProgress) {
        socket.emit('beginHunt');
      }

    });

    // Listen for messages
    // 

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

      // Clear previous timer
      clearTimeout(RoomStates[roomID].players[playerID].hintTimeout);

      // Send the next available hint to the player
      sendPlayerHint(roomID, player.id, 0);
    });

    // Verify code
    socket.on('code', (data) => {
      console.log('code: ' + JSON.stringify(data));
      let rooms = Object.keys(socket.rooms).filter(item => item!=socket.id);
      let roomID = huntID = rooms[0];
      let player = getPlayerBySocket(roomID, socket.id);
      let stepid = RoomStates[roomID].players[player.id].step;
      let qrcode = RoomStates[roomID].hunt.steps[stepid].qrcode;

      console.log('Comparing ' + qrcode + ' and ' + data.code);

      if (qrcode == data.code) {
        // Player submitted the correct QR Code

        // Clear previous timer
        console.log('clearing timer')
        clearTimeout(RoomStates[roomID].players[player.id].hintTimeout);

        if (stepid >= RoomStates[roomID].hunt.steps.length-1) {
          // Player just completed the last step
          socket.emit('update', {
            status: 'Congratulations. You completed the Hunt!'
          })
          // Send the finish signal
          socket.emit('fin');

        } else {
          // Increment the players current step and reset hint number to 0
          RoomStates[roomID].players[playerID].step++
          RoomStates[roomID].players[playerID].hint=0

          // Update the players message
          socket.emit('update', {
            status: 'Nice Job! Here comes your next Hint...'
          })

          setTimeout(() => {
            // Send the next available hint to the player
            sendPlayerHint(roomID, player.id, 0);
          }, 2000);
        }
      } else {
        // Incorrect code
        socket.emit('update', {
          status: 'Try Again!'
        })
      }
    })
  });


  return io;
}

