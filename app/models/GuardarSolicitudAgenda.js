const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.GuardarSolicitudAgenda = async (body) => {

  try {
    console.log(body)
    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()
      .input('pnIdAlcaldia', body.pnIdAlcaldia)
      .input('pnIdSolicitudAgenda', body.pnIdSolicitudAgenda)
      .input('psAsunto', body.psAsunto)
      .input('pnIdTipoAgenda', body.pnIdTipoAgenda)
      .input('pnIdEstatusAgenda', body.pnIdEstatusAgenda)
      .input('pnIdOrigenAgenda', body.pnIdOrigenAgenda)
      .input('pnIdClasificacionAgenda', body.pnIdClasificacionAgenda)
      .input('psNombre', body.psNombre)
      .input('psTelefono', body.psTelefono)
      .input('psCorreo', body.psCorreo)
      .input('psCargo', body.psCargo)
      .input('pdFechaIni', body.pdFechaIni)
      .input('pdFechaFin', body.pdFechaFin)
      .input('pnIdColonia', body.pnIdColonia)
      .input('psCalle', body.psCalle)
      .input('psNumero', body.psNumero)
      .input('psCodigoPostal', body.psCodigoPostal)
      .input('pnIdUsuario', body.pnIdUsuario)
      .execute('GuardarSolicitudAgenda');
    console.log('GUARDA CORRECTAMENTE');
    console.log('Id:', result.recordsets[0].IdSolicitudAgenda);
    const resultado = result.recordsets[0];
    return resultado[0].IdSolicitudAgenda;

  } catch (err) {
    console.log('MENSAJE DE ERROR:' + err.message)
    return err.message;

  }
};