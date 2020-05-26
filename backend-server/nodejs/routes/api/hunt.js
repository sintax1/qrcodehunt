const { Hunt } = require('../../models/QRHunt');

// GET api/hunt/:id
exports.getHunt = async (req, res) => {
    let id = req.params.id;

    Hunt.findById(id)
    .populate({
      path: 'steps.hints.photo'
    })
    .exec((err, doc) => {
        if (err) {
          console.log(err);
          return res.send({
            success: false,
            message: err
          });
        }

        console.log(JSON.stringify(doc));

        return res.send({
          success: true,
          message: 'success',
          hunt: doc
        });
    });
};

// GET api/hunts
exports.getAllHunts = async (req, res) => {
  Hunt.find({}, '-steps',(err, docs) => {
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
    let timer = Number(req.body.timer);
    let isRandom = req.body.isRandom;

    const hunt = new Hunt({name: name, timer: timer, isRandom: isRandom});

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

// DELETE api/hunt/:huntid/step/:stepid
exports.deleteStep = async (req, res) => {
  let huntid = req.params.huntid;
  let stepid = req.params.stepid;

  Hunt.findOne({_id: huntid}, (err, doc) => {
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: err
        });
      } else if (doc) {
        // Delete the step
        doc.steps.splice(stepid-1, 1);
        // Save changes
        doc.save(err => {
          if (err) {
            console.log(err);
            return res.send({
              success: false,
              message: err
            });
          } else {
            return res.send({
              success: true,
              message: 'success',
            });
          }
        })
      } else {
        return res.send({
          success: false,
          message: 'No hunt found with id: ' + huntid
        });
      }
  });
};