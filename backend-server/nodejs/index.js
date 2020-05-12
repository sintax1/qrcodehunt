const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const multer = require('multer')
const bodyParser = require('body-parser')
const db = require('./db')

//const app = Express()
app.use(bodyParser.json())

const Storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './images')
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
  },
})

const upload = multer({ storage: Storage })

const user = require('./routes/api/user');
const admin = require('./routes/api/admin');

// User Routes
app.post('/api/signin', user.signin);

// Admin Routes
app.post('/api/admin/signin', admin.signin);

app.get('/', (req, res) => {
  console.log('GET /')
  res.status(200).send('You can post to /api/upload.')
})

app.post('/api/upload', upload.array('photo', 3), (req, res) => {
    //console.log(JSON.stringify(req));
    console.log('file', req.files);
    console.log('body', req.body);
    res.status(200).json({
      message: 'success!',
    });
});

app.use(function (err, req, res, next) {
    console.log('This is the invalid field ->', err.field)
    next(err)
})

// Websocket
io.on('connection', (socket) => {
  console.log('websocket connection');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('App running on http://0.0.0.0:3000')
})
