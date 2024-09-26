const express = require('express');
const cors = require('cors');
require('./app/auth/auth');

const routes = require('./app/routes/routes');
const app = express();
const port = process.env.PORT || 3000;


//Configuración de Twilio
const twilio = require("./Twilio");

app.use(express.json());
app.set('port', port);
app.use(cors());
app.use('/', routes);


//Configuración de Twilio
app.use(express.urlencoded({ extended: true }));

// console.log("TWILIO_ACCOUNT_SID: ", process.env.TWILIO_ACCOUNT_SID);
// console.log("TWILIO_AUTH_TOKEN: ", process.env.TWILIO_AUTH_TOKEN);

app.post("/webhook", function (req, res) {
    console.log("req ->", req.body);
    twilio.sendTextMessage(req.body.WaId, req.body.Body);
    res.status(200).json({ ok: true, msg: "Mensaje enviado correctamente" });
  });


// Inicia el servidor
const main = () => app.listen(app.get('port'), () => console.log(`Server is running on port ${app.get('port')}.`));

main();


