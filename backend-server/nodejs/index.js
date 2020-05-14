const app = require('express')();
const server = require('http').Server(app);
var io = require('./routes/sockets/sockets').listen(server)
const multer = require('multer')
const bodyParser = require('body-parser')
const db = require('./db')
const user = require('./routes/api/user');
const admin = require('./routes/api/admin');
const GridFsStorage = require("multer-gridfs-storage");

const hunt = require('./routes/api/hunt');

server.listen(3000, '0.0.0.0', () => {
  console.log('App running on http://0.0.0.0:3000')
})

//const app = Express()
app.use(bodyParser.json())

// Shared Routes
app.get('/api/photo/:id', hunt.getPhoto);

app.post('/api/hunt/:name', hunt.addHunt);

app.get('/api/hunt/:name', hunt.getHunt);

// User Routes
app.post('/api/signin', user.signin);

// Admin Routes
app.post('/api/admin/signin', admin.signin);

app.get('/', (req, res) => {
  console.log('GET /')
  res.status(200).send('You can post to /api/upload.')
})

const DiskStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, './images')
  },
  filename(req, file, callback) {
    callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
  },
})

const DBStorage = new GridFsStorage({
  url: "mongodb://admin:password@mongodb:27017/qrhunt",
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-qrhunt-${file.originalname}`;
      return filename;
    }

    return {
      bucketName: "photos",
      filename: `${Date.now()}-qrhunt-${file.originalname}`
    };
  }
});

//const upload = multer({ storage: DiskStorage })
const upload = multer({ storage: DBStorage })

app.post('/api/upload', upload.array('photo', 3), (req, res) => {
    //console.log(JSON.stringify(req));
    console.log('file', req.files);
    console.log('body', req.body);
    res.status(200).json({
      message: 'success!',
      photos: req.files
    });
});

app.use(function (err, req, res, next) {
    console.log('This is the invalid field ->', err.field)
    next(err)
})
