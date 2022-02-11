"use strict";
let path = require("path");
let fs = require("fs");
let moment = require("moment");
let mongoosePagination = require("mongoose-pagination");

let Publication = require("../models/publication");
let User = require("../models/user");
let Follow = require("../models/follow");

function probando(req, res) {
  res.status(200).send({
    message: "Hola estamos en el controlador de publicaciones",
  });
}

function savePublication(req, res) {
  let params = req.body;
  if (!params.text)
    return res.status(500).send({
      message: "Debes enviar un texto",
    });
  let publication = new Publication();
  publication.text = params.text;
  publication.file = "null";
  publication.user = req.user.sub;
  publication.create_at = moment().unix();

  publication.save((err, publicationStore) => {
    if (err)
      return res.status(500).send({
        message: "Error al guardar la publicacion",
      });
    if (!publicationStore)
      res.status(404).send({
        message: "La publicacion no ha sido guardada",
      });
    return res.status(200).send({
      publication: publicationStore,
    });
  });
}

function getPublications(req, res) {
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  let itemsPerPage = 4;

  Follow.find({ user: req.user.sub })
    .populate("followed")
    .exec((err, follows) => {
      if (err)
        return res.status(500).send({
          message: "Error en la peticion al servidor",
        });
      let follows_clean = [];

      follows.forEach((follow) => {
        follows_clean.push(follow.followed);
      });

      Publication.find({ user: { $in: follows_clean } })
        .sort("-create")
        .populate("user")
        .paginate(page, itemsPerPage, (err, publications, total) => {
          if (err)
            return res.status(500).send({
              message: "Error al devolver las publicaciones",
            });
          if (!publications) {
            return res.status(404).send({
              message: "No hay publicaciones",
            });
          }
          return res.status(200).send({
            total_items: total,
            pages: Math.ceil(total / itemsPerPage),
            page: page,
            publications,
          });
        });
    });
}

function viewPublication(req, res) {
  let publicationId = req.params.id;
  Publication.findById(publicationId, (err, publication) => {
    if (err)
      return res.status(500).send({
        message: "Error en la peticion al mostrar publicacion",
      });
    if (!publication)
      return res.status(404).send({
        message: "No existe la publicacion",
      });
    return res.status(200).send({
      publication,
    });
  });
}

function deletePublication(req, res) {
  let publicationId = req.params.id;
  Publication.find({ user: req.user.sub, _id: publicationId }).deleteOne(
    (err, publicationRemove) => {
      if (err)
        return res.status(500).send({
          message: "Error al borrar publicacion",
        });
      if (!publicationRemove)
        return res.status(404).send({
          message: "No se ha borrado la publicacion",
        });
      return res.status(200).send({
        message: "Publicacion eliminada",
      });
    }
  );
}

function uploadImagePublication(req, res) {
  let publicationId = req.params.id;
  if (!req.files.file) {
    return res
      .status(500)
      .send({ messsage: "Por favor cargue su imagen para la publicacion" });
  }
  if (req.files) {
    let filePath = req.files[Object.keys(req.files)[0]].path;
    let fileSplit = filePath.split("\\");
    let fileName = fileSplit[2];
    let splitEx = fileName.split(".");
    let fileEx = splitEx[1];
    if (
      fileEx == "png" ||
      fileEx == "jpg" ||
      fileEx == "jpeg" ||
      fileEx == "gif"
    ) {
      Publication.findOne({ user: req.user.sub, _id: publicationId }).exec(
        (err, publication) => {
          if (publication) {
            Publication.findByIdAndUpdate(
              publicationId,
              { file: fileName },
              { new: true },
              (err, publicationUpdate) => {
                if (err) {
                  return res.status(500).send({
                    message: "Error en la peticion",
                  });
                }
                if (!publicationUpdate) {
                  return res.status(404).send({
                    message: "No se ha podido actualizar la imagen",
                  });
                }
                return res.status(200).send({
                  publication: publicationUpdate,
                });
              }
            );
          } else {
            return removeFile(
              res,
              filePath,
              "No tienes permisos para actualizar o la publicacion ya no existe"
            );
          }
        }
      );
    } else {
      return removeFile(res, filePath, "Extension de imagen no valida");
    }
  }
}

function removeFile(res, filePath, message) {
  try {
    fs.unlinkSync(filePath);
    return res.status(200).send({ message: message });
  } catch (err) {
    console.error("Error al eliminar", err);
  }
}

function viewImage(req, res) {
  let image = req.params.image;
  let fileName = "./uploads/publications/" + image;
  if (fs.existsSync(fileName)) {
    res.sendFile(path.resolve(fileName));
  } else {
    return res.status(404).send({
      message: "La imagen no existe",
    });
  }
}

module.exports = {
  probando,
  savePublication,
  getPublications,
  viewPublication,
  deletePublication,
  uploadImagePublication,
  viewImage,
};
