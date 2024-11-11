const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.ConsultarEventoParticipantes = async (params) => {
  try {
    console.log(params.pnIdAlcaldia, params.pnIdSolicitudAgenda, params.pnIdTipoParticipanteEvento);
    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()
      .input('pnIdAlcaldia', params.pnIdAlcaldia)
      .input('pnIdSolicitudAgenda', params.pnIdSolicitudAgenda)
      .input('pnIdTipoParticipanteEvento', params.pnIdTipoParticipanteEvento)
      .execute('ConsultarEventoParticipantes');    
    return result.recordsets[0];

  } catch (err) {
    return err;
  }
};