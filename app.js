const express = require('express');
const cors = require('cors');
require('./app/auth/auth');

const routes = require('./app/routes/routes');
const app = express();
const port = process.env.PORT || 3000;


//Configuración de Twilio
const twilio = require("./app/config/Twilio");

//importamos axios para la llamada a los servicios de Guardar Incidencia y Guardar Evidencias de la Incidencia 
const axios = require('axios');
const FormData = require('form-data');


// Aumentar el límite de tamaño
app.use(express.json({ limit: '30mb' })); // Aumenta el límite de tamaño según lo necesites
app.use(express.urlencoded({ limit: '30mb', extended: true }));


app.use(express.json());
app.set('port', port);
app.use(cors());
app.use('/', routes);

//Configuración de Twilio
app.use(express.urlencoded({ extended: true }));


//Código para generar un Chatbot que interactue con el usuario para el registro de la Incidencia
//**************************************CHATBOT DE WHATSAPP ALCALDE 360 ********************************

// Función para extraer el ID y la descripción
function obtenerId(texto) {
  const partes = texto.split(" - ");
  const id = partes[0].trim();  // Extraemos el ID  
  return { id };
}

// Función para validar si es valido el ID capturado por el usuario
function validaIdCapturado(arreglo, idCapturado) {
  // Recorremos los el arreglo y verificamos el ID
  for (const elemento of arreglo) {
    const { id } = obtenerId(elemento);

    console.log(elemento)  
    console.log(id) 
    console.log(idCapturado) 

    // Verificamos si el id Capturado por el usuario coincide con el ID del arreglo
    if (id === idCapturado) {
      return true;
    }
  }

  return false;

}


// Estado para Almacenar las respuestas de los usuarios
let users = {};

// Listas de opciones para desplegables
// !OJO!, Estas se tienen que obtener de la BD, a tráves de un Dataset, temporalmente lo manejamos asi
const tiposDeIncidencia = ["1 - Fuga de Agua", "2 - Luminaria", "3 - Bache"];
const colonias = ["596 - Soto la Marina Centro", "5 - Lázaro Cárdenas", "2018 - Del Río Solidaridad"];

// Preguntas del chatbot
const preguntas = [
  `¿Cuál es el tipo de incidencia que deseas reportar: ${tiposDeIncidencia.join(", ")} ?`,
  "Por favor, describe brevemente la incidencia.",
  "¿Cuál es la calle donde se presenta la incidencia?",
  "Si conoces el número del domicilio donde se presenta la incidencia capturalo, de lo contrario, captura 1 para continuar",
  "Si conoces el código postal del domicilio donde se presenta la incidencia capturalo, de lo contrario, captura 1 para continuar",
  `Selecciona una colonia: (${colonias.join(", ")})`,
  "Si tienes fotos de evidencia, envíalas ahora (máximo 3)",
  "¿Cuál es tu nombre completo?",
  "Por favor, indícanos tu número de teléfono."
];

// Manejador de webhook de Twilio
app.post("/webhook", function (req, res) {
  const from = req.body.WaId;
  const message = req.body.Body ? req.body.Body.trim().toLowerCase() : "";
  const mediaUrl = req.body.MediaUrl0; // Captura de imágenes (si las hay)

  // Si el usuario no está en el objeto users, inicializar su estado
  if (!users[from]) {
    users[from] = { step: 0, data: {} };
    twilio.sendTextMessage(from, '¡Hola Bienvenido!, soy el Chatbot de Alcalde 360, Vamos a recolectar la información de tu incidencia.');
    // Usamos setTimeout para retrasar el segundo mensaje
    setTimeout(() => {
      twilio.sendTextMessage(from, preguntas[users[from].step]);
    }, 500); // El segundo mensaje se enviará 1/2 segundo después     
    return res.status(200).json({ ok: true });
  }

  const user = users[from];

  // Manejar el flujo dependiendo del paso actual
  switch (user.step) {
    case 0: // Tipo de incidencia
            
      // Verificamos si el mensaje normalizado está en la lista de tipos de incidencia
      if (validaIdCapturado(tiposDeIncidencia, message)) {
        user.data.idTipoIncidencia = message;  // Guardar el tipo de incidencia sin normalizar, tal como lo introdujo el usuario
        user.step++;
        twilio.sendTextMessage(from, preguntas[user.step]);
      } else {
        twilio.sendTextMessage(from, `Por favor, selecciona una opción válida: ${tiposDeIncidencia.join(", ")}`);
      }
      break;

    case 1: // Descripción de la incidencia
      user.data.descripcion = message;
      user.step++;
      twilio.sendTextMessage(from, preguntas[user.step]);
      break;

    case 2: // Calle donde se presenta la Incidencia
      user.data.calle = message;
      user.step++;
      twilio.sendTextMessage(from, preguntas[user.step]);
      break;
    
    case 3: // Número donde se presenta la Incidencia
      if (!isNaN(message)) {
        user.data.numeroDomicilio = message;
        user.step++;
        twilio.sendTextMessage(from, preguntas[user.step]);
      } else {
        twilio.sendTextMessage(from, 'Por favor, ingresa un número de domicilio válido.');
      }
      break;

    case 4: // Código postal donde se presenta la Incidencia
      if (!isNaN(message) && message.length === 5) {
        user.data.codigoPostal = message;
        user.step++;
        twilio.sendTextMessage(from, preguntas[user.step]);
      } else {
        twilio.sendTextMessage(from, 'Por favor, ingresa un código postal válido (5 dígitos).');
      }
      break;

    case 5: // Seleccionar colonia donde se presenta la Incidencia
               
      // Verificamos si el id capturado por el usuario esta en los Ids del listado de colonias
      if (validaIdCapturado(colonias, message)) {
        user.data.idColonia = message;  // Guardar el id de la colonia
        user.step++;
        twilio.sendTextMessage(from, preguntas[user.step]);
      } else {
        twilio.sendTextMessage(from, `Por favor, selecciona una opción válida: ${colonias.join(", ")}`);
      }
      break;
    
    
      case 6: // Adjuntar fotos (máximo 3)
      // Verificamos si se recibió una imagen
      if (mediaUrl) {
        // Inicializamos el array de fotos si no existe
        user.data.fotos = user.data.fotos || [];
  
        // Si aún no se han adjuntado 3 fotos, permitimos agregar la imagen
        if (user.data.fotos.length < 3) {
          user.data.fotos.push(mediaUrl);
          twilio.sendTextMessage(from, `Imagen recibida. Puedes adjuntar ${3 - user.data.fotos.length} imágenes más o teclear "1" para continuar con el registro de tu incidencia.`);
  
          // Si ya se han adjuntado las 3 fotos, guardamos la incidencia
          if (user.data.fotos.length === 3) {
            twilio.sendTextMessage(from, 'Has adjuntado el máximo de 3 imágenes. Continuamos con el registro de tu incidencia.');
            user.step++;
            twilio.sendTextMessage(from, preguntas[user.step]);
          } 
        }
      } else if (message === '1') {
        // Si el usuario teclea "1", guardamos la incidencia si hay al menos una imagen
        if (user.data.fotos && user.data.fotos.length > 0) {
          user.step++;
          twilio.sendTextMessage(from, preguntas[user.step]);
        } else {
          twilio.sendTextMessage(from, 'Debes adjuntar al menos una imagen antes de registrar tu incidencia.');
        }
      } else {
        twilio.sendTextMessage(from, 'No se recibió ninguna imagen. Puedes adjuntar hasta 3 imágenes o teclear "1" para terminar.');
      }
      break;
  
    
    case 7: // Nombre Completo
      user.data.nombre = message;
      user.step++;
      twilio.sendTextMessage(from, preguntas[user.step]);
      break;
/*
    case 3: // Apellido Paterno
      user.data.apellidoPaterno = message;
      user.step++;
      twilio.sendTextMessage(from, preguntas[user.step]);
      break;

    case 4: // Apellido Materno
      user.data.apellidoMaterno = message;
      user.step++;
      twilio.sendTextMessage(from, preguntas[user.step]);
      break;
*/
    case 8: // Teléfono
      if (!isNaN(message) && message.length >= 10) {
        user.data.telefono = message;
        user.step++;
        guardarIncidencia(user.data, from);
        delete users[from]; // Reiniciar el estado del usuario        
      } else {
        twilio.sendTextMessage(from, 'Por favor, ingresa un número de teléfono válido (10 dígitos).');
      }
      break;
/*
    case 9: // Correo electrónico
      user.data.correo = message;
      user.step++;
      twilio.sendTextMessage(from, preguntas[user.step]);
      break;
  */   

    default:
      //guardarIncidencia(user.data, from);
      //delete users[from]; // Reiniciar el estado del usuario
      break;
  }

  res.status(200).json({ ok: true });
});

// Función para guardar la incidencia (simulación)
async function guardarIncidencia(datosCiudadano, from) {
  console.log(`Incidencia registrada para el usuario ${from}:`, datosCiudadano);
  // Aquí podrías hacer una llamada a tu base de datos para guardar la incidencia

  try {

        const data = {

                pnIdAlcaldia: 1,    //SE ASIGNA 1 TEMPORALMENTE, SE DEBE CAMBIAR AL CONTAR CON UNA VARIABLE GLOBAL    
                pnIdIncidencia: 0,  //se asigna 0 para indicar que es una nueva incidencia
                psDescripcion: datosCiudadano.descripcion,
                pnIdTipoIncidencia: datosCiudadano.idTipoIncidencia,
                psNombre: datosCiudadano.nombre,
                psApellidoPaterno: '',//datosCiudadano.apellidoPaterno,
                psApellidoMaterno: '',//datosCiudadano.apellidoMaterno,
                psTelefono: datosCiudadano.telefono,
                psCorreo: '',//datosCiudadano.correo,
                psUbicacion: '',
                pnIdColonia: datosCiudadano.idColonia,
                psCalle: datosCiudadano.calle,
                psNumero: datosCiudadano.numeroDomicilio,
                psCodigoPostal: datosCiudadano.codigoPostal,
                pnIdUsuario: 1,   //SE ASIGNA 1 TEMPORALMENTE, SE DEBE CAMBIAR AL CONTAR CON UNA VARIABLE GLOBAL
                pnAccion: 1
        };

        console.log('data: ', data)
    
    let idIncidencia = 0;
    const apiReq = 'http://localhost:3000/GuardarIncidencia';
    await axios.post(apiReq, { data }, { 'Access-Control-Allow-Origin': '*' })    
    .then(response => {    
      if (!response.data == '') {
          if (response.data.originalError === undefined) {
            idIncidencia = response.data;
            console.log('guardo correctamente, idIncidencia: ' + idIncidencia)
          }
          else {
              console.log('response.data.originalError.info.message: ' + response.data.originalError.info.message)
          }
      } 
    })



  // Guardar la imagen en la base de datos
  const idAlcaldia = 1;
  const idUsuario = 1;
 
  const fotos = datosCiudadano.fotos; //asigna el arreglo que contiene las Urls donde estan las imagenes https://api.twilio.com
  for (const fotoUrl of fotos) {
    const binaryImage = await ConvierteImagenABinario(fotoUrl); // Descarga y convierte a binario    
    const apiReq = 'http://localhost:3000/GuardarIncidenciaEvidencia';
    const formData = new FormData()
          formData.append('piEvidencia', binaryImage, {
            filename: 'imagen.jpg', // Nombre del archivo
            contentType: 'image/jpeg', // Especifica el tipo MIME correcto
          });
          formData.append('pnIdAlcaldia', idAlcaldia)
          formData.append('pnIdIncidencia', idIncidencia)
          formData.append('pnIdUsuario', idUsuario)
          console.log('GUARDAR EVIDENCIA')
          
          if (!binaryImage) {
              alert('Debe seleccionar un archivo')
              return
          }
          else if (binaryImage.size > 1000000) {
              alert('El límite máximo del archivo es 1 MB. Favor de validar ')
              return
          }
          else {
              try {
                  console.log('entra a llamar el servicio de GuardarIncidenciaEvidencia')
                  console.log('información de archivo binario', binaryImage)
                  //await axios.post(apiReq, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                  await axios.post(apiReq, formData, { headers: { ...formData.getHeaders(), } });
                  console.log('guardo correctamente')  
                                                  
              } catch (error) {               
                  if (!error.message == '') {
                      console.log('REGRESA ERROR:')
                      console.error('Error al guardar la evidencia', error);
                                            
                  }
                  
              }
          }
  }


  
} catch (error) {
  console.error('Error al guardar la Incidencia.', error);
}
  
  
}



// Función para descargar la imagen desde la URL y convertirla a binario
async function ConvierteImagenABinario(url) {

 
  try {
    const auth = {
      username: 'AC8cc46acd638d67ccd4a18342c7b2f0d9', // Reemplaza con tu Account SID de Twilio
      password: '66696e3e8ac2c3221f2520f24f6954c0'   // Reemplaza con tu Auth Token de Twilio
    };

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer', // Esto convierte la respuesta a binario
      auth, // Añade la autenticación básica aquí
    });

    return response.data; // Devuelve los datos binarios de la imagen
  } catch (error) {
    console.error('Error descargando la imagen: ', error);
    throw error;
  }
/*
  try {

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer', // Esto convierte la respuesta a binario
    });

    return response.data; // Devuelve los datos binarios de la imagen


  } catch (error) {
    console.error('Error descargando la imagen: ', error);
    throw error;
  }
*/

}

/*
// Función principal para procesar y guardar imágenes
async function processAndSaveImages(incidenciaId, fotos) {
  for (const fotoUrl of fotos) {
    const binaryImage = await downloadImageAsBinary(fotoUrl); // Descarga y convierte a binario
    await saveImageToDatabase(incidenciaId, binaryImage); // Guarda en la base de datos
  }
}
  */

//**************************************CHATBOT DE WHATSAPP ALCALDE 360 ********************************


// Inicia el servidor
const main = () => app.listen(port, () => console.log(`El servidor esta corriendo en el puerto ${port}.`));

main();




