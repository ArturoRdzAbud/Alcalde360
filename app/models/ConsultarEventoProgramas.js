const mssql = require ('mssql');
const sqlConfig = require('../config/db');

exports.ConsultarEventoProgramas = async(params) => {
    try {
        const pool = await mssql.connect(sqlConfig);
        const result = await pool.request()
        .input('pnIdAlcaldia', params.pnIdAlcaldia)
        .input('pnIdSolicitudAgenda', params.pnIdSolicitudAgenda)
        .execute('ConsultarEventoProgramas');
        return result.recordsets[0];
    } catch (err) {
        return err;
    }
};