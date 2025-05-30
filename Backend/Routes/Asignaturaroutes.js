const express = require('express');
const router = express.Router();

const asignaturaController = require('../Controllers/Asignaturacontroller'); 

// Rutas para la gestión de ASIGNATURAS
router.get('/assignments', asignaturaController.getAllAssignments);
router.post('/assignments', asignaturaController.createAssignment);

router.get('/registered-students', asignaturaController.getAllRegisteredStudents);
router.post('/register-student', asignaturaController.registerStudent);

module.exports = router;