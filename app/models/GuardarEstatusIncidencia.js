const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.GuardarEstatusIncidencia = async (body) => {
  try {
    console.log(body)
    
    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()

      .input('pnIdAlcaldia', body.pmIdAlcaldia)
      .input('pnIdIncidencia', body.pnIdIncidencia)
      .input('pnidEstatusIncidencia', body.pnIdEstatus)
      .input('pnFechaEstimada', body.pmFechaEstimada)
      .input('pnComentarios', body.pmComentarios)
      .input('pnIdUsuario', body.pnIdUsuario)

      .execute('ActualizarEstatusIncidencia'); 

      console.log('ACTUALIZADO CORRECTAMENTE')

    return result.recordsets[0];
  } catch (err) {
    console.log('MENSAJE DE ERROR:' + err.message)
    return err.message;
    
  }
};