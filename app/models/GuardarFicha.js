const mssql = require("mssql");
const sqlConfig = require("../config/db");
exports.GuardarFicha = async (body) => {
  try {
    // console.log(body);
    const pool = await mssql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("pnIdAlcaldia", body.pnIdAlcaldia)
      .input("pnFicha", body.pnFicha)
      .input("pnIdSolicitudAgenda", body.pnIdSolicitudAgenda)
      .input("psTitulo", body.psTitulo)
      .input("psFecha", body.psFecha)
      .input("psHora", body.psHora)
      .input("psHoraFin", body.psHoraFin)
      .input("psTema", body.psTema)
      .input("psLugar", body.psLugar)
      .input("psXmlParticipante", body.psXmlParticipante)
      .input("psXmlAcuerdo", body.psXmlAcuerdo)
      .input("psXmlActividades", body.psXmlActividades)
      .input("psXmlArchivos", body.psXmlArchivos)
      .execute("GuardarFicha");
    return result.recordsets[0];
  } catch (err) {
    console.log(err.message);
    return err.message;
  }
};
