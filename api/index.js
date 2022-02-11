'use strict'

let mongoose = require('mongoose');
let app = require('./app');
let port = 3800;

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/red-social', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("La coneccion a la base de datos es correcta");

        app.listen(port, () => {
 console.log("servidor corriendo correctamente en http://localhost:3800");
        });
}).catch(err =>console.log(err));
