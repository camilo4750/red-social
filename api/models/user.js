'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UserSchema = Schema({
    name: String,
    surname: String,
    nick: String,
    email: String,
    password: {
        type: String,
        require: true,
        select: false
    },
    role: String,
    image: String
});

module.exports = mongoose.model('User', UserSchema);