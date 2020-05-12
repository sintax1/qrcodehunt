const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema

const UserSchema = new Schema({
    username: {
        type: String,
        default: ''
    }
});

const AdminUserSchema = new Schema({
    password: {
        type: String,
        default: ''
    }
});

/*
AdminUserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};
AdminUserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};
*/

exports.User = mongoose.model('User', UserSchema);
exports.AdminUser = mongoose.model('AdminUser', AdminUserSchema);
