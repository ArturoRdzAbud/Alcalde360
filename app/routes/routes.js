const express = require('express');
const router = express.Router();
const passport = require('passport');
const mssql = require('mssql');
const sqlConfig = require('../config/db');
const multer = require('multer');

// Configuración de multer para manejar el almacenamiento de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const consultarEstados = require('../controllers/ConsultarEstados');
const consultarGrid = require('../controllers/ConsultarGrid');
const consultarLogin = require('../controllers/ConsultarLogin');
const consultarCombo = require('../controllers/ConsultarCombo');
const consultarMunicipios = require('../controllers/ConsultarMunicipios');
const consultarPaises = require('../controllers/ConsultarPaises');
const consultarDiasSemana = require('../controllers/ConsultarDiasSemana');
const defaultRoute = require('../controllers/DefaultController');
const guardarGrid = require('../controllers/GuardarGrid');
const guardarArbitro = require('../controllers/GuardarArbitro');
const ConsultarArbitros = require('../controllers/ConsultarArbitros');
const consultarUsuarios = require('../controllers/ConsultarUsuarios');
const guardarUsuario = require('../controllers/GuardarUsuario');
const consultarUsuariosAdministradores = require('../controllers/ConsultarUsuariosAdministradores');

const consultarArbitroFoto = require('../controllers/ConsultarArbitroFoto');

const login = require('../auth/controllers/login');
const validsession = require('../auth/controllers/validsession');
// const { GuardarJugadorxEquipo } = require('../models/GuardarJugadorxEquipo');



router.get('/ConsultarEstados', consultarEstados.get);
router.get('/ConsultarGrid', consultarGrid.get);
router.get('/ConsultarLogin', consultarLogin.get);
router.get('/ConsultarCombo', consultarCombo.get);
router.get('/ConsultarMunicipios', consultarMunicipios.get);
router.get('/ConsultarPaises', consultarPaises.get);
router.get('/ConsultarDiasSemana', consultarDiasSemana.get);
router.get('/ConsultarArbitros', ConsultarArbitros.get);
router.get('/ConsultarUsuarios', consultarUsuarios.get);
router.get('/ConsultarUsuariosAdministradores', consultarUsuariosAdministradores.get);

router.get('/ConsultarArbitroFoto', consultarArbitroFoto.get);

router.get('/', defaultRoute.get);
router.post('/GuardarGrid', guardarGrid.post);
router.post('/GuardarArbitro', guardarArbitro.post);
router.post('/GuardarUsuario', guardarUsuario.post);

router.post('/login', login.post);
router.get('/validsession', passport.authenticate('jwt', { session: false }), validsession.get);


// Ruta para manejar la carga de fotografia del Árbitro
router.post('/GuardarArbitroFotografia', upload.single('piFotografia'), async (req, res) => {
    try {
        //console.log(req.body)
        const pool = await mssql.connect(sqlConfig);
        const request = pool.request()
        console.log(req.body.pnIdLiga)
        console.log(req.body.pnIdArbitro)
        console.log('mensaje del server')

        // Guardar la imagen en la base de datos
        const image = req.file.buffer;
        const idLiga = req.body.pnIdLiga;
        const idArbitro = req.body.pnIdArbitro;


        request.input('pnImage', mssql.VarBinary, image); // Declara el parámetro @image y asigna el valor 'image'
        request.input('pnIdLiga', mssql.Int, idLiga)
        request.input('pnIdArbitro', mssql.Int, idArbitro)
        // console.log('etapa intermedia')
        await request.query('UPDATE dbo.Arbitro SET FechaUltimaMod=Getdate(), Fotografia = @pnImage where IdLiga = @pnIdLiga AND IdArbitro = @pnIdArbitro');

        res.status(200).send('Imagen subida correctamente');
        // return request.recordsets[0];


    } catch (error) {
        //console.error('Error al subir la imagen:', error);
        res.status(500).send('Error al subir la imagen');
        console.log(error.message)
        //return err.message;
    }
});



module.exports = router;