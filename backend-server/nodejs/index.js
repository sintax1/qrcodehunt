const app = require('express')();
const server = require('http').Server(app);
var io = require('./routes/sockets/sockets').listen(server)
const bodyParser = require('body-parser')
const db = require('./db')
const user = require('./routes/api/user');
const admin = require('./routes/api/admin');

const hunt = require('./routes/api/hunt');
const step = require('./routes/api/step');
const hint = require('./routes/api/hint');
const photo = require('./routes/api/photo');

server.listen(3000, '0.0.0.0', () => {
  console.log('App running on http://0.0.0.0:3000')
})

//const app = Express()
app.use(bodyParser.json())

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

// Auth
app.post('/api/signin', user.signin);
app.post('/api/admin/signin', admin.signin);

// Photo
app.get('/api/photo/:id', photo.getPhoto);
app.post('/api/photo/upload', photo.upload.single('photo'), (req, res) => {
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
