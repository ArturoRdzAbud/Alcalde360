const mssql = require("mssql");
const sqlConfig = require("../config/db");
//Configuración de Twilio
const twilio = require('../config/Twilio');

exports.GuardarFicha = async (body) => {
  try {
    // console.log(body);
    const pool = await mssql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("pnIdAlcaldia", body.pnIdAlcaldia)
      .input("pnFicha", body.pnFicha)
      .input("pnIdSolicitudAgenda", body.pnIdSolicitudAgenda)
      .input("psTitulo", body.psTitulo)
      .input("psFecha", body.psFecha)
      .input("psHora", body.psHora)
      .input("psHoraFin", body.psHoraFin)
      .input("psTema", body.psTema)
      .input("psLugar", body.psLugar)
      .input("psXmlParticipante", body.psXmlParticipante)
      .input("psXmlAcuerdo", body.psXmlAcuerdo)
      .input("psXmlActividades", body.psXmlActividades)
      .input("psXmlArchivos", body.psXmlArchivos)
      .execute("GuardarFicha_WhatsApp");
    //return result.recordsets[0];
    const fichaTecnicaReunion = result.recordsets[0]
    const nombreAlcalde = fichaTecnicaReunion[0].NombreAlcalde
    const whatsAppAlcalde = '521'+ fichaTecnicaReunion[0].TelefonoAlcalde

    const fecha = fichaTecnicaReunion[0].Fecha;
    const fechaFormateada = new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(fecha);

    const link = "https://localhost:5173/FichaTecnicaReunion?pnIdAlcaldia=" + body.pnIdAlcaldia + "&pnIdFichatecnica=" + fichaTecnicaReunion[0].IdFichaTecnica        

    // Enviar mensaje con información de la ficha técnica de la reunión al alcalde
    const mensajeAlcalde = `Hola Alcalde ${nombreAlcalde}, compartimos información relevante acerca de la reunión que se llevará a cabo el día *${fechaFormateada}* a las *${fichaTecnicaReunion[0].HoraIni}* en *${fichaTecnicaReunion[0].Lugar}* para revisar el asunto: *"${fichaTecnicaReunion[0].Asunto}"* con *${fichaTecnicaReunion[0].Nombre}*.\nPuede comunicarse con el solicitante a este número: *${fichaTecnicaReunion[0].Telefono}*.\nPara ver mas detalles de la reunión, puede entrar al siguiente link: ${link}`;
    await twilio.sendTextMessage(whatsAppAlcalde, mensajeAlcalde);
    
    //console.log(nombreCiudadano)
    //console.log(whatsAppCiudadano)
    //console.log(whatsAppFuncionario)
    console.log('GUARDA CORRECTAMENTE')
    return fichaTecnicaReunion[0].IdFichaTecnica
  } catch (err) {
    console.log(err.message);
    return err.message;
  }
};
