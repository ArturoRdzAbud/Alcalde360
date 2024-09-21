const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.GuardarAreayPrioridadIncidencia = async (body) => {
  try {
    console.log(body)
    //console.log('actualizar area y prioridad : ' + body.pmIdAlcaldia + ' ' + body.pmIdIncidencia + ' ' + body.pmIdArea + ' ' + body.pmIdPrioridad);

    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()

      .input('pnIdAlcaldia', body.pmIdAlcaldia)
      .input('pnIdIncidencia', body.pnIdIncidencia)
      .input('pnIdArea', body.pnIdArea)
      .input('pnIdPrioridad', body.pmIdPrioridad)
      .input('pnIdUsuario', body.pnIdUsuario)

      .execute('ActualizarAreayPrioridadIncidencia'); 

      console.log('ACTUALIZADO CORRECTAMENTE')

    return result.recordsets[0];
    
  } catch (err) {
    console.log('MENSAJE DE ERROR:' + err.message)
    return err.message;
    
  }
};