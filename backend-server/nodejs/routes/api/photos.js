const db = require('../../db');

const collection = db.collection('photos.files');
const collectionChunks = db.collection('photos.chunks');

const getChunks = async (doc) => {
    return await collectionChunks.find({files_id : docs._id}).sort({n: 1}).toArray();
};

const getPhotoByName = async (photoIDs) => {
    let objIDs = photoIDs.map(function(id) { return ObjectId(id); });
    let images = [];
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

        images.push({
            id: docs[i]._id,
            photo: 'data:' + docs[i].contentType + ';base64,' + fileData.join('')
        });
    }

    return images;
};

exports.getPhoto = async (req, res) => {
    console.log(Object.keys(req.body));
    //let photoId = req.body.id;

    let photos = await getPhotoByName(["1589395305372"]);

    console.log('photo: ' + photos)

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