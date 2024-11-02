const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.GuardaFichaTecnicaEventoGrids = async (body) => {
  try {
    console.log(body)
    
    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()

      .input('pnIdAlcaldia', body.pnIdAlcaldia)
      .input('pnIdFichaTecnicaEvento', body.pnIdFichaTecnicaEvento)
      .input('pnClaUsuarioMod', body.pnClaUsuarioMod)
      .input('psXmlResultados1', body.psXmlResultados1)
      .input('psXmlResultados2', body.psXmlResultados2)
      .input('psXmlResultados3', body.psXmlResultados3)
     
      .execute('GuardaFichaTecnicaEventoGrids'); 

      console.log('GUARDO GRIDS DE EVENTO CORRECTAMENTE')

    return result.recordsets[0];
    
  } catch (err) {
    console.log('MENSAJE DE ERROR:' + err.message)
    return err.message;
    
  }
};