'use strict'

let jwt = require('jwt-simple');
let moment = require('moment');
let secret = 'Esta-Es-My-Clave-Secreta';

exports.ensureAuth = function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: 'La peticion no tiene Cabezera de autentificacion' })
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');
    try {
        var payload = jwt.decode(token, secret);
        if (payload.exp <= moment().unix()) {
            res.status(401).send({ message: 'El token ha expirado' });
        }
    } catch (ex) {
        return res.status(404).send({ message: 'La peticion No exite en el servidor' })
    }
    req.user = payload;
    next();
}
