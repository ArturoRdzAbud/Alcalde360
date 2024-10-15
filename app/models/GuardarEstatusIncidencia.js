const mssql = require('mssql');
const sqlConfig = require('../config/db');
//Configuración de Twilio
const twilio = require('../config/Twilio');

exports.GuardarEstatusIncidencia = async (body) => {
  try {
      
    console.log('llega al servicio de actualización de estatus!!')
    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()
      .input('pnIdAlcaldia', body.pnIdAlcaldia)
      .input('pnIdIncidencia', body.pnIdIncidencia)
      .input('pnidEstatusIncidencia', body.pnIdEstatus)   
      .input('pdFechaEstimada', body.pdFechaEstimada)
      .input('psComentarios', body.psComentarios)
      .input('pnIdUsuario', body.pnIdUsuario)
      .execute('ActualizarEstatusIncidencia2'); 
      const incidencia = result.recordsets[0]
      console.log(incidencia[0])
      
      const nombreCiudadano = incidencia[0].Nombre + ' ' + incidencia[0].ApellidoPaterno + ' ' + incidencia[0].ApellidoMaterno
      const whatsAppCiudadano = '521'+ incidencia[0].Telefono
      const LigaEncuesta = 'http://localhost:5173/ReporteIncidencia'
    
      if (incidencia[0].EstatusIncidencia=='Terminada')
      {
          // Enviar mensaje al ciudadano
          const mensajeCiudadano = `Hola ${nombreCiudadano}, la incidencia con folio: ${incidencia[0].IdIncidencia} y descripción: ${incidencia[0].Descripcion} ha cambiado a estatus: ${incidencia[0].EstatusIncidencia}, Comentarios del funcionario: ${incidencia[0].Comentarios}. Ayudanos a contestar la siguiente encuesta con el objetivo de mejorar nuestro servicio: ${LigaEncuesta}`;
          await twilio.sendTextMessage(whatsAppCiudadano, mensajeCiudadano);
      }
      else
      {
          // Enviar mensaje al ciudadano
          const mensajeCiudadano = `Hola ${nombreCiudadano}, la incidencia con folio: ${incidencia[0].IdIncidencia} y descripción: ${incidencia[0].Descripcion} ha cambiado a estatus: ${incidencia[0].EstatusIncidencia}, Comentarios del funcionario: ${incidencia[0].Comentarios}. Te seguiremos informando.`;
          await twilio.sendTextMessage(whatsAppCiudadano, mensajeCiudadano);
      }

       
      console.log(nombreCiudadano)
      console.log(whatsAppCiudadano)
     

      console.log('ACTUALIZA ESTATUS CORRECTAMENTE')

    //return result.recordsets[0];
  } catch (err) {
    console.log('MENSAJE DE ERROR:' + err.message)
    return err.message;
    
  }
};