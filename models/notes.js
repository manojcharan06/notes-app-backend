const { Schema, model } = require('mongoose')

const noteSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    pinned: {
        type: Boolean,
        default: false,
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true})

const Notes = model('Notes', noteSchema);

module.exports = Notes