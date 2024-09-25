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
const consultarIncidencia = require('../controllers/ConsultarIncidencia');
const guardarAreayPrioridadIncidencia = require('../controllers/GuardarAreayPrioridadIncidencia');
const consultarColonias = require('../controllers/ConsultarColonias');
const guardarIncidencia = require('../controllers/GuardarIncidencia');

const consultarArbitroFoto = require('../controllers/ConsultarArbitroFoto');
const consultarIncidenciaEvidencia = require('../controllers/ConsultarIncidenciaEvidencia');

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
router.get('/ConsultarColonias', consultarColonias.get);

router.get('/ConsultarArbitroFoto', consultarArbitroFoto.get);
router.get('/ConsultarIncidenciaEvidencia', consultarIncidenciaEvidencia.get);

router.get('/', defaultRoute.get);
router.post('/GuardarGrid', guardarGrid.post);
router.post('/GuardarArbitro', guardarArbitro.post);
router.post('/GuardarUsuario', guardarUsuario.post);
router.post('/GuardarAreayPrioridadIncidencia', guardarAreayPrioridadIncidencia.post);
router.post('/GuardarIncidencia', guardarIncidencia.post);

router.post('/login', login.post);
router.get('/validsession', passport.authenticate('jwt', { session: false }), validsession.get);
router.get('/ConsultarIncidencia', consultarIncidencia.get);

// Ruta para manejar la carga de fotografia del Árbitro
router.post('/GuardarIncidenciaEvidencia', upload.single('piEvidencia'), async (req, res) => {
    try {
        //console.log(req.body)
        const pool = await mssql.connect(sqlConfig);
        const request = pool.request()
        console.log(req.body.pnIdAlcaldia)
        console.log(req.body.pnIdIncidencia)
        console.log(req.body.pnIdUsuario)
        console.log('mensaje del server')

        // Guardar la imagen en la base de datos
        const image = req.file.buffer;
        const idAlcaldia = req.body.pnIdAlcaldia;
        const idIncidencia = req.body.pnIdIncidencia;
        const idUsuario = req.body.pnIdUsuario;


        request.input('pnImage', mssql.VarBinary, image); // Declara el parámetro @image y asigna el valor 'image'
        request.input('pnIdAlcaldia', mssql.Int, idAlcaldia)
        request.input('pnIdIncidencia', mssql.Int, idIncidencia)
        request.input('pnIdUsuario', mssql.Int, idUsuario)

        const response = await request.query('DECLARE @pnIdEvidencia AS INT IF (SELECT COUNT(1) FROM dbo.IncidenciaEvidencia WHERE IdAlcaldia = @pnIdAlcaldia AND IdIncidencia = @pnIdIncidencia) < 3 BEGIN SET @pnIdEvidencia = dbo.ObtieneSiguienteIdEvidencia(@pnIdAlcaldia, @pnIdIncidencia) INSERT INTO [dbo].[IncidenciaEvidencia]([IdAlcaldia],[IdIncidencia],[IdEvidencia],[Evidencia],[FechaUltimaMod],[NombrePcMod],[ClaUsuarioMod]) VALUES(@pnIdAlcaldia, @pnIdIncidencia, @pnIdEvidencia, @pnImage, Getdate(), host_name(), @pnIdUsuario) SELECT Evidencias = 0 END ELSE BEGIN SELECT Evidencias = 3 END');
        let evidencias = response.recordset[0].Evidencias;
        console.log(evidencias)
        if (evidencias === 3) 
        {
            res.status(200).send('No se pueden agregar más de 3 evidencias por incidencia');
        }
        else
        {
            res.status(200).send('Guardo exitosamente la evidencia');
        }
        
        
    } catch (error) {
        //console.error('Error al subir la imagen:', error);
        res.status(500).send('Error al subir la evidencia');
        console.log(error.message)
        //return err.message;
    }
});



module.exports = router;