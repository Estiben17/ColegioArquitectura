// netlify/functions/assignments.js
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express(); // Crea una instancia de Express
app.use(cors());       // Habilita CORS para todas las rutas en esta app
app.use(express.json()); // Habilita el parsing de JSON

// Import your assignment routes
const assignmentRoutes = require('../../Backend/Routes/Asignaturaroutes'); // Importa solo las rutas de asignatura
app.use('/api/assignments', assignmentRoutes); // Monta estas rutas bajo el prefijo '/api/assignments'

module.exports.handler = serverless(app); // Envuelve la app de Express para Netlify Functions