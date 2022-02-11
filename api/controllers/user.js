"use strict";
let Bcrypt = require("bcrypt-nodejs");
let Jwt = require("../services/jwt");
let MongoosePagination = require("mongoose-pagination");
let Fs = require("fs");
let Path = require("path");

let User = require("../models/user");
let Follow = require("../models/follow");
let Publication = require("../models/publication");

const user = require("../models/user");
const { exists, validate } = require("../models/user");
const { path } = require("../app");
const follow = require("../models/follow");

function home(req, res) {
  res.status(200).send({
    message: "Estamos en el controlador del usuarios",
  });
}

function register(req, res) {
  let params = req.body;
  let user = new User();

  if (
    params.name &&
    params.surname &&
    params.nick &&
    params.email &&
    params.password
  ) {
    user.name = params.name;
    user.surname = params.surname;
    user.nick = params.nick;
    user.email = params.email;
    user.role = "ROLE_USER";
    user.image = null;
    User.find({
      $or: [
        { email: user.email.toLowerCase() },
        { nick: user.nick.toLowerCase() },
      ],
    }).exec((err, userReplica) => {
      if (err)
        return res.status(500).send({
          message: "Error en la peticion",
        });
      if (userReplica && userReplica.length >= 1) {
        return res.status(404).send({
          message: "El usurio o nick qu eintenta registrar ya existe",
        });
      } else {
        Bcrypt.hash(params.password, null, null, (err, hash) => {
          user.password = hash;
          user.save((err, userStored) => {
            if (err)
              return res.status(500).send({ message: "Error en el servidor" });
            if (userStored) {
              res.status(200).send({ user: userStored });
            } else {
              res
                .status(404)
                .send({ message: "No se ha podido registrar el usuario" });
            }
          });
        });
      }
    });
  } else {
    res.status(404).send({ message: "Ingrese todos los campos" });
  }
}

function login(req, res) {
  let params = req.body;
  let email = params.email;
  let password = params.password;
  User.findOne({ email: email }, (err, user) => {
    if (err) return res.status(500).send({ message: "Error en la peticion" });
    if (user) {
      Bcrypt.compare(password, user.password, (err, userIdentified) => {
        if (err)
          return res
            .status(404)
            .send({ message: "Error en la peticion de contraseña" });
        if (userIdentified) {
          if (params.getToken) {
            return res.status(200).send({
              token: Jwt.createToken(user),
            });
          }
        } else {
          user.password = undefined;
          return res.status(200).send(user);
        }
      });
    } else {
      return res
        .status(404)
        .send({ message: "El usuario no se ha podido identificar" });
    }
  }).select("+password");
}

function updateUser(req, res) {
  let userId = req.params.id;
  let update = req.body;
  delete update.password;
  if (userId != req.user.sub) {
    return res
      .status(403)
      .send({ message: "No tienes permisos para Editar este usuario" });
  }
  User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdate) => {
    if (err) return res.status(500).send({ message: "Error en la peticion" });
    if (!userUpdate)
      return res
        .status(404)
        .send({ message: "El usuario no se ha podido actualizar" });
    return res.status(200).send({ userUpdate });
  });
}

function updateImage(req, res) {
  let userId = req.params.id;

  if (!req.files.image) {
    return res
      .status(500)
      .send({ messsage: "Por favor cargue su imagen de perfil" });
  }
  if (req.files) {
    let filePath = req.files[Object.keys(req.files)[0]].path;
    let fileSplit = filePath.split("\\");
    let fileName = fileSplit[2];
    let splitEx = fileName.split(".");
    let fileEx = splitEx[1];
    if (userId != req.user.sub) {
      return removeFile(
        res,
        filePath,
        "No tienes Permisos para realizar este cambio"
      );
    }
    if (
      fileEx == "png" ||
      fileEx == "jpg" ||
      fileEx == "jpeg" ||
      fileEx == "gif"
    ) {
      User.findByIdAndUpdate(
        userId,
        { image: fileName },
        { new: true },
        (err, imageUpdate) => {
          if (err)
            return res.status(500).send({ message: "error en la peticion" });
          if (!imageUpdate)
            return res
              .status(404)
              .send({ message: "Error al actualizar la imagen" });
          return res.status(200).send({ imageUpdate });
        }
      );
    }
  }
}

function removeFile(res, filePath, message) {
  try {
    Fs.unlinkSync(filePath);
    return res.status(200).send({ message: message });
  } catch (err) {
    console.error("Error al eliminar", err);
  }
}

function getImage(req, res) {
  let image = req.params.imageFile;
  let filePath = "./uploads/users/" + image;
  if (Fs.existsSync(filePath)) {
    // devolver el fichero en crudo para mostrarlo en cualqueir parte
    res.sendFile(Path.resolve(filePath));
  } else {
    res.status(200).send({ message: "No existe la imagen" });
  }
}

function getUser(req, res) {
  let userId = req.params.id;

  User.findById(userId, (err, user) => {
    if (err)
      return res
        .status(500)
        .send({ message: "error en la peticion al servidor" });
    if (!user)
      return res
        .status(404)
        .send({ message: "El usuario que busca no existe" });
    followThisUser(req.user.sub, userId).then((value) => {
      return res.status(200).send({
        user,
        following: value.following,
        followed: value.followed,
      });
    });
  });
}

async function followThisUser(userIdentity, userId) {
  let following = await Follow.findOne({
    "user:": userIdentity,
    followed: userId,
  })
    .exec()
    .then((follow) => {
      return follow;
    })
    .catch((err) => {
      return handleError(err);
    });

  let followed = await Follow.findOne({ user: userId, followed: userIdentity })
    .exec()
    .then((follows) => {
      return follows;
    })
    .catch((err) => {
      return handleError(err);
    });

  return {
    following: following,
    followed: followed,
  };
}

function getUsers(req, res) {
  let UserIdentityId = req.user.sub;

  let page = 1;
  if (req.param.page) {
    page = req.params.page;
  }
  let itemsForPages = 5;
  User.find()
    .sort("_id")
    .paginate(page, itemsForPages, (err, users, total) => {
      if (err)
        return res
          .status(500)
          .send({ message: "Erro en la peticion al servidor" });
      if (!user)
        return res.status(404).send({ message: "No existe lista de usuarios" });
      usersFollowIds(UserIdentityId).then((response) => {
        return res.status(200).send({
          users,
          usersFollowing: response.following,
          usersFollowed: response.followed,
          total,
          pages: Math.ceil(total / itemsForPages),
        });
      });
    });
}

async function usersFollowIds(userIdentity) {
  let following = await Follow.find({ user: userIdentity })
    .select({ _id: 0, __v: 0, user: 0 })
    .exec()
    .then((follows) => {
      console.log(follows);
      return follows;
    })
    .catch((err) => {
      handleError(err);
    });

  let followed = await Follow.find({ followed: userIdentity })
    .select({ _id: 0, __v: 0, followed: 0 })
    .exec()
    .then((follows) => {
      console.log(follows);
      return follows;
    })
    .catch((err) => {
      return handleError(err);
    });

  let followingClean = [];

  following.forEach((follow) => {
    followingClean.push(follow.followed);
  });

  let followedClean = [];

  followed.forEach((follow) => {
    followedClean.push(follow.user);
  });

  return {
    following: followingClean,
    followed: followedClean,
  };
}

function getCounters(req, res) {
  let userId = req.user.sub;

  if (req.params.id) {
    userId = req.params.id;
  }

  getCountFollow(userId).then((value) => {
    return res.status(200).send(value);
  });
}

async function getCountFollow(userId) {
  let following = await Follow.countDocuments({ user: userId })
    .exec()
    .then((count) => {
      console.log(count);
      return count;
    })
    .catch((err) => {
      return handleError(err);
    });

  let followed = await Follow.countDocuments({ followed: userId })
    .exec()
    .then((count) => {
      return count;
    })
    .catch((err) => {
      return handleError(err);
    });

  let publications = await Publication.countDocuments({ user: userId })
    .exec()
    .then((count) => {
      return count;
    })
    .catch((err) => {
      return handleError(err);
    });

  return {
    following: following,
    followed: followed,
    publications: publications,
  };
}

module.exports = {
  home,
  register,
  login,
  updateUser,
  updateImage,
  getImage,
  getUser,
  getUsers,
  getCounters,
};
