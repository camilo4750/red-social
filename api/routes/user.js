"use strict";

let express = require("express");
let UserController = require("../controllers/user");
let multipart = require("connect-multiparty");
let mdAut = require("../middlewares/authenticated");
let md_upload = multipart({ uploadDir: "./uploads/users" });
let api = express.Router();

api.get("/home", UserController.home);

api.post("/register", UserController.register);

api.post("/login", UserController.login);

api.put("/update-user/:id", mdAut.ensureAuth, UserController.updateUser);

api.post(
  "/update-image/:id",
  [mdAut.ensureAuth, md_upload],
  UserController.updateImage
);

api.get("/get-image/:imageFile", UserController.getImage);

api.get("/user/:id", mdAut.ensureAuth, UserController.getUser);

api.get("/users/:page?", mdAut.ensureAuth, UserController.getUsers);

api.get("/counters/:id?", mdAut.ensureAuth, UserController.getCounters);
module.exports = api;
