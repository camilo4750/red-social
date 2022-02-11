'use strict'
let path = require('path');
let fs = require('fs');
let moment = require('moment');
let mongoosePagination = require('mongoose-pagination');

let Publication = require('../models/publication');
let User = require('../models/user');
let Follow = require('../models/follow');
const { populate } = require('../models/publication');

function probando(req, res) {
    res.status(200).send({
        message: 'Hola estamos en el controlador de publicaciones'
    });
}

function savePublication(req, res) {
    let params = req.body;
    if (!params.text) return res.status(500).send({
        message: 'Debes enviar un texto'
    });
    let publication = new Publication();
    publication.text = params.text;
    publication.file = 'null';
    publication.user = req.user.sub;
    publication.create_at = moment().unix();

    publication.save((err, publicationStore) => {
        if (err) return res.status(500).send({
            message: 'Error al guardar la publicacion'
        });
        if (!publicationStore) res.status(404).send({
            message: 'La publicacion no ha sido guardada'
        });
        return res.status(200).send({
            publication: publicationStore
        });
    });
}

function getPublications(req, res) {
    let page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    let itemsPerPage = 4;

    Follow.find({ user: req.user.sub }).populate('followed').exec((err, follows) => {
        if (err) return res.status(500).send({
            message: 'Error en la peticion al servidor'
        });
        let follows_clean = [];

        follows.forEach((follow) => {
            follows_clean.push(follow.followed);
        });

        Publication.find({ user: { "$in": follows_clean } })
            .sort('-create')
            .populate('user')
            .paginate(page, itemsPerPage, (err, publications, total) => {
                if (err) return res.status(500).send({
                    message: 'Error al devolver las publicaciones'
                });
                if (!publications) {
                    return res.status(404).send({
                        message: 'No hay publicaciones'
                    });
                }
                return res.status(200).send({
                    total_items: total,
                    pages: Math.ceil(total / itemsPerPage),
                    page: page,
                    publications

                })
            });
    });
}

module.exports = {
    probando,
    savePublication,
    getPublications
}