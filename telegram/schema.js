const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        id: String,
        email: String,
        startTime: String,
        endTime: String,
        messages: Number,
        conversation: Array,
        isAlive:Boolean
    }
);


module.exports = mongoose.model('users', userSchema);;
