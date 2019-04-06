var express = require('express');

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

//Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

//===========================================================================
// AUTENTICACION GOOGLE
//===========================================================================

async function verify( token ) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];


    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

  }


app.post('/google', async ( req, res ) => {

    var token = req.body.token;

    var googleUser = await verify( token )
                        .catch( e => {
                            res.status(403).json({
                                ok: false,
                                mensaje: 'Token no valido'
                            });
                        });

    Usuario.findOne( {email: googleUser.email }, (err, usuarioDB) => {

        if( err ){

            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuario',
                errors: err
            });

        }

        //si el usuario que se esta logeando, ya existe en la base de datos
        if( usuarioDB ){

            if( usuarioDB.google === false ){
                res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal'
                });
            }else{
                //Crear un token
                var token = jwt.sign({usuario: usuarioDB}, SEED , { expiresIn: 14400 });//4 horas

                res.status(201).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id,
                    msg: 'Usuario logeado correctamente con google'
                });
            }

        }else{ 
            //es la primera ves que el usuario se esta autenticando/registrando en la aplicacion con Google
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.picture;
            usuario.google = true;
            usuario.password = ':-)';

            usuario.save( (err, usuarioDB) => {

                if( err ){
                    res.status(500).json({
                        ok: false,
                        mensaje: 'Error al registrar Usuario',
                        errors: err
                    });
                }

                //Crear token
                var token = jwt.sign({usuario: usuarioDB}, SEED , { expiresIn: 14400 });

                res.status(201).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id
                });
            });

        }
    });

    // res.status(200).json({
    //     ok: true,
    //     mesaje: 'OK!!!!',
    //     googleUser: googleUser
    // });
});




//===========================================================================
// AUTENTICACION NORMAL
//===========================================================================

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