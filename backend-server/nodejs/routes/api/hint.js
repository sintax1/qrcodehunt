const db = require('../../db');
var ObjectId = require('mongoose').Types.ObjectId;

const collection = db.collection('photos.files');
const collectionChunks = db.collection('photos.chunks');

const { Hint } = require('../../models/QRHunt');

const getPhotosByIds = async (photoIDs) => {
    let objIDs = photoIDs.map(function(id) { return ObjectId(id); });
    let photos = [];
    let docs = await collection.find({_id: {$in: objIDs }}).toArray();

    //console.log('docs: ' + JSON.stringify(docs));

    for (let i=0; i<docs.length; i++) {
        //console.log('doc: ' + JSON.stringify(docs[i]));
        let chunks = await collectionChunks.find({files_id : docs[i]._id}).sort({n: 1}).toArray();
        //console.log('chunks: ' + JSON.stringify(chunks));

        let fileData = [];
        for(let j=0; j<chunks.length; j++) {
            fileData.push(chunks[j].data.toString('base64'));
        }

        photos.push({
            id: docs[i]._id,
            photo: 'data:' + docs[i].contentType + ';base64,' + fileData.join('')
        });
    }

    return photos;
};

const getPhotoById = async (photoID) => {
    let photos = await getPhotosByIds([photoID]);
    if (photos) {
        return photos[0];
    }
    return null
};

// GET api/photo/:id
exports.getPhoto = async (req, res) => {
    let photoId = req.params.id;

    let photo = await getPhotoById(photoId);

    if (photo) {
        return res.send({
            success: true,
            photo: photo
        });
    } else {
        return res.send({
            success: false,
            message: 'No Photo'
        });
    }
};

// GET api/hint/:id
exports.getHint = async (req, res) => {
    let photoIds = req.params.id;

    let photos = await getPhotosById(photoIds);

    if (photos) {
        return res.send({
            success: true,
            photos: photos
        });
    } else {
        return res.send({
            success: false,
            message: 'No Photo'
        });
    }
};

// GET api/hint/:id
exports.getHint = async (req, res) => {
    let id = req.params.id;

    Hint.findById(id, (err, doc) => {
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: err
          });
        }

        return res.send({
          success: true,
          message: 'success',
          hint: doc
        });
    });
};

// POST api/hint
// TODO: Add photo upload/association
exports.addHint = async (req, res) => {
    let name = req.body.name;

    const hint = new Hint();

    hint.save((err, doc) => {
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: err
          });
        }

        return res.send({
          success: true,
          message: 'success',
          id: doc._id
        });
    });
};

// PUT api/hint/:id
exports.updateHint = async (req, res) => {
    let id = req.params.id;
    let updates = req.body;

    Hint.findOneAndUpdate({_id: id}, updates, { new: true }, (err, doc) => {
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: err
          });
        }

        return res.send({
          success: true,
          message: 'success',
          hint: doc
        });
    });
};

// DELETE api/hint/:id
exports.deleteHint = async (req, res) => {
    let id = req.params.id;

    Hint.deleteOne({_id: id}, (err) => {
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: err
          });
        }

        return res.send({
          success: true,
          message: 'success',
        });
    });
};