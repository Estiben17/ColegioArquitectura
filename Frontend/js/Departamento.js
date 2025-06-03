// --- Department Management ---
const departmentListBody = document.getElementById('department-list-body');
const departmentSearchInput = document.getElementById('department-search');
const departmentFilterSelect = document.getElementById('department-filter');

const viewDepartmentModal = document.getElementById('view-department-modal');
const editDepartmentModal = document.getElementById('edit-department-modal');
const closeModals = document.querySelectorAll('.close-modal');

// Elements for viewing department details
const viewDepartmentCode = document.getElementById('view-department-code');
const viewDepartmentName = document.getElementById('view-department-name');
const viewDepartmentDate = document.getElementById('view-department-date');
const viewDepartmentStatus = document.getElementById('view-department-status');
const viewDepartmentDirector = document.getElementById('view-department-director');
const viewDepartmentDescription = document.getElementById('view-department-description');

// Elements for editing department details
const editDepartmentId = document.getElementById('edit-department-id'); // Hidden field for ID
const departmentCodeInput = document.getElementById('department-code-input');
const editDepartmentNameInput = document.getElementById('edit-department-name');
const departmentDirectorInput = document.getElementById('department-director-input');
const editDepartmentStatusSelect = document.getElementById('edit-department-status');
const departmentDescriptionInput = document.getElementById('department-description-input');
const departmentForm = document.getElementById('department-form');

// Elements for main department info display
const departmentIdDisplay = document.getElementById('department-id-display');
const departmentCodeDisplay = document.getElementById('department-code');
const departmentNameDisplay = document.getElementById('department-name-display');
const departmentCreationDateDisplay = document.getElementById('department-creation-date-display');
const departmentStatusDisplay = document.getElementById('department-status-display');
const departmentUpdateDateDisplay = document.getElementById('department-update-date-display');
const departmentDirectorDisplay = document.getElementById('department-director');
const departmentDescriptionDisplay = document.getElementById('department-description');

const totalStudentsStat = document.getElementById('total-students');
const totalProfessorsStat = document.getElementById('total-professors');
const totalSubjectsStat = document.getElementById('total-subjects');

let currentDepartments = []; // This will hold the departments fetched from Firebase
let currentDepartmentId = null; // To keep track of the selected department for view/edit

/**
 * Renders departments in the table based on the provided array.
 * @param {Array} departmentsToRender - An array of department objects.
 */
function renderDepartments(departmentsToRender) {
    departmentListBody.innerHTML = ''; // Clear existing rows
    if (departmentsToRender.length === 0) {
        departmentListBody.innerHTML = '<tr><td colspan="5">No se encontraron departamentos.</td></tr>';
        return;
    }

    departmentsToRender.forEach(dept => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dept.name}</td>
            <td><span class="status-badge ${dept.status === 'Activo' ? 'status-active' : 'status-inactive'}">${dept.status}</span></td>
            <td>${dept.creationDate || 'N/A'}</td>
            <td>${dept.updateDate || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-info view-btn" data-id="${dept.id}" title="Ver Detalles"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-warning edit-btn" data-id="${dept.id}" title="Editar Departamento"><i class="fas fa-edit"></i></button>
            </td>
        `;
        departmentListBody.appendChild(row);
    });

    attachDepartmentEventListeners();
}

/**
 * Attaches event listeners to dynamically created department action buttons.
 */
function attachDepartmentEventListeners() {
    document.querySelectorAll('.view-btn').forEach(button => {
        button.onclick = (e) => {
            const departmentId = e.currentTarget.dataset.id;
            displayDepartmentDetails(departmentId);
            viewDepartmentModal.style.display = 'block';
        };
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.onclick = (e) => {
            const departmentId = e.currentTarget.dataset.id;
            loadDepartmentForEdit(departmentId);
            editDepartmentModal.style.display = 'block';
        };
    });
}

/**
 * Displays the details of a specific department in the main section and the view modal.
 * @param {string} id - The ID of the department to display.
 */
function displayDepartmentDetails(id) {
    const department = currentDepartments.find(dept => dept.id === id);
    if (department) {
        // Update main display
        departmentIdDisplay.textContent = department.id || 'N/A';
        departmentCodeDisplay.textContent = department.code || 'N/A';
        departmentNameDisplay.textContent = department.name || 'N/A';
        departmentCreationDateDisplay.textContent = department.creationDate || 'N/A';
        departmentUpdateDateDisplay.textContent = department.updateDate || 'N/A';
        departmentDirectorDisplay.textContent = department.director || 'N/A';
        departmentDescriptionDisplay.textContent = department.description || 'N/A';
        departmentStatusDisplay.textContent = department.status || 'N/A';
        departmentStatusDisplay.className = `status-badge ${department.status === 'Activo' ? 'status-active' : 'status-inactive'}`;

        // Assuming these stats are part of the department object or fetched separately
        totalStudentsStat.textContent = department.students || '0';
        totalProfessorsStat.textContent = department.professors || '0';
        totalSubjectsStat.textContent = department.subjects || '0';

        // Update view modal
        viewDepartmentCode.textContent = department.code || 'N/A';
        viewDepartmentName.textContent = department.name || 'N/A';
        viewDepartmentDate.textContent = department.creationDate || 'N/A';
        viewDepartmentStatus.textContent = department.status || 'N/A';
        viewDepartmentStatus.className = `status-badge ${department.status === 'Activo' ? 'status-active' : 'status-inactive'}`;
        viewDepartmentDirector.textContent = department.director || 'N/A';
        viewDepartmentDescription.textContent = department.description || 'N/A';

        currentDepartmentId = id; // Set the currently viewed/edited department ID
    } else {
        console.warn(`Department with ID ${id} not found.`);
        // Optionally clear display or show an error
        clearDepartmentDetailsDisplay();
    }
}

/**
 * Loads department data into the edit modal form fields.
 * @param {string} id - The ID of the department to edit.
 */
function loadDepartmentForEdit(id) {
    const department = currentDepartments.find(dept => dept.id === id);
    if (department) {
        editDepartmentId.value = department.id;
        departmentCodeInput.value = department.code || '';
        editDepartmentNameInput.value = department.name || '';
        departmentDirectorInput.value = department.director || '';
        editDepartmentStatusSelect.value = department.status || 'Activo';
        departmentDescriptionInput.value = department.description || '';
    } else {
        console.warn(`Department with ID ${id} not found for editing.`);
        // Optionally disable form or show a message
    }
}

/**
 * Clears the main department details display.
 */
function clearDepartmentDetailsDisplay() {
    departmentIdDisplay.textContent = '';
    departmentCodeDisplay.textContent = '';
    departmentNameDisplay.textContent = '';
    departmentCreationDateDisplay.textContent = '';
    departmentUpdateDateDisplay.textContent = '';
    departmentDirectorDisplay.textContent = '';
    departmentDescriptionDisplay.textContent = '';
    departmentStatusDisplay.textContent = '';
    departmentStatusDisplay.className = 'status-badge'; // Reset class
    totalStudentsStat.textContent = '0';
    totalProfessorsStat.textContent = '0';
    totalSubjectsStat.textContent = '0';
}

/**
 * Filters the `currentDepartments` array based on search term and status filter,
 * then re-renders the table.
 */
function filterAndRenderDepartments() {
    const searchTerm = departmentSearchInput.value.toLowerCase();
    const filterStatus = departmentFilterSelect.value;

    let filtered = currentDepartments.filter(dept => {
        const matchesSearch = dept.name.toLowerCase().includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || dept.status.toLowerCase() === filterStatus;
        return matchesSearch && matchesStatus;
    });

    renderDepartments(filtered);
}

// --- Firebase Interaction Placeholders ---

/**
 * Fetches all departments from Firestore.
 * Call this function on page load and after any CUD operation.
 * @returns {Promise<Array>} A promise that resolves to an array of department objects.
 */
async function fetchDepartmentsFromFirestore() {
    departmentListBody.innerHTML = '<tr><td colspan="5">Cargando departamentos...</td></tr>';
    try {
        // TODO: Implement actual Firebase fetch logic here
        // Example: const querySnapshot = await db.collection('departments').get();
        // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // For now, return an empty array or throw an error to indicate no data
        console.warn("fetchDepartmentsFromFirestore: Implement actual Firebase fetch logic.");
        return []; // Replace with actual data from Firebase
    } catch (error) {
        console.error("Error fetching departments:", error);
        alert("Hubo un error al cargar los departamentos.");
        departmentListBody.innerHTML = '<tr><td colspan="5">Error al cargar departamentos.</td></tr>';
        return [];
    }
}

/**
 * Updates a department in Firestore.
 * @param {string} id - The ID of the department to update.
 * @param {object} updatedData - An object containing the fields to update.
 * @returns {Promise<void>} A promise that resolves when the update is complete.
 */
async function updateDepartmentInFirestore(id, updatedData) {
    try {
        // TODO: Implement actual Firebase update logic here
        // Example: await db.collection('departments').doc(id).update(updatedData);
        console.log(`Updating department ${id} with:`, updatedData);
        alert('Departamento actualizado correctamente!');
    } catch (error) {
        console.error("Error updating department:", error);
        alert("Hubo un error al actualizar el departamento.");
        throw error; // Re-throw to handle in form submission
    }
}

/**
 * Fetches student data from Firestore by document type and ID.
 * @param {string} docType - The document type (e.g., 'CC', 'TI').
 * @param {string} docId - The document ID.
 * @returns {Promise<object|null>} A promise that resolves to the student object or null if not found.
 */
async function fetchStudentFromFirestore(docType, docId) {
    try {
        // TODO: Implement actual Firebase fetch logic for a student here
        // Example: const querySnapshot = await db.collection('students')
        //                             .where('documentType', '==', docType)
        //                             .where('documentId', '==', docId)
        //                             .limit(1)
        //                             .get();
        // if (!querySnapshot.empty) {
        //     const doc = querySnapshot.docs[0];
        //     return { id: doc.id, ...doc.data() };
        // }
        console.warn("fetchStudentFromFirestore: Implement actual Firebase fetch logic.");
        return null; // Replace with actual student data or null
    } catch (error) {
        console.error("Error fetching student:", error);
        alert("Hubo un error al buscar el estudiante.");
        return null;
    }
}

// --- Event Listeners ---

// Handle department form submission (Save Changes)
departmentForm.onsubmit = async (e) => {
    e.preventDefault();
    const idToUpdate = editDepartmentId.value;
    const updatedData = {
        name: editDepartmentNameInput.value.trim(),
        director: departmentDirectorInput.value.trim(),
        status: editDepartmentStatusSelect.value,
        description: departmentDescriptionInput.value.trim(),
        updateDate: new Date().toISOString().slice(0, 10) // Set current date for update
    };

    if (!idToUpdate || !updatedData.name || !updatedData.director || !updatedData.description) {
        alert('Por favor, complete todos los campos requeridos.');
        return;
    }

    try {
        await updateDepartmentInFirestore(idToUpdate, updatedData);
        editDepartmentModal.style.display = 'none';
        // Re-fetch all departments and re-render
        currentDepartments = await fetchDepartmentsFromFirestore();
        filterAndRenderDepartments();
        displayDepartmentDetails(idToUpdate); // Update the main display section with new data
    } catch (error) {
        // Error handled in updateDepartmentInFirestore
    }
};

// Event Listeners for search and filter
departmentSearchInput.onkeyup = filterAndRenderDepartments;
departmentFilterSelect.onchange = filterAndRenderDepartments;

// Close modals when clicking on 'x' or 'Cancelar'/'Aceptar' buttons
closeModals.forEach(button => {
    button.onclick = () => {
        viewDepartmentModal.style.display = 'none';
        editDepartmentModal.style.display = 'none';
    };
});

// Close modals when clicking outside
window.onclick = (e) => {
    if (e.target === viewDepartmentModal) {
        viewDepartmentModal.style.display = 'none';
    }
    if (e.target === editDepartmentModal) {
        editDepartmentModal.style.display = 'none';
    }
};

// --- Student Search Functionality ---
const studentDocumentTypeInput = document.getElementById('student-document-type-input');
const studentIdInput = document.getElementById('student-id-input');
const btnSearchStudent = document.getElementById('btn-search-student');
const studentSearchResult = document.getElementById('student-search-result');
const noStudentResults = document.getElementById('no-student-results');

// Student info display elements
const studentStatusSpan = document.getElementById('student-status');
const studentIdSpan = document.getElementById('student-id');
const studentNameSpan = document.getElementById('student-name');
const studentBirthdateSpan = document.getElementById('student-birthdate');
const studentGenderSpan = document.getElementById('student-gender');
const studentFacultySpan = document.getElementById('student-faculty');
const studentProgramSpan = document.getElementById('student-program');
const studentSemesterSpan = document.getElementById('student-semester');
const studentAverageSpan = document.getElementById('student-average');
const studentEmailSpan = document.getElementById('student-email');
const studentPhoneSpan = document.getElementById('student-phone');
const studentAddressSpan = document.getElementById('student-address');

btnSearchStudent.onclick = async () => {
    const docType = studentDocumentTypeInput.value;
    const docId = studentIdInput.value.trim();

    if (!docType || !docId) {
        alert('Por favor, seleccione un tipo de documento e ingrese el número de documento.');
        return;
    }

    try {
        const foundStudent = await fetchStudentFromFirestore(docType, docId);

        if (foundStudent) {
            studentStatusSpan.textContent = foundStudent.status || 'N/A';
            studentStatusSpan.className = `status-badge ${foundStudent.status === 'Activo' ? 'status-active' : 'status-inactive'}`;
            studentIdSpan.textContent = `${foundStudent.documentType || 'N/A'} ${foundStudent.documentId || 'N/A'}`;
            studentNameSpan.textContent = foundStudent.name || 'N/A';
            studentBirthdateSpan.textContent = foundStudent.birthdate || 'N/A';
            studentGenderSpan.textContent = foundStudent.gender || 'N/A';
            studentFacultySpan.textContent = foundStudent.faculty || 'N/A';
            studentProgramSpan.textContent = foundStudent.program || 'N/A';
            studentSemesterSpan.textContent = foundStudent.semester || 'N/A';
            studentAverageSpan.textContent = foundStudent.average || 'N/A';
            studentEmailSpan.textContent = foundStudent.email || 'N/A';
            studentPhoneSpan.textContent = foundRutaStudent.phone || 'N/A'; // Corrected variable name
            studentAddressSpan.textContent = foundStudent.address || 'N/A';

            studentSearchResult.style.display = 'block';
            noStudentResults.style.display = 'none';
        } else {
            studentSearchResult.style.display = 'none';
            noStudentResults.style.display = 'flex'; // Use flex to center content
        }
    } catch (error) {
        console.error("Error searching student:", error);
        alert("Hubo un error al buscar el estudiante. Por favor, intente de nuevo.");
        studentSearchResult.style.display = 'none';
        noStudentResults.style.display = 'flex';
    }
};

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch departments and display them when the page loads
    currentDepartments = await fetchDepartmentsFromFirestore();
    filterAndRenderDepartments(); // Initial render with any filters/search applied

    // Display details of the first department if available
    if (currentDepartments.length > 0) {
        displayDepartmentDetails(currentDepartments[0].id);
    } else {
        clearDepartmentDetailsDisplay();
    }
});