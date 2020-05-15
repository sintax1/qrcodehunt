const { Hunt } = require('../../models/QRHunt');

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

// GET api/hunt/:id
exports.getHunt = async (req, res) => {
    let id = req.params.id;

    Hunt.findById(id, (err, doc) => {
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
          hunt: doc
        });
    });
};

// GET api/hunts
exports.getAllHunts = async (req, res) => {
  Hunt.find({}, (err, docs) => {
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
        hunts: docs
      });
  });
};

// POST api/hunt
exports.addHunt = async (req, res) => {
    let name = req.body.name;

    const hunt = new Hunt({name: name});

    hunt.save((err, doc) => {
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

// PUT api/hunt/:id
exports.updateHunt = async (req, res) => {
    let id = req.params.id;
    let updates = req.body;

    Hunt.findOneAndUpdate({_id: id}, updates, { new: true }, (err, doc) => {
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
          hunt: doc
        });
    });
};

// DELETE api/hunt/:id
exports.deleteHunt = async (req, res) => {
    let id = req.params.id;

    Hunt.deleteOne({_id: id}, (err) => {
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