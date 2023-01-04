const { response } = require("express");
const { validationResult } = require("express-validator");
const Usuario = require("../models/usuario");
const bcrypt = require('bcryptjs');
const { generarJWT } = require("../helpers/jwt");


const crearUsuario = async (req, res=response) => {

    // const errores = validationResult(req);

    // if(!errores.isEmpty()){
    //     return res.status(400).json({
    //         ok: false,
    //         errors: errores.mapped()
    //     });
    // }
    const {email, password} = req.body;

    try{
        const existeEmail = await Usuario.findOne({email})

        if(existeEmail){
            return res.status(400).json({
                ok:false,
                msg:'El correo ya está registrado'
            });
        }

        const usuario = new Usuario(req.body);

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);


        await usuario.save();

        //Generar mi JWT
        const token = await generarJWT(usuario._id);

        res.json({
            ok: true,
            usuario,
            token
        });

    }catch(error){
        console.log(error);
        res.status(500).json({
            ok: false,
            msg:'Hable con el admin'
        });
    }
    
};

const login = async (req, res = response) => {
    const {email, password} = req.body;
    try{
        const usuarioDB = await Usuario.findOne({email});
        if(!usuarioDB){
            return res.status(404).json({
                ok:false,
                msg:'Email no encontrado'
            });
        }

        const validPassowrd = bcrypt.compareSync(password, usuarioDB.password);
        if(!validPassowrd){
            return res.status(400).json({
                ok:false,
                msg:'La contraseña no es válida'
            });
        }

        // Generar el JWT
        const token = await generarJWT(usuarioDB.id)

        return res.json({
            ok:true,
            usuario: usuarioDB,
            token
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            ok:false,
            msg:'Hable con el admin'
        });
    }

}

const renewToken = async(req, res=response) => {

    const uid = req.uid;

    const token = await generarJWT(uid);
    const usuario = await Usuario.findById(uid);

    res.json({
        ok:true,
        usuario,
        token
    });
}

module.exports = {
    crearUsuario,
    login,
    renewToken
}