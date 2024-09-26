const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.GuardarEncuesta = async (body) => {
  try {
    console.log(body)
    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()

      .input('pnIdAlcaldia', body.pnIdAlcaldia)
      .input('pnIdIncidencia', body.pnIdIncidencia)
      .input('pnClaEncuesta', body.pnClaEncuesta)
      .input('pnClaTipoEncuesta', body.pnClaTipoEncuesta)
      .input('psV1', body.psV1)
      .input('psV2', body.psV2)
      .input('psV3', body.psV3)
      .input('psV4', body.psV4)
      .input('pnActivo', body.pnActivo)
      .input('pnAccion', body.pnAccion)
      .execute('GuardarEncuesta'); 
      console.log('GUARDA CORRECTAMENTE')
    return result.recordsets[0];
  } catch (err) {
    console.log('MENSAJE DE ERROR:' + err.message)
    return err.message;
    
  }
};