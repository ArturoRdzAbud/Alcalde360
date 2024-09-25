const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.ConsultarIncidenciaEvidencia = async (params) => {
  try {
    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()
      .input('pnIdAlcaldia', params.pnIdAlcaldia)
      .input('pnIdIncidencia', params.pnIdIncidencia)
      .input('pnIdEvidencia', params.pnIdEvidencia)
      .execute('ConsultarIncidenciaEvidencia');

    //const base64Data = result.recordsets[0].Fotografia.toString('base64');
    //console.log(base64Data.toString())
    //return base64Data
    return result.recordsets[0];
  } catch (err) {
    return err;
  }
};