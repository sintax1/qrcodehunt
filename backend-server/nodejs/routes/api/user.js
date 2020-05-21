UserSession = require('../../models/UserSession');

// Remove User session
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
      console.log("Removed user: " + userid)
      return res.send({
        success: true,
      });
    }
  });
};

exports.signin = (req, res, next) => {
  const { body } = req;
  const {
    username
  } = body;

  if (!username) {
    return res.send({
      success: false,
      message: 'You must enter a name.'
    });
  }

  UserSession.find({
      username: username,
      isDeleted: false
  }, (err, users) => {
    if (err) {
      console.log('err:', err);
      return res.send({
        success: false,
        message: err
      });
    } else if (users.length > 0) {
      console.log('err: duplicate name: ' + username);
      return res.send({
        success: false,
        message: 'That name is already taken. Enter a different name.'
      });
    } else {
      console.log('Adding user: ' + username);
      
      const userSession = new UserSession({ username: username});

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
    }
  });
};