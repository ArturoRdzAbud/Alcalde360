// Configuración de Twilio
const accountSid = "AC8cc46acd638d67ccd4a18342c7b2f0d9";
const authToken = "383d294d1e841644b21a8d3cb62980e5";
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