const Express = require('express')
const multer = require('multer')
const bodyParser = require('body-parser')
const db = require('./db')

const app = Express()
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

/*
app.post('*', function(req, res, next){
    console.log(req);
});
*/

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

// Add login routes
require('./routes/api/login')(app);

app.use(function (err, req, res, next) {
    console.log('This is the invalid field ->', err.field)
    next(err)
})

app.listen(3000, '0.0.0.0', () => {
  console.log('App running on http://0.0.0.0:3000')
})
