// Frontend/js/Asignatura.js
// Este script maneja la lógica de la interfaz de usuario para la página de Asignaturas
// y se comunica con las Netlify Functions para la gestión de datos.

// --- Configuración de la API (URLs de tus Netlify Functions) ---
// Asegúrate de que estas URLs coincidan con tus redirecciones en netlify.toml
const API_BASE_URL = '/.netlify/functions/Asignatura'; // La URL base de tu función Asignatura.js

const ASSIGNMENTS_ENDPOINT = `${API_BASE_URL}/assignments`;
const REGISTER_STUDENT_ENDPOINT = `${API_BASE_URL}/register-student`;
const REGISTERED_STUDENTS_ENDPOINT = `${API_BASE_URL}/registered-students`; // Para obtener la lista de estudiantes registrados

// --- Referencias a elementos del DOM ---
let createSubjectForm;
let registerStudentForm;
let subjectsListBody;
let studentsListBody;
let registerSubjectSelect;
let subjectSearchInput;
let studentSearchInput;

// Arrays para almacenar datos en el frontend después de ser cargados desde la API
let subjectsData = [];
let studentsData = [];

// --- Funciones de Utilidad ---

/**
 * Función genérica para hacer peticiones fetch a la API.
 * @param {string} url La URL del endpoint.
 * @param {string} method El método HTTP (GET, POST, etc.).
 * @param {object} [bodyData=null] Los datos a enviar en el cuerpo de la petición (para POST/PUT).
 * @returns {Promise<object>} Una promesa que resuelve con la respuesta JSON de la API.
 */
async function apiFetch(url, method = 'GET', bodyData = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (bodyData) {
        options.body = JSON.stringify(bodyData);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
            // Si la respuesta no es OK (ej. 400, 500), lanzar un error con el mensaje del servidor
            throw new Error(data.message || 'Error en la petición API');
        }
        return data;
    } catch (error) {
        console.error(`Error en la petición ${method} a ${url}:`, error);
        alert(`Error: ${error.message || 'Ocurrió un error al comunicarse con el servidor.'}`);
        throw error; // Re-lanzar para que el código que llama pueda manejarlo
    }
}

// --- Funciones de Renderizado y Actualización de UI ---

/**
 * Carga las asignaturas desde la API y las renderiza en la tabla.
 */
async function loadAndRenderSubjects() {
    try {
        const data = await apiFetch(ASSIGNMENTS_ENDPOINT, 'GET');
        subjectsData = data; // Almacenar los datos en el array global
        renderSubjectsTable(subjectsData); // Renderizar con los datos obtenidos
        populateSubjectDropdown(subjectsData); // Actualizar el dropdown
    } catch (error) {
        console.error("No se pudieron cargar las asignaturas:", error);
    }
}

/**
 * Carga los estudiantes registrados desde la API y los renderiza en la tabla.
 */
async function loadAndRenderStudents() {
    try {
        const data = await apiFetch(REGISTERED_STUDENTS_ENDPOINT, 'GET');
        studentsData = data; // Almacenar los datos en el array global
        renderStudentsTable(studentsData); // Renderizar con los datos obtenidos
    } catch (error) {
        console.error("No se pudieron cargar los estudiantes registrados:", error);
    }
}

/**
 * Renders/updates the table of subjects.
 * @param {Array} subjectsToRender - El array de asignaturas a mostrar.
 */
function renderSubjectsTable(subjectsToRender) {
    if (!subjectsListBody) return; // Asegurarse de que el elemento existe

    subjectsListBody.innerHTML = ''; // Limpiar filas existentes
    subjectsToRender.forEach(subject => {
        const row = subjectsListBody.insertRow();
        // Usar subject.code para el ID si existe, o un ID único para la edición/eliminación
        row.dataset.id = subject.id;

        row.insertCell().textContent = subject.code;
        row.insertCell().textContent = subject.name;
        row.insertCell().textContent = subject.semester;
        row.insertCell().textContent = subject.credits;

        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.classList.add('btn', 'btn-edit');
        editButton.addEventListener('click', () => {
            alert(`Editar asignatura: ${subject.name} (ID: ${subject.id}) - Funcionalidad no implementada aún.`);
            // Aquí llamarías a una función para abrir un formulario de edición
            // o poblar el formulario de creación con los datos de la asignatura.
        });

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.classList.add('btn', 'btn-delete');
        deleteButton.addEventListener('click', async () => {
            if (confirm(`¿Estás seguro de que quieres eliminar la asignatura: ${subject.name}?`)) {
                try {
                    // Aquí harías una petición DELETE a tu API, por ejemplo:
                    // await apiFetch(`${ASSIGNMENTS_ENDPOINT}/${subject.id}`, 'DELETE');
                    // alert('Asignatura eliminada correctamente!');
                    // loadAndRenderSubjects(); // Recargar datos después de la eliminación

                    // NOTA: La función Netlify no tiene un endpoint DELETE implementado aún
                    // Por ahora, solo simula la eliminación en el frontend
                    subjectsData = subjectsData.filter(s => s.id !== subject.id);
                    renderSubjectsTable(subjectsData);
                    populateSubjectDropdown(subjectsData);
                    alert('Asignatura eliminada (simulado).');

                } catch (error) {
                    console.error("Error al eliminar asignatura:", error);
                }
            }
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
    });
}

/**
 * Renders/updates the table of registered students.
 * @param {Array} studentsToRender - El array de estudiantes a mostrar.
 */
function renderStudentsTable(studentsToRender) {
    if (!studentsListBody) return; // Asegurarse de que el elemento existe

    studentsListBody.innerHTML = ''; // Limpiar filas existentes
    studentsToRender.forEach(student => {
        const row = studentsListBody.insertRow();
        row.dataset.id = student.id;

        // Aquí se asume que 'student' tiene las propiedades de la API
        // subjectName se obtiene buscando la asignatura por ID, o si la API devuelve el nombre directamente
        const correspondingSubject = subjectsData.find(s => s.id === student.subjectId);
        const subjectName = correspondingSubject ? correspondingSubject.name : 'N/A';

        row.insertCell().textContent = subjectName; // Ahora muestra el nombre de la asignatura
        row.insertCell().textContent = student.group;
        row.insertCell().textContent = student.semester;
        row.insertCell().textContent = student.dni;
        row.insertCell().textContent = student.name;
        row.insertCell().textContent = student.lastname;
        row.insertCell().textContent = student.email;

        const actionsCell = row.insertCell();
        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.classList.add('btn', 'btn-edit');
        editButton.addEventListener('click', () => {
            alert(`Editar estudiante: ${student.name} ${student.lastname} (ID: ${student.id}) - Funcionalidad no implementada aún.`);
        });

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.classList.add('btn', 'btn-delete');
        deleteButton.addEventListener('click', async () => {
            if (confirm(`¿Estás seguro de que quieres eliminar a ${student.name} ${student.lastname}?`)) {
                try {
                    // Aquí harías una petición DELETE a tu API para estudiantes
                    // await apiFetch(`${REGISTER_STUDENT_ENDPOINT}/${student.id}`, 'DELETE');
                    // alert('Estudiante eliminado correctamente!');
                    // loadAndRenderStudents(); // Recargar datos después de la eliminación

                    // NOTA: La función Netlify no tiene un endpoint DELETE implementado aún
                    // Por ahora, solo simula la eliminación en el frontend
                    studentsData = studentsData.filter(s => s.id !== student.id);
                    renderStudentsTable(studentsData);
                    alert('Estudiante eliminado (simulado).');

                } catch (error) {
                    console.error("Error al eliminar estudiante:", error);
                }
            }
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);
    });
}

/**
 * Populates the subject dropdown in the student registration form with data from the API.
 * @param {Array} subjects - El array de asignaturas para poblar el dropdown.
 */
function populateSubjectDropdown(subjects) {
    if (!registerSubjectSelect) return;

    registerSubjectSelect.innerHTML = '<option value="">Seleccione una asignatura</option>'; // Clear and add default
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id; // ¡Ahora usa el ID de la asignatura!
        option.textContent = `${subject.name} (${subject.code})`;
        registerSubjectSelect.appendChild(option);
    });
}

// --- Event Listeners y Lógica Principal ---

document.addEventListener('DOMContentLoaded', () => {
    // Asignar referencias a los elementos DOM después de que el DOM esté cargado
    createSubjectForm = document.getElementById('create-subject-form');
    registerStudentForm = document.getElementById('register-student-form');
    subjectsListBody = document.getElementById('subjects-list');
    studentsListBody = document.getElementById('students-list');
    registerSubjectSelect = document.getElementById('register-subject');
    subjectSearchInput = document.getElementById('subject-search');
    studentSearchInput = document.getElementById('student-search');

    // --- Funcionalidad de Pestañas (Tabs) ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;

            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            document.getElementById(tabId).classList.add('active');
            button.classList.add('active');
        });
    });

    // --- Event Listener para Crear Nueva Asignatura ---
    if (createSubjectForm) {
        createSubjectForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevenir el envío predeterminado del formulario

            const subjectCode = document.getElementById('subject-code').value.trim();
            const subjectName = document.getElementById('subject-name').value.trim();
            const subjectSemester = document.getElementById('subject-semester').value;
            const subjectCredits = document.getElementById('subject-credits').value;

            if (subjectCode && subjectName && subjectSemester && subjectCredits) {
                const newSubjectData = {
                    code: subjectCode,
                    name: subjectName,
                    semester: subjectSemester,
                    credits: parseInt(subjectCredits)
                };

                try {
                    const response = await apiFetch(ASSIGNMENTS_ENDPOINT, 'POST', newSubjectData);
                    alert(response.message); // Mostrar mensaje de éxito desde la API
                    createSubjectForm.reset(); // Limpiar el formulario
                    await loadAndRenderSubjects(); // Recargar y renderizar las asignaturas
                } catch (error) {
                    console.error("Error al crear asignatura:", error);
                    // El error ya se maneja en apiFetch con un alert
                }
            } else {
                alert('Por favor, complete todos los campos para crear la asignatura.');
            }
        });
    }

    // --- Event Listener para Registrar Estudiante en Asignatura ---
    if (registerStudentForm) {
        registerStudentForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const subjectId = document.getElementById('register-subject').value; // Usar ID de la asignatura
            const group = document.getElementById('register-group').value.trim();
            const semester = document.getElementById('register-semester').value;
            const dni = document.getElementById('register-dni').value.trim();
            const name = document.getElementById('register-name').value.trim();
            const lastname = document.getElementById('register-lastname').value.trim();
            const email = document.getElementById('register-email').value.trim();

            if (subjectId && group && semester && dni && name && lastname && email) {
                const newStudentRegistration = {
                    subjectId: subjectId, // Enviar el ID de la asignatura
                    group: group,
                    semester: semester,
                    dni: dni,
                    name: name,
                    lastname: lastname,
                    email: email
                };

                try {
                    const response = await apiFetch(REGISTER_STUDENT_ENDPOINT, 'POST', newStudentRegistration);
                    alert(response.message); // Mostrar mensaje de éxito desde la API
                    registerStudentForm.reset(); // Limpiar el formulario
                    await loadAndRenderStudents(); // Recargar y renderizar los estudiantes
                } catch (error) {
                    console.error("Error al registrar estudiante:", error);
                    // El error ya se maneja en apiFetch con un alert
                }
            } else {
                alert('Por favor, complete todos los campos para registrar al estudiante.');
            }
        });
    }

    // --- Funcionalidad de Búsqueda ---
    // (Estos permanecen mayormente iguales, operando sobre los datos cargados)

    if (subjectSearchInput) {
        subjectSearchInput.addEventListener('keyup', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const filteredSubjects = subjectsData.filter(subject =>
                subject.name.toLowerCase().includes(searchTerm) ||
                subject.code.toLowerCase().includes(searchTerm)
            );
            renderSubjectsTable(filteredSubjects);
        });
    }

    if (studentSearchInput) {
        studentSearchInput.addEventListener('keyup', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const filteredStudents = studentsData.filter(student =>
                student.name.toLowerCase().includes(searchTerm) ||
                student.lastname.toLowerCase().includes(searchTerm) ||
                student.dni.toLowerCase().includes(searchTerm)
            );
            renderStudentsTable(filteredStudents);
        });
    }

    // --- Carga Inicial de Datos al Cargar la Página ---
    loadAndRenderSubjects();
    loadAndRenderStudents();
});
