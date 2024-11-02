const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.GuardarFichaTecnicaEvento = async (body) => {
  try {
    console.log('Body GTE: '+body, body.pnIdFichaTecnicaEvento, body.pdFechaHoraInicioEvento, body.pdFechaHoraFinalEvento)
    
    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()

      .input('pnIdAlcaldia', body.pnIdAlcaldia)
      .input('pnIdFichaTecnicaEvento', body.pnIdFichaTecnicaEvento)
      .input('psTituloEvento', body.psTituloEvento)
      .input('pdFechaHoraInicioEvento', body.pdFechaHoraInicioEvento)
      .input('pdFechaHoraFinalEvento', body.pdFechaHoraFinalEvento)
      .input('pnIdOrigenAgenda', body.pnIdOrigenAgenda)
      .input('psLugarEvento', body.psLugarEvento)
      .input('psLogistica', body.psLogistica)
      .input('pnClaUsuarioMod', body.pnClaUsuarioMod)
     
      .execute('GuardaFichaTecnicaEvento'); 

      console.log('GUARDO EVENTO CORRECTAMENTE: '+result.recordsets[0])

    return result.recordsets[0];
    
  } catch (err) {
    console.log('MENSAJE DE ERROR:' + err.message)
    return err.message;
    
  }
};