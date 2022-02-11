"use strict";

let express = require("express");
let mdAut = require("../middlewares/authenticated");
let api = express.Router();

let MessageController = require("../controllers/message");

api.get("/testing", MessageController.testing);

module.exports = api;
