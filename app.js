//Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//importar Rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');
var hospitalRoutes = require('./routes/hopital');
var medicoRoutes = require('./routes/medico');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imagenesRoutes = require('./routes/imagenes');

//Inicializar variables
var app = express();


//body-parser, para realizar peticiones HTTP (post)
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( err, res ) =>{

    if ( err ) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

});

//Server index config
var serveIndex = require('serve-index');
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads'));

//Rutas
app.use('/img', imagenesRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/medico', medicoRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/upload', uploadRoutes);

app.use('/', appRoutes);

//Escuchar peticiones
app.listen(3000, () =>{
    console.log('Servidor express: \x1b[32m%s\x1b[0m', 'online');
});

//para iniciar el servidor usar: node app.js || node app