const mssql = require("mssql");
const sqlConfig = require("../config/db");
//Configuración de Twilio
const twilio = require('../config/Twilio');

//npm install xml2js
const xml2js = require('xml2js');

//npm install fast-xml-parser
const { XMLParser } = require('fast-xml-parser');

function ConvertirParticipantesXMLALista (XML) {

   // Crear un parser
  const parser = new xml2js.Parser();

  // Parsear el XML
  parser.parseString(XML, (err, result) => {
    if (err) {
        console.error('Error al convertir XML a JSON:', err);
        return
    } else {

      console.log(result);

      // Acceder al arreglo de participantes
      const participantes = result.Root.Telefonos.map(p => ({
          Nombre: p.Nombre[0],
          Telefono: p.Telefono[0],
      }));

      console.log('Array de teléfonos:', participantes);

      return participantes;
    }
  });          
}

// Función para convertir XML a un array de objetos
function parseXmlToParticipants(xml) {
  try {
    const parser = new XMLParser();
    const result = parser.parse(xml);

    // Validar que el nodo raíz y el contenido existen
    if (!result.Root || !result.Root.Telefonos) {
      throw new Error('Formato XML inválido: Falta el nodo <Telefonos>.');
    }

    const participantes = result.Root.Telefonos;
/*
    // Convertir los datos a un array de objetos
    const participantes = result.Root.Telefonos.map(p => ({
      IdUsuario: p.IdUsuario,
      Nombre: p.Nombre,
      Telefono: p.Telefono,
    }));*/

    return participantes;
  } catch (error) {
    console.error('Error al convertir XML a JSON:', error.message);
    return null;
  }
}

const calcularDiferenciaDias = (fechaIni, fechaFin) => {
  const inicio = new Date(fechaIni);
  const fin = new Date(fechaFin);

  // Calcular la diferencia en milisegundos
  const diferenciaMilisegundos = fin - inicio;

  // Convertir de milisegundos a días y redondear hacia abajo
  return Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
};

const EnviarMensajesAParticipantes2 = (Participantes, Acuerdos, psTitulo, psFecha, psTema) => {

  //console.log('Array de Participantes ok:', Participantes);

  /*let misactividades = Lista.find(dato => dato.IdActividad === Responsables[i].IdUsuario);
  console.log('misctividades: ', misactividades);*/

  let msgParticipantes = "";
  let msgAcuerdos = "";

       for (let i=0; i<= Participantes.length-1;i++)
       {
        
        msgParticipantes = "Hola " + Participantes[i].Nombre + ", te compartimos información de los siguientes acuerdos: ";
        
        for (let j=0; j<= Acuerdos.length-1;j++)
        {
          //console.log("Participantes.length:", Participantes.length, Participantes[i].Nombre, "Acuerdos.length:",Acuerdos.length, Acuerdos[j].Descripcion);

          if (msgAcuerdos == "")
            msgAcuerdos = Acuerdos[j].Descripcion
          else
            msgAcuerdos += "," + Acuerdos[j].Descripcion
        }
        //format(psFecha, 'dd-MM-yyyy')
        msgParticipantes += msgAcuerdos + ", derivados de la Reunón " + psTitulo + " en la Fecha : " + psFecha + " y el Tema : " + psTema
       
        //Enviar mensaje a cada participante de los acuerdos de la reunión 
        //await twilio.sendTextMessage(participante.Telefono, msgParticipantes);
        console.log("Teléfono: " + Participantes[i].Telefono, "Mensaje WhatssApp: " + msgParticipantes);
       }    
       
}

const EnviarMensajesAParticipantes = (Participantes, Acuerdos, psTitulo, psFecha, psTema) => {
  // Construir la lista de acuerdos una sola vez
  const msgAcuerdos = Acuerdos.map(a => a.Descripcion).join(', ');

  // Iterar sobre los participantes
  Participantes.forEach(participante => {
    const msgParticipantes = `
      Hola ${participante.Nombre}, te compartimos información de los siguientes acuerdos:
      "${msgAcuerdos}", derivados de la Reunión "${psTitulo}" con el Tema: "${psTema}", llevado a cabo el: "${new Date(psFecha).toLocaleDateString("es-Mx")}".
    `.trim();

    //enviar mensaje a cada responsable de las actividades asignadas
    //await twilio.sendTextMessage(participante.Telefono, msgParticipantes);
    console.log(`Teléfono: ${participante.Telefono}`, `Mensaje WhatsApp: ${msgParticipantes}`);
  });
};

const EnviarMensajesAResponsables = (Responsables, Actividades) => {

  let diasRestantes = 0;
  let Estatus;

  // Iterar sobre los Responsables
  Responsables.forEach(responsable => {

    let miactividad = Actividades.find(dato => dato.responsableIdCombo === responsable.IdUsuario);

    if (miactividad.ListoEditChk === 'true') {
      Estatus = "Completada"; // 3
    } else {

      diasRestantes = calcularDiferenciaDias(miactividad.FechaIni, miactividad.FechaFin);
              
      //diasRestantes = -1;
      if (diasRestantes >=0 && diasRestantes <= 1) {
        Estatus = "Casi vencida"; // 2 
      } else if (diasRestantes > 1) {
       Estatus = "Pendiente"; // 1
      } else if (diasRestantes < 0){
        Estatus = "Vencida"; // 4
      }

    }
    
    const msgResponsables = `
      Hola ${responsable.Nombre}, te compartimos información de la actividad :
      "${miactividad.Descripcion}", a la que fuiste asignado, con Estatus : "${Estatus}" y Fecha de vencimiento : "${new Date(miactividad.FechaFin).toLocaleDateString("es-Mx")}".
    `.trim();

    //enviar mensaje a cada responsable de las actividades asignadas
    //await twilio.sendTextMessage(responsable.Telefono, msgResponsables);
    console.log(`Teléfono: ${responsable.Telefono}`, `Mensaje WhatsApp: ${msgResponsables}`);

  });

} 

const EnviarMensajesAResponsables2 = (Responsables, Actividades) => {

   let msgResponsables = "";
   let diasRestantes = 0;
   let Estatus;

  for (let i=0; i <= Responsables.length-1; i++)
    {
  
      let miactividad = Actividades.find(dato => dato.responsableIdCombo === Responsables[i].IdUsuario);
      //console.log('Actividades:', Actividades, 'miactividad: ', miactividad);
  
      if (miactividad.ListoEditChk === 'true') {
        Estatus = "Completada"; // 3
      } else {
        //const diasRestantes = differenceInDays(new Date(miactividad.FechaFin), new Date());
        //console.log(miactividad.FechaIni, miactividad.FechaFin);
  
        diasRestantes = calcularDiferenciaDias(miactividad.FechaIni, miactividad.FechaFin);
                
        //diasRestantes = -1;
        if (diasRestantes >=0 && diasRestantes <= 1) {
          Estatus = "Casi vencida"; // 2 
        } else if (diasRestantes > 1) {
         Estatus = "Pendiente"; // 1
        } else if (diasRestantes < 0){
          Estatus = "Vencida"; // 4
        }
        //console.log(diasRestantes)
      }
      
      //format(miactividad.FechaFin, 'dd-MM-yyyy')
      msgResponsables = "Hola " + Responsables[i].Nombre + ", te compartimos información de la actividad : " + miactividad.Descripcion + ", a la que fuiste asignado, con Estatus : " + Estatus + " y Fecha de vencimiento : " + miactividad.FechaFin; 
    
      //enviar mensaje a cada responsable de las actividades asignadas
      //await twilio.sendTextMessage(responsable.Telefono, msgResponsables);
      console.log("Teléfono: " + Responsables[i].Telefono, "Mensaje WhatssApp: " + msgResponsables)
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

      console.log(result.recordsets[0], "acuerdos xml: " + body.psXmlAcuerdo, "\n\nActividades : " + body.psXmlActividades)

      //codigo para enviar notificaciones de los acuerdos a los responsables registrados
      const fichaTecnicaReunion = result.recordsets[0]

      var TelefonosParticipantesXML = fichaTecnicaReunion[0].TelefonosParticipantesXML //"<person><id>1234</id><age>30</age><name>John Doe</name></person>";
      var TelefonosResponsablesXML = fichaTecnicaReunion[0].TelefonosResponsablesXML //"<person><id>1234</id><age>30</age><name>John Doe</name></person>";

     /*
     var ListaParticipantes = ConvertirParticipantesXMLALista(TelefonosParticipantesXML);
     var ListaResponsables = ConvertirParticipantesXMLALista(TelefonosResponsablesXML);
     */

     // https://stackoverflow.com/questions/70119706/how-to-parse-xml-data-into-list-using-react-js

    const Participantes = parseXmlToParticipants(TelefonosParticipantesXML);
    const Responsables = parseXmlToParticipants(TelefonosResponsablesXML);
    const Acuerdos = parseXmlToParticipants(body.psXmlAcuerdo);
    const Actividades = parseXmlToParticipants(body.psXmlActividades);

/*
    if (Acuerdos) {
      console.log('Array de Acuerdos ok:', Acuerdos);
    }
    if (Actividades) {
      console.log('Array de Actividades ok:', Actividades);
    }
*/

    if (Participantes && Acuerdos) {
      EnviarMensajesAParticipantes(Participantes, Acuerdos, body.psTitulo, body.psFecha, body.psTema);       
    }

    if (Responsables && Actividades) {
      EnviarMensajesAResponsables(Responsables, Actividades);
    }

    //return result.recordsets[0];
   /*
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
    
    //codigo para enviar notificaciones de los acuerdos a los responsables registrados

    var xml = fichaTecnicaReunion[0].TelefonosParticipantesXML //"<person><id>1234</id><age>30</age><name>John Doe</name></person>";
    var json = xml2json(xml); 

    // Beautify the JSON if needed
    var beautifiedJson = JSON.stringify(jsonOutput, undefined, 4)

    console.log(json, beautifiedJson);


    //console.log(nombreCiudadano)
    //console.log(whatsAppCiudadano)
    //console.log(whatsAppFuncionario)
    console.log('GUARDA CORRECTAMENTE')
    return fichaTecnicaReunion[0].IdFichaTecnica
    */

  } catch (err) {
    console.log(err.message);
    return err.message;
  }
};
