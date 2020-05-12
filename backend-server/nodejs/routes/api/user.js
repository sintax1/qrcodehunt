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

  console.log("Checking if user already signed in");

  UserSession.find({
      username: username,
      isDeleted: false
  }, (err, users) => {
    if (err) {
      console.error('err:', err);
      return res.send({
        success: false,
        message: 'Error: server error'
      });
    } else if (users.length > 0) {
      console.error('err: duplicate name');
      return res.send({
        success: false,
        message: 'Error: Choose a different name.'
      });
    }
  });

  console.log("Creating user session");

  var userSession = new UserSession({ username: username});
  console.log('Saving session:' + userSession);
  //userSession.username = username;
  userSession.save((err, doc) => {
    if (err) {
      console.error(err);
      return res.send({
        success: false,
        message: 'Error: server error'
      });
    }
    console.log('success');
    return res.send({
      success: true,
      message: 'Valid sign in',
      token: doc._id
    });
  });
};