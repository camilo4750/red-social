let moment = require("moment");
let mongoosePagination = require("mongoose-pagination");

let User = require("../models/user");
let Follow = require("../models/follow");
let Message = require("../models/message");

function testing(req, res) {
  return res.status(200).send({ message: "Hola estas en los mensajes" });
}

function saveMessage(req, res) {
  var params = req.body;
  if (!params.text || !params.receiver) {
    return res
      .status(200)
      .send({ message: "Debes enviar los campos campletos" });
  }
  var message = new Message();
  message.text = params.text;
  message.create_at = moment().unix();
  message.viewed = false;
  message.emitter = req.user.sub;
  message.receiver = params.receiver;

  message.save((err, messageStored) => {
    if (err) return res.status(500).send({ message: "Error en el servidor" });
    if (!messageStored)
      return res.status(404).send({ message: "Error al enviar el mensaje" });

    return res.status(200).send({
      message: messageStored,
    });
  });
}

function receiverMessages(req, res) {
  let userId = req.user.sub;
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  itemsPerPage = 5;
  Message.find({ receiver: userId })
    .populate("emitter", "name surname _id image nick")
    .paginate(page, itemsPerPage, (err, messages, total) => {
      if (err) return res.status(200).send({ message: "Error en la peticion" });
      if (!messages)
        return res.status(404).send({ message: "No hay mensajes" });
      return res.status(200).send({
        total: total,
        pages: Math.ceil(total / itemsPerPage),
        page: page,
        messages,
      });
    });
}

function sentMessages(req, res) {
  let userId = req.user.sub;
  let page = 1;
  if (req.params.page) {
    page = req.params.page;
  }
  itemsPerPage = 5;
  Message.find({ emitter: userId })
    .populate("emitter receiver", "_id name surname nick image")
    .paginate(page, itemsPerPage, (err, messages, total) => {
      if (err)
        return res.status(500).send({
          message: "Error en la peticion al server",
        });
      if (!messages)
        return res.status(404).send({
          message: "No hay mensajes en la bande",
        });
      return res.status(200).send({
        total: total,
        pages: Math.ceil(total / itemsPerPage),
        page: page,
        messages,
      });
    });
}

function unViewedMessages(req, res) {
  let userId = req.user.sub;

  Message.count({ receiver: userId, viewed: false }).exec((err, count) => {
    if (err)
      return res
        .status(500)
        .send({ message: "error en la peticion al server" });
    return res.status(200).send({
      unviewed: count,
    });
  });
}

function viewedMessages(req, res) {
  var userId = req.user.sub;
  Message.updateMany(
    { receiver: userId, viewed: "false" },
    { viewed: "true" },
    { multi: true },
    (err, viewedUpdate) => {
      if (err)
        return res
          .status(200)
          .send({ message: "Error en la peticion al server " });
      if (!viewedUpdate)
        return res.status(404).send({ message: "No hay mensajes enviados" });
      return res.status(200).send({
        message: viewedUpdate,
      });
    }
  );
}
module.exports = {
  testing,
  saveMessage,
  receiverMessages,
  sentMessages,
  unViewedMessages,
  viewedMessages,
};
