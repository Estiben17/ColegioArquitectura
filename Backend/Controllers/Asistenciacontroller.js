// Backend/Controllers/AsistenciaController.js

const db = require('../config/firebaseConfig'); // Importa la instancia de Firestore
const admin = require('firebase-admin'); // Importa firebase-admin para FieldValue

/**
 * @desc Obtener todos los registros de asistencia
 * @route GET /api/asistencias
 * @access Public
 */
exports.obtenerAsistencias = async (req, res) => { // Renamed
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

/**
 * @desc Crear nuevo registro de asistencia
 * @route POST /api/asistencias
 * @access Public (o restringido si hay autenticación)
 */
exports.crearAsistencia = async (req, res) => { // Renamed
    try {
        // Campos esperados del cuerpo de la solicitud:
        const { asignaturaID, codigoAsignatura, fecha, horaInicio, horaFin, nombreAsignatura, registros, semestreAsignatura } = req.body;

        // Validación básica
        if (!asignaturaID || !fecha || !horaInicio || !horaFin || !nombreAsignatura || semestreAsignatura === undefined || !registros) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios para crear un registro de asistencia.' });
        }

        const semestreAsignaturaNum = parseInt(semestreAsignatura);
        if (isNaN(semestreAsignaturaNum)) {
            return res.status(400).json({ message: 'Semestre de asignatura debe ser un número válido.' });
        }
        
        // Convertir la fecha a Date. Asegúrate de que el formato de 'fecha' sea parseable.
        const fechaAsistencia = new Date(fecha);

        const nuevaAsistenciaRef = await db.collection('asistencias').add({
            asignaturaID,
            codigoAsignatura: codigoAsignatura || asignaturaID, // Si codigoAsignatura está vacío, usa asignaturaID
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

/**
 * @desc Obtener un registro de asistencia por ID
 * @route GET /api/asistencias/:id
 * @access Public
 */
exports.obtenerAsistenciaPorId = async (req, res) => { // Renamed
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

/**
 * @desc Obtener asistencia por código (para "Fill Attendance" u otras búsquedas)
 * @route GET /api/asistencias/code/:codigo
 * @access Public
 */
exports.obtenerAsistenciaPorCodigo = async (req, res) => {
    const { codigo } = req.params;
    try {
        const asistenciasRef = db.collection('asistencias');
        // Asumiendo que 'codigoAsignatura' es el campo por el que buscarás el código
        const snapshot = await asistenciasRef.where('codigoAsignatura', '==', codigo).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: `No se encontró registro de asistencia para el código: ${codigo}.` });
        }

        const asistencias = [];
        snapshot.forEach(doc => {
            asistencias.push({ id: doc.id, ...doc.data() });
        });

        // Si esperas solo un registro por código, puedes devolver el primero:
        // res.status(200).json({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        // Si pueden haber múltiples, devuelve el array:
        res.status(200).json(asistencias);

    } catch (error) {
        console.error(`Error al obtener registro de asistencia por código ${codigo}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};


/**
 * @desc Actualizar un registro de asistencia por ID
 * @route PUT /api/asistencias/:id
 * @access Public (o restringido si hay autenticación)
 */
exports.actualizarAsistencia = async (req, res) => { // Renamed
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

        // Opcional: Convertir 'fecha' a Date si viene en la solicitud y es un string
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

/**
 * @desc Eliminar un registro de asistencia por ID
 * @route DELETE /api/asistencias/:id
 * @access Public (o restringido si hay autenticación)
 */
exports.eliminarAsistencia = async (req, res) => { // Renamed
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

/**
 * @desc Obtener estudiantes candidatos para una sesión de asistencia (ej: los inscritos en la asignatura)
 * @route GET /api/asistencias/:asistenciaId/estudiantes-candidatos
 * @access Public
 */
exports.obtenerEstudiantesParaSesionAsistencia = async (req, res) => {
    const { asistenciaId } = req.params;
    try {
        // Lógica para obtener el ID de la asignatura desde el registro de asistencia
        const asistenciaRef = db.collection('asistencias').doc(asistenciaId);
        const asistenciaDoc = await asistenciaRef.get();

        if (!asistenciaDoc.exists) {
            return res.status(404).json({ message: 'Registro de asistencia no encontrado.' });
        }

        const { asignaturaID } = asistenciaDoc.data();

        // Lógica para obtener los estudiantes inscritos en esa asignatura
        // Esto asume que tienes una colección 'matriculas' o 'estudiantesAsignaturas'
        // que relaciona estudiantes con asignaturas. Si no, necesitarás ajustar esta lógica.
        
        // Ejemplo asumiendo que los estudiantes tienen un campo 'asignaturasInscritas' que es un array
        // O una colección 'matriculas' con documentos que tienen 'estudianteId' y 'asignaturaId'
        const estudiantesInscritosSnapshot = await db.collection('estudiantes').where('asignaturasInscritas', 'array-contains', asignaturaID).get();
        
        // O si los estudiantes tienen un campo 'departamentoId' y 'facultad' y tu quieres filtrar por eso
        // Esto es un ejemplo, ajusta la lógica a tu modelo de datos real.

        const estudiantes = [];
        estudiantesInscritosSnapshot.forEach(doc => {
            // No devolver toda la data del estudiante, solo la necesaria para la asistencia
            const data = doc.data();
            estudiantes.push({
                id: doc.id,
                nombres: data.nombres,
                apellidos: data.apellidos,
                numeroDocumento: data.numeroDocumento // Útil para identificar
            });
        });

        res.status(200).json(estudiantes);

    } catch (error) {
        console.error(`Error al obtener estudiantes candidatos para sesión ${asistenciaId}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/**
 * @desc Registrar la asistencia de los estudiantes para una sesión específica
 * @route POST /api/asistencias/:asistenciaId/registrar-estudiantes
 * @access Public
 * @body {Object} asistenciaData - Objeto donde las claves son studentId y los valores son booleanos (true = presente)
 * Ejemplo de body: { "estudiante123": true, "estudiante456": false }
 */
exports.registrarAsistenciaEstudiantes = async (req, res) => {
    const { asistenciaId } = req.params;
    const asistenciaData = req.body; // Esto debería ser un objeto como { "estudianteId1": true, "estudianteId2": false }

    try {
        if (!asistenciaData || Object.keys(asistenciaData).length === 0) {
            return res.status(400).json({ message: 'Se requiere un objeto con datos de asistencia de estudiantes.' });
        }

        const asistenciaRef = db.collection('asistencias').doc(asistenciaId);
        const doc = await asistenciaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Registro de asistencia no encontrado.' });
        }

        // Obtener los registros de asistencia existentes (si los hay)
        const currentRecords = doc.data().registros || {};

        // Combinar los registros existentes con los nuevos/actualizados
        const updatedRecords = { ...currentRecords, ...asistenciaData };

        // Actualizar el campo 'registros' en el documento de asistencia
        await asistenciaRef.update({ registros: updatedRecords });

        res.status(200).json({ message: `Asistencia para sesión ${asistenciaId} registrada/actualizada exitosamente.`, updatedRecords });

    } catch (error) {
        console.error(`Error al registrar asistencia de estudiantes para sesión ${asistenciaId}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// --- Funciones para añadir/eliminar estudiantes individuales de un registro de asistencia existente. ---
// Estas funciones pueden ser útiles si gestionas la asistencia de forma individual después de la creación inicial.

/**
 * @desc Añadir un estudiante a un registro de asistencia existente (marcar presente)
 * @route POST /api/asistencias/:id/estudiantes
 * @access Public
 * @body {string} estudianteId - El ID del estudiante a añadir/marcar presente
 */
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

        // Actualizar el mapa 'registros' para incluir el nuevo estudiante como presente
        await asistenciaRef.update({
            [`registros.${estudianteId}`]: true // Añade/actualiza la clave estudianteId con valor true
        });

        res.status(200).json({ message: `Estudiante ${estudianteId} añadido/marcado presente en el registro de asistencia ${id}.` });

    } catch (error) {
        console.error(`Error al añadir estudiante al registro de asistencia ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/**
 * @desc Remover un estudiante de un registro de asistencia (o marcar ausente si se prefiere)
 * @route DELETE /api/asistencias/:id/estudiantes
 * @access Public
 * @body {string} estudianteId - El ID del estudiante a remover
 */
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