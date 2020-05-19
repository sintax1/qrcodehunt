AdminUser = require('../../models/User').AdminUser;
UserSession = require('../../models/UserSession');

// Remove session
exports.signout = (req, res, next) => {
  
  const { body } = req;
  const {
    userid
  } = body;

  UserSession.findOneAndDelete( { _id: userid}, (err, doc) => {
    if (err) {
      console.log('err:', err);
      return res.send({
        success: false,
        message: 'Failed to clear user session'
      });
    } else {
      return res.send({
        success: true,
      });
    }
  });
};

exports.signin = (req, res, next) => {
  const { body } = req;
  const {
    password
  } = body;

  if (!password) {
    return res.send({
      success: false,
      message: 'Error: Password cannot be blank.'
    });
  }

  AdminUser.find({
    password: password
  }, (err, users) => {
    if (err) {
      console.log('err:', err);
      return res.send({
        success: false,
        message: 'Error: server error'
      });
    }
    if (users.length != 1) {
      return res.send({
        success: false,
        message: 'Error: Invalid Password'
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
