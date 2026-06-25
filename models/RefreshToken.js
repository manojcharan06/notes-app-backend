const {Schema, model, trusted} = require('mongoose')

const refreshTokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true
    },
}, { timestamps: true })

module.exports = model('RefreshToken', refreshTokenSchema);