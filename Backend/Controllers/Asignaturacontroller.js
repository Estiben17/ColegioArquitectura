// Backend/Controllers/Asignaturacontroller.js

const db = require('../config/firebaseConfig'); // Importa la instancia de Firestore

exports.getAllAssignments = async (req, res) => {
    try {
        const asignaturasRef = db.collection('asignaturas'); // Accede a la colección 'asignaturas'
        const snapshot = await asignaturasRef.get(); // Obtiene todos los documentos
        const asignaturas = [];
        snapshot.forEach(doc => {
            // Asegúrate de que los IDs de los documentos sean incluidos en la respuesta
            asignaturas.push({ id: doc.id, ...doc.data() }); 
        });
        res.status(200).json(asignaturas);
    } catch (error) {
        console.error("Error al obtener todas las asignaturas:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

exports.createAssignment = async (req, res) => {
    try {
        const { codigo, nombre, semestre, creditos, departamentoId } = req.body;

        // Validación de entrada
        if (!codigo || !nombre || semestre === undefined || creditos === undefined || !departamentoId) {
            return res.status(400).json({ message: 'Todos los campos (codigo, nombre, semestre, creditos, departamentoId) son obligatorios.' });
        }

        // Convertir semestre y creditos a números, ya que en tu Firestore los tienes como string en la imagen,
        // pero idealmente deberían ser números para operaciones o lógica numérica.
        const semestreNum = parseInt(semestre);
        const creditosNum = parseInt(creditos);

        if (isNaN(semestreNum) || isNaN(creditosNum)) {
            return res.status(400).json({ message: 'Semestre y creditos deben ser números válidos.' });
        }

        // Verificar si la asignatura ya existe por su código (ID de documento)
        const existingAssignment = await db.collection('asignaturas').doc(codigo).get();
        if (existingAssignment.exists) {
            return res.status(409).json({ message: `La asignatura con código ${codigo} ya existe.` });
        }

        // Crear un documento en la colección 'asignaturas' usando 'codigo' como ID
        const asignaturaRef = db.collection('asignaturas').doc(codigo);
        await asignaturaRef.set({ 
            nombre: nombre,
            semestre: semestreNum, 
            creditos: creditosNum, 
            departamentoId: departamentoId
        });

        res.status(201).json({ message: 'Asignatura creada exitosamente', asignatura: { id: codigo, ...req.body, semestre: semestreNum, creditos: creditosNum } });

    } catch (error) {
        console.error("Error al crear asignatura:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

exports.updateAssignmentById = async (req, res) => {
    const { id } = req.params; // 'id' es el código de la asignatura (ej. PROG004)
    const dataToUpdate = req.body;

    try {
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: 'No hay datos para actualizar.' });
        }

        // Opcional: Convertir 'semestre' y 'creditos' a números si vienen en la solicitud
        if (dataToUpdate.semestre !== undefined) {
            const semestreNum = parseInt(dataToUpdate.semestre);
            if (isNaN(semestreNum)) return res.status(400).json({ message: 'Semestre debe ser un número válido.' });
            dataToUpdate.semestre = semestreNum;
        }
        if (dataToUpdate.creditos !== undefined) {
            const creditosNum = parseInt(dataToUpdate.creditos);
            if (isNaN(creditosNum)) return res.status(400).json({ message: 'Creditos deben ser un número válido.' });
            dataToUpdate.creditos = creditosNum;
        }

        const asignaturaRef = db.collection('asignaturas').doc(id);
        const doc = await asignaturaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Asignatura no encontrada.' });
        }

        await asignaturaRef.update(dataToUpdate); // 'update' actualiza campos existentes, no sobrescribe todo el documento
        res.status(200).json({ message: `Asignatura con ID ${id} actualizada exitosamente` });
    } catch (error) {
        console.error(`Error al actualizar asignatura con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

exports.deleteAssignmentById = async (req, res) => {
    const { id } = req.params; // 'id' es el código de la asignatura (ej. PROG004)
    try {
        const asignaturaRef = db.collection('asignaturas').doc(id);
        const doc = await asignaturaRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Asignatura no encontrada.' });
        }

        await asignaturaRef.delete();
        res.status(200).json({ message: `Asignatura con ID ${id} eliminada exitosamente` });
    } catch (error) {
        console.error(`Error al eliminar asignatura con ID ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// --- Funciones para Inscripciones de Asignaturas ---
// Colección: 'inscripcionesAsignaturas'
// Document ID: Generado automáticamente por Firestore (ej. xjQ2Knf2jaGKeJTqubD)

exports.getAllRegisteredStudents = async (req, res) => {
    try {
        const inscripcionesRef = db.collection('inscripcionesAsignaturas');
        const snapshot = await inscripcionesRef.get();
        const inscripciones = [];
        snapshot.forEach(doc => {
            inscripciones.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(inscripciones);
    } catch (error) {
        console.error("Error al obtener todas las inscripciones de estudiantes:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

exports.registerStudent = async (req, res) => {
    try {
        // Campos que esperaríamos en el body de la solicitud basados en tu Firestore:
        const { 
            asignaturaId, estudianteId, grupo, semestreInscripcion, 
            apellidosEstudiante, correoEstudiante, nombreAsignatura, nombresEstudiante 
        } = req.body;
        
        // Validación básica
        if (!asignaturaId || !estudianteId || !grupo || semestreInscripcion === undefined || 
            !apellidosEstudiante || !correoEstudiante || !nombreAsignatura || !nombresEstudiante) {
            return res.status(400).json({ message: 'Faltan campos obligatorios para registrar al estudiante en la asignatura.' });
        }

        const semestreInscripcionNum = parseInt(semestreInscripcion);
        if (isNaN(semestreInscripcionNum)) {
             return res.status(400).json({ message: 'Semestre de inscripción debe ser un número válido.' });
        }

        // Opcional: Verificar si el estudiante y la asignatura existen en sus respectivas colecciones
        // Esto sería una buena práctica para asegurar la integridad referencial.
        // const asignaturaDoc = await db.collection('asignaturas').doc(asignaturaId).get();
        // if (!asignaturaDoc.exists) {
        //     return res.status(404).json({ message: `Asignatura con ID ${asignaturaId} no encontrada.` });
        // }
        // const estudianteDoc = await db.collection('estudiantes').doc(estudianteId).get();
        // if (!estudianteDoc.exists) {
        //     return res.status(404).json({ message: `Estudiante con ID ${estudianteId} no encontrado.` });
        // }

        // Crear una nueva inscripción, Firestore generará automáticamente el ID del documento
        const nuevaInscripcionRef = await db.collection('inscripcionesAsignaturas').add({
            asignaturaId,
            estudianteId,
            grupo,
            semestreInscripcion: semestreInscripcionNum,
            apellidosEstudiante,
            correoEstudiante,
            nombreAsignatura,
            nombresEstudiante,
            fechaInscripcion: new Date() // Opcional: Añadir un timestamp de la inscripción
        });

        res.status(201).json({ 
            message: 'Estudiante registrado en asignatura exitosamente', 
            inscripcion: { id: nuevaInscripcionRef.id, ...req.body, semestreInscripcion: semestreInscripcionNum } 
        });

    } catch (error) {
        console.error("Error al registrar estudiante en asignatura:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

exports.updateRegisteredStudentInAssignment = async (req, res) => {
    const { registrationId } = req.params; // ID del documento de inscripción (generado por Firestore)
    const dataToUpdate = req.body;

    try {
        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({ message: 'No hay datos para actualizar la inscripción.' });
        }

        // Opcional: Convertir 'semestreInscripcion' a número si viene en la solicitud
        if (dataToUpdate.semestreInscripcion !== undefined) {
            const semestreInscripcionNum = parseInt(dataToUpdate.semestreInscripcion);
            if (isNaN(semestreInscripcionNum)) return res.status(400).json({ message: 'Semestre de inscripción debe ser un número válido.' });
            dataToUpdate.semestreInscripcion = semestreInscripcionNum;
        }

        const inscripcionRef = db.collection('inscripcionesAsignaturas').doc(registrationId);
        const doc = await inscripcionRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Inscripción no encontrada.' });
        }

        await inscripcionRef.update(dataToUpdate);
        res.status(200).json({ message: `Inscripción con ID ${registrationId} actualizada exitosamente` });
    } catch (error) {
        console.error(`Error al actualizar inscripción con ID ${registrationId}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

exports.unregisterStudentFromAssignment = async (req, res) => {
    const { registrationId } = req.params; // ID del documento de inscripción
    try {
        const inscripcionRef = db.collection('inscripcionesAsignaturas').doc(registrationId);
        const doc = await inscripcionRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Inscripción no encontrada.' });
        }

        await inscripcionRef.delete();
        res.status(200).json({ message: `Estudiante desregistrado de la asignatura (inscripción con ID ${registrationId} eliminada) exitosamente` });
    } catch (error) {
        console.error(`Error al desregistrar estudiante de la asignatura con ID ${registrationId}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};