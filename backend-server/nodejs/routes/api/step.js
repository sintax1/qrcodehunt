const { Step } = require('../../models/QRHunt');

// GET api/step/:id
exports.getStep = async (req, res) => {
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

// GET api/steps
exports.getAllSteps = async (req, res) => {
  Step.find({}, (err, docs) => {
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
        steps: docs
      });
  });
};

// GET api/step/:id
exports.getStep = async (req, res) => {
    let id = req.params.id;

    Step.findById(id, (err, doc) => {
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
          step: doc
        });
    });
};

// POST api/step
exports.addStep = async (req, res) => {
    let name = req.body.name;

    const step = new Step();

    step.save((err, doc) => {
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

// PUT api/step/:id
exports.updateStep = async (req, res) => {
    let id = req.params.id;
    let updates = req.body;

    Step.findOneAndUpdate({_id: id}, updates, { new: true }, (err, doc) => {
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
          step: doc
        });
    });
};

// DELETE api/step/:id
exports.deleteStep = async (req, res) => {
    let id = req.params.id;

    Step.deleteOne({_id: id}, (err) => {
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