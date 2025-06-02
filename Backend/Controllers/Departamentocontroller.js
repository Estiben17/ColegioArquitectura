// Backend/Controllers/Departamentoscontroller.js

const db = require('../config/firebaseConfig'); // Importa la instancia de Firestore

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

exports.createDepartment = async (req, res) => {
    try {
        // Campos basados en tu Firestore:
        const { departamentoId, nombre, director, descripcion } = req.body; 

        if (!departamentoId || !nombre || !director || !descripcion) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios para crear un departamento.' });
        }

        // Verificar si el departamento ya existe
        const existingDepartment = await db.collection('departamentos').doc(departamentoId).get();
        if (existingDepartment.exists) {
            return res.status(409).json({ message: `El departamento con ID ${departamentoId} ya existe.` });
        }

        const departamentoRef = db.collection('departamentos').doc(departamentoId);
        await departamentoRef.set({
            nombre: nombre,
            director: director,
            descripcion: descripcion,
            fechaCreacion: new Date() // Almacenar como Timestamp de Firestore
        });

        res.status(201).json({ message: 'Departamento creado exitosamente', departamento: { id: departamentoId, ...req.body } });

    } catch (error) {
        console.error("Error al crear departamento:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

exports.updateDepartmentById = async (req, res) => {
    const { id } = req.params; // 'id' es el departamentoId
    const dataToUpdate = req.body;
    try {
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: 'No hay datos para actualizar.' });
        }

        const departamentoRef = db.collection('departamentos').doc(id);
        const doc = await departamentoRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Departamento no encontrado.' });
        }

        await departamentoRef.update(dataToUpdate);
        res.status(200).json({ message: `Departamento con ID ${id} actualizado exitosamente` });
    } catch (error) {
        console.error(`Error al actualizar departamento con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

exports.deleteDepartmentById = async (req, res) => {
    const { id } = req.params; // 'id' es el departamentoId
    try {
        const departamentoRef = db.collection('departamentos').doc(id);
        const doc = await departamentoRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Departamento no encontrado.' });
        }

        await departamentoRef.delete();
        res.status(200).json({ message: `Departamento con ID ${id} eliminado exitosamente` });
    } catch (error) {
        console.error(`Error al eliminar departamento con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};
