const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HintSchema = new Schema({
    text: { type: String },
    photoID: { type: Schema.Types.ObjectId }
});

const StepSchema = new Schema({
    easyHint: { type: Schema.Types.ObjectId, ref: 'Hint' },
    easyTimer: { type: Number, default: 300 }, // minutes
    mediumHint: { type: Schema.Types.ObjectId, ref: 'Hint' },
    mediumTimer: { type: Number, default: 300 }, // minutes
    hardHint: { type: Schema.Types.ObjectId, ref: 'Hint' },
    hardTimer: { type: Number, default: 300 } // minutes
});

const QRHuntSchema = new Schema(
    {
        name: { type: String, required: true },
        isRandom: { type: Boolean, default: false},
        steps: [{ type: Schema.Types.ObjectId, ref: 'Step' }],
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