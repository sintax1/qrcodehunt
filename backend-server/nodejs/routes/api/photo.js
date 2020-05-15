const db = require('../../db');
const GridFsStorage = require("multer-gridfs-storage");
const ObjectId = require('mongoose').Types.ObjectId;
const collection = db.collection('photos.files');
const collectionChunks = db.collection('photos.chunks');
const multer = require('multer');

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

export const getPhotoById = async (photoID) => {
    let photos = await getPhotosByIds([photoID]);
    if (photos) {
        return photos[0];
    }
    return null
};

exports.upload = multer({ storage: DBStorage });

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