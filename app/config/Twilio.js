// Cargar dotenv para acceder a las variables de entorno
require('dotenv').config();

// Configuración de Twilio
// Obtiene las credenciales desde el archivo .env
const accountSid = "AC8cc46acd638d67ccd4a18342c7b2f0d9";//process.env.TWILIO_ACCOUNT_SID; // Tu SID de cuenta de Twilio
const authToken = "8b58ddd1921105f6c5f01e2193f0f389";//process.env.TWILIO_AUTH_TOKEN;   // Tu token de autenticación


const client = require("twilio")(accountSid, authToken);

function sendTextMessage(sender, message) {
    return new Promise((resolve, reject) => {
      client.messages
        .create({
          from: "whatsapp:+14155238886",
          body: message,
          to: "whatsapp:+" + sender,
        })
        .then((message) => resolve())
        .catch((err) => reject(err));
    });
  }
  
 
  module.exports = {
    sendTextMessage,
  };

/*
sendTextMessage('5218121003020','Hola Mundo!')
*/