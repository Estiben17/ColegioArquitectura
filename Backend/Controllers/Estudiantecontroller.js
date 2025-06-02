// Backend/controllers/estudiantesController.js
// IMPORTANT: Adjust this path if your firebaseConfig.js is not here.
// It should be relative to this 'estudiantesController.js' file.
const db = require('../config/firebaseConfig'); // Path from controllers to config

/**
 * @desc Obtener todos los estudiantes
 * @route GET /api/estudiantes
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
 * @route GET /api/estudiantes/:id
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

        console.log(`[Controller] Estudiante ${id} encontrado. Datos:`, doc.data());
        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error(`❌ Error al obtener estudiante con número de documento ${id}:`, error);
        res.status(500).json({ message: `Error interno del servidor al obtener estudiante con ID ${id}`, error: error.message });
    }
};

/**
 * @desc Crear un nuevo estudiante
 * @route POST /api/estudiantes
 * @access Public
 */
exports.crearEstudiante = async (req, res) => {
    console.log("[Controller] Petición para crear un nuevo estudiante. Body:", req.body);
    try {
        const { numeroDocumento, nombres, apellidos, correoElectronico, tipoDocumento, departamentoId, facultad } = req.body;

        if (!numeroDocumento || !nombres || !apellidos || !correoElectronico || !tipoDocumento || !departamentoId || !facultad) {
            console.warn("[Controller] Campos obligatorios faltantes para crear estudiante.");
            return res.status(400).json({ message: 'Todos los campos son obligatorios para crear un estudiante.' });
        }

        const estudianteDocRef = db.collection('estudiantes').doc(numeroDocumento);
        const existingStudent = await estudianteDocRef.get();

        if (existingStudent.exists) {
            console.warn(`[Controller] Intento de crear estudiante con ID ${numeroDocumento} que ya existe.`);
            return res.status(409).json({ message: `El estudiante con número de documento ${numeroDocumento} ya existe.` });
        }

        await estudianteDocRef.set({
            nombres, // Shorthand for nombres: nombres
            apellidos,
            correoElectronico,
            tipoDocumento,
            departamentoId,
            facultad
        });
        console.log(`[Controller] Estudiante con ID ${numeroDocumento} creado exitosamente.`);
        res.status(201).json({ message: 'Estudiante creado exitosamente', estudiante: { id: numeroDocumento, ...req.body } });

    } catch (error) {
        console.error("❌ Error al crear estudiante:", error);
        res.status(500).json({ message: 'Error interno del servidor al crear estudiante', error: error.message });
    }
};

/**
 * @desc Actualizar un estudiante por ID
 * @route PUT /api/estudiantes/:id
 * @access Public
 */
exports.actualizarEstudiante = async (req, res) => {
    const { id } = req.params;
    const dataToUpdate = req.body;
    console.log(`[Controller] Petición para actualizar estudiante ID: ${id}. Datos:`, dataToUpdate);

    try {
        if (Object.keys(dataToUpdate).length === 0) {
            console.warn(`[Controller] No hay datos para actualizar para el estudiante ID: ${id}.`);
            return res.status(400).json({ message: 'No hay datos para actualizar.' });
        }

        const estudianteRef = db.collection('estudiantes').doc(id);
        const doc = await estudianteRef.get();
        if (!doc.exists) {
            console.warn(`[Controller] Intento de actualizar estudiante con ID ${id} que no existe.`);
            return res.status(404).json({ message: 'Estudiante no encontrado para actualizar.' });
        }

        await estudianteRef.update(dataToUpdate);
        console.log(`[Controller] Estudiante con ID ${id} actualizado exitosamente.`);
        res.status(200).json({ message: `Estudiante con número de documento ${id} actualizado exitosamente` });
    } catch (error) {
        console.error(`❌ Error al actualizar estudiante con número de documento ${id}:`, error);
        res.status(500).json({ message: `Error interno del servidor al actualizar estudiante con ID ${id}`, error: error.message });
    }
};

/**
 * @desc Eliminar un estudiante por ID
 * @route DELETE /api/estudiantes/:id
 * @access Public
 */
exports.eliminarEstudiante = async (req, res) => {
    const { id } = req.params;
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
 * @route GET /api/estudiantes/filtros/facultades
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
            if (data.facultad) {
                facultades.add(data.facultad);
            }
        });
        console.log(`[Controller] Facultades únicas encontradas:`, Array.from(facultades));
        res.status(200).json(Array.from(facultades));
    } catch (error) {
        console.error("❌ Error al obtener facultades para filtro:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener facultades', error: error.message });
    }
};

/**
 * @desc Obtener lista de tipos de documento para filtro
 * @route GET /api/estudiantes/filtros/tipos-documento
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
            if (data.tipoDocumento) {
                tiposDocumento.add(data.tipoDocumento);
            }
        });
        console.log(`[Controller] Tipos de documento únicos encontrados:`, Array.from(tiposDocumento));
        res.status(200).json(Array.from(tiposDocumento));
    } catch (error) {
        console.error("❌ Error al obtener tipos de documento para filtro:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener tipos de documento', error: error.message });
    }
};

/**
 * @desc Buscar estudiantes por filtros (nombre, facultad, tipo de documento)
 * @route POST /api/estudiantes/buscar
 * @access Public
 */
exports.buscarEstudiantes = async (req, res) => {
    const { nombres, facultad, tipoDocumento } = req.body;
    console.log(`[Controller] Petición de búsqueda de estudiantes. Filtros:`, { nombres, facultad, tipoDocumento });

    try {
        let query = db.collection('estudiantes');

        if (nombres) {
            // Firestore does not support 'contains' queries for strings.
            // This range query allows for prefix matching (e.g., 'Juan' matches 'Juan Perez').
            // For true 'contains' (substring) search, consider a third-party service like Algolia.
            query = query.where('nombres', '>=', nombres).where('nombres', '<=', nombres + '\uf8ff');
            console.log(`[Controller] Añadiendo filtro de nombres (prefijo): ${nombres}`);
        }
        if (facultad) {
            query = query.where('facultad', '==', facultad);
            console.log(`[Controller] Añadiendo filtro de facultad: ${facultad}`);
        }
        if (tipoDocumento) {
            query = query.where('tipoDocumento', '==', tipoDocumento);
            console.log(`[Controller] Añadiendo filtro de tipoDocumento: ${tipoDocumento}`);
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