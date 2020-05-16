const { Hunt } = require('../../models/QRHunt');

// POST api/qrcode
exports.addQRCode = async (req, res) => {
    console.log('body', req.body);
  
    const {
      hunt,
      step,
      qrcode
    } = req.body;
  
    const filter = { _id: hunt.id };
    const query = {};
    query["steps." + (step-1) + ".qrcode"] = qrcode;
    const update = { $set: query };
    const options = {new: true};
  
    Hunt.findOneAndUpdate(filter, update, options, (err, doc) => {
      if (err) {
        console.log(err);
        return res.send({
          success: false,
          message: err
        });
      }
  
      console.log('addQRCode success! ' + JSON.stringify(doc));
      return res.status(200).json({
        success: true
      });
    })
  };