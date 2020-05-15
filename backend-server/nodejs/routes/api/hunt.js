const { Hunt } = require('../../models/QRHunt');
const { getPhoto } = require('./photo')

// GET api/hunt/:id
exports.getHunt = async (req, res) => {
    let id = req.params.id;

    async function asyncForEach(array, callback) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
      }
    }

    Hunt.findById(id, (err, doc) => {
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: err
          });
        }

        const populatePhotos = async () => {
          asyncForEach(doc.steps, async (step, si, steps) => {
            await asyncForEach(step.hints, async (hint, hi, hints) => {
              if (hint.photo)
                doc.steps[si].hints[hi]['photo'] = await getPhoto(hint.photo);
            })
          });
        }

        populatePhotos();

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