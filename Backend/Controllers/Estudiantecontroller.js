// Backend/Controllers/Estudiantescontroller.js

const db = require('../config/firebaseConfig'); // Importa la instancia de Firestore

exports.getAllStudents = async (req, res) => {
    try {
        const estudiantesRef = db.collection('estudiantes');
        const snapshot = await estudiantesRef.get();
        const estudiantes = [];
        snapshot.forEach(doc => {
            estudiantes.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(estudiantes);
    } catch (error) {
        console.error("Error al obtener todos los estudiantes:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

exports.createStudent = async (req, res) => {
    try {
        // Campos basados en tu Firestore:
        const { numeroDocumento, nombres, apellidos, correoElectronico, tipoDocumento, departamentoId, facultad } = req.body;

        if (!numeroDocumento || !nombres || !apellidos || !correoElectronico || !tipoDocumento || !departamentoId || !facultad) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios para crear un estudiante.' });
        }

        // Verificar si el estudiante ya existe por su numeroDocumento (ID de documento)
        const existingStudent = await db.collection('estudiantes').doc(numeroDocumento).get();
        if (existingStudent.exists) {
            return res.status(409).json({ message: `El estudiante con número de documento ${numeroDocumento} ya existe.` });
        }

        const estudianteRef = db.collection('estudiantes').doc(numeroDocumento);
        await estudianteRef.set({
            nombres: nombres,
            apellidos: apellidos,
            correoElectronico: correoElectronico,
            tipoDocumento: tipoDocumento,
            departamentoId: departamentoId,
            facultad: facultad
        });

        res.status(201).json({ message: 'Estudiante creado exitosamente', estudiante: { id: numeroDocumento, ...req.body } });

    } catch (error) {
        console.error("Error al crear estudiante:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

exports.updateStudentById = async (req, res) => {
    const { id } = req.params; // 'id' es el numeroDocumento
    const dataToUpdate = req.body;
    try {
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: 'No hay datos para actualizar.' });
        }

        const estudianteRef = db.collection('estudiantes').doc(id);
        const doc = await estudianteRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }

        await estudianteRef.update(dataToUpdate);
        res.status(200).json({ message: `Estudiante con número de documento ${id} actualizado exitosamente` });
    } catch (error) {
        console.error(`Error al actualizar estudiante con número de documento ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

exports.deleteStudentById = async (req, res) => {
    const { id } = req.params; // 'id' es el numeroDocumento
    try {
        const estudianteRef = db.collection('estudiantes').doc(id);
        const doc = await estudianteRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }

        await estudianteRef.delete();
        res.status(200).json({ message: `Estudiante con número de documento ${id} eliminado exitosamente` });
    } catch (error) {
        console.error(`Error al eliminar estudiante con número de documento ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};