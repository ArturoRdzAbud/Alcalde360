const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.ConsultarIncidencia = async (params) => {
  try {
    const pool = await mssql.connect(sqlConfig);
    console.log(params, pool)
    const result = await pool.request()
      .input('pnIdAlcaldia', params.pnIdAlcaldia)
      .input('pnActivo', params.pnActivo)
      .execute('ConsultarIncidencia');
    return result.recordsets[0];
  } catch (err) {
    return err;
  }
};