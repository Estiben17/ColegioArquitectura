// Backend/Controllers/Departamentoscontroller.js

const db = require('../config/firebaseConfig'); // Importa la instancia de Firestore

/**
 * @desc Obtener todos los departamentos
 * @route GET /api/departamentos
 * @access Public
 */
exports.getAllDepartments = async (req, res) => {
    try {
        const departamentosRef = db.collection('departamentos');
        const snapshot = await departamentosRef.get();
        const departamentos = [];
        snapshot.forEach(doc => {
            departamentos.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(departamentos);
    } catch (error) {
        console.error("Error al obtener todos los departamentos:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/**
 * @desc Obtener departamento por ID
 * @route GET /api/departamentos/:id
 * @access Public
 */
exports.getDepartmentById = async (req, res) => {
    const { id } = req.params;
    try {
        const departamentoRef = db.collection('departamentos').doc(id);
        const doc = await departamentoRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Departamento no encontrado.' });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error(`Error al obtener departamento con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/**
 * @desc Crear un nuevo departamento
 * @route POST /api/departamentos
 * @access Public (o restringido si hay autenticación)
 */
exports.createDepartment = async (req, res) => {
    try {
        // Campos esperados del cuerpo de la solicitud:
        const { departamentoId, nombre, director, descripcion } = req.body; 

        // Validación básica de campos obligatorios
        if (!departamentoId || !nombre || !director || !descripcion) {
            return res.status(400).json({ message: 'Todos los campos (departamentoId, nombre, director, descripcion) son obligatorios para crear un departamento.' });
        }

        // Verificar si el departamento ya existe usando el departamentoId proporcionado
        const existingDepartment = await db.collection('departamentos').doc(departamentoId).get();
        if (existingDepartment.exists) {
            return res.status(409).json({ message: `El departamento con ID ${departamentoId} ya existe.` });
        }

        // Crear el nuevo documento en Firestore con el ID especificado
        const departamentoRef = db.collection('departamentos').doc(departamentoId);
        await departamentoRef.set({
            nombre: nombre,
            director: director,
            descripcion: descripcion,
            fechaCreacion: new Date() // Almacena la fecha de creación como un Timestamp de Firestore
        });

        res.status(201).json({ 
            message: 'Departamento creado exitosamente', 
            departamento: { id: departamentoId, nombre, director, descripcion, fechaCreacion: new Date() } 
        });

    } catch (error) {
        console.error("Error al crear departamento:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/**
 * @desc Actualizar un departamento por ID
 * @route PUT /api/departamentos/:id
 * @access Public (o restringido si hay autenticación)
 */
exports.updateDepartmentById = async (req, res) => {
    const { id } = req.params; // 'id' es el departamentoId en la URL
    const dataToUpdate = req.body; // Los datos a actualizar vienen en el cuerpo de la solicitud

    try {
        // Validación: Asegurarse de que hay datos para actualizar
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: 'No hay datos proporcionados para actualizar.' });
        }

        const departamentoRef = db.collection('departamentos').doc(id);
        const doc = await departamentoRef.get();

        // Verificar si el departamento existe antes de intentar actualizar
        if (!doc.exists) {
            return res.status(404).json({ message: 'Departamento no encontrado.' });
        }

        // Actualizar el documento
        await departamentoRef.update(dataToUpdate);
        res.status(200).json({ message: `Departamento con ID ${id} actualizado exitosamente` });
    } catch (error) {
        console.error(`Error al actualizar departamento con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/**
 * @desc Eliminar un departamento por ID
 * @route DELETE /api/departamentos/:id
 * @access Public (o restringido si hay autenticación)
 */
exports.deleteDepartmentById = async (req, res) => {
    const { id } = req.params; // 'id' es el departamentoId en la URL

    try {
        const departamentoRef = db.collection('departamentos').doc(id);
        const doc = await departamentoRef.get();

        // Verificar si el departamento existe antes de intentar eliminar
        if (!doc.exists) {
            return res.status(404).json({ message: 'Departamento no encontrado.' });
        }

        // Eliminar el documento
        await departamentoRef.delete();
        res.status(200).json({ message: `Departamento con ID ${id} eliminado exitosamente` });
    } catch (error) {
        console.error(`Error al eliminar departamento con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};