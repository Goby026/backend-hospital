var express = require('express');

var fileUpload = require('express-fileupload');

var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());



app.put('/:tipo/:id', (req, res, next)=>{

    var tipo = req.params.tipo;
    var id = req.params.id;

    //tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if(tiposValidos.indexOf(tipo) < 0 ){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors : { message:'Tipo de coleccion no es valida' }
        });
    }

    if(!req.files){

        return res.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errors : { message:'Debe seleccionar una imagen' }
        });

    }

    //obtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[ nombreCortado.length - 1 ];

    //extensiones aceptadas
    var extensionesValidas = ['png','jpeg','jpg','gif'];

    //validar la extension
    if( extensionesValidas.indexOf(extensionArchivo) < 0 ){
        return res.status(400).json({
            ok: false,
            mensaje: 'No es una extensión válida',
            errors : { message:'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }

    //Nombre de archivo personalizado
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    //Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv( path, err => {

        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors : err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res );

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionArchivo: extensionArchivo
        // });

    } );

});


function subirPorTipo( tipo, id, nombreArchivo, res ){

    if( tipo === 'usuarios' ){
        Usuario.findById( id , (err, usuario) => {

            if( !usuario ){
                res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el usuario indicado',
                    errors: { mensaje: 'Error: ' + err }
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            //si existe, elimina la imagen anterior
            if( fs.existsSync(pathViejo) ){
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save( (err, usuarioActualizado ) => {

                usuarioActualizado.password = ':-D';

                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuarioActualizado: usuarioActualizado
                });
            });

        });
    }

    if( tipo === 'medicos' ){

        Medico.findById( id , (err, medico) => {

            if( !medico ){
                res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el médico indicado',
                    errors: { mensaje: 'Error: ' + err }
                });
            }

            var pathViejo = './uploads/medicos/' + medico.img;

            //si existe, elimina la imagen anterior
            if( fs.existsSync(pathViejo) ){
                fs.unlink(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save( (err, medicoActualizado ) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de médico actualizada',
                    medicoActualizado: medicoActualizado
                });
            });

        });
    }

    if( tipo === 'hospitales' ){

        Hospital.findById( id , (err, hospital) => {

            if( !hospital ){
                res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el hospital indicado',
                    errors: { mensaje: 'Error: ' + err }
                });
            }

            var pathViejo = './uploads/hospitales/' + hospital.img;

            //si existe, elimina la imagen anterior
            if( fs.existsSync(pathViejo) ){
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save( (err, hospitalActualizado ) => {
                res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospitalActualizado: hospitalActualizado
                });
            });

        });

    }

    
}

module.exports = app;