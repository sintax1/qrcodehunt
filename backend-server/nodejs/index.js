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
const step = require('./routes/api/step');
const hint = require('./routes/api/hint');

server.listen(3000, '0.0.0.0', () => {
  console.log('App running on http://0.0.0.0:3000')
})

//const app = Express()
app.use(bodyParser.json())

// Shared Routes
app.get('/api/photo/:id', hunt.getPhoto);

// Hunt
app.post('/api/hunt', hunt.addHunt);
app.get('/api/hunt/:id', hunt.getHunt);
app.get('/api/hunts', hunt.getAllHunts);
app.put('/api/hunt/:id', hunt.updateHunt);
app.delete('/api/hunt/:id', hunt.deleteHunt);

// Step
app.post('/api/step', step.addStep);
app.get('/api/step/:id', step.getStep);
app.get('/api/steps', step.getAllSteps);
app.put('/api/step/:id', step.updateStep);
app.delete('/api/step/:id', step.deleteStep);

// Hint
app.post('/api/hint', hint.addHint);
app.get('/api/hint/:id', hint.getHint);
app.get('/api/hints', hint.getAllHints);
app.put('/api/hint/:id', hint.updateHint);
app.delete('/api/hint/:id', hint.deleteHint);

// User Routes
app.post('/api/signin', user.signin);

// Admin Routes
app.post('/api/admin/signin', admin.signin);

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

const upload = multer({ storage: DBStorage })

app.post('/api/upload', upload.single('photo'), (req, res) => {
    //console.log(JSON.stringify(req));
    console.log('file', req.file);
    console.log('body', req.body);
    res.status(200).json({
      message: 'success!',
      photo: req.file
    });
});

app.use(function (err, req, res, next) {
    console.log('This is the invalid field ->', err.field)
    next(err)
})
