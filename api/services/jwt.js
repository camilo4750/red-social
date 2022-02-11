'use strict'

let jwt = require('jwt-simple');
let moment = require('moment');
let secret = 'Esta-Es-My-Clave-Secreta';

exports.createToken = function (user) {
    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        ait: moment().unix(),
        exp: moment().add(30, 'days').unix
    }
    return jwt.encode(payload, secret);
}