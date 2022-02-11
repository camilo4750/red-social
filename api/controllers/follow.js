let mongoose = require("mongoose");
let path = require("path");
let User = require("../models/user");
let Follow = require("../models/follow");

function saveFollow(req, res) {
  let params = req.body;
  let follow = new Follow();
  follow.user = req.user.sub;
  follow.followed = params.followed;
  follow.save((err, userFollowed) => {
    if (err)
      return res
        .status(500)
        .send({ message: "Error en la peticion al servidor" });
    if (!userFollowed)
      return res
        .status(404)
        .send({ message: "El usuario a seguir no se ha guardado" });
    return res.status(200).send({ userFollowed });
  });
}

function deleteFollow(req, res) {
  let userIdentity = req.user.sub;
  let userId = req.params.id;

  Follow.find({ user: userIdentity, followed: userId }).deleteOne((err) => {
    if (err) return res.status(500).send({ message: "Error en el Servidor" });
    return res
      .status(200)
      .send({ message: "Dejaste de seguir a este usuario" });
  });
}

//obtener usuarios que sigo
function getUserFollowed(req, res) {
  let userId = req.user.sub;

  if (req.params.id && req.params.page) {
    userId = req.params.id;
  }

  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  } else {
    page = req.params.id;
  }

  let itemPerPage = 5;
  Follow.find({ user: userId })
    .populate("followed")
    .paginate(page, itemPerPage, (err, followers, total) => {
      if (err)
        return res
          .status(500)
          .send({ message: "Error en la peticion al servidor" });
      if (!followers)
        return res
          .status(404)
          .send({ message: "Error al listar los usuarios que sigues" });
      return res.status(200).send({
        total,
        page: Math.ceil(total / itemPerPage),
        followers,
      });
    });
}

//obtener seguidores del usuario
function getUserFollowings(req, res) {
  let userId = req.user.sub;

  if (req.params.id && req.params.page) {
    userId = req.params.id;
  }

  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  } else {
    page = req.params.id;
  }
  let itemPerPage = 5;
  Follow.find({ followed: userId })
    .populate("user")
    .paginate(page, itemPerPage, (err, followings, total) => {
      if (err)
        return res
          .status(500)
          .send({ message: "Error en la peticion al servidor" });
      if (!followings)
        return res
          .status(404)
          .send({ message: "Error al listar los usuarios que te siguen" });
      return res.status(200).send({
        total,
        page: Math.ceil(total / itemPerPage),
        followings,
      });
    });
}



module.exports = {
  saveFollow,
  deleteFollow,
  getUserFollowed,
  getUserFollowings,
};
