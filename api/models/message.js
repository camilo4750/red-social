"use strict";

let Mongoose = require("mongoose");
let Schema = Mongoose.Schema;

let MessageSchema = Schema({
  text: String,
  create_at: String,
  viewed: String,
  emitter: { type: Schema.ObjectId, ref: "User" },
  receiver: { type: Schema.ObjectId, ref: "User" },
});

module.exports = Mongoose.model("Message", MessageSchema);
