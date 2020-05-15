const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HintSchema = new Schema({
    text: { type: String },
    photoID: { type: Schema.Types.ObjectId, ref: "photos.files" }
});

const StepSchema = new Schema({
    hints: [HintSchema]
});

const QRHuntSchema = new Schema(
    {
        name: { type: String, unique: true, required: true },
        isRandom: { type: Boolean, default: false},
        timer: { type: Number, default: 300 },
        steps: [StepSchema],
        hintOrder: [{ type: String}],
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