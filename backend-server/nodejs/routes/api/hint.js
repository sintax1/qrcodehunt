const { Hint } = require('../../models/QRHunt');

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
  console.log('file', req.file);
  console.log('body', req.body);
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