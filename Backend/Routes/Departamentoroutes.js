const express = require('express');
const router = express.Router();
const departamentoController = require('../Controllers/Departamentocontroller');

// Obtener todos los departamentos
router.get('/', departamentoController.obtenerDepartamentos);

// Obtener departamento por ID
router.get('/:id', departamentoController.obtenerDepartamentoPorId);

// Crear nuevo departamento
router.post('/', departamentoController.crearDepartamento);

// Modificar departamento
router.put('/:id', departamentoController.actualizarDepartamento);

// Eliminar departamento (opcional)
router.delete('/:id', departamentoController.eliminarDepartamento);

module.exports = router;
