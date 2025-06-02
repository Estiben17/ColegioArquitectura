// Backend/Controllers/AsistenciaController.js

const db = require('../config/firebaseConfig'); // Importa la instancia de Firestore

exports.getAllAssistanceRecords = async (req, res) => {
    try {
        const asistenciasRef = db.collection('asistencias');
        const snapshot = await asistenciasRef.get();
        const asistencias = [];
        snapshot.forEach(doc => {
            asistencias.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(asistencias);
    } catch (error) {
        console.error("Error al obtener todos los registros de asistencia:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

exports.createAssistanceRecord = async (req, res) => {
    try {
        // Campos basados en tu Firestore:
        const { asignaturaID, codigoAsignatura, fecha, horaInicio, horaFin, nombreAsignatura, registros, semestreAsignatura } = req.body;

        // Validación básica
        if (!asignaturaID || !fecha || !horaInicio || !horaFin || !nombreAsignatura || !semestreAsignatura || !registros) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios para crear un registro de asistencia.' });
        }

        const semestreAsignaturaNum = parseInt(semestreAsignatura);
        if (isNaN(semestreAsignaturaNum)) {
             return res.status(400).json({ message: 'Semestre de asignatura debe ser un número válido.' });
        }
        
        // Convertir la fecha y horas a un formato más adecuado (Timestamp o Date)
        // Puedes recibir la fecha como string y convertirla a Date
        const fechaAsistencia = new Date(fecha); // Asegúrate de que el formato de 'fecha' sea parseable

        // La horaInicio y horaFin también podrían ser parte del objeto Date o strings estandarizados
        // Para este ejemplo, los mantendremos como string si vienen así.

        const nuevaAsistenciaRef = await db.collection('asistencias').add({
            asignaturaID,
            codigoAsignatura: codigoAsignatura || asignaturaID, // Si codigoAsignatura está vacío en BD, usa asignaturaID
            fecha: fechaAsistencia, 
            horaInicio: horaInicio,
            horaFin: horaFin,
            nombreAsignatura,
            registros: registros, // Esto espera un objeto como { estudianteID: true }
            semestreAsignatura: semestreAsignaturaNum
        });

        res.status(201).json({ message: 'Registro de asistencia creado exitosamente', asistencia: { id: nuevaAsistenciaRef.id, ...req.body, fecha: fechaAsistencia, semestreAsignatura: semestreAsignaturaNum } });

    } catch (error) {
        console.error("Error al crear registro de asistencia:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// Obtener un registro de asistencia por ID
exports.getAssistanceRecordById = async (req, res) => {
    const { id } = req.params; // ID del documento de asistencia
    try {
        const asistenciaRef = db.collection('asistencias').doc(id);
        const doc = await asistenciaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Registro de asistencia no encontrado.' });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error(`Error al obtener registro de asistencia con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// Actualizar un registro de asistencia por ID
exports.updateAssistanceRecordById = async (req, res) => {
    const { id } = req.params; // ID del documento de asistencia
    const dataToUpdate = req.body;
    try {
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: 'No hay datos para actualizar el registro de asistencia.' });
        }

        // Opcional: Convertir 'semestreAsignatura' a número si viene en la solicitud
        if (dataToUpdate.semestreAsignatura !== undefined) {
            const semestreAsignaturaNum = parseInt(dataToUpdate.semestreAsignatura);
            if (isNaN(semestreAsignaturaNum)) return res.status(400).json({ message: 'Semestre de asignatura debe ser un número válido.' });
            dataToUpdate.semestreAsignatura = semestreAsignaturaNum;
        }

        // Opcional: Convertir 'fecha' a Date si viene en la solicitud
        if (dataToUpdate.fecha !== undefined && typeof dataToUpdate.fecha === 'string') {
            dataToUpdate.fecha = new Date(dataToUpdate.fecha);
        }

        const asistenciaRef = db.collection('asistencias').doc(id);
        const doc = await asistenciaRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Registro de asistencia no encontrado.' });
        }

        await asistenciaRef.update(dataToUpdate);
        res.status(200).json({ message: `Registro de asistencia con ID ${id} actualizado exitosamente` });
    } catch (error) {
        console.error(`Error al actualizar registro de asistencia con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// Eliminar un registro de asistencia por ID
exports.deleteAssistanceRecordById = async (req, res) => {
    const { id } = req.params; // ID del documento de asistencia
    try {
        const asistenciaRef = db.collection('asistencias').doc(id);
        const doc = await asistenciaRef.get();
        if (!doc.exists) {
            return res.status(404).json({ message: 'Registro de asistencia no encontrado.' });
        }

        await asistenciaRef.delete();
        res.status(200).json({ message: `Registro de asistencia con ID ${id} eliminado exitosamente` });
    } catch (error) {
        console.error(`Error al eliminar registro de asistencia con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// --- Funciones para manejar los registros de estudiantes dentro de un registro de asistencia ---
// Si quieres añadir/eliminar estudiantes individuales de un registro de asistencia existente.

exports.addStudentToAssistanceRecord = async (req, res) => {
    const { id } = req.params; // ID del registro de asistencia
    const { estudianteId } = req.body;

    try {
        if (!estudianteId) {
            return res.status(400).json({ message: 'ID del estudiante es requerido.' });
        }

        const asistenciaRef = db.collection('asistencias').doc(id);
        const doc = await asistenciaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Registro de asistencia no encontrado.' });
        }

        // Actualizar el mapa 'registros' para incluir el nuevo estudiante
        // FieldValue.set() para actualizar campos anidados sin sobreescribir todo el mapa
        const admin = require('firebase-admin'); // Se necesita importar admin para FieldValue

        await asistenciaRef.update({
            [`registros.${estudianteId}`]: true // Añade/actualiza la clave estudianteId con valor true
        });

        res.status(200).json({ message: `Estudiante ${estudianteId} añadido al registro de asistencia ${id}.` });

    } catch (error) {
        console.error(`Error al añadir estudiante al registro de asistencia ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

exports.removeStudentFromAssistanceRecord = async (req, res) => {
    const { id } = req.params; // ID del registro de asistencia
    const { estudianteId } = req.body; // ID del estudiante a remover

    try {
        if (!estudianteId) {
            return res.status(400).json({ message: 'ID del estudiante es requerido.' });
        }

        const asistenciaRef = db.collection('asistencias').doc(id);
        const doc = await asistenciaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Registro de asistencia no encontrado.' });
        }
        
        const admin = require('firebase-admin'); // Se necesita importar admin para FieldValue

        // Eliminar el campo específico del mapa 'registros'
        await asistenciaRef.update({
            [`registros.${estudianteId}`]: admin.firestore.FieldValue.delete() 
        });

        res.status(200).json({ message: `Estudiante ${estudianteId} eliminado del registro de asistencia ${id}.` });

    } catch (error) {
        console.error(`Error al eliminar estudiante del registro de asistencia ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};