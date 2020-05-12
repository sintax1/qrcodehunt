auth = require('../../models/User');
UserSession = require('../../models/UserSession');
const db = require('./db');

exports.signin = (req, res, next) => {
  const { body } = req;
  const {
    password
  } = body;

  console.log('password: ' + password);

  if (!password) {
    return res.send({
      success: false,
      message: 'Error: Password cannot be blank.'
    });
  }

  auth.AdminUser.find({
    password: password
  }, (err, users) => {
    console.log(users);

    if (err) {
      console.log('err 2:', err);
      return res.send({
        success: false,
        message: 'Error: server error'
      });
    }
    if (users.length != 1) {
      return res.send({
        success: false,
        message: 'Error: Invalid'
      });
    }
    const user = users[0];

    const userSession = new UserSession();
    userSession.userId = user._id;
    userSession.username = user.username;
    userSession.isAdmin = true;
    userSession.save((err, doc) => {
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: 'Error: server error'
        });
      }
      return res.send({
        success: true,
        message: 'Valid sign in',
        token: doc._id,
        isAdmin: true
      });
    });
  });
};
