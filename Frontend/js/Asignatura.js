document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---

    // Create Subject Form
    const createSubjectForm = document.getElementById('create-subject-form');
    const subjectCodeInput = document.getElementById('subject-code');
    const subjectNameInput = document.getElementById('subject-name');
    const subjectSemesterInput = document.getElementById('subject-semester');
    const subjectCreditsInput = document.getElementById('subject-credits');

    // Register Student Form
    const registerStudentForm = document.getElementById('register-student-form');
    const registerSubjectSelect = document.getElementById('register-subject');
    const registerGroupInput = document.getElementById('register-group');
    const registerSemesterSelect = document.getElementById('register-semester');
    const registerDniInput = document.getElementById('register-dni');
    const registerNameInput = document.getElementById('register-name');
    const registerLastnameInput = document.getElementById('register-lastname');
    const registerEmailInput = document.getElementById('register-email');

    // Tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Tables & Search
    const subjectsListBody = document.getElementById('subjects-list');
    const studentsListBody = document.getElementById('students-list');
    const subjectSearchInput = document.getElementById('subject-search');
    const studentSearchInput = document.getElementById('student-search');
    const subjectSearchButton = document.querySelector('#subjects-tab .btn-search');
    const studentSearchButton = document.querySelector('#students-tab .btn-search');

    // --- Data Storage (In-memory arrays for this example) ---
    let subjects = []; // Array of subject objects
    let studentRegistrations = []; // Array of student registration objects

    // --- Utility Functions ---
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // --- Render Functions ---

    function renderSubjectsTable(subjectsToRender = subjects) {
        subjectsListBody.innerHTML = ''; // Clear existing rows
        if (subjectsToRender.length === 0) {
            subjectsListBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay asignaturas registradas.</td></tr>';
            return;
        }
        subjectsToRender.forEach(subject => {
            const row = subjectsListBody.insertRow();
            row.innerHTML = `
                <td>${subject.code}</td>
                <td>${subject.name}</td>
                <td>${subject.semester}</td>
                <td>${subject.credits}</td>
                <td>
                    <button class="btn btn-danger btn-sm delete-subject" data-id="${subject.id}"><i class="fas fa-trash"></i> Eliminar</button>
                    <!-- <button class="btn btn-warning btn-sm edit-subject" data-id="${subject.id}"><i class="fas fa-edit"></i> Editar</button> -->
                </td>
            `;
        });
        addDeleteSubjectEventListeners();
    }

    function renderRegisterSubjectDropdown() {
        registerSubjectSelect.innerHTML = '<option value="">Seleccione una asignatura</option>'; // Clear existing options and add default
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.code; // Or subject.id if preferred for backend
            option.textContent = `${subject.code} - ${subject.name}`;
            registerSubjectSelect.appendChild(option);
        });
    }

    function renderStudentRegistrationsTable(registrationsToRender = studentRegistrations) {
        studentsListBody.innerHTML = ''; // Clear existing rows
        if (registrationsToRender.length === 0) {
            studentsListBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">No hay estudiantes registrados en asignaturas.</td></tr>';
            return;
        }
        registrationsToRender.forEach(reg => {
            const subject = subjects.find(s => s.code === reg.subjectCode); // Get subject name
            const subjectNameDisplay = subject ? subject.name : reg.subjectCode;

            const row = studentsListBody.insertRow();
            row.innerHTML = `
                <td>${subjectNameDisplay}</td>
                <td>${reg.group}</td>
                <td>${reg.semester}</td>
                <td>${reg.dni}</td>
                <td>${reg.name}</td>
                <td>${reg.lastname}</td>
                <td>${reg.email}</td>
                <td>
                    <button class="btn btn-danger btn-sm delete-registration" data-id="${reg.id}"><i class="fas fa-trash"></i> Eliminar</button>
                    <!-- <button class="btn btn-warning btn-sm edit-registration" data-id="${reg.id}"><i class="fas fa-edit"></i> Editar</button> -->
                </td>
            `;
        });
        addDeleteRegistrationEventListeners();
    }

    // --- Event Handlers ---

    // Handle Create Subject Form Submission
    function handleCreateSubject(event) {
        event.preventDefault();
        const code = subjectCodeInput.value.trim();
        const name = subjectNameInput.value.trim();
        const semester = subjectSemesterInput.value;
        const credits = subjectCreditsInput.value.trim();

        if (!code || !name || !semester || !credits) {
            alert('Por favor, complete todos los campos para crear la asignatura.');
            return;
        }

        if (subjects.some(s => s.code === code)) {
            alert('Ya existe una asignatura con ese código.');
            return;
        }

        const newSubject = {
            id: generateId(),
            code,
            name,
            semester,
            credits
        };

        subjects.push(newSubject);
        renderSubjectsTable();
        renderRegisterSubjectDropdown(); // Update dropdown in student registration form
        createSubjectForm.reset(); // Clear the form
        alert('Asignatura creada exitosamente.');
    }

    // Handle Register Student Form Submission
    function handleRegisterStudent(event) {
        event.preventDefault();
        const subjectCode = registerSubjectSelect.value;
        const group = registerGroupInput.value.trim();
        const semester = registerSemesterSelect.value;
        const dni = registerDniInput.value.trim();
        const name = registerNameInput.value.trim();
        const lastname = registerLastnameInput.value.trim();
        const email = registerEmailInput.value.trim();

        if (!subjectCode || !group || !semester || !dni || !name || !lastname || !email) {
            alert('Por favor, complete todos los campos para registrar al estudiante.');
            return;
        }

        // Optional: Check if student is already registered in this subject/group
        if (studentRegistrations.some(reg => reg.subjectCode === subjectCode && reg.dni === dni && reg.group === group)) {
            alert('Este estudiante ya está registrado en esta asignatura y grupo.');
            return;
        }

        const newRegistration = {
            id: generateId(),
            subjectCode,
            group,
            semester,
            dni,
            name,
            lastname,
            email
        };

        studentRegistrations.push(newRegistration);
        renderStudentRegistrationsTable();
        registerStudentForm.reset(); // Clear the form
        alert('Estudiante registrado exitosamente en la asignatura.');
    }

    // Handle Tab Switching
    function handleTabSwitch(event) {
        const clickedTabButton = event.currentTarget;
        const targetTabId = clickedTabButton.dataset.tab;

        // Remove active class from all tab buttons and contents
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to the clicked button and corresponding content
        clickedTabButton.classList.add('active');
        document.getElementById(targetTabId).classList.add('active');
    }

    // Handle Subject Search
    function handleSubjectSearch() {
        const searchTerm = subjectSearchInput.value.toLowerCase();
        const filteredSubjects = subjects.filter(subject =>
            subject.code.toLowerCase().includes(searchTerm) ||
            subject.name.toLowerCase().includes(searchTerm) ||
            subject.semester.toLowerCase().includes(searchTerm)
        );
        renderSubjectsTable(filteredSubjects);
    }

    // Handle Student Registration Search
    function handleStudentSearch() {
        const searchTerm = studentSearchInput.value.toLowerCase();
        const filteredRegistrations = studentRegistrations.filter(reg =>
            reg.subjectCode.toLowerCase().includes(searchTerm) ||
            reg.group.toLowerCase().includes(searchTerm) ||
            reg.dni.toLowerCase().includes(searchTerm) ||
            reg.name.toLowerCase().includes(searchTerm) ||
            reg.lastname.toLowerCase().includes(searchTerm) ||
            reg.email.toLowerCase().includes(searchTerm)
        );
        renderStudentRegistrationsTable(filteredRegistrations);
    }

    // Handle Delete Subject
    function handleDeleteSubject(event) {
        if (!event.target.classList.contains('delete-subject')) return;

        const subjectId = event.target.dataset.id;
        if (confirm('¿Está seguro de que desea eliminar esta asignatura? Esto también eliminará los registros de estudiantes asociados.')) {
            const subjectToDelete = subjects.find(s => s.id === subjectId);
            if (!subjectToDelete) return;

            // Remove subject
            subjects = subjects.filter(s => s.id !== subjectId);

            // Remove associated student registrations
            studentRegistrations = studentRegistrations.filter(reg => reg.subjectCode !== subjectToDelete.code);

            renderSubjectsTable();
            renderRegisterSubjectDropdown();
            renderStudentRegistrationsTable(); // Re-render student table as registrations might have changed
            alert('Asignatura y registros asociados eliminados.');
        }
    }

    // Handle Delete Student Registration
    function handleDeleteRegistration(event) {
        if (!event.target.classList.contains('delete-registration')) return;

        const registrationId = event.target.dataset.id;
        if (confirm('¿Está seguro de que desea eliminar este registro de estudiante?')) {
            studentRegistrations = studentRegistrations.filter(reg => reg.id !== registrationId);
            renderStudentRegistrationsTable();
            alert('Registro de estudiante eliminado.');
        }
    }

    // --- Add Event Listeners for Dynamic Elements ---
    // These functions are called after tables are re-rendered to attach listeners to new buttons

    function addDeleteSubjectEventListeners() {
        const deleteButtons = subjectsListBody.querySelectorAll('.delete-subject');
        deleteButtons.forEach(button => {
            // Remove existing listener to prevent multiple attachments if re-rendered often
            button.removeEventListener('click', handleDeleteSubject);
            button.addEventListener('click', handleDeleteSubject);
        });
        // Similarly for edit buttons if implemented
        // const editButtons = subjectsListBody.querySelectorAll('.edit-subject');
        // editButtons.forEach(button => button.addEventListener('click', handleEditSubject));
    }

    function addDeleteRegistrationEventListeners() {
        const deleteButtons = studentsListBody.querySelectorAll('.delete-registration');
        deleteButtons.forEach(button => {
            button.removeEventListener('click', handleDeleteRegistration);
            button.addEventListener('click', handleDeleteRegistration);
        });
        // Similarly for edit buttons if implemented
        // const editButtons = studentsListBody.querySelectorAll('.edit-registration');
        // editButtons.forEach(button => button.addEventListener('click', handleEditRegistration));
    }


    // --- Initial Event Listeners Setup ---
    if (createSubjectForm) {
        createSubjectForm.addEventListener('submit', handleCreateSubject);
    }

    if (registerStudentForm) {
        registerStudentForm.addEventListener('submit', handleRegisterStudent);
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabSwitch);
    });

    if (subjectSearchButton) {
        subjectSearchButton.addEventListener('click', handleSubjectSearch);
    }
    if (subjectSearchInput) {
        subjectSearchInput.addEventListener('keyup', handleSubjectSearch); // Search as user types
    }

    if (studentSearchButton) {
        studentSearchButton.addEventListener('click', handleStudentSearch);
    }
    if (studentSearchInput) {
        studentSearchInput.addEventListener('keyup', handleStudentSearch); // Search as user types
    }

    // Event delegation for delete buttons within tables (alternative to re-attaching listeners)
    // This is often a more robust way if you prefer not to call addDelete...EventListeners() on each render.
    // However, the current approach of re-attaching is also fine for this scale.
    /*
    if (subjectsListBody) {
        subjectsListBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-subject')) {
                handleDeleteSubject(event);
            }
            // if (event.target.classList.contains('edit-subject')) {
            //     handleEditSubject(event); // You would need to define this function
            // }
        });
    }

    if (studentsListBody) {
        studentsListBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('delete-registration')) {
                handleDeleteRegistration(event);
            }
            // if (event.target.classList.contains('edit-registration')) {
            //     handleEditRegistration(event); // You would need to define this function
            // }
        });
    }
    */

    // --- Initial Render ---
    // In a real application, you might fetch initial data from a server here.
    // For now, we start with empty tables.
    renderSubjectsTable();
    renderRegisterSubjectDropdown();
    renderStudentRegistrationsTable();

    // Set the first tab as active by default (if not already set by HTML)
    // The HTML already has the first tab active, so this might be redundant
    // but good for robustness if HTML changes.
    if (tabButtons.length > 0 && !document.querySelector('.tab-btn.active')) {
        tabButtons[0].classList.add('active');
    }
    if (tabContents.length > 0 && !document.querySelector('.tab-content.active')) {
        tabContents[0].classList.add('active');
    }
});