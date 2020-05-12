UserSession = require('../../models/UserSession');

exports.signin = (req, res, next) => {
  const { body } = req;
  const {
    username
  } = body;

  console.log("Signin: " + username);

  if (!username) {
    return res.send({
      success: false,
      message: 'Error: name cannot be blank.'
    });
  }

  UserSession.find({
      username: username,
      isDeleted: false
  }, (err, users) => {
    if (err) {
      console.log('err 2:', err);
      return res.send({
        success: false,
        message: 'Error: server error'
      });
    } else if (users.length > 0) {
      return res.send({
        success: false,
        message: 'Error: Choose a different name.'
      });
    }
  });

  const userSession = new UserSession();
  userSession.userId = user._id;
  userSession.username = user.username;
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
      token: doc._id
    });
  });
};