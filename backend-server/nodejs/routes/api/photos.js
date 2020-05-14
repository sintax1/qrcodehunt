const db = require('../../db');

const collection = db.collection('photos.files');
const collectionChunks = db.collection('photos.chunks');

const getChunks = async (doc) => {
    return await collectionChunks.find({files_id : docs._id}).sort({n: 1}).toArray();
};

const getPhotoByName = async (filename) => {
    let images = [];
    let docs = await collection.find({filename: filename}).toArray();

    //console.log('docs: ' + JSON.stringify(docs));

    for (let i=0; i<docs.length; i++) {
        //console.log('doc: ' + JSON.stringify(docs[i]));
        let chunks = await collectionChunks.find({files_id : docs[i]._id}).sort({n: 1}).toArray();
        //console.log('chunks: ' + JSON.stringify(chunks));

        let fileData = [];
        for(let j=0; j<chunks.length; j++) {
            fileData.push(chunks[j].data.toString('base64'));
        }

        console.log('fileData: ' + JSON.stringify(fileData));

        images.push({
            id: docs[i]._id,
            photo: 'data:' + docs[i].contentType + ';base64,' + fileData.join('')
        });
    }

    return images;
    
    
    /*
    function(err, docs) {
        if(err){
            console.log('err: ' + err);
            return null;
        }

        if(!docs || docs.length === 0){
            console.log('err: No photos found');
            return null;
        } else {
            console.log('Getting Chunks for: ' + JSON.stringify(docs[0]));
            //Retrieving the chunks from the db
            return collectionChunks.find({files_id : docs[0]._id})
            .sort({n: 1}).toArray(function(err, chunks) {
                if(err) {
                    console.log('err: ' + err);
                    return null;
                }
                if(!chunks || chunks.length === 0) {
                    //No data found
                    console.log('err: No data found');
                    return null;
                }

                let fileData = [];
                for(let i=0; i<chunks.length; i++) {
                    //This is in Binary JSON or BSON format, which is stored
                    //in fileData array in base64 endocoded string format

                    fileData.push(chunks[i].data.toString('base64'));
                }

                //Display the chunks using the data URI format
                let finalFile = 'data:' + docs[0].contentType + ';base64,' + fileData.join('');
                console.log('Adding a photo');
                return finalFile;
            });
        }
    });
    */
};

exports.getPhoto = async (req, res) => {
    console.log(Object.keys(req.body));
    //let photoId = req.body.id;

    let photo = await getPhotoByName("1589395305372-qrhunt-photo-filename.jpg");

    console.log('photo: ' + photo)

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