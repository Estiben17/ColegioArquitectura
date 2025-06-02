// c:\Users\estib\Documents\ArquitecturaColegio\Backend\Controllers\Asignaturacontroller.js

// Funciones existentes (ya referenciadas en Asignaturaroutes.js)
exports.getAllAssignments = async (req, res) => {
    // TODO: Implementar lógica para obtener todas las asignaturas
    // Ejemplo: const asignaturas = await Asignatura.find();
    // res.json(asignaturas);
    res.status(501).json({ message: 'getAllAssignments no implementado' });
};

exports.createAssignment = async (req, res) => {
    // TODO: Implementar lógica para crear una nueva asignatura
    // Ejemplo: const nuevaAsignatura = new Asignatura(req.body);
    // await nuevaAsignatura.save();
    // res.status(201).json({ message: 'Asignatura creada', asignatura: nuevaAsignatura });
    res.status(501).json({ message: 'createAssignment no implementado' });
};

exports.getAllRegisteredStudents = async (req, res) => {
    // TODO: Implementar lógica para obtener todos los estudiantes registrados en asignaturas
    // Esto podría implicar joins o consultas a una tabla de inscripciones.
    // Ejemplo: const inscripciones = await Inscripcion.find().populate('estudiante').populate('asignatura');
    // res.json(inscripciones);
    res.status(501).json({ message: 'getAllRegisteredStudents no implementado' });
};

exports.registerStudent = async (req, res) => {
    // TODO: Implementar lógica para registrar un estudiante en una asignatura
    // Ejemplo: const { studentId, subjectId, group, semester, dni, name, lastname, email } = req.body;
    // const nuevaInscripcion = new Inscripcion({ estudiante: studentId, asignatura: subjectId, ... });
    // await nuevaInscripcion.save();
    // res.status(201).json({ message: 'Estudiante registrado en asignatura', inscripcion: nuevaInscripcion });
    res.status(501).json({ message: 'registerStudent no implementado' });
};

// --- NUEVAS FUNCIONES ---

// Para manejar la edición de una asignatura
exports.updateAssignmentById = async (req, res) => {
    const { id } = req.params;
    // TODO: Implementar lógica para actualizar una asignatura por su ID
    // Ejemplo: const asignaturaActualizada = await Asignatura.findByIdAndUpdate(id, req.body, { new: true });
    // if (!asignaturaActualizada) return res.status(404).json({ message: 'Asignatura no encontrada' });
    // res.json({ message: 'Asignatura actualizada', asignatura: asignaturaActualizada });
    res.status(501).json({ message: `updateAssignmentById para ID ${id} no implementado` });
};

// Para manejar la eliminación de una asignatura
exports.deleteAssignmentById = async (req, res) => {
    const { id } = req.params;
    // TODO: Implementar lógica para eliminar una asignatura por su ID
    // Ejemplo: const asignaturaEliminada = await Asignatura.findByIdAndDelete(id);
    // if (!asignaturaEliminada) return res.status(404).json({ message: 'Asignatura no encontrada' });
    // res.json({ message: 'Asignatura eliminada' });
    res.status(501).json({ message: `deleteAssignmentById para ID ${id} no implementado` });
};

// Para manejar la edición de la información de un estudiante registrado en una asignatura
// (Esto podría ser más complejo, dependiendo de si editas la inscripción o el estudiante en sí)
exports.updateRegisteredStudentInAssignment = async (req, res) => {
    const { registrationId } = req.params; // Asumiendo que la inscripción tiene un ID único
    // TODO: Implementar lógica para actualizar datos de una inscripción
    // Ejemplo: const inscripcionActualizada = await Inscripcion.findByIdAndUpdate(registrationId, req.body, { new: true });
    // if (!inscripcionActualizada) return res.status(404).json({ message: 'Inscripción no encontrada' });
    // res.json({ message: 'Inscripción actualizada', inscripcion: inscripcionActualizada });
    res.status(501).json({ message: `updateRegisteredStudentInAssignment para ID ${registrationId} no implementado` });
};

// Para manejar la eliminación (desregistro) de un estudiante de una asignatura
exports.unregisterStudentFromAssignment = async (req, res) => {
    const { registrationId } = req.params; // Asumiendo que la inscripción tiene un ID único
    // TODO: Implementar lógica para eliminar una inscripción
    // Ejemplo: const inscripcionEliminada = await Inscripcion.findByIdAndDelete(registrationId);
    // if (!inscripcionEliminada) return res.status(404).json({ message: 'Inscripción no encontrada' });
    // res.json({ message: 'Estudiante desregistrado de la asignatura' });
    res.status(501).json({ message: `unregisterStudentFromAssignment para ID ${registrationId} no implementado` });
};
