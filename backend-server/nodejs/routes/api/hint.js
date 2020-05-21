const { Hint } = require('../../models/QRHunt');
const { Hunt } = require('../../models/QRHunt');

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

// GET api/hints
exports.getAllHints = async (req, res) => {
  Hint.find({}, (err, docs) => {
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
        hints: docs
      });
  });
};

// POST api/hint
exports.addHint = async (req, res) => {
  const {
    hunt,
    step,
    hint,
    hintText
  } = JSON.parse(req.body.data);

  const filter = { _id: hunt.id };
  const query = {};
  query["steps." + (step-1) + ".hints." + (hint-1) + ".text"] = hintText;
  query["steps." + (step-1) + ".hints." + (hint-1) + ".photo"] = req.file.id;
  const update = { $set: query };
  const options = {new: true, lean: true};

  Hunt.findOneAndUpdate(filter, update, options, (err, doc) => {
    if (err) {
      console.log(err);
      return res.send({
        success: false,
        message: err
      });
    }

    console.log('addHint success! ' + JSON.stringify(doc));
    console.log(doc.steps[doc.steps.length-1].hints)
    console.log(doc.steps[doc.steps.length-1].hints[0])
    console.log(Object.keys(doc.steps[doc.steps.length-1].hints[0]).length)
    return res.status(200).json({
      success: true,
      message: 'success!',
      photo: req.file,
      stepid: doc.steps.length,
      hintid: doc.steps[doc.steps.length-1].hints.length
    });
  })
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