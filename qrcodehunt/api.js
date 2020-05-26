import io from 'socket.io-client';


const url = process.env.SERVER_URL || 'http://192.168.7.253:3000';

const ws = io(url, { forceNode: true });

function AdminSignIn(password) {
  // Post request to backend
  return fetch('http://192.168.7.253:3000/api/admin/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      password: password
    }),
  })
  .then(res => res.json());
};

function AdminSignOut(userid) {
  // Post request to backend
  return fetch('http://192.168.7.253:3000/api/admin/signout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
       userid: userid
    }),
  })
  .then(res => res.json());
};

function signIn(username) {
  // Post request to backend
  return fetch('http://192.168.7.253:3000/api/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username
    }),
  })
  .then(res => res.json());
};

function signOut(userid) {
  // Post request to backend
  return fetch('http://192.168.7.253:3000/api/signout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userid: userid
    }),
  })
  .then(res => res.json());
}

async function getAllHunts() {
  try {
    let response = await fetch(
      'http://192.168.7.253:3000/api/hunts'
    );
    let json = await response.json();
    return json;
  } catch (error) {
    
    console.error(error);
    return error
  }
}

async function getPhotoByID(photoID) {
  try {
    let response = await fetch(
      'http://192.168.7.253:3000/api/photo/' + photoID
    );
    let json = await response.json();
    return json;
  } catch (error) {
    
    console.error(error);
    return error
  }
}

async function saveQRCode(data) {
  try {
    let response = await fetch('http://192.168.7.253:3000/api/qrcode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
    let json = await response.json();
    return json;
  } catch (error) {
    return error
  } 
}

async function deleteStep(huntid, stepid) {
  try {
    let response = await fetch(`http://192.168.7.253:3000/api/hunt/${huntid}/step/${stepid}`, {
        method: 'DELETE'
    });
    let json = await response.json();
    return json;
  } catch (error) {
    return error
  } 
}

module.exports = {
  adminsignin: AdminSignIn,
  adminsignout: AdminSignOut,
  signin: signIn,
  signout: signOut,
  getPhoto: getPhotoByID,
  saveQRCode: saveQRCode,
  getAllHunts: getAllHunts,
  deleteStep: deleteStep,
  ws: ws
}