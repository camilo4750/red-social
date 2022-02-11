let express = require('express');
let multipart = require('connect-multiparty');
let mdAut = require('../middlewares/authenticated');
let md_upload = multipart({ uploadDir: './uploads/publications' });
let api = express.Router();

let PublicationController = require('../controllers/publication');

api.get('/prueba', mdAut.ensureAuth, PublicationController.probando);
api.post(
    '/publication',
    mdAut.ensureAuth,
    PublicationController.savePublication
)

api.get(
    '/publications/:page?',
    mdAut.ensureAuth,
    PublicationController.getPublications

)
module.exports = api;