"use strict";

let express = require("express");
let mdAut = require("../middlewares/authenticated");
let api = express.Router();

let MessageController = require("../controllers/message");

api.get("/testing", MessageController.testing);
api.post("/message", mdAut.ensureAuth, MessageController.saveMessage);
api.get(
  "/my-messages/:page?",
  mdAut.ensureAuth,
  MessageController.receiverMessages
);
api.get("/messages/:page?", mdAut.ensureAuth, MessageController.sentMessages);
api.get(
  "/unviewed-messages",
  mdAut.ensureAuth,
  MessageController.unViewedMessages
);
api.get("/viewed-messages", mdAut.ensureAuth, MessageController.viewedMessages);
module.exports = api;
