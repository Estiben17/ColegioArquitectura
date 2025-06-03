// netlify/functions/api.js

const serverless = require('serverless-http');
// IMPORTANTE: Cuando Netlify empaqueta la función,
// todos los archivos a los que haces 'require' deben estar disponibles localmente.
// Usaremos un script de build para COPIAR la carpeta 'Backend'
// dentro de 'netlify/functions' ANTES del empaquetado.
// Por lo tanto, aquí lo importamos como si ya estuviera allí.
const app = require('./Backend/app'); // Asume que Backend/app.js estará dentro de netlify/functions/

exports.handler = serverless(app);