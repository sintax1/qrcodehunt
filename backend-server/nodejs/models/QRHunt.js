const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HintSchema = new Schema({
    text: { type: String },
    photoID: { type: String }
});

const StepSchema = new Schema({
    easyHint: HintSchema,
    easyTimer: { type: Number, default: 300 }, // minutes
    mediumHint: HintSchema,
    mediumTimer: { type: Number, default: 300 }, // minutes
    hardHint: HintSchema,
    hardTimer: { type: Number, default: 300 } // minutes
});

const QRHuntSchema = new Schema(
    {
        name: { type: String, required: true },
        isRandom: { type: Boolean, default: false},
        hints: StepSchema,
        hintOrder: [{ type: String}],
        history: [{
            player: { type: String },
            place: { type: Number },
            score: { type: Number }
        }]
    },
    { timestamps: true },
);

module.exports = mongoose.model('qrhunt', QRHuntSchema)