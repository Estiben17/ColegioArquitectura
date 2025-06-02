// Backend/app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Good practice for frontend development
// IMPORTANT: Adjust this path if your estudiantesRoutes.js is not here.
const estudiantesRoutes = require('./Routes/Estudianteroutes'); 
const asignaturasRoutes = require('./Routes/Asignaturaroutes');
const asistenciasRoutes = require('./Routes/Asistenciaroutes');
const departamentosRoutes = require('./Routes/Departamentoroutes');// Path from app.js to routes

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all origins (for development)
app.use(bodyParser.json()); // To parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded bodies

// Define base paths for your routes
// All routes defined in estudiantesRoutes will be prefixed with /api/estudiantes
app.use('/api/estudiante', estudiantesRoutes);
app.use('/api/asignatura', asignaturasRoutes);
app.use('/api/asistencia', asistenciasRoutes);
app.use('/api/departamento', departamentosRoutes);

// Basic route for testing server status
app.get('/', (req, res) => {
    res.send('API de Gestión Académica está funcionando!');
});

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).send('Algo salió mal en el servidor!');
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Servidor Express escuchando en http://localhost:${port}`);
});