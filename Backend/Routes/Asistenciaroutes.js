const express = require('express');
const router = express.Router();
const asistenciaController = require('../Controllers/Asistenciacontroller');

// Obtener todas las asistencias
router.get('/', asistenciaController.obtenerAsistencias);

// Obtener asistencia por ID
router.get('/:id', asistenciaController.obtenerAsistenciaPorId);

// Crear nueva asistencia
router.post('/', asistenciaController.crearAsistencia);

// Actualizar asistencia
router.put('/:id', asistenciaController.actualizarAsistencia);

// Eliminar asistencia (opcional)
router.delete('/:id', asistenciaController.eliminarAsistencia);

module.exports = router;


