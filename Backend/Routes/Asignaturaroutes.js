const express = require('express');
const router = express.Router();

const asignaturaController = require('../Controllers/Asignaturacontroller'); 

// Rutas para la gestión de ASIGNATURAS
router.get('/assignments', asignaturaController.getAllAssignments);
router.post('/assignments', asignaturaController.createAssignment);
router.put('/assignments/:id', asignaturaController.updateAssignmentById);
router.delete('/assignments/:id', asignaturaController.deleteAssignmentById);

router.get('/registered-students', asignaturaController.getAllRegisteredStudents);
router.post('/register-student', asignaturaController.registerStudent);
router.put('/registered-students/:registrationId', asignaturaController.updateRegisteredStudentInAssignment);
router.delete('/registered-students/:registrationId', asignaturaController.unregisterStudentFromAssignment);

module.exports = router;