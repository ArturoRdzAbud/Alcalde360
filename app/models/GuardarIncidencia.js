const mssql = require('mssql');
const sqlConfig = require('../config/db');
//Configuración de Twilio
const twilio = require('../config/Twilio');

exports.GuardarIncidencia = async (body) => {

  try {
    console.log(body)
    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()
      .input('pnIdAlcaldia', body.pnIdAlcaldia)
      .input('pnIdIncidencia', body.pnIdIncidencia)
      .input('psDescripcion', body.psDescripcion)
      .input('pnIdTipoIncidencia', body.pnIdTipoIncidencia)
      .input('psNombre', body.psNombre)
      .input('psApellidoPaterno', body.psApellidoPaterno)
      .input('psApellidoMaterno', body.psApellidoMaterno)
      .input('psTelefono', body.psTelefono)
      .input('psCorreo', body.psCorreo)
      .input('psUbicacion', body.psUbicacion)
      .input('pnIdColonia', body.pnIdColonia)
      .input('psCalle', body.psCalle)
      .input('psNumero', body.psNumero)
      .input('psCodigoPostal', body.psCodigoPostal)
      .input('pnIdUsuario', body.pnIdUsuario)
      .input('pnAccion', body.pnAccion)
      .execute('GuardarIncidencia_WhatsApp'); 
      //return result.recordsets[0];
      const incidencia = result.recordsets[0]
      const nombreCiudadano = incidencia[0].Nombre + ' ' + incidencia[0].ApellidoPaterno + ' ' + incidencia[0].ApellidoMaterno
      const whatsAppCiudadano = '521'+ incidencia[0].Telefono
      const whatsAppFuncionario = '521'+ incidencia[0].TelefonoFuncionario

      // Enviar mensaje al ciudadano
      const mensajeCiudadano = `Estimado ${nombreCiudadano}, tu incidencia con folio: ${incidencia[0].IdIncidencia} y descripción: ${incidencia[0].Descripcion} ha sido registrada correctamente. Nos pondremos en contacto contigo pronto.`;
      await twilio.sendTextMessage(whatsAppCiudadano, mensajeCiudadano);

      // Enviar mensaje al funcionario responsable
      const mensajeFuncionario = `Hola ${incidencia[0].NombreFuncionario}, se te ha asignado una nueva incidencia con folio: ${incidencia[0].IdIncidencia} y descripción: ${incidencia[0].Descripcion}. Por favor revisa el sistema para más detalles.`;
      await twilio.sendTextMessage(whatsAppFuncionario, mensajeFuncionario);
  
      //console.log(incidencia[0])
      //console.log(nombreCiudadano)
      //console.log(whatsAppCiudadano)
      //console.log(whatsAppFuncionario)
      console.log('GUARDA CORRECTAMENTE')
      return incidencia[0].IdIncidencia
  
  } catch (err) {
    console.log('MENSAJE DE ERROR:' + err.message)
    return err.message;
    
  }
};