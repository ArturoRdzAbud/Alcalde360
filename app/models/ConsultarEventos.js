const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.ConsultarEventos = async (params) => {
  try {
    const pool = await mssql.connect(sqlConfig);
    console.log(params, pool)
    const result = await pool.request()
      .input('pnIdAlcaldia', params.pnIdAlcaldia)
      .execute('ConsultarEventos');
    return result.recordsets[0];
  } catch (err) {
    return err;
  }
};