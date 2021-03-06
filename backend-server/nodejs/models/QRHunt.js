const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HintSchema = new Schema({
    text: { type: String },
    photo: { type: Schema.Types.ObjectId }
});

const StepSchema = new Schema({
    hints: [HintSchema],
    qrcode: { type: String }
});

const QRHuntSchema = new Schema(
    {
        name: { type: String, unique: true, required: true },
        isRandom: { type: Boolean, default: false},
        timer: { type: Number, default: 2000 },
        steps: [StepSchema],
        history: [{
            player: { type: String },
            place: { type: Number },
            score: { type: Number }
        }]
    },
    { timestamps: true },
);

module.exports = {
    Hunt: mongoose.model('Hunt', QRHuntSchema),
    Step: mongoose.model('Step', HintSchema),
    Hint: mongoose.model('Hint', HintSchema)
}