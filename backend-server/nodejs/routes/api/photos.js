const db = require('../../db');

const collection = db.collection('photos.files');    
const collectionChunks = db.collection('photos.chunks');

const getPhotoByName = (filename) => {
    collection.find({filename: fileName}).toArray(function(err, docs) {
        if(err){
            console.log('err: ' + err);
            return null;
        }

        if(!docs || docs.length === 0){    
            console.log('err: No photos found');    
            return null;    
        } else {
            //Retrieving the chunks from the db          
            collectionChunks.find({files_id : docs[0]._id})
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
                let finalFile = 'data:' + docs[0].contentType + ';base64,' 
                    + fileData.join('');          
                return finalFile
            });      
        }
    });
};

exports.getPhotoByName = (req, res) => {
    console.log(req.body);
    //let photoId = req.body.id;

    let photo = this.getPhotoByName("1589395305372-qrhunt-photo-filename.jpg");

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