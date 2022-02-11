'use strict'

let Mongoose = require('mongoose');
let Schema = Mongoose.Schema;

let FollowSchema = Schema({
    user: { type: Schema.ObjectId, ref: 'User' },
    followed: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = Mongoose.model('Follow', FollowSchema);