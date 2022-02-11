'use strict';

let express = require("express");
let FollowController = require("../controllers/follow");
let mdAut = require("../middlewares/authenticated");

let api = express.Router();
api.post(
    "/follow",
    mdAut.ensureAuth,
    FollowController.saveFollow
);

api.get(
    "/let-of-follow/:id",
    mdAut.ensureAuth,
    FollowController.deleteFollow
);

api.get(
    "/user-followers/:id?/:page?",
    mdAut.ensureAuth,
    FollowController.getUserFollowed
);

api.get(
    "/user-following/:id?/:page?",
    mdAut.ensureAuth,
    FollowController.getUserFollowings
);
module.exports = api;
