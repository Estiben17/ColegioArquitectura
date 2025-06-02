const express = require('express');
const router = express.Router();
const estudianteController = require('../Controllers/Estudiantecontroller');

// Obtener todos los estudiantes
router.get('/', estudianteController.obtenerEstudiantes);

// Obtener un estudiante por ID
router.get('/:id', estudianteController.obtenerEstudiantePorId);

// Crear un nuevo estudiante
router.post('/', estudianteController.crearEstudiante);

// Actualizar un estudiante
router.put('/:id', estudianteController.actualizarEstudiante);

// Eliminar un estudiante
router.delete('/:id', estudianteController.eliminarEstudiante);

// Rutas para obtener datos para filtros
router.get('/filtros/facultades', estudianteController.obtenerFacultadesParaFiltro); // NUEVA RUTA
router.get('/filtros/tipos-documento', estudianteController.obtenerTiposDocumentoParaFiltro); // NUEVA RUTA


// Buscar estudiante por filtros (nombre, facultad, tipo de documento)
router.post('/buscar', estudianteController.buscarEstudiantes); // Opcional si usas filtros personalizados

module.exports = router;
