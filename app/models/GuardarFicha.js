const mssql = require("mssql");
const sqlConfig = require("../config/db");
//Configuración de Twilio
const twilio = require('../config/Twilio');
const { format, parseISO } = require('date-fns'); 

const { DOMParser } = require('xmldom');

// Función para convertir XML a un array de objetos
function parseXmlToParticipants(xmlData) { 
  try {
    
   //console.log(xmlData)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
        
    // Extraer nodos y convertirlos a una estructura de arreglos
    const items = Array.from(xmlDoc.getElementsByTagName('Telefonos')).map((node) => {
        return {
          IdUsuario: node.getElementsByTagName('IdUsuario')[0]?.textContent,
          Telefono: node.getElementsByTagName('Telefono')[0]?.textContent,
          Nombre: node.getElementsByTagName('Nombre')[0]?.textContent,
        };
    });
        
    //console.log(items);
    return items;
    
  } catch (error) {
    console.error('Error al convertir XML a JSON:', error.message);
    return null;
  }
}

// Función para convertir XML a un array de objetos
function parseXmlToAcuerdos(xmlData) { 
  try {
    
   //console.log(xmlData)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
        
    // Extraer nodos y convertirlos a una estructura de arreglos
    const items = Array.from(xmlDoc.getElementsByTagName('Telefonos')).map((node) => {
        return {
          IdFichaTecnica: node.getElementsByTagName('IdFichaTecnica')[0]?.textContent,
          IdAlcaldia: node.getElementsByTagName('IdAlcaldia')[0]?.textContent,
          IdAcuerdo: node.getElementsByTagName('IdAcuerdo')[0]?.textContent,
          Descripcion: node.getElementsByTagName('Descripcion')[0]?.textContent,
          Num: node.getElementsByTagName('Num')[0]?.textContent,
        };
    });
        
    //console.log(items);
    return items;
    
  } catch (error) {
    console.error('Error al convertir XML a JSON:', error.message);
    return null;
  }
}

// Función para convertir XML a un array de objetos
function parseXmlToActividades(xmlData) { 
  try {
    
   //console.log(xmlData)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
        
    // Extraer nodos y convertirlos a una estructura de arreglos
    const items = Array.from(xmlDoc.getElementsByTagName('Telefonos')).map((node) => {
        return {
         Descripcion: node.getElementsByTagName('Descripcion')[0]?.textContent,
         responsableIdCombo: node.getElementsByTagName('responsableIdCombo')[0]?.textContent,
         FechaIni: node.getElementsByTagName('FechaIni')[0]?.textContent,
         FechaFin: node.getElementsByTagName('FechaFin')[0]?.textContent,
         ListoEditChk: node.getElementsByTagName('ListoEditChk')[0]?.textContent,

        };
    });
        
    //console.log(items);
    return items;
    
  } catch (error) {
    console.error('Error al convertir XML a JSON:', error.message);
    return null;
  }
}





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
      .execute("GuardarFicha_WhatsApp");
    //return result.recordsets[0];
    const fichaTecnicaReunion = result.recordsets[0]
    const nombreAlcalde = fichaTecnicaReunion[0].NombreAlcalde
    const whatsAppAlcalde = '521'+ fichaTecnicaReunion[0].TelefonoAlcalde

    const fecha = fichaTecnicaReunion[0].Fecha;
    const fechaFormateada = new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(fecha);

    
    const link = "https://localhost:5173/FichaTecnicaReunion?pnIdAlcaldia=" + body.pnIdAlcaldia + "&pnIdFichatecnica=" + fichaTecnicaReunion[0].IdFichaTecnica        

    // Enviar mensaje con información de la ficha técnica de la reunión al alcalde
    const mensajeAlcalde = `Hola Alcalde ${nombreAlcalde}, compartimos información relevante acerca de la reunión que se llevará a cabo el día *${fechaFormateada}* a las *${fichaTecnicaReunion[0].HoraIni}* en *${fichaTecnicaReunion[0].Lugar}* para revisar el asunto: *"${fichaTecnicaReunion[0].Asunto}"* con *${fichaTecnicaReunion[0].Nombre}*.\nPuede comunicarse con el solicitante a este número: *${fichaTecnicaReunion[0].Telefono}*.\nPara ver mas detalles de la reunión, puede entrar al siguiente link: ${link}`;
    await twilio.sendTextMessage(whatsAppAlcalde, mensajeAlcalde);
    
    //console.log(nombreCiudadano)
    //console.log(whatsAppCiudadano)
    //console.log(whatsAppFuncionario)
    
    var TelefonosParticipantesXML = fichaTecnicaReunion[0].TelefonosParticipantesXML //"<person><id>1234</id><age>30</age><name>John Doe</name></person>";
    var TelefonosResponsablesXML = fichaTecnicaReunion[0].TelefonosResponsablesXML //"<person><id>1234</id><age>30</age><name>John Doe</name></person>";
    
    //console.log(TelefonosResponsablesXML)
    const Responsables = parseXmlToParticipants(TelefonosResponsablesXML);
    const Participantes = parseXmlToParticipants(TelefonosParticipantesXML);
    const Acuerdos = parseXmlToAcuerdos(body.psXmlAcuerdo);
    const Actividades = parseXmlToActividades(body.psXmlActividades);
    
    //onsole.log(body.psXmlAcuerdo)
    //console.log(body.psXmlActividades)
    //console.log(Responsables)
    //console.log(Participantes)
    //console.log(Acuerdos)
    //console.log(Actividades)
  
 
    if (Participantes && Acuerdos) {
      EnviarMensajesAParticipantes(Participantes, Acuerdos, body.psTitulo, body.psFecha, body.psTema);       
    }

    if (Responsables && Actividades) {
      EnviarMensajesAResponsables(Responsables, Actividades);
    }
      

    console.log('GUARDA CORRECTAMENTE')
    return fichaTecnicaReunion[0].IdFichaTecnica
  } catch (err) {
    console.log(err.message);
    return err.message;
  }
};

 
const EnviarMensajesAParticipantes = async (Participantes, Acuerdos, psTitulo, psFecha, psTema) => {
  // Construir la lista de acuerdos una sola vez
  const msgAcuerdos = Acuerdos.map(a => a.Descripcion).join(', ');

  // Iterar sobre los participantes
  for (const participante of Participantes) {
    const msgParticipantes = `
      Hola ${participante.Nombre}, te compartimos información de los siguientes acuerdos:
      "${msgAcuerdos}", derivados de la Reunión "${psTitulo}" con el Tema: "${psTema}", llevado a cabo el: "${format(parseISO(psFecha), 'dd/MM/yyyy')}".
    `.trim();

    const whatsAppParticipante = '521'+ participante.Telefono

    // Enviar mensaje a cada responsable de las actividades asignadas
    await twilio.sendTextMessage(whatsAppParticipante, msgParticipantes);
    //console.log(`Teléfono: ${participante.Telefono}, Mensaje WhatsApp: ${msgParticipantes}`);
  }
};



const EnviarMensajesAResponsables = async (Responsables, Actividades) => {
  let diasRestantes = 0;
  let Estatus;

  // Iterar sobre los Responsables
  for (const responsable of Responsables) {
    try {
      // Buscar la actividad correspondiente al responsable
      const miactividad = Actividades.find(dato => dato.responsableIdCombo === responsable.IdUsuario);

      if (!miactividad) {
        console.error(`No se encontró actividad para el responsable: ${responsable.Nombre}`);
        continue; // Saltar al siguiente responsable si no hay actividad
      }

      // Determinar el estatus de la actividad
      if (miactividad.ListoEditChk === 'true') {
        Estatus = "Completada"; // 3
      } else {
        diasRestantes = calcularDiferenciaDias(miactividad.FechaIni, miactividad.FechaFin);

        if (diasRestantes >= 0 && diasRestantes <= 1) {
          Estatus = "Casi vencida"; // 2
        } else if (diasRestantes > 1) {
          Estatus = "Pendiente"; // 1
        } else if (diasRestantes < 0) {
          Estatus = "Vencida"; // 4
        }
      }

      // Construir el mensaje
      const msgResponsables = `
        Hola ${responsable.Nombre}, te compartimos información de la actividad:
        "${miactividad.Descripcion}", a la que fuiste asignado, con Estatus: "${Estatus}" y Fecha de vencimiento: "${format(parseISO(miactividad.FechaFin), 'dd/MM/yyyy')}".
      `.trim();

      const whatsAppResponsable = '521' + responsable.Telefono;

      // Enviar mensaje a cada responsable de las actividades asignadas
      await twilio.sendTextMessage(whatsAppResponsable, msgResponsables);
      //console.log(`Teléfono: ${responsable.Telefono}, Mensaje WhatsApp: ${msgResponsables}`);
    } catch (error) {
      console.error(`Error enviando mensaje a ${responsable.Telefono}:`, error);
    }
  }
};

const calcularDiferenciaDias = (fechaIni, fechaFin) => {
  const inicio = new Date(fechaIni);
  const fin = new Date(fechaFin);

  // Calcular la diferencia en milisegundos
  const diferenciaMilisegundos = fin - inicio;

  // Convertir de milisegundos a días y redondear hacia abajo
  return Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
};