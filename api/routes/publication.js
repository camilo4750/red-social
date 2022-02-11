"use strict";

let express = require("express");
let multipart = require("connect-multiparty");
let mdAut = require("../middlewares/authenticated");
let md_upload = multipart({ uploadDir: "./uploads/publications" });
let api = express.Router();

let PublicationController = require("../controllers/publication");

api.get("/prueba", mdAut.ensureAuth, PublicationController.probando);
api.post(
  "/publication",
  mdAut.ensureAuth,
  PublicationController.savePublication
);

api.get(
  "/publications/:page?",
  mdAut.ensureAuth,
  PublicationController.getPublications
);

api.get(
  "/publication/:id",
  mdAut.ensureAuth,
  PublicationController.viewPublication
);

api.delete(
  "/publication/:id",
  mdAut.ensureAuth,
  PublicationController.deletePublication
);

api.post(
  "/upload-image-pub/:id",
  [mdAut.ensureAuth, md_upload],
  PublicationController.uploadImagePublication
);

api.get("/view-publication/:image", PublicationController.viewImage);

module.exports = api;
