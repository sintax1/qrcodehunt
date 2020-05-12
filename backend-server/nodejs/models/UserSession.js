const mongoose = require('mongoose');
const UserSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now()
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  huntId: {
    type: String,
    default: ''
  }
});
module.exports = mongoose.model('UserSession', UserSessionSchema);
