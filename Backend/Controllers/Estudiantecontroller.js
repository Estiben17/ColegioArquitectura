// Backend/controllers/estudiantesController.js
const db = require('../config/firebaseConfig'); // Path from controllers to config

/**
 * @desc Obtener todos los estudiantes
 * @route GET /api/estudiante
 * @access Public
 */
exports.obtenerEstudiantes = async (req, res) => {
    console.log("[Controller] Petición para obtener todos los estudiantes.");
    try {
        const estudiantesRef = db.collection('estudiantes');
        const snapshot = await estudiantesRef.get();
        const estudiantes = [];

        if (snapshot.empty) {
            console.log("[Controller] No se encontraron estudiantes en la colección.");
            return res.status(200).json([]); // Return empty array if no students
        }

        snapshot.forEach(doc => {
            estudiantes.push({ id: doc.id, ...doc.data() });
        });
        console.log(`[Controller] ${estudiantes.length} estudiantes obtenidos exitosamente.`);
        res.status(200).json(estudiantes);
    } catch (error) {
        console.error("❌ Error al obtener todos los estudiantes:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener estudiantes', error: error.message });
    }
};

/**
 * @desc Obtener un estudiante por ID
 * @route GET /api/estudiante/:id
 * @access Public
 */
exports.obtenerEstudiantePorId = async (req, res) => {
    const { id } = req.params; // 'id' es el numeroDocumento (Firestore Document ID)
    console.log(`[Controller] Petición para obtener estudiante con ID: ${id}`);
    try {
        const estudianteRef = db.collection('estudiantes').doc(id);
        const doc = await estudianteRef.get();

        console.log(`[Controller] Resultado para ID ${id}: doc.exists = ${doc.exists}`);

        if (!doc.exists) {
            return res.status(404).json({ message: `Estudiante con ID ${id} no encontrado.` });
        }

        console.log(`[Controller] Estudiante ${id} encontrado.`);
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error(`❌ Error al obtener estudiante con número de documento ${id}:`, error);
        res.status(500).json({ message: `Error interno del servidor al obtener estudiante con ID ${id}`, error: error.message });
    }
};

/**
 * @desc Crear un nuevo estudiante
 * @route POST /api/estudiante
 * @access Public
 */
exports.crearEstudiante = async (req, res) => {
    console.log("[Controller] Petición para crear un nuevo estudiante. Body:", req.body);
    // Destructure ALL expected fields from frontend, providing defaults for optional fields
    const {
        documentNumber, firstName, secondName, firstSurname, secondSurname,
        documentType, faculty, program, birthDate, gender, semester, average,
        email, phone, address, status // Assuming these are sent from frontend
    } = req.body;

    // Basic validation for required fields
    if (!documentNumber || !firstName || !firstSurname || !documentType || !faculty) {
        console.warn("[Controller] Campos obligatorios faltantes para crear estudiante.");
        return res.status(400).json({ message: 'Error: Campos obligatorios incompletos (Número de Documento, Primer Nombre, Primer Apellido, Tipo de Documento, Facultad son requeridos).' });
    }

    try {
        const estudianteDocRef = db.collection('estudiantes').doc(documentNumber); // Use documentNumber as Firestore Document ID
        const existingStudent = await estudianteDocRef.get();

        if (existingStudent.exists) {
            console.warn(`[Controller] Intento de crear estudiante con número de documento ${documentNumber} que ya existe.`);
            return res.status(409).json({ message: `El estudiante con número de documento ${documentNumber} ya existe.` });
        }

        // Prepare the student data object for Firestore
        const studentData = {
            firstName: firstName,
            secondName: secondName || null, // Store as null if not provided
            firstSurname: firstSurname,
            secondSurname: secondSurname || null,
            documentType: documentType,
            faculty: faculty,
            program: program || null,
            birthDate: birthDate || null,
            gender: gender || null,
            semester: semester ? parseInt(semester) : null, // Convert to number
            average: average ? parseFloat(average) : null, // Convert to number
            email: email || null,
            phone: phone || null,
            address: address || null,
            status: status || 'Activo', // Default status if not provided
            createdAt: new Date().toISOString(), // Add creation timestamp
            updatedAt: new Date().toISOString() // Add update timestamp
        };

        await estudianteDocRef.set(studentData);
        console.log(`[Controller] Estudiante con ID ${documentNumber} creado exitosamente.`);
        res.status(201).json({ message: 'Estudiante creado exitosamente', estudiante: { id: documentNumber, ...studentData } });

    } catch (error) {
        console.error("❌ Error al crear estudiante:", error);
        res.status(500).json({ message: 'Error interno del servidor al crear estudiante', error: error.message });
    }
};

/**
 * @desc Actualizar un estudiante por ID
 * @route PUT /api/estudiante/:id
 * @access Public
 */
exports.actualizarEstudiante = async (req, res) => {
    const { id } = req.params; // 'id' es el numeroDocumento
    const dataToUpdate = req.body;
    console.log(`[Controller] Petición para actualizar estudiante ID: ${id}. Datos:`, dataToUpdate);

    try {
        if (Object.keys(dataToUpdate).length === 0) {
            console.warn(`[Controller] No hay datos para actualizar para el estudiante ID: ${id}.`);
            return res.status(400).json({ message: 'No hay datos proporcionados para actualizar.' });
        }

        const estudianteRef = db.collection('estudiantes').doc(id);
        const doc = await estudianteRef.get();
        if (!doc.exists) {
            console.warn(`[Controller] Intento de actualizar estudiante con ID ${id} que no existe.`);
            return res.status(404).json({ message: 'Estudiante no encontrado para actualizar.' });
        }

        // Add updatedAt timestamp to the data being updated
        const updatePayload = { ...dataToUpdate, updatedAt: new Date().toISOString() };

        // Convert semester and average to numbers if they exist in dataToUpdate
        if (updatePayload.semester) {
            updatePayload.semester = parseInt(updatePayload.semester);
        }
        if (updatePayload.average) {
            updatePayload.average = parseFloat(updatePayload.average);
        }

        await estudianteRef.update(updatePayload);
        console.log(`[Controller] Estudiante con ID ${id} actualizado exitosamente.`);
        res.status(200).json({ message: `Estudiante con número de documento ${id} actualizado exitosamente` });
    } catch (error) {
        console.error(`❌ Error al actualizar estudiante con número de documento ${id}:`, error);
        res.status(500).json({ message: `Error interno del servidor al actualizar estudiante con ID ${id}`, error: error.message });
    }
};

/**
 * @desc Eliminar un estudiante por ID
 * @route DELETE /api/estudiante/:id
 * @access Public
 */
exports.eliminarEstudiante = async (req, res) => {
    const { id } = req.params; // 'id' es el numeroDocumento
    console.log(`[Controller] Petición para eliminar estudiante con ID: ${id}`);
    try {
        const estudianteRef = db.collection('estudiantes').doc(id);
        const doc = await estudianteRef.get();
        if (!doc.exists) {
            console.warn(`[Controller] Intento de eliminar estudiante con ID ${id} que no existe.`);
            return res.status(404).json({ message: 'Estudiante no encontrado para eliminar.' });
        }

        await estudianteRef.delete();
        console.log(`[Controller] Estudiante con ID ${id} eliminado exitosamente.`);
        res.status(200).json({ message: `Estudiante con número de documento ${id} eliminado exitosamente` });
    } catch (error) {
        console.error(`❌ Error al eliminar estudiante con número de documento ${id}:`, error);
        res.status(500).json({ message: `Error interno del servidor al eliminar estudiante con ID ${id}`, error: error.message });
    }
};

/**
 * @desc Obtener lista de facultades para filtro
 * @route GET /api/estudiante/filtros/facultades
 * @access Public
 */
exports.obtenerFacultadesParaFiltro = async (req, res) => {
    console.log("[Controller] Petición para obtener lista de facultades para filtro.");
    try {
        const estudiantesRef = db.collection('estudiantes');
        const snapshot = await estudiantesRef.get();
        const facultades = new Set();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.faculty) { // Use 'faculty' as per frontend
                facultades.add(data.faculty);
            }
        });
        const result = Array.from(facultades).sort(); // Sort for consistent order
        console.log(`[Controller] Facultades únicas encontradas:`, result);
        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Error al obtener facultades para filtro:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener facultades', error: error.message });
    }
};

/**
 * @desc Obtener lista de tipos de documento para filtro
 * @route GET /api/estudiante/filtros/tipos-documento
 * @access Public
 */
exports.obtenerTiposDocumentoParaFiltro = async (req, res) => {
    console.log("[Controller] Petición para obtener lista de tipos de documento para filtro.");
    try {
        const estudiantesRef = db.collection('estudiantes');
        const snapshot = await estudiantesRef.get();
        const tiposDocumento = new Set();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.documentType) { // Use 'documentType' as per frontend
                tiposDocumento.add(data.documentType);
            }
        });
        const result = Array.from(tiposDocumento).sort(); // Sort for consistent order
        console.log(`[Controller] Tipos de documento únicos encontrados:`, result);
        res.status(200).json(result);
    } catch (error) {
        console.error("❌ Error al obtener tipos de documento para filtro:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener tipos de documento', error: error.message });
    }
};

/**
 * @desc Buscar estudiantes por filtros (nombres, apellidos, facultad, tipo de documento)
 * @route POST /api/estudiante/buscar
 * @access Public
 */
exports.buscarEstudiantes = async (req, res) => {
    const { firstName, firstSurname, faculty, documentType } = req.body; // Use frontend field names
    console.log(`[Controller] Petición de búsqueda de estudiantes. Filtros:`, { firstName, firstSurname, faculty, documentType });

    try {
        let query = db.collection('estudiantes');

        // Note: Firestore does not support 'contains' queries for strings or OR conditions across different fields directly.
        // For full-text search, consider external services like Algolia.
        // These queries are for exact matches or prefix matches.

        if (firstName) {
            // Prefix search for firstName
            query = query.where('firstName', '>=', firstName).where('firstName', '<=', firstName + '\uf8ff');
            console.log(`[Controller] Añadiendo filtro de primer nombre (prefijo): ${firstName}`);
        }
        if (firstSurname) {
            // Prefix search for firstSurname
            query = query.where('firstSurname', '>=', firstSurname).where('firstSurname', '<=', firstSurname + '\uf8ff');
            console.log(`[Controller] Añadiendo filtro de primer apellido (prefijo): ${firstSurname}`);
        }
        if (faculty) {
            query = query.where('faculty', '==', faculty);
            console.log(`[Controller] Añadiendo filtro de facultad: ${faculty}`);
        }
        if (documentType) {
            query = query.where('documentType', '==', documentType);
            console.log(`[Controller] Añadiendo filtro de tipo de documento: ${documentType}`);
        }

        const snapshot = await query.get();
        const estudiantes = [];

        if (snapshot.empty) {
            console.log("[Controller] No se encontraron estudiantes con los filtros especificados.");
            return res.status(200).json([]);
        }

        snapshot.forEach(doc => {
            estudiantes.push({ id: doc.id, ...doc.data() });
        });
        console.log(`[Controller] ${estudiantes.length} estudiantes encontrados con los filtros.`);
        res.status(200).json(estudiantes);

    } catch (error) {
        console.error("❌ Error al buscar estudiantes:", error);
        res.status(500).json({ message: 'Error interno del servidor al buscar estudiantes', error: error.message });
    }
};