var express = require('express');

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

app.post('/', (req,res) =>{

    var body = req.body;

    //validando que el usuario existe en la base de datos, la condicion es = { email:body.email }
    Usuario.findOne({ email:body.email }, ( err, usuarioDB )=>{

        //si existe algun error
        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe el usuario',
                errors : err
            });
        }

        //si no existe el usuario
        if( !usuarioDB ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors : err
            });
        }

        //validar la contraseña
        if( !bcrypt.compareSync( body.password, usuarioDB.password ) ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors : err
            });
        }

        usuarioDB.password = ':D';

        //Crear un token
        var token = jwt.sign({usuario: usuarioDB}, SEED , { expiresIn: 14400 });//4 horas

        res.status(201).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });

    });

});


module.exports = app;