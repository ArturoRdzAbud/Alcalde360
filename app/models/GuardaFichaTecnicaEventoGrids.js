const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.GuardaFichaTecnicaEventoGrids = async (body) => {
  try {
    console.log(body.pnIdAlcaldia, body.pnIdSolicitudAgenda)
    
    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()     
      .input('pnIdAlcaldia', body.pnIdAlcaldia)
      .input('pnIdSolicitudAgenda', body.pnIdSolicitudAgenda)
      .input('psTituloEvento', body.psTituloEvento)
      .input('pdFechaHoraInicioEvento', body.pdFechaHoraInicioEvento)
      .input('pdFechaHoraFinalEvento', body.pdFechaHoraFinalEvento)
      .input('pnIdOrigenAgenda', body.pnIdOrigenAgenda)
      .input('psLugarEvento', body.psLugarEvento)
      .input('psLogistica', body.psLogistica)
      .input('pnClaUsuarioMod', body.pnClaUsuarioMod)
      .input('psXmlResultados1', body.psXmlResultados1)
      .input('psXmlResultados2', body.psXmlResultados2)
      .input('psXmlResultados3', body.psXmlResultados3) 
      .execute('GuardaFichaTecnicaEventoGrids'); 

      console.log('GUARDO GRIDS DE EVENTO CORRECTAMENTE')

    return result.recordsets[0];
    
  } catch (err) {
    console.log('GuardaFichaTecnicaEventoGrids: ERROR:' + err.message)
    return err.message;
    
  }
};