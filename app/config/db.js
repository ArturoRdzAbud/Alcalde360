const dbConfig = {
  user: 'sadmin',
  password: 'Nimdas2023@',
  database: 'Alcalde360_Des',
  server: 'enlaces.database.windows.net',

  //cosas a instalar en el proyecto API node.js
  //npm install nodemon
  //    esto ayuda a que la api se reinicie automaticamente cada que hagan un cambio, como ocurre en el proyecto web+
  //    sin necesidad de que esten reiniciando en forma "manual" la API
  //npm install dotenv
  //    permite cargar variables de entorno desde un archivo .env a tu aplicación para credenciales de Twilio
  //    nota quiza valga la pena hacer lo mismo con las credenciales del sql que esta en db.js para mas seguridad
  //npm install cors
  //    para enviar arreglos a la api que tengan archivos binarios

  pool: {
    max: 30,
    min: 0,
    idleTimeoutMillis: 60000
  },
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
}

module.exports = dbConfig;
