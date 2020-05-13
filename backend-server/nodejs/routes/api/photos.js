

exports.getPhotos = (req, res) => {
    console.log(req);
    //let photoId = req.body.id;

    return res.send({
        photos: [
            {
                name: 'test.jpg'
            }
        ]
      });
};