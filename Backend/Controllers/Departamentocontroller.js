// Backend/Controllers/Departamentoscontroller.js

const db = require('../config/firebaseConfig'); // Importa la instancia de Firestore

/**
 * @desc Obtener todos los departamentos
 * @route GET /api/departamento
 * @access Public
 */
exports.getAllDepartments = async (req, res) => {
    console.log("[Controller] Petición para obtener todos los departamentos.");
    try {
        const departamentosRef = db.collection('departamentos');
        const snapshot = await departamentosRef.get();
        const departamentos = [];

        if (snapshot.empty) {
            console.log("[Controller] No se encontraron departamentos en la colección.");
            return res.status(200).json([]); // Return empty array if no departments
        }

        snapshot.forEach(doc => {
            departamentos.push({ id: doc.id, ...doc.data() });
        });
        console.log(`[Controller] ${departamentos.length} departamentos obtenidos exitosamente.`);
        res.status(200).json(departamentos);
    } catch (error) {
        console.error("❌ Error al obtener todos los departamentos:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener departamentos', error: error.message });
    }
};

/**
 * @desc Obtener departamento por ID
 * @route GET /api/departamento/:id
 * @access Public
 */
exports.getDepartmentById = async (req, res) => {
    const { id } = req.params; // 'id' es el departamentoId (Firestore Document ID)
    console.log(`[Controller] Petición para obtener departamento con ID: ${id}`);
    try {
        const departamentoRef = db.collection('departamentos').doc(id);
        const doc = await departamentoRef.get();

        console.log(`[Controller] Resultado para ID ${id}: doc.exists = ${doc.exists}`);

        if (!doc.exists) {
            console.warn(`[Controller] Departamento con ID ${id} no encontrado.`);
            return res.status(404).json({ message: `Departamento con ID ${id} no encontrado.` });
        }

        console.log(`[Controller] Departamento ${id} encontrado. Datos:`, doc.data());
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error(`❌ Error al obtener departamento con ID ${id}:`, error);
        res.status(500).json({ message: `Error interno del servidor al obtener departamento con ID ${id}`, error: error.message });
    }
};

/**
 * @desc Crear un nuevo departamento
 * @route POST /api/departamento
 * @access Public
 */
exports.createDepartment = async (req, res) => {
    console.log("[Controller] Petición para crear un nuevo departamento. Body:", req.body);
    // Campos esperados del cuerpo de la solicitud:
    const { departamentoId, nombre, director, descripcion } = req.body; 

    // Validación básica de campos obligatorios
    if (!departamentoId || !nombre || !director || !descripcion) {
        console.warn("[Controller] Campos obligatorios faltantes para crear departamento.");
        return res.status(400).json({ message: 'Error: Todos los campos (ID de Departamento, Nombre, Director, Descripción) son obligatorios para crear un departamento.' });
    }

    try {
        // Verificar si el departamento ya existe usando el departamentoId proporcionado
        const existingDepartment = await db.collection('departamentos').doc(departamentoId).get();
        if (existingDepartment.exists) {
            console.warn(`[Controller] Intento de crear departamento con ID ${departamentoId} que ya existe.`);
            return res.status(409).json({ message: `El departamento con ID ${departamentoId} ya existe.` });
        }

        // Crear el nuevo documento en Firestore con el ID especificado
        const departamentoRef = db.collection('departamentos').doc(departamentoId);
        const departmentData = {
            nombre: nombre,
            director: director,
            descripcion: descripcion,
            fechaCreacion: new Date(), // Almacena la fecha de creación como un Timestamp de Firestore
            fechaActualizacion: new Date() // También añade fecha de actualización inicial
        };
        await departamentoRef.set(departmentData);

        console.log(`[Controller] Departamento con ID ${departamentoId} creado exitosamente.`);
        res.status(201).json({ 
            message: 'Departamento creado exitosamente', 
            departamento: { id: departamentoId, ...departmentData } 
        });

    } catch (error) {
        console.error("❌ Error al crear departamento:", error);
        res.status(500).json({ message: 'Error interno del servidor al crear departamento', error: error.message });
    }
};

/**
 * @desc Actualizar un departamento por ID
 * @route PUT /api/departamento/:id
 * @access Public
 */
exports.updateDepartmentById = async (req, res) => {
    const { id } = req.params; // 'id' es el departamentoId en la URL
    const dataToUpdate = req.body; // Los datos a actualizar vienen en el cuerpo de la solicitud
    console.log(`[Controller] Petición para actualizar departamento ID: ${id}. Datos:`, dataToUpdate);

    try {
        // Validación: Asegurarse de que hay datos para actualizar
        if (Object.keys(dataToUpdate).length === 0) {
            console.warn(`[Controller] No hay datos para actualizar para el departamento ID: ${id}.`);
            return res.status(400).json({ message: 'No hay datos proporcionados para actualizar.' });
        }

        const departamentoRef = db.collection('departamentos').doc(id);
        const doc = await departamentoRef.get();

        // Verificar si el departamento existe antes de intentar actualizar
        if (!doc.exists) {
            console.warn(`[Controller] Intento de actualizar departamento con ID ${id} que no existe.`);
            return res.status(404).json({ message: 'Departamento no encontrado para actualizar.' });
        }

        // Agregar la fecha de actualización
        const updatePayload = { ...dataToUpdate, fechaActualizacion: new Date() };

        // Actualizar el documento
        await departamentoRef.update(updatePayload);
        console.log(`[Controller] Departamento con ID ${id} actualizado exitosamente.`);
        res.status(200).json({ message: `Departamento con ID ${id} actualizado exitosamente` });
    } catch (error) {
        console.error(`❌ Error al actualizar departamento con ID ${id}:`, error);
        res.status(500).json({ message: `Error interno del servidor al actualizar departamento con ID ${id}`, error: error.message });
    }
};

/**
 * @desc Eliminar un departamento por ID
 * @route DELETE /api/departamento/:id
 * @access Public
 */
exports.deleteDepartmentById = async (req, res) => {
    const { id } = req.params; // 'id' es el departamentoId en la URL
    console.log(`[Controller] Petición para eliminar departamento con ID: ${id}`);

    try {
        const departamentoRef = db.collection('departamentos').doc(id);
        const doc = await departamentoRef.get();

        // Verificar si el departamento existe antes de intentar eliminar
        if (!doc.exists) {
            console.warn(`[Controller] Intento de eliminar departamento con ID ${id} que no existe.`);
            return res.status(404).json({ message: 'Departamento no encontrado para eliminar.' });
        }

        // Eliminar el documento
        await departamentoRef.delete();
        console.log(`[Controller] Departamento con ID ${id} eliminado exitosamente.`);
        res.status(200).json({ message: `Departamento con ID ${id} eliminado exitosamente` });
    } catch (error) {
        console.error(`❌ Error al eliminar departamento con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar departamento', error: error.message });
    }
};