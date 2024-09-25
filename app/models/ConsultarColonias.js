const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.ConsultarColonias = async (params) => {
  try {
    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()
      .input('pnActivo', 1)
      .input('pnIdAlcaldia', params.pnIdAlcaldia)
      .execute('ConsultarColoniasCmb');
      console.log('ejecuta ConsultarColonias', params.pnIdAlcaldia)
      //console.log(result.recordsets[0])
      
    return result.recordsets[0];
  } catch (err) {
    return err;
  }
};