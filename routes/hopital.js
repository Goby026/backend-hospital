var express = require('express');

var autenticacion = require('../middlewares/autenticacion');

var app = express();
var Hospital = require('../models/hospital');


//===============================================
//=========== GET todos los hospitales===========
//===============================================
app.get('/', (req, res, next)=>{

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')//especificar que tabla y que campos de la coleccion de la base de datos
        .exec(
        (err, hospitales)=>{
            if(err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors : err
                });
            }

            Hospital.count({}, (err, conteo) =>{

                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });

            });

        });
});


//============================================
//===========PUT actualizar hospital===========
//============================================
app.put('/:id', autenticacion.verificaToken,  ( req, res )=>{

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, ( err, hospital )=>{

        //si existe algun error
        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors : err
            });
        }

        //si no existe el hospital
        if( !hospital ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra el hospital con el id: '+ id,
                errors : { message: 'No existe un hospital con ese id' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalGuardado) =>{
            if(err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors : err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });

});

//==============================================
//=============POST crear hospital==============
//==============================================
app.post('/', autenticacion.verificaToken, (req, res)=> {

    var body = req.body;

    var hospital = new Hospital({
        nombre:body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save(( err , hospitalGuardado )=>{
        if(err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors : err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            hospitalToken: req.usuario
        });

        //extrae el usuario de decoded del middleware de autenticacion, muy util para saber que usuario esta haciendo las peticiones
    });

});

//=================================================
//=============DELETE borrar hospital==============
//=================================================
app.delete('/:id', autenticacion.verificaToken,  (req, res)=> {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id,( err , hospitalBorrado )=>{
        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors : err
            });
        }
        
        if( !hospitalBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra el hospital solicitado',
                errors : { message: 'No existe un hospital con ese id' }
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });

});

module.exports = app;