// Backend/Controllers/Estudiantescontroller.js

const db = require('../config/firebaseConfig'); // Importa la instancia de Firestore

/**
 * @desc Obtener todos los estudiantes
 * @route GET /api/estudiantes
 * @access Public
 */
exports.obtenerEstudiantes = async (req, res) => { // Renamed from getAllStudents
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

/**
 * @desc Obtener un estudiante por ID
 * @route GET /api/estudiantes/:id
 * @access Public
 */
exports.obtenerEstudiantePorId = async (req, res) => { // Renamed from getStudentById (if it existed)
    const { id } = req.params; // 'id' es el numeroDocumento
    try {
        const estudianteRef = db.collection('estudiantes').doc(id);
        const doc = await estudianteRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        console.error(`Error al obtener estudiante con número de documento ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/**
 * @desc Crear un nuevo estudiante
 * @route POST /api/estudiantes
 * @access Public (o restringido si hay autenticación)
 */
exports.crearEstudiante = async (req, res) => { // Renamed from createStudent
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

/**
 * @desc Actualizar un estudiante por ID
 * @route PUT /api/estudiantes/:id
 * @access Public (o restringido si hay autenticación)
 */
exports.actualizarEstudiante = async (req, res) => { // Renamed from updateStudentById
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

/**
 * @desc Eliminar un estudiante por ID
 * @route DELETE /api/estudiantes/:id
 * @access Public (o restringido si hay autenticación)
 */
exports.eliminarEstudiante = async (req, res) => { // Renamed from deleteStudentById
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

/**
 * @desc Obtener lista de facultades para filtro
 * @route GET /api/estudiantes/filtros/facultades
 * @access Public
 */
exports.obtenerFacultadesParaFiltro = async (req, res) => {
    try {
        // Implementa la lógica para obtener una lista única de facultades
        // Puedes hacer esto leyendo todos los estudiantes y extrayendo las facultades
        // O si tienes una colección separada de facultades, consultarla.
        // Ejemplo (menos eficiente para grandes volúmenes, pero funcional):
        const estudiantesRef = db.collection('estudiantes');
        const snapshot = await estudiantesRef.get();
        const facultades = new Set();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.facultad) {
                facultades.add(data.facultad);
            }
        });
        res.status(200).json(Array.from(facultades));
    } catch (error) {
        console.error("Error al obtener facultades para filtro:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/**
 * @desc Obtener lista de tipos de documento para filtro
 * @route GET /api/estudiantes/filtros/tipos-documento
 * @access Public
 */
exports.obtenerTiposDocumentoParaFiltro = async (req, res) => {
    try {
        // Implementa la lógica para obtener una lista única de tipos de documento
        const estudiantesRef = db.collection('estudiantes');
        const snapshot = await estudiantesRef.get();
        const tiposDocumento = new Set();
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.tipoDocumento) {
                tiposDocumento.add(data.tipoDocumento);
            }
        });
        res.status(200).json(Array.from(tiposDocumento));
    } catch (error) {
        console.error("Error al obtener tipos de documento para filtro:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

/**
 * @desc Buscar estudiantes por filtros (nombre, facultad, tipo de documento)
 * @route POST /api/estudiantes/buscar
 * @access Public
 */
exports.buscarEstudiantes = async (req, res) => {
    try {
        const { nombres, facultad, tipoDocumento } = req.body;
        let query = db.collection('estudiantes');

        if (nombres) {
            // Para búsqueda por nombre, necesitarías hacer un query que sea compatible con Firestore
            // Una búsqueda "contiene" en Firestore es compleja y a menudo requiere una librería de terceros
            // o buscar por prefijo. Para una búsqueda básica de igualdad:
            // query = query.where('nombres', '==', nombres);
            // Si quieres búsqueda por parte de nombre, necesitarás ajustar tu base de datos o lógica.
            // Para una búsqueda flexible, podrías obtener todos los resultados y filtrarlos en el servidor,
            // pero esto es ineficiente para grandes volúmenes de datos.
            // Por ahora, asumiré una búsqueda exacta si se usa 'where'.
            // Para "contiene", podrías necesitar un índice o una solución de terceros como Algolia.
            console.warn("La búsqueda por 'nombres' en Firestore es limitada. Se recomienda usar una búsqueda de prefijo exacto o integrar una solución de búsqueda externa.");
            query = query.where('nombres', '>=', nombres).where('nombres', '<=', nombres + '\uf8ff');
        }
        if (facultad) {
            query = query.where('facultad', '==', facultad);
        }
        if (tipoDocumento) {
            query = query.where('tipoDocumento', '==', tipoDocumento);
        }

        const snapshot = await query.get();
        const estudiantes = [];
        snapshot.forEach(doc => {
            estudiantes.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(estudiantes);

    } catch (error) {
        console.error("Error al buscar estudiantes:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};