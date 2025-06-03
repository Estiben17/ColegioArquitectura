// Backend/Controllers/AsistenciaController.js

const db = require('../config/firebaseConfig'); // Importa la instancia de Firestore
const admin = require('firebase-admin'); // Importa firebase-admin para FieldValue

/**
 * @desc Obtener todos los registros de asistencia
 * @route GET /api/asistencias
 * @access Public
 */
exports.obtenerAsistencias = async (req, res) => {
    console.log("[Controller] Petición para obtener todos los registros de asistencia.");
    try {
        const asistenciasRef = db.collection('asistencias');
        const snapshot = await asistenciasRef.get();
        const asistencias = [];

        if (snapshot.empty) {
            console.log("[Controller] No se encontraron registros de asistencia en la colección.");
            return res.status(200).json([]);
        }

        snapshot.forEach(doc => {
            asistencias.push({ id: doc.id, ...doc.data() });
        });
        console.log(`[Controller] ${asistencias.length} registros de asistencia obtenidos exitosamente.`);
        res.status(200).json(asistencias);
    } catch (error) {
        console.error("❌ Error al obtener todos los registros de asistencia:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener registros de asistencia', error: error.message });
    }
};

/**
 * @desc Crear nuevo registro de asistencia
 * @route POST /api/asistencias
 * @access Public
 */
exports.crearAsistencia = async (req, res) => {
    console.log("[Controller] Petición para crear un nuevo registro de asistencia. Body:", req.body);
    // Campos esperados del cuerpo de la solicitud:
    const { asignaturaID, codigoAsignatura, fecha, horaInicio, horaFin, nombreAsignatura, registros, semestreAsignatura } = req.body;

    // Validación básica
    if (!asignaturaID || !fecha || !horaInicio || !horaFin || !nombreAsignatura || semestreAsignatura === undefined || !registros) {
        console.warn("[Controller] Campos obligatorios faltantes para crear un registro de asistencia.");
        return res.status(400).json({ message: 'Error: Todos los campos (ID de Asignatura, Fecha, Hora Inicio, Hora Fin, Nombre de Asignatura, Semestre de Asignatura, Registros) son obligatorios para crear un registro de asistencia.' });
    }

    const semestreAsignaturaNum = parseInt(semestreAsignatura);
    if (isNaN(semestreAsignaturaNum)) {
        console.warn("[Controller] Semestre de asignatura no es un número válido.");
        return res.status(400).json({ message: 'Semestre de asignatura debe ser un número válido.' });
    }

    try {
        // Convertir la fecha a Date. Asegúrate de que el formato de 'fecha' sea parseable (ej. "YYYY-MM-DD").
        const fechaAsistencia = new Date(fecha);

        const nuevaAsistenciaData = {
            asignaturaID,
            codigoAsignatura: codigoAsignatura || asignaturaID, // Si codigoAsignatura está vacío, usa asignaturaID
            fecha: fechaAsistencia,
            horaInicio: horaInicio,
            horaFin: horaFin,
            nombreAsignatura,
            registros: registros, // Esto espera un objeto como { estudianteID: true }
            semestreAsignatura: semestreAsignaturaNum,
            createdAt: new Date(), // Timestamp de creación
            updatedAt: new Date()  // Timestamp de última actualización
        };

        const nuevaAsistenciaRef = await db.collection('asistencias').add(nuevaAsistenciaData);

        console.log(`[Controller] Registro de asistencia con ID ${nuevaAsistenciaRef.id} creado exitosamente.`);
        res.status(201).json({ message: 'Registro de asistencia creado exitosamente', asistencia: { id: nuevaAsistenciaRef.id, ...nuevaAsistenciaData } });

    } catch (error) {
        console.error("❌ Error al crear registro de asistencia:", error);
        res.status(500).json({ message: 'Error interno del servidor al crear registro de asistencia', error: error.message });
    }
};

/**
 * @desc Obtener un registro de asistencia por ID
 * @route GET /api/asistencias/:id
 * @access Public
 */
exports.obtenerAsistenciaPorId = async (req, res) => {
    const { id } = req.params; // ID del documento de asistencia
    console.log(`[Controller] Petición para obtener registro de asistencia con ID: ${id}`);
    try {
        const asistenciaRef = db.collection('asistencias').doc(id);
        const doc = await asistenciaRef.get();

        if (!doc.exists) {
            console.warn(`[Controller] Registro de asistencia con ID ${id} no encontrado.`);
            return res.status(404).json({ message: `Registro de asistencia con ID ${id} no encontrado.` });
        }

        console.log(`[Controller] Registro de asistencia ${id} encontrado. Datos:`, doc.data());
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error(`❌ Error al obtener registro de asistencia con ID ${id}:`, error);
        res.status(500).json({ message: `Error interno del servidor al obtener registro de asistencia con ID ${id}`, error: error.message });
    }
};

/**
 * @desc Obtener asistencia por código (para "Fill Attendance" u otras búsquedas)
 * @route GET /api/asistencias/code/:codigo
 * @access Public
 */
exports.obtenerAsistenciaPorCodigo = async (req, res) => {
    const { codigo } = req.params;
    console.log(`[Controller] Petición para obtener registro(s) de asistencia por código: ${codigo}`);
    try {
        const asistenciasRef = db.collection('asistencias');
        // Asumiendo que 'codigoAsignatura' es el campo por el que buscarás el código
        const snapshot = await asistenciasRef.where('codigoAsignatura', '==', codigo).get();

        if (snapshot.empty) {
            console.warn(`[Controller] No se encontró registro de asistencia para el código: ${codigo}.`);
            return res.status(404).json({ message: `No se encontró registro de asistencia para el código: ${codigo}.` });
        }

        const asistencias = [];
        snapshot.forEach(doc => {
            asistencias.push({ id: doc.id, ...doc.data() });
        });

        console.log(`[Controller] ${asistencias.length} registros de asistencia encontrados para el código ${codigo}.`);
        res.status(200).json(asistencias);

    } catch (error) {
        console.error(`❌ Error al obtener registro de asistencia por código ${codigo}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al obtener registro de asistencia por código', error: error.message });
    }
};

/**
 * @desc Actualizar un registro de asistencia por ID
 * @route PUT /api/asistencias/:id
 * @access Public
 */
exports.actualizarAsistencia = async (req, res) => {
    const { id } = req.params; // ID del documento de asistencia
    const dataToUpdate = { ...req.body }; // Crear una copia mutable del body
    console.log(`[Controller] Petición para actualizar registro de asistencia ID: ${id}. Datos:`, dataToUpdate);

    try {
        if (Object.keys(dataToUpdate).length === 0) {
            console.warn(`[Controller] No hay datos para actualizar el registro de asistencia ID: ${id}.`);
            return res.status(400).json({ message: 'No hay datos proporcionados para actualizar el registro de asistencia.' });
        }

        // Opcional: Convertir 'semestreAsignatura' a número si viene en la solicitud
        if (dataToUpdate.semestreAsignatura !== undefined) {
            const semestreAsignaturaNum = parseInt(dataToUpdate.semestreAsignatura);
            if (isNaN(semestreAsignaturaNum)) {
                console.warn("[Controller] Intento de actualizar con semestre de asignatura no válido.");
                return res.status(400).json({ message: 'Semestre de asignatura debe ser un número válido.' });
            }
            dataToUpdate.semestreAsignatura = semestreAsignaturaNum;
        }

        // Opcional: Convertir 'fecha' a Date si viene en la solicitud y es un string
        if (dataToUpdate.fecha !== undefined && typeof dataToUpdate.fecha === 'string') {
            dataToUpdate.fecha = new Date(dataToUpdate.fecha);
        }

        // Añadir/actualizar el timestamp de actualización
        dataToUpdate.updatedAt = new Date();

        const asistenciaRef = db.collection('asistencias').doc(id);
        const doc = await asistenciaRef.get();
        if (!doc.exists) {
            console.warn(`[Controller] Intento de actualizar registro de asistencia con ID ${id} que no existe.`);
            return res.status(404).json({ message: 'Registro de asistencia no encontrado para actualizar.' });
        }

        await asistenciaRef.update(dataToUpdate);
        console.log(`[Controller] Registro de asistencia con ID ${id} actualizado exitosamente.`);
        res.status(200).json({ message: `Registro de asistencia con ID ${id} actualizado exitosamente` });
    } catch (error) {
        console.error(`❌ Error al actualizar registro de asistencia con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar registro de asistencia', error: error.message });
    }
};

/**
 * @desc Eliminar un registro de asistencia por ID
 * @route DELETE /api/asistencias/:id
 * @access Public
 */
exports.eliminarAsistencia = async (req, res) => {
    const { id } = req.params; // ID del documento de asistencia
    console.log(`[Controller] Petición para eliminar registro de asistencia con ID: ${id}`);
    try {
        const asistenciaRef = db.collection('asistencias').doc(id);
        const doc = await asistenciaRef.get();
        if (!doc.exists) {
            console.warn(`[Controller] Intento de eliminar registro de asistencia con ID ${id} que no existe.`);
            return res.status(404).json({ message: 'Registro de asistencia no encontrado para eliminar.' });
        }

        await asistenciaRef.delete();
        console.log(`[Controller] Registro de asistencia con ID ${id} eliminado exitosamente.`);
        res.status(200).json({ message: `Registro de asistencia con ID ${id} eliminado exitosamente` });
    } catch (error) {
        console.error(`❌ Error al eliminar registro de asistencia con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar registro de asistencia', error: error.message });
    }
};

/**
 * @desc Obtener estudiantes candidatos para una sesión de asistencia (ej: los inscritos en la asignatura)
 * @route GET /api/asistencias/:asistenciaId/estudiantes-candidatos
 * @access Public
 */
exports.obtenerEstudiantesParaSesionAsistencia = async (req, res) => {
    const { asistenciaId } = req.params;
    console.log(`[Controller] Petición para obtener estudiantes candidatos para sesión de asistencia: ${asistenciaId}`);
    try {
        const asistenciaRef = db.collection('asistencias').doc(asistenciaId);
        const asistenciaDoc = await asistenciaRef.get();

        if (!asistenciaDoc.exists) {
            console.warn(`[Controller] Registro de asistencia ${asistenciaId} no encontrado para obtener estudiantes.`);
            return res.status(404).json({ message: 'Registro de asistencia no encontrado.' });
        }

        const { asignaturaID } = asistenciaDoc.data();
        if (!asignaturaID) {
            console.warn(`[Controller] El registro de asistencia ${asistenciaId} no tiene un 'asignaturaID'.`);
            return res.status(400).json({ message: 'El registro de asistencia no tiene un ID de asignatura asociado.' });
        }

        // Lógica para obtener los estudiantes inscritos en esa asignatura.
        // Esto asume que tienes una colección 'estudiantes' y que cada documento de estudiante
        // tiene un campo `asignaturasInscritas` que es un array de IDs de asignaturas.
        const estudiantesInscritosSnapshot = await db.collection('estudiantes').where('asignaturasInscritas', 'array-contains', asignaturaID).get();

        const estudiantes = [];
        if (estudiantesInscritosSnapshot.empty) {
            console.log(`[Controller] No se encontraron estudiantes inscritos en la asignatura ${asignaturaID}.`);
            return res.status(200).json([]);
        }

        estudiantesInscritosSnapshot.forEach(doc => {
            const data = doc.data();
            // Asegúrate de que los nombres de los campos coincidan con tu esquema de estudiante
            estudiantes.push({
                id: doc.id, // Esto será el documentNumber del estudiante si lo usas como ID de documento
                documentNumber: data.documentNumber, // Para ser explícito
                firstName: data.firstName,
                secondName: data.secondName,
                firstSurname: data.firstSurname,
                secondSurname: data.secondSurname
            });
        });

        console.log(`[Controller] ${estudiantes.length} estudiantes candidatos encontrados para la sesión ${asistenciaId}.`);
        res.status(200).json(estudiantes);

    } catch (error) {
        console.error(`❌ Error al obtener estudiantes candidatos para sesión ${asistenciaId}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al obtener estudiantes candidatos', error: error.message });
    }
};

/**
 * @desc Registrar la asistencia de los estudiantes para una sesión específica
 * @route POST /api/asistencias/:asistenciaId/registrar-estudiantes
 * @access Public
 * @body {Object} asistenciaData - Objeto donde las claves son studentId y los valores son booleanos (true = presente)
 * Ejemplo de body: { "estudiante123": true, "estudiante456": false, "estudiante789": true }
 */
exports.registrarAsistenciaEstudiantes = async (req, res) => {
    const { asistenciaId } = req.params;
    const asistenciaData = req.body; // Esto debería ser un objeto como { "estudianteId1": true, "estudianteId2": false }
    console.log(`[Controller] Petición para registrar asistencia de estudiantes para sesión ${asistenciaId}. Datos:`, asistenciaData);

    try {
        if (!asistenciaData || Object.keys(asistenciaData).length === 0) {
            console.warn("[Controller] Se requiere un objeto con datos de asistencia de estudiantes para el registro.");
            return res.status(400).json({ message: 'Se requiere un objeto con datos de asistencia de estudiantes.' });
        }

        const asistenciaRef = db.collection('asistencias').doc(asistenciaId);
        const doc = await asistenciaRef.get();

        if (!doc.exists) {
            console.warn(`[Controller] Registro de asistencia ${asistenciaId} no encontrado para registrar estudiantes.`);
            return res.status(404).json({ message: 'Registro de asistencia no encontrado.' });
        }

        // Obtener los registros de asistencia existentes (si los hay)
        const currentRecords = doc.data().registros || {};

        // Combinar los registros existentes con los nuevos/actualizados
        const updatedRecords = { ...currentRecords, ...asistenciaData };

        // Actualizar el campo 'registros' y 'updatedAt' en el documento de asistencia
        await asistenciaRef.update({ registros: updatedRecords, updatedAt: new Date() });

        console.log(`[Controller] Asistencia para sesión ${asistenciaId} registrada/actualizada exitosamente.`);
        res.status(200).json({ message: `Asistencia para sesión ${asistenciaId} registrada/actualizada exitosamente.`, updatedRecords });

    } catch (error) {
        console.error(`❌ Error al registrar asistencia de estudiantes para sesión ${asistenciaId}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al registrar asistencia de estudiantes', error: error.message });
    }
};

/**
 * @desc Añadir un estudiante a un registro de asistencia existente (marcar presente)
 * Este endpoint es alternativo a `registrarAsistenciaEstudiantes` si se quiere actualizar individualmente.
 * @route PUT /api/asistencias/:id/estudiantes/add
 * @access Public
 * @body {string} estudianteId - El ID del estudiante a añadir/marcar presente
 */
exports.addStudentToAssistanceRecord = async (req, res) => {
    const { id } = req.params; // ID del registro de asistencia
    const { estudianteId } = req.body;
    console.log(`[Controller] Petición para añadir estudiante ${estudianteId} al registro de asistencia ${id}.`);

    try {
        if (!estudianteId) {
            console.warn("[Controller] ID del estudiante es requerido para añadir al registro.");
            return res.status(400).json({ message: 'ID del estudiante es requerido.' });
        }

        const asistenciaRef = db.collection('asistencias').doc(id);
        const doc = await asistenciaRef.get();

        if (!doc.exists) {
            console.warn(`[Controller] Registro de asistencia ${id} no encontrado para añadir estudiante.`);
            return res.status(404).json({ message: 'Registro de asistencia no encontrado.' });
        }

        // Actualizar el mapa 'registros' para incluir el nuevo estudiante como presente y el timestamp de actualización
        await asistenciaRef.update({
            [`registros.${estudianteId}`]: true, // Añade/actualiza la clave estudianteId con valor true
            updatedAt: new Date()
        });

        console.log(`[Controller] Estudiante ${estudianteId} añadido/marcado presente en el registro de asistencia ${id}.`);
        res.status(200).json({ message: `Estudiante ${estudianteId} añadido/marcado presente en el registro de asistencia ${id}.` });

    } catch (error) {
        console.error(`❌ Error al añadir estudiante al registro de asistencia ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al añadir estudiante al registro de asistencia', error: error.message });
    }
};

/**
 * @desc Remover un estudiante de un registro de asistencia (o marcar ausente/eliminar su entrada)
 * Este endpoint es alternativo si se quiere actualizar individualmente.
 * @route PUT /api/asistencias/:id/estudiantes/remove (o DELETE con body si el framework lo permite)
 * @access Public
 * @body {string} estudianteId - El ID del estudiante a remover
 */
exports.removeStudentFromAssistanceRecord = async (req, res) => {
    const { id } = req.params; // ID del registro de asistencia
    const { estudianteId } = req.body; // ID del estudiante a remover
    console.log(`[Controller] Petición para remover estudiante ${estudianteId} del registro de asistencia ${id}.`);

    try {
        if (!estudianteId) {
            console.warn("[Controller] ID del estudiante es requerido para remover del registro.");
            return res.status(400).json({ message: 'ID del estudiante es requerido.' });
        }

        const asistenciaRef = db.collection('asistencias').doc(id);
        const doc = await asistenciaRef.get();

        if (!doc.exists) {
            console.warn(`[Controller] Registro de asistencia ${id} no encontrado para remover estudiante.`);
            return res.status(404).json({ message: 'Registro de asistencia no encontrado.' });
        }

        // Eliminar el campo específico del mapa 'registros' y actualizar el timestamp
        await asistenciaRef.update({
            [`registros.${estudianteId}`]: admin.firestore.FieldValue.delete(),
            updatedAt: new Date()
        });

        console.log(`[Controller] Estudiante ${estudianteId} eliminado del registro de asistencia ${id}.`);
        res.status(200).json({ message: `Estudiante ${estudianteId} eliminado del registro de asistencia ${id}.` });

    } catch (error) {
        console.error(`❌ Error al eliminar estudiante del registro de asistencia ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar estudiante del registro de asistencia', error: error.message });
    }
};