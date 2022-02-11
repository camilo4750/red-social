let moment = require("moment");
let mongoosePagination = require("mongoose-pagination");

let User = require("../models/user");
let Follow = require("../models/follow");
let Message = require("../models/message");

function testing(req, res) {
  return res.status(200).send({ message: "Hola estas en los mensajes" });
}

module.exports = {
  testing,
};
