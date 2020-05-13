const mongoose = require('mongoose')
const Schema = mongoose.Schema

const HintSchema = new Schema(
    {
        easyImg: { data: Buffer },
        easyText: { type: String },
        easyTimer: { type: Number, default: 300 }, // minutes
        mediumImg: { data: Buffer },
        mediumText: { type: String },
        mediumTimer: { type: Number, default: 300 }, // minutes
        hardImg: { data: Buffer },
        hardText: { type: String },
        hardTimer: { type: Number, default: 300 } // minutes
    }
);

const QRHuntSchema = new Schema(
    {
        name: { type: String, required: true },
        isRandom: { type: Boolean, default: false},
        hints: [HintSchema],
        hintOrder: [{ type: Number, required: true }],
        history: [{
            player: { type: String, required: true },
            place: { type: Number, required: true },
            score: { type: Number, required: true }
        }]
    },
    { timestamps: true },
)

module.exports = mongoose.model('qrhunt', QRHuntSchema)