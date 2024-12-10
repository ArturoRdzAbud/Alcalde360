const express = require('express');
const router = express.Router();
const passport = require('passport');
const mssql = require('mssql');
const sqlConfig = require('../config/db');
const multer = require('multer');

/*
// Configuración de multer para manejar el almacenamiento de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
*/
// Configura multer para manejar el archivo binario de las evidencias
const upload = multer({
    limits: { fileSize: 5 * 1024 * 1024 }, // Límite de tamaño de archivo: 5 MB, ajusta si es necesario
});

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
const guardarEncuesta = require('../controllers/GuardarEncuesta');
const ConsultarArbitros = require('../controllers/ConsultarArbitros');
const consultarUsuarios = require('../controllers/ConsultarUsuarios');
const guardarUsuario = require('../controllers/GuardarUsuario');
const consultarUsuariosAdministradores = require('../controllers/ConsultarUsuariosAdministradores');
const consultarIncidencia = require('../controllers/ConsultarIncidencia');
const guardarAreayPrioridadIncidencia = require('../controllers/GuardarAreayPrioridadIncidencia');
const consultarColonias = require('../controllers/ConsultarColonias');
const guardarIncidencia = require('../controllers/GuardarIncidencia');

const GuardarAreayPrioridadIncidencia = require('../controllers/GuardarAreayPrioridadIncidencia');
const GuardarEstatusIncidencia = require('../controllers/GuardarEstatusIncidencia');
const GuardarSolicitudAgenda = require('../controllers/GuardarSolicitudAgenda');
const GuardarFicha = require('../controllers/GuardarFicha');
const consultarArbitroFoto = require('../controllers/ConsultarArbitroFoto');
const consultarIncidenciaEvidencia = require('../controllers/ConsultarIncidenciaEvidencia');

const ConsultarEventos = require('../controllers/ConsultarEventos');
const ConsultarEventoParticipantes = require('../controllers/ConsultarEventoParticipantes');
const ConsultarEventoProgramas = require('../controllers/ConsultarEventoProgramas');

const GuardarFichaTecnicaEvento = require('../controllers/GuardarFichaTecnicaEvento');
const GuardaFichaTecnicaEventoGrids = require('../controllers/GuardaFichaTecnicaEventoGrids');

const consultarSolicitudAgenda = require('../controllers/ConsultarSolicitudAgenda');

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
router.get('/ConsultarSolicitudAgenda', consultarSolicitudAgenda.get);

router.get('/', defaultRoute.get);
router.post('/GuardarGrid', guardarGrid.post);
router.post('/GuardarArbitro', guardarArbitro.post);
router.post('/GuardarEncuesta', guardarEncuesta.post);
router.post('/GuardarUsuario', guardarUsuario.post);
router.post('/GuardarAreayPrioridadIncidencia', guardarAreayPrioridadIncidencia.post);
router.post('/GuardarIncidencia', guardarIncidencia.post);

router.post('/login', login.post);
router.get('/validsession', passport.authenticate('jwt', { session: false }), validsession.get);
router.get('/ConsultarIncidencia', consultarIncidencia.get);

router.get('/ConsultarEventos', ConsultarEventos.get)
router.get('/ConsultarEventoParticipantes', ConsultarEventoParticipantes.get)
router.get('/ConsultarEventoProgramas', ConsultarEventoProgramas.get)

router.post('/GuardarFichaTecnicaEvento', GuardarFichaTecnicaEvento.post)
router.post('/GuardaFichaTecnicaEventoGrids', GuardaFichaTecnicaEventoGrids.post)

router.post('/GuardarAreayPrioridadIncidencia', GuardarAreayPrioridadIncidencia.post);
router.post('/GuardarEstatusIncidencia', GuardarEstatusIncidencia.post);
router.post('/GuardarSolicitudAgenda', GuardarSolicitudAgenda.post);
router.post('/GuardarFicha', GuardarFicha.post);
// Ruta para manejar la carga de fotografia del Árbitro
router.post('/GuardarIncidenciaEvidencia', upload.single('piEvidencia'), async (req, res) => {
    try {
        //console.log(req.body)
        const pool = await mssql.connect(sqlConfig);
        const request = pool.request()


        // Verifica si el archivo fue cargado correctamente
        if (!req.file) {
            return res.status(400).send('No se recibió ningún archivo.');
        }

        // Guardar la imagen en la base de datos
        //console.log('manda información de req:', req)
        const image = req.file.buffer;

        if (!image) {
            return res.status(400).send('No se recibió ninguna imagen.');
        }

        //const image = req.body.piEvidencia;
        const idAlcaldia = req.body.pnIdAlcaldia;
        const idIncidencia = req.body.pnIdIncidencia;
        const idUsuario = req.body.pnIdUsuario;

        console.log('asignación correcta de parametros')

        request.input('pnImage', mssql.VarBinary(mssql.MAX), image); // Declara el parámetro @image y asigna el valor 'image'
        request.input('pnIdAlcaldia', mssql.Int, idAlcaldia)
        request.input('pnIdIncidencia', mssql.Int, idIncidencia)
        request.input('pnIdUsuario', mssql.Int, idUsuario)

        console.log(request.parameters)

        //const response = await request.query('DECLARE @pnIdEvidencia AS INT IF (SELECT COUNT(1) FROM dbo.IncidenciaEvidencia WHERE IdAlcaldia = @pnIdAlcaldia AND IdIncidencia = @pnIdIncidencia) < 3 BEGIN SET @pnIdEvidencia = dbo.ObtieneSiguienteIdEvidencia(@pnIdAlcaldia, @pnIdIncidencia) INSERT INTO [dbo].[IncidenciaEvidencia]([IdAlcaldia],[IdIncidencia],[IdEvidencia],[Evidencia],[FechaUltimaMod],[NombrePcMod],[ClaUsuarioMod]) VALUES(@pnIdAlcaldia, @pnIdIncidencia, @pnIdEvidencia, @pnImage, Getdate(), host_name(), @pnIdUsuario) SELECT Evidencias = 0 END ELSE BEGIN SELECT Evidencias = 3 END');
        const response = await request.execute('GuardarImagen')
        let evidencias = response.recordset[0].Evidencias;
        console.log(evidencias)
        if (evidencias === 3) {
            res.status(200).send('No se pueden agregar más de 3 evidencias por incidencia');
        }
        else {
            res.status(200).send('Guardo exitosamente la evidencia');
        }


    } catch (error) {
        //console.error('Error al subir la imagen:', error);
        res.status(500).send('Error al subir la evidencia');
        console.log(error.message)
        //return err.message;
    }
});

/*
const axios = require('axios');
const cheerio = require('cheerio'); // Para analizar HTML

async function getAuthorizationCode() {
  const tenantId = "b15d8fa9-690a-4b8a-9b08-df1642c6c557";
  const clientId = "5fad5f20-a0e2-40db-9fbb-a85c09909a44";
  const redirectUri = "http://localhost:3000/";
  const scope = "https://analysis.windows.net/powerbi/api/.default";
  const loginHint = "arturorodriguezabud@grupoartra.onmicrosoft.com";

  // Construcción de la URL
  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize` +
    `?client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&login_hint=${encodeURIComponent(loginHint)}`;

  try {
    console.log("Realizando llamada GET a la URL de autorización...");
    const response = await axios.get(authUrl, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    console.log("Respuesta recibida, analizando HTML...");

    // Cargar el cuerpo HTML de la respuesta
    const $ = cheerio.load(response.data);

    console.log(response.data)

    // Buscar el código de autorización en el HTML
    const authCode = $('input[name="code"]').val(); // Esto depende de cómo esté estructurado el HTML
    if (authCode) {
      console.log("Código de autorización capturado:", authCode);
      return authCode;
    } else {
      throw new Error("No se encontró el código de autorización en el HTML.");
    }
  } catch (err) {
    console.error("Error al obtener el código de autorización:", err.message);
    return null;
  }
}
*/



/*
//FUNCIONA PASANDO UN CÓDIGO DE AUTORIZACIÓN CORRECTO

const axios = require('axios');
async function getAccessToken() {
 
  //const authorizationCode = await getAuthorizationCode();
  const authorizationCode = "1.AWEBqY9dsQppikubCN8WQsbFVyBfrV_ioNtAn7uoXAmQmkRiAUthAQ.AgABBAIAAADW6jl31mB3T7ugrWTT8pFeAwDs_wUA9P8lyfqnjb1t9nV2aaV9DpKJE5gLNEPAD9eYgstcBZR8EG4ZyNtVOKR82j9Fb5tm_QPiFmg_D6mCLUtN3zoCtXo2j5euW8AfH6F3ElyKoP7jljN45DQBrIRJ6USPsySfjG6HsvnSL7AvI2qN6gbST79wTjOkdYOUN5zMepQPrxhVp-xkkOCtgJYTKiWMjhvi8cagt-w30mW-mZqqvtkp-QUGuqEE4EzuKeKL9z0YcCbk0NdQyS77MLR0xHL2vgijpIPWdr6Fo32XyDk6tbX-fKmloSL3ZbkAGST70TTHVjbflhBG1nLkGpj5dGBWxix95APY0CSQLDeyYY93p6bQHCvBNYjSEncm-EZ5lLPwkzcNHYp5j04im4dxmdkVFx_DpJW2dqWK0dAWGQKgSZ6VtOr4xj7o5cdWk1_mO8YWBxreZEWxuUnO4oKIMrU-5qKXUQHnsMR2BUh9tK1sjYaa16b7DhbsZJjXUnGRadO5PWpztC2lTADWW6lzOYeqdCiyEZ6HxhR1rng7wvyYTF2bjwkkUgUyybqeTsenvAiKMub4ZXiUUYY3-KyFvmO3U-oh844drZR4ruk3MIKlJ3RnJGHRPJKv2YrQRg8tOnkOg7TjHnFgSMW67-c_-smN33WsnXy4mB7OJiOULi53pUyKx8snydSfjuSDypVsLVt8j4iYdrNrm1Bd4iQO3Gd0UzJX0vOO0v0g9SvYEvKJPUSuOhcrTmLlzFQo"

  const tenantId = "b15d8fa9-690a-4b8a-9b08-df1642c6c557";
  const clientId = "5fad5f20-a0e2-40db-9fbb-a85c09909a44";
  const clientSecret = "";
  const code = authorizationCode;
  
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('redirect_uri', 'http://localhost:3000/');
  params.append('code', code);
                          
  
  const response = await axios.post(url, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  console.log(response.data.access_token)

  return response.data.access_token;
  
}
*/

const axios = require('axios');

async function getAccessToken() {
  const tenantId = "b15d8fa9-690a-4b8a-9b08-df1642c6c557";
  const clientId = "5fad5f20-a0e2-40db-9fbb-a85c09909a44";
  const clientSecret = ""; //para que funcione en sus ambientes tienen que poner el secreto, 
                           //si no lo tienen me lo piden y se los comparto por whatsapp, 
                           //lo tuvé que quitar porque no me dejaba hacer commit de los cambios en el repositorio
  const scope = "https://analysis.windows.net/powerbi/api/.default";
  let refresh_token = "1.AWEBqY9dsQppikubCN8WQsbFVyBfrV_ioNtAn7uoXAmQmkRiAUthAQ.AgABAwEAAADW6jl31mB3T7ugrWTT8pFeAwDs_wUA9P8OThUk9d3XIZbW4OGsJwHqqvjnVfcvEH4nejPU6R6-3onU34aSbVTEmxec0Nn3PaKfTBxucT-bu5XLSaTZSePKAAZw22RpqBb1w6ySb5GvvcCVpFU45mNfX5OH63y2Ryt-B7Beyp5yzlIgVgQA2S4OKhd_2qoVQoQXLApTwR78awwMFEQ7eVSbu5DO52dxisjB9ApHmpDCBip5y2MzyS7TizR38e-qBTnCMWt9RuHcKJySFFa-yPRBqYCgZLQWmEsKXBq-RIJToFsaGhVH2sXGXec0-Qsd9CvSPNFfGUDb_d2FLkZyKYKPra7Wmsvpw6qZJxO_TYprs1TbeWJYTTWT6WWI3xn10XtVml0a0P77ESqAWs-nbl6fS15mE24ZVU6rsuD7Q5AmtFfaddVN-JFP3fJ-6VsiY3KAefmdNULF_AVfMxAelBDSHtNllsMv4Qqs8N4h5bY4cabHibpu_OVA7WzfkNbxQ1dZpccZ9pi--xq9BCU3QAzereqYwmKretykB8twHw8Ryl5UVGocBNSJD65w2K3FJGZ6zbinfb_g1vV39iFxLdUz3JT1obce5ndeMBUeFmhN5XsczKAzTRK9c8aX6sdOd5pw5vUe-98qFRypPvCSF4hVA2ziwH38V9Dtc56UEVSMKISOacRMs8F_m9XtxP4X5KsWICIrK8_EXWfgmvEQnXm5PHV24ROsbnmmtUJWN1-vgzmNmSQ54_66W-fsCdnYAzDlwZeKr7wTZYO82nepNHX-wvTTEPV-QlrTPQFAlguP6nnxRc8MoxyiEvT4fOsDwD4yWFkLMMlKbyB6pQF_0CW_rQbyl0e6EKP2HbIDVKs628MDizjsdX693gplJevjF5g";

  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refresh_token);
  params.append('client_secret', clientSecret);
  params.append('scope', scope);

  try {
    const response = await axios.post(url, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });


    // Si el refresh token cambia, actualízalo
    if (response.data.refresh_token) {
      refresh_token = response.data.refresh_token;
    }

    console.log("Refresh Token:", response.data.refresh_token); 
    console.log("Access Token:", response.data.access_token);
    return response.data.access_token;

  } catch (err) {
    console.error("Error al obtener el token de acceso:", err.message);
    return null;
  }
}


async function generateEmbedToken() {
   
   
    const accessToken = await getAccessToken();
         
    const groupId = "fad3d819-9f17-4777-a2ad-3cc65decf46b";
    const reportId = "ee118c4d-2ffd-4bbd-87e2-b959d6ed54d3"; //parametrizable
    const datasetId = "da48caa5-f2c6-4747-9fc6-c4c6a90ca312"; // parametrizable Opcional, pero recomendable
    
    const url = `https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}/GenerateToken`;
    //const url = 'https://api.powerbi.com/v1.0/myorg/groups/fad3d819-9f17-4777-a2ad-3cc65decf46b/reports/ee118c4d-2ffd-4bbd-87e2-b959d6ed54d3/GenerateToken'
              
  
    const body = {
      accessLevel: "View",
      datasetId: datasetId
    };
  
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  
    return response.data.token;
  
  }
  
router.get('/embed-token', async (req, res) => {
    try {
        const embedToken = await generateEmbedToken();
        res.json({ token: embedToken });
        console.log("Embed Token:", embedToken)
    } catch (error) {
        console.log(error.message)
        res.status(500).send('Error generating embed token');
    }
    });
    


module.exports = router;