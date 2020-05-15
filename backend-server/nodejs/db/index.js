const mongoose = require('mongoose')

const options = {
    useNewUrlParser: true,
    user: 'admin',
    pass: 'password',
    useFindAndModify: false // https://mongoosejs.com/docs/deprecations.html#findandmodify
}

mongoose
    .connect('mongodb://mongodb:27017/qrhunt', options)
    .catch(e => {
        console.error('Connection error', e.message)
    })

const db = mongoose.connection

module.exports = db