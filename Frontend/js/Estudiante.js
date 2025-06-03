// --- Firebase Initialization (Assumed separate module) ---
// You'll need to ensure your Firebase initialization is handled
// in a separate module (e.g., 'firebase-config.js') that correctly
// accesses your Netlify environment variables and exports the `db` instance.
// Then, you import it here.
import { db } from './firebase-config.js'; // Adjust path if necessary
import {
    collection,
    getDocs,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter
} from 'firebase/firestore';


// --- DOM Elements ---
const studentsTableBody = document.getElementById('students-table-body');
const addStudentBtn = document.getElementById('add-student-btn');
const studentModal = document.getElementById('student-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const modalTitle = document.getElementById('modal-title');
const studentForm = document.getElementById('student-form');

// Form fields
const firstNameInput = document.getElementById('first-name');
const secondNameInput = document.getElementById('second-name');
const firstSurnameInput = document.getElementById('first-surname');
const secondSurnameInput = document.getElementById('second-surname');
const documentTypeSelect = document.getElementById('document-type');
const documentNumberInput = document.getElementById('document-number');
const facultySelect = document.getElementById('faculty');
const programInput = document.getElementById('program');
const birthDateInput = document.getElementById('birth-date');
const genderSelect = document.getElementById('gender');
const semesterInput = document.getElementById('semester');
const averageInput = document.getElementById('average');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');
const statusSelect = document.getElementById('status');

// Filters and Search
const filterFacultySelect = document.getElementById('filter-faculty');
const filterDocumentTypeSelect = document.getElementById('filter-document-type');
const searchInput = document.getElementById('search');
const btnSearchStudentFilter = document.getElementById('btn-search-student-filter');
const noResultsDiv = document.getElementById('no-results');

// Pagination
const btnPrevPage = document.getElementById('btn-prev-page');
const btnNextPage = document.getElementById('btn-next-page');
const pageInfoSpan = document.getElementById('page-info');

// --- Global State Variables ---
let allStudents = []; // Stores all fetched students
let filteredStudents = []; // Stores currently filtered/searched students
let currentPage = 1;
const studentsPerPage = 10; // Number of students to show per page
let editingStudentId = null; // Stores the ID of the student being edited

// --- Utility Functions ---

/**
 * Populates a <select> element with options from an array of values.
 * @param {HTMLSelectElement} selectElement - The select element to populate.
 * @param {Array<string>} options - An array of string values for the options.
 * @param {string} defaultOptionText - Text for the default disabled/selected option.
 */
function populateSelect(selectElement, options, defaultOptionText) {
    selectElement.innerHTML = `<option value="" disabled selected>${defaultOptionText}</option>`;
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        selectElement.appendChild(opt);
    });
}

/**
 * Renders the students in the table.
 * @param {Array} studentsToRender - The array of student objects to display.
 */
function renderStudents(studentsToRender) {
    studentsTableBody.innerHTML = '';
    noResultsDiv.style.display = 'none';

    if (studentsToRender.length === 0) {
        noResultsDiv.style.display = 'block';
        return;
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const paginatedStudents = studentsToRender.slice(startIndex, endIndex);

    paginatedStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.firstName} ${student.secondName || ''} ${student.firstSurname} ${student.secondSurname || ''}</td>
            <td>${student.documentType}</td>
            <td>${student.documentNumber}</td>
            <td>${student.faculty}</td>
            <td>
                <button class="btn btn-sm btn-info view-student-btn" data-id="${student.id}" title="Ver Detalles"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-warning edit-student-btn" data-id="${student.id}" title="Editar Estudiante"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-student-btn" data-id="${student.id}" title="Eliminar Estudiante"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        studentsTableBody.appendChild(row);
    });

    updatePaginationControls(studentsToRender.length);
    attachStudentActionListeners();
}

/**
 * Attaches event listeners to dynamically created student action buttons.
 */
function attachStudentActionListeners() {
    document.querySelectorAll('.view-student-btn').forEach(button => {
        button.onclick = (e) => {
            const studentId = e.currentTarget.dataset.id;
            // For now, we'll just log it. You might want a dedicated view modal for students.
            const student = allStudents.find(s => s.id === studentId);
            if (student) {
                alert(`Detalles del Estudiante:\n\nNombre: ${student.firstName} ${student.firstSurname}\nDocumento: ${student.documentType} ${student.documentNumber}\nFacultad: ${student.faculty}\nPrograma: ${student.program}\nEmail: ${student.email}\nEstado: ${student.status}`);
            }
        };
    });

    document.querySelectorAll('.edit-student-btn').forEach(button => {
        button.onclick = (e) => {
            editingStudentId = e.currentTarget.dataset.id;
            loadStudentForEdit(editingStudentId);
            modalTitle.textContent = 'Editar Estudiante';
            studentModal.style.display = 'block';
        };
    });

    document.querySelectorAll('.delete-student-btn').forEach(button => {
        button.onclick = async (e) => {
            const studentId = e.currentTarget.dataset.id;
            if (confirm('¿Está seguro de que desea eliminar este estudiante?')) {
                await deleteStudent(studentId);
            }
        };
    });
}

/**
 * Updates pagination buttons and info.
 * @param {number} totalStudents - Total number of students in the filtered list.
 */
function updatePaginationControls(totalStudents) {
    const totalPages = Math.ceil(totalStudents / studentsPerPage);
    pageInfoSpan.textContent = `Página ${currentPage} de ${totalPages || 1}`;

    btnPrevPage.disabled = currentPage === 1;
    btnNextPage.disabled = currentPage === totalPages || totalPages === 0;
}

/**
 * Clears the student form fields.
 */
function clearStudentForm() {
    studentForm.reset();
    editingStudentId = null;
    modalTitle.textContent = 'Nuevo Estudiante';
    // Reset selects to their default "Seleccione" option
    documentTypeSelect.value = '';
    facultySelect.value = '';
    genderSelect.value = '';
    statusSelect.value = 'Activo'; // Default status to active
}

/**
 * Populates the student form for editing.
 * @param {string} studentId - The ID of the student to load.
 */
function loadStudentForEdit(studentId) {
    const student = allStudents.find(s => s.id === studentId);
    if (student) {
        firstNameInput.value = student.firstName || '';
        secondNameInput.value = student.secondName || '';
        firstSurnameInput.value = student.firstSurname || '';
        secondSurnameInput.value = student.secondSurname || '';
        documentTypeSelect.value = student.documentType || '';
        documentNumberInput.value = student.documentNumber || '';
        facultySelect.value = student.faculty || '';
        programInput.value = student.program || '';
        birthDateInput.value = student.birthDate || '';
        genderSelect.value = student.gender || '';
        semesterInput.value = student.semester || '';
        averageInput.value = student.average || '';
        emailInput.value = student.email || '';
        phoneInput.value = student.phone || '';
        addressInput.value = student.address || '';
        statusSelect.value = student.status || 'Activo';
    } else {
        console.error("Student not found for editing:", studentId);
        alert("No se pudo cargar la información del estudiante para editar.");
        clearStudentForm();
        studentModal.style.display = 'none';
    }
}

/**
 * Applies filters and search query to the `allStudents` array
 * and updates `filteredStudents`, then re-renders.
 */
function applyFiltersAndSearch() {
    const facultyFilter = filterFacultySelect.value;
    const docTypeFilter = filterDocumentTypeSelect.value;
    const searchTerm = searchInput.value.toLowerCase().trim();

    filteredStudents = allStudents.filter(student => {
        const matchesFaculty = !facultyFilter || student.faculty === facultyFilter;
        const matchesDocType = !docTypeFilter || student.documentType === docTypeFilter;
        const matchesSearch = !searchTerm ||
                              student.firstName.toLowerCase().includes(searchTerm) ||
                              (student.secondName && student.secondName.toLowerCase().includes(searchTerm)) ||
                              student.firstSurname.toLowerCase().includes(searchTerm) ||
                              (student.secondSurname && student.secondSurname.toLowerCase().includes(searchTerm)) ||
                              student.documentNumber.toLowerCase().includes(searchTerm);
        return matchesFaculty && matchesDocType && matchesSearch;
    });

    currentPage = 1; // Reset to first page on new filter/search
    renderStudents(filteredStudents);
}

// --- Firebase Interaction Functions ---

/**
 * Fetches all students from Firestore and populates filter dropdowns.
 */
async function fetchStudents() {
    studentsTableBody.innerHTML = '<tr><td colspan="5">Cargando estudiantes...</td></tr>';
    try {
        const studentsCol = collection(db, 'students');
        // Order by a relevant field, e.g., first name, for consistent display
        const q = query(studentsCol, orderBy('firstSurname', 'asc'), orderBy('firstName', 'asc'));
        const querySnapshot = await getDocs(q);
        allStudents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Populate filters after fetching students
        const faculties = [...new Set(allStudents.map(s => s.faculty))].sort();
        const documentTypes = [...new Set(allStudents.map(s => s.documentType))].sort();

        populateSelect(filterFacultySelect, faculties, 'Todos');
        populateSelect(facultySelect, faculties, 'Seleccione una facultad'); // For the add/edit modal
        populateSelect(filterDocumentTypeSelect, documentTypes, 'Todos');
        populateSelect(documentTypeSelect, ['CC', 'TI', 'CE', 'Pasaporte'], 'Seleccione un tipo de documento'); // Fixed types for add/edit modal

        applyFiltersAndSearch(); // Render students with initial filters/search
    } catch (error) {
        console.error("Error fetching students:", error);
        alert("Hubo un error al cargar los estudiantes.");
        studentsTableBody.innerHTML = '<tr><td colspan="5">Error al cargar estudiantes.</td></tr>';
        noResultsDiv.style.display = 'block';
    }
}

/**
 * Adds a new student to Firestore.
 * @param {object} studentData - The student data to add.
 */
async function addStudent(studentData) {
    try {
        await addDoc(collection(db, 'students'), studentData);
        alert('Estudiante agregado exitosamente!');
        studentModal.style.display = 'none';
        clearStudentForm();
        await fetchStudents(); // Re-fetch and re-render
    } catch (error) {
        console.error("Error adding student:", error);
        alert("Hubo un error al agregar el estudiante.");
    }
}

/**
 * Updates an existing student in Firestore.
 * @param {string} id - The ID of the student to update.
 * @param {object} updatedData - The data to update.
 */
async function updateStudent(id, updatedData) {
    try {
        const studentRef = doc(db, 'students', id);
        await updateDoc(studentRef, updatedData);
        alert('Estudiante actualizado exitosamente!');
        studentModal.style.display = 'none';
        clearStudentForm();
        await fetchStudents(); // Re-fetch and re-render
    } catch (error) {
        console.error("Error updating student:", error);
        alert("Hubo un error al actualizar el estudiante.");
    }
}

/**
 * Deletes a student from Firestore.
 * @param {string} id - The ID of the student to delete.
 */
async function deleteStudent(id) {
    try {
        const studentRef = doc(db, 'students', id);
        await deleteDoc(studentRef);
        alert('Estudiante eliminado exitosamente!');
        await fetchStudents(); // Re-fetch and re-render
    } catch (error) {
        console.error("Error deleting student:", error);
        alert("Hubo un error al eliminar el estudiante.");
    }
}

// --- Event Listeners ---

// Open add student modal
addStudentBtn.onclick = () => {
    clearStudentForm();
    modalTitle.textContent = 'Nuevo Estudiante';
    studentModal.style.display = 'block';
};

// Close modals
closeModalButtons.forEach(button => {
    button.onclick = () => {
        studentModal.style.display = 'none';
        clearStudentForm(); // Clear form on close
    };
});

window.onclick = (event) => {
    if (event.target === studentModal) {
        studentModal.style.display = 'none';
        clearStudentForm(); // Clear form on outside click
    }
};

// Form submission handler
studentForm.onsubmit = async (e) => {
    e.preventDefault();

    const studentData = {
        firstName: firstNameInput.value.trim(),
        secondName: secondNameInput.value.trim() || null,
        firstSurname: firstSurnameInput.value.trim(),
        secondSurname: secondSurnameInput.value.trim() || null,
        documentType: documentTypeSelect.value,
        documentNumber: documentNumberInput.value.trim(),
        faculty: facultySelect.value,
        program: programInput.value.trim() || null,
        birthDate: birthDateInput.value || null,
        gender: genderSelect.value || null,
        semester: semesterInput.value ? parseInt(semesterInput.value) : null,
        average: averageInput.value ? parseFloat(averageInput.value) : null,
        email: emailInput.value.trim() || null,
        phone: phoneInput.value.trim() || null,
        address: addressInput.value.trim() || null,
        status: statusSelect.value,
        createdAt: editingStudentId ? null : new Date().toISOString(), // Set creation date only for new student
        updatedAt: new Date().toISOString() // Always update modification date
    };

    // Basic validation
    if (!studentData.firstName || !studentData.firstSurname || !studentData.documentType || !studentData.documentNumber || !studentData.faculty) {
        alert('Por favor, complete los campos obligatorios (Primer Nombre, Primer Apellido, Tipo y Número de Documento, Facultad).');
        return;
    }

    if (editingStudentId) {
        await updateStudent(editingStudentId, studentData);
    } else {
        await addStudent(studentData);
    }
};

// Filter and Search Event Listeners
filterFacultySelect.onchange = applyFiltersAndSearch;
filterDocumentTypeSelect.onchange = applyFiltersAndSearch;
btnSearchStudentFilter.onclick = applyFiltersAndSearch;
searchInput.onkeyup = (e) => {
    if (e.key === 'Enter') {
        applyFiltersAndSearch();
    }
};

// Pagination Event Listeners
btnPrevPage.onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        renderStudents(filteredStudents);
    }
};

btnNextPage.onclick = () => {
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderStudents(filteredStudents);
    }
};

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', fetchStudents);