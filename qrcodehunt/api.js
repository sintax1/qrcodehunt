import openSocket from 'socket.io-client';

const url = process.env.SERVER_URL || 'http://192.168.7.253:3000';

const socket = openSocket(url);

function subscribeToTest(cb) {
  socket.on('test', data => {
      console.log('ws rcvd: ' + data);
      cb(null, data)
  });
  socket.emit('subscribeToTest', 1000);
}

export { subscribeToTest };