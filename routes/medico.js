var express = require('express');

var autenticacion = require('../middlewares/autenticacion');

var app = express();
var Medico = require('../models/medico');


//===============================================
//=========== GET todos los medicos =============
//===============================================
app.get('/', (req, res, next)=>{

    var desde = req.query.desde || 0; //sino se recibe el parametro se establece en 0
    desde = Number(desde);//el usuario debe enviar solo numeros en el formulario

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
        (err, medicos)=>{
            if(err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando médicos',
                    errors : err
                });
            }

            Medico.count({}, (err, conteo) =>{

                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });

            });
            
        });
});


//=============================================
//=========== PUT actualizar médico ===========
//=============================================
app.put('/:id', autenticacion.verificaToken,  ( req, res )=>{

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, ( err, medico )=>{

        //si existe algun error
        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors : err
            });
        }

        //si no existe el médico
        if( !medico ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra el medico con el id: '+ id,
                errors : { message: 'No existe un hospital con ese id' }
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( (err, medicoGuardado) =>{
            if(err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors : err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

    });

});

//==============================================
//============= POST crear médico ==============
//==============================================
app.post('/', autenticacion.verificaToken, (req, res)=> {

    var body = req.body;

    var medico = new Medico({
        nombre : body.nombre,
        img : body.img,
        usuario : req.usuario._id,
        hospital : body.hospital
    });

    medico.save(( err , medicoGuardado )=>{
        if(err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear médico',
                errors : err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });

        //extrae el usuario de decoded del middleware de autenticacion, muy util para saber que usuario esta haciendo las peticiones
    });

});

//=================================================
//============= DELETE borrar médico ==============
//=================================================
app.delete('/:id', autenticacion.verificaToken,  (req, res)=> {

    var id = req.params.id;

    Medico.findByIdAndRemove(id,( err , medicoBorrado )=>{
        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar médico',
                errors : err
            });
        }
        
        if( !medicoBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'No se encuentra el medico solicitado',
                errors : { message: 'No existe un medico con ese id' }
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoBorrado
        });
    });

});

module.exports = app;