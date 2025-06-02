// Backend/routes/estudiantesRoutes.js
const express = require('express');
const router = express.Router();
// IMPORTANT: Adjust this path if your estudiantesController.js is not here.
// It should be relative to this 'estudiantesRoutes.js' file.
const estudiantesController = require('../Controllers/Estudiantecontroller'); // Path from routes to controllers

// Definir rutas para /api/estudiantes
router.get('/', estudiantesController.obtenerEstudiantes);
router.get('/:id', estudiantesController.obtenerEstudiantePorId);
router.post('/', estudiantesController.crearEstudiante);
router.put('/:id', estudiantesController.actualizarEstudiante);
router.delete('/:id', estudiantesController.eliminarEstudiante);

// Rutas para filtros
router.get('/filtros/facultades', estudiantesController.obtenerFacultadesParaFiltro);
router.get('/filtros/tipos-documento', estudiantesController.obtenerTiposDocumentoParaFiltro);

// Ruta para búsqueda avanzada (usa POST para enviar los filtros en el body)
router.post('/buscar', estudiantesController.buscarEstudiantes);

module.exports = router;