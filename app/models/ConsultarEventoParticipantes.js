const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.ConsultarEventoParticipantes = async (params) => {
  try {
    const pool = await mssql.connect(sqlConfig);
    //console.log(params, pool)
    const result = await pool.request()
      .input('pnIdAlcaldia', params.pnIdAlcaldia)
      .input('pnIdFichaTecnicaEvento', params.pnIdFichaTecnicaEvento)
      .input('pnIdTipoParticipanteEvento', params.pnIdTipoParticipanteEvento)
      .execute('ConsultarEventoParticipantes');
    
    return result.recordset[0];

  } catch (err) {
    return err;
  }
};