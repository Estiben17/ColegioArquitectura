// Backend/Controllers/Asignaturacontroller.js

const db = require('../config/firebaseConfig'); // Importa la instancia de Firestore

/**
 * @desc Obtener todas las asignaturas
 * @route GET /api/assignments
 * @access Public
 */
exports.getAllAssignments = async (req, res) => {
    console.log("[Controller] Petición para obtener todas las asignaturas.");
    try {
        const asignaturasRef = db.collection('asignaturas'); // Accede a la colección 'asignaturas'
        const snapshot = await asignaturasRef.get(); // Obtiene todos los documentos
        const asignaturas = [];

        if (snapshot.empty) {
            console.log("[Controller] No se encontraron asignaturas en la colección.");
            return res.status(200).json([]);
        }

        snapshot.forEach(doc => {
            // Asegúrate de que los IDs de los documentos sean incluidos en la respuesta
            asignaturas.push({ id: doc.id, ...doc.data() });
        });
        console.log(`[Controller] ${asignaturas.length} asignaturas obtenidas exitosamente.`);
        res.status(200).json(asignaturas);
    } catch (error) {
        console.error("❌ Error al obtener todas las asignaturas:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener asignaturas', error: error.message });
    }
};

/**
 * @desc Crear una nueva asignatura
 * @route POST /api/assignments
 * @access Public
 */
exports.createAssignment = async (req, res) => {
    console.log("[Controller] Petición para crear una nueva asignatura. Body:", req.body);
    const { codigo, nombre, semestre, creditos, departamentoId } = req.body;

    // Validación de entrada
    if (!codigo || !nombre || semestre === undefined || creditos === undefined || !departamentoId) {
        console.warn("[Controller] Campos obligatorios faltantes para crear asignatura.");
        return res.status(400).json({ message: 'Error: Todos los campos (codigo, nombre, semestre, creditos, departamentoId) son obligatorios.' });
    }

    // Convertir semestre y creditos a números
    const semestreNum = parseInt(semestre);
    const creditosNum = parseInt(creditos);

    if (isNaN(semestreNum) || isNaN(creditosNum)) {
        console.warn("[Controller] Semestre o creditos no son números válidos.");
        return res.status(400).json({ message: 'Semestre y creditos deben ser números válidos.' });
    }

    try {
        // Verificar si la asignatura ya existe por su código (ID de documento)
        const existingAssignment = await db.collection('asignaturas').doc(codigo).get();
        if (existingAssignment.exists) {
            console.warn(`[Controller] Intento de crear asignatura con código ${codigo} que ya existe.`);
            return res.status(409).json({ message: `La asignatura con código ${codigo} ya existe.` });
        }

        const newAssignmentData = {
            nombre: nombre,
            semestre: semestreNum,
            creditos: creditosNum,
            departamentoId: departamentoId,
            createdAt: new Date(), // Timestamp de creación
            updatedAt: new Date()  // Timestamp de última actualización
        };

        // Crear un documento en la colección 'asignaturas' usando 'codigo' como ID
        const asignaturaRef = db.collection('asignaturas').doc(codigo);
        await asignaturaRef.set(newAssignmentData);

        console.log(`[Controller] Asignatura con código ${codigo} creada exitosamente.`);
        res.status(201).json({
            message: 'Asignatura creada exitosamente',
            asignatura: { id: codigo, ...newAssignmentData } // Retorna los datos como se guardaron
        });

    } catch (error) {
        console.error("❌ Error al crear asignatura:", error);
        res.status(500).json({ message: 'Error interno del servidor al crear asignatura', error: error.message });
    }
};

/**
 * @desc Actualizar una asignatura por ID
 * @route PUT /api/assignments/:id
 * @access Public
 */
exports.updateAssignmentById = async (req, res) => {
    const { id } = req.params; // 'id' es el código de la asignatura (ej. PROG004)
    const dataToUpdate = { ...req.body }; // Crear una copia mutable
    console.log(`[Controller] Petición para actualizar asignatura ID: ${id}. Datos:`, dataToUpdate);

    try {
        if (Object.keys(dataToUpdate).length === 0) {
            console.warn(`[Controller] No hay datos para actualizar la asignatura ID: ${id}.`);
            return res.status(400).json({ message: 'No hay datos proporcionados para actualizar.' });
        }

        // Opcional: Convertir 'semestre' y 'creditos' a números si vienen en la solicitud
        if (dataToUpdate.semestre !== undefined) {
            const semestreNum = parseInt(dataToUpdate.semestre);
            if (isNaN(semestreNum)) {
                console.warn("[Controller] Intento de actualizar con semestre no válido.");
                return res.status(400).json({ message: 'Semestre debe ser un número válido.' });
            }
            dataToUpdate.semestre = semestreNum;
        }
        if (dataToUpdate.creditos !== undefined) {
            const creditosNum = parseInt(dataToUpdate.creditos);
            if (isNaN(creditosNum)) {
                console.warn("[Controller] Intento de actualizar con creditos no válidos.");
                return res.status(400).json({ message: 'Creditos deben ser un número válido.' });
            }
            dataToUpdate.creditos = creditosNum;
        }

        // Añadir/actualizar el timestamp de actualización
        dataToUpdate.updatedAt = new Date();

        const asignaturaRef = db.collection('asignaturas').doc(id);
        const doc = await asignaturaRef.get();

        if (!doc.exists) {
            console.warn(`[Controller] Intento de actualizar asignatura con ID ${id} que no existe.`);
            return res.status(404).json({ message: 'Asignatura no encontrada para actualizar.' });
        }

        await asignaturaRef.update(dataToUpdate); // 'update' actualiza campos existentes, no sobrescribe todo el documento
        console.log(`[Controller] Asignatura con ID ${id} actualizada exitosamente.`);
        res.status(200).json({ message: `Asignatura con ID ${id} actualizada exitosamente` });
    } catch (error) {
        console.error(`❌ Error al actualizar asignatura con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar asignatura', error: error.message });
    }
};

/**
 * @desc Eliminar una asignatura por ID
 * @route DELETE /api/assignments/:id
 * @access Public
 */
exports.deleteAssignmentById = async (req, res) => {
    const { id } = req.params; // 'id' es el código de la asignatura (ej. PROG004)
    console.log(`[Controller] Petición para eliminar asignatura con ID: ${id}`);
    try {
        const asignaturaRef = db.collection('asignaturas').doc(id);
        const doc = await asignaturaRef.get();

        if (!doc.exists) {
            console.warn(`[Controller] Intento de eliminar asignatura con ID ${id} que no existe.`);
            return res.status(404).json({ message: 'Asignatura no encontrada para eliminar.' });
        }

        await asignaturaRef.delete();
        console.log(`[Controller] Asignatura con ID ${id} eliminada exitosamente.`);
        res.status(200).json({ message: `Asignatura con ID ${id} eliminada exitosamente` });
    } catch (error) {
        console.error(`❌ Error al eliminar asignatura con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar asignatura', error: error.message });
    }
};

// --- Funciones para Inscripciones de Asignaturas (Colección: 'inscripcionesAsignaturas') ---

/**
 * @desc Obtener todas las inscripciones de estudiantes en asignaturas
 * @route GET /api/registered-students
 * @access Public
 */
exports.getAllRegisteredStudents = async (req, res) => {
    console.log("[Controller] Petición para obtener todas las inscripciones de estudiantes en asignaturas.");
    try {
        const inscripcionesRef = db.collection('inscripcionesAsignaturas');
        const snapshot = await inscripcionesRef.get();
        const inscripciones = [];

        if (snapshot.empty) {
            console.log("[Controller] No se encontraron inscripciones de estudiantes en asignaturas.");
            return res.status(200).json([]);
        }

        snapshot.forEach(doc => {
            inscripciones.push({ id: doc.id, ...doc.data() });
        });
        console.log(`[Controller] ${inscripciones.length} inscripciones obtenidas exitosamente.`);
        res.status(200).json(inscripciones);
    } catch (error) {
        console.error("❌ Error al obtener todas las inscripciones de estudiantes:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener inscripciones', error: error.message });
    }
};

/**
 * @desc Registrar un estudiante en una asignatura
 * @route POST /api/register-student
 * @access Public
 */
exports.registerStudent = async (req, res) => {
    console.log("[Controller] Petición para registrar un estudiante en una asignatura. Body:", req.body);
    // Campos que esperaríamos en el body de la solicitud basados en tu Firestore:
    const {
        asignaturaId, estudianteId, grupo, semestreInscripcion,
        apellidosEstudiante, correoEstudiante, nombreAsignatura, nombresEstudiante
    } = req.body;

    // Validación básica
    if (!asignaturaId || !estudianteId || !grupo || semestreInscripcion === undefined ||
        !apellidosEstudiante || !correoEstudiante || !nombreAsignatura || !nombresEstudiante) {
        console.warn("[Controller] Faltan campos obligatorios para registrar al estudiante en la asignatura.");
        return res.status(400).json({ message: 'Error: Faltan campos obligatorios para registrar al estudiante en la asignatura.' });
    }

    const semestreInscripcionNum = parseInt(semestreInscripcion);
    if (isNaN(semestreInscripcionNum)) {
        console.warn("[Controller] Semestre de inscripción no es un número válido.");
        return res.status(400).json({ message: 'Semestre de inscripción debe ser un número válido.' });
    }

    try {
        // Opcional: Verificar si el estudiante y la asignatura existen en sus respectivas colecciones
        // Esto es altamente recomendado para la integridad referencial.
        const [asignaturaDoc, estudianteDoc] = await Promise.all([
            db.collection('asignaturas').doc(asignaturaId).get(),
            db.collection('estudiantes').doc(estudianteId).get()
        ]);

        if (!asignaturaDoc.exists) {
            console.warn(`[Controller] Asignatura con ID ${asignaturaId} no encontrada para registro.`);
            return res.status(404).json({ message: `Asignatura con ID ${asignaturaId} no encontrada.` });
        }
        if (!estudianteDoc.exists) {
            console.warn(`[Controller] Estudiante con ID ${estudianteId} no encontrado para registro.`);
            return res.status(404).json({ message: `Estudiante con ID ${estudianteId} no encontrado.` });
        }

        // Puedes añadir una verificación para evitar duplicados si un estudiante no debe inscribirse dos veces
        // a la misma asignatura en el mismo semestre/grupo.
        const existingRegistrationSnapshot = await db.collection('inscripcionesAsignaturas')
            .where('asignaturaId', '==', asignaturaId)
            .where('estudianteId', '==', estudianteId)
            .where('semestreInscripcion', '==', semestreInscripcionNum)
            .where('grupo', '==', grupo) // Incluye grupo si es relevante para la unicidad
            .get();

        if (!existingRegistrationSnapshot.empty) {
            console.warn(`[Controller] El estudiante ${estudianteId} ya está registrado en la asignatura ${asignaturaId} para el semestre ${semestreInscripcionNum} y grupo ${grupo}.`);
            return res.status(409).json({ message: `El estudiante ya está registrado en esta asignatura, semestre y grupo.` });
        }

        // Crear una nueva inscripción, Firestore generará automáticamente el ID del documento
        const nuevaInscripcionData = {
            asignaturaId,
            estudianteId,
            grupo,
            semestreInscripcion: semestreInscripcionNum,
            apellidosEstudiante,
            correoEstudiante,
            nombreAsignatura,
            nombresEstudiante,
            createdAt: new Date(), // Timestamp de creación
            updatedAt: new Date()  // Timestamp de última actualización
        };

        const nuevaInscripcionRef = await db.collection('inscripcionesAsignaturas').add(nuevaInscripcionData);

        console.log(`[Controller] Estudiante registrado en asignatura exitosamente con ID ${nuevaInscripcionRef.id}.`);
        res.status(201).json({
            message: 'Estudiante registrado en asignatura exitosamente',
            inscripcion: { id: nuevaInscripcionRef.id, ...nuevaInscripcionData }
        });

    } catch (error) {
        console.error("❌ Error al registrar estudiante en asignatura:", error);
        res.status(500).json({ message: 'Error interno del servidor al registrar estudiante en asignatura', error: error.message });
    }
};

/**
 * @desc Actualizar una inscripción de estudiante en una asignatura por su ID de inscripción
 * @route PUT /api/registered-students/:registrationId
 * @access Public
 */
exports.updateRegisteredStudentInAssignment = async (req, res) => {
    const { registrationId } = req.params; // ID del documento de inscripción (generado por Firestore)
    const dataToUpdate = { ...req.body }; // Copia mutable
    console.log(`[Controller] Petición para actualizar inscripción ${registrationId}. Datos:`, dataToUpdate);

    try {
        if (Object.keys(dataToUpdate).length === 0) {
            console.warn(`[Controller] No hay datos para actualizar la inscripción ${registrationId}.`);
            return res.status(400).json({ message: 'No hay datos proporcionados para actualizar la inscripción.' });
        }

        // Opcional: Convertir 'semestreInscripcion' a número si viene en la solicitud
        if (dataToUpdate.semestreInscripcion !== undefined) {
            const semestreInscripcionNum = parseInt(dataToUpdate.semestreInscripcion);
            if (isNaN(semestreInscripcionNum)) {
                console.warn("[Controller] Intento de actualizar inscripción con semestre no válido.");
                return res.status(400).json({ message: 'Semestre de inscripción debe ser un número válido.' });
            }
            dataToUpdate.semestreInscripcion = semestreInscripcionNum;
        }

        // Añadir/actualizar el timestamp de actualización
        dataToUpdate.updatedAt = new Date();

        const inscripcionRef = db.collection('inscripcionesAsignaturas').doc(registrationId);
        const doc = await inscripcionRef.get();

        if (!doc.exists) {
            console.warn(`[Controller] Inscripción con ID ${registrationId} no encontrada para actualizar.`);
            return res.status(404).json({ message: 'Inscripción no encontrada para actualizar.' });
        }

        await inscripcionRef.update(dataToUpdate);
        console.log(`[Controller] Inscripción con ID ${registrationId} actualizada exitosamente.`);
        res.status(200).json({ message: `Inscripción con ID ${registrationId} actualizada exitosamente` });
    } catch (error) {
        console.error(`❌ Error al actualizar inscripción con ID ${registrationId}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar inscripción', error: error.message });
    }
};

/**
 * @desc Desregistrar un estudiante de una asignatura (eliminar la inscripción)
 * @route DELETE /api/registered-students/:registrationId
 * @access Public
 */
exports.unregisterStudentFromAssignment = async (req, res) => {
    const { registrationId } = req.params; // ID del documento de inscripción
    console.log(`[Controller] Petición para desregistrar estudiante de asignatura. Inscripción ID: ${registrationId}`);
    try {
        const inscripcionRef = db.collection('inscripcionesAsignaturas').doc(registrationId);
        const doc = await inscripcionRef.get();

        if (!doc.exists) {
            console.warn(`[Controller] Inscripción con ID ${registrationId} no encontrada para eliminar.`);
            return res.status(404).json({ message: 'Inscripción no encontrada para eliminar.' });
        }

        await inscripcionRef.delete();
        console.log(`[Controller] Estudiante desregistrado de la asignatura (inscripción con ID ${registrationId} eliminada) exitosamente.`);
        res.status(200).json({ message: `Estudiante desregistrado de la asignatura (inscripción con ID ${registrationId} eliminada) exitosamente` });
    } catch (error) {
        console.error(`❌ Error al desregistrar estudiante de la asignatura con ID ${registrationId}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al desregistrar estudiante de la asignatura', error: error.message });
    }
};