// Backend/Routes/Departamentoroutes.js
const express = require('express');
const router = express.Router();
// Asegúrate de que este nombre de archivo sea exacto, tu imagen muestra 'Departamentocontroller.js'
const departamentoController = require('../Controllers/Departamentocontroller');

// Obtener todos los departamentos
router.get('/', departamentoController.getAllDepartments()); // <-- Este ya coincide

// Obtener departamento por ID
router.get('/:id', departamentoController.getDepartmentById); // <-- ¡CORREGIDO! Estaba 'obtenerDepartamentoPorId'

// Crear nuevo departamento
router.post('/', departamentoController.createDepartment); // <-- ¡CORREGIDO! Estaba 'crearDepartamento'

// Modificar departamento
router.put('/:id', departamentoController.updateDepartmentById); // <-- ¡CORREGIDO! Estaba 'actualizarDepartamento'

// Eliminar departamento (opcional)
router.delete('/:id', departamentoController.deleteDepartmentById); // <-- ¡CORREGIDO! Estaba 'eliminarDepartamento'

module.exports = router;