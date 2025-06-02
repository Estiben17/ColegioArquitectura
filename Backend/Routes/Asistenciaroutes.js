const express = require('express');
const router = express.Router();
const asistenciaController = require('../Controllers/Asistenciacontroller');

// Obtener todas las asistencias
router.get('/', asistenciaController.obtenerAsistencias);

// Obtener asistencia por ID
router.get('/:id', asistenciaController.obtenerAsistenciaPorId);

// Obtener asistencia por código (para "Fill Attendance")
router.get('/code/:codigo', asistenciaController.obtenerAsistenciaPorCodigo);

// Crear nueva asistencia
router.post('/', asistenciaController.crearAsistencia);

// Actualizar asistencia
router.put('/:id', asistenciaController.actualizarAsistencia);

// Obtener estudiantes candidatos para una sesión de asistencia
router.get('/:asistenciaId/estudiantes-candidatos', asistenciaController.obtenerEstudiantesParaSesionAsistencia); // NUEVA RUTA
// Registrar la asistencia de los estudiantes para una sesión
router.post('/:asistenciaId/registrar-estudiantes', asistenciaController.registrarAsistenciaEstudiantes); // NUEVA RUTA

// Eliminar asistencia (opcional)
router.delete('/:id', asistenciaController.eliminarAsistencia);

module.exports = router;


