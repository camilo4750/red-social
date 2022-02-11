'use strict'

let Mongoose = require('mongoose');
let Schema  = Mongoose.Schema;

let PublicationSchema = Schema({
    text: String,
    file: String,
    create_at: String,
    user: { type: Schema.ObjectId, ref:'User' }
});

module.exports = Mongoose.model('Publication', PublicationSchema);