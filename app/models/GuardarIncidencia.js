const mssql = require('mssql');
const sqlConfig = require('../config/db');

exports.GuardarIncidencia = async (body) => {
  try {
    console.log(body)
    const pool = await mssql.connect(sqlConfig);
    const result = await pool.request()

      .input('pnIdAlcaldia', body.pnIdAlcaldia)
      .input('pnIdIncidencia', body.pnIdIncidencia)
      .input('psDescripcion', body.psDescripcion)
      .input('pnIdTipoIncidencia', body.pnIdTipoIncidencia)
      .input('psNombre', body.psNombre)
      .input('psApellidoPaterno', body.psApellidoPaterno)
      .input('psApellidoMaterno', body.psApellidoMaterno)
      .input('psTelefono', body.psTelefono)
      .input('psCorreo', body.psCorreo)
      .input('psUbicacion', body.psUbicacion)
      .input('pnIdColonia', body.pnIdColonia)
      .input('psCalle', body.psCalle)
      .input('psNumero', body.psNumero)
      .input('psCodigoPostal', body.psCodigoPostal)
      .input('pnIdUsuario', body.pnIdUsuario)
      .input('pnAccion', body.pnAccion)
      .execute('GuardarIncidencia'); 
      console.log('GUARDA CORRECTAMENTE')
    return result.recordsets[0];
  } catch (err) {
    console.log('MENSAJE DE ERROR:' + err.message)
    return err.message;
    
  }
};