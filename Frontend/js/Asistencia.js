document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    // Main Page Buttons
    const btnNewAttendance = document.getElementById('btn-new-attendance');
    const btnFillAttendance = document.getElementById('btn-fill-attendance');

    // Filters
    const filterCodeInput = document.getElementById('filter-code');
    const filterSubjectSelect = document.getElementById('filter-subject');
    const filterGroupSelect = document.getElementById('filter-group');
    const filterSemesterSelect = document.getElementById('filter-semester');
    const filterDateFromInput = document.getElementById('filter-date-from');
    const filterDateToInput = document.getElementById('filter-date-to');
    const filterTimeFromInput = document.getElementById('filter-time-from');
    const filterTimeToInput = document.getElementById('filter-time-to');
    const btnFilter = document.getElementById('btn-filter');
    const btnClearFilters = document.getElementById('btn-clear-filters');

    // Attendance Table
    const attendanceTableBody = document.getElementById('attendance-table-body');

    // Statistics
    const totalAttendanceSpan = document.getElementById('total-attendance');
    const registeredAttendanceSpan = document.getElementById('registered-attendance');
    const attendancePercentageSpan = document.getElementById('attendance-percentage');

    // Modals
    const attendanceModal = document.getElementById('attendance-modal');
    const fillAttendanceModal = document.getElementById('fill-attendance-modal');
    const viewAttendanceModal = document.getElementById('view-attendance-modal');
    const closeModals = document.querySelectorAll('.close-modal');

    // "Create New Attendance" Modal Form
    const attendanceForm = document.getElementById('attendance-form');
    const attendanceCodeInput = document.getElementById('attendance-code');
    const attendanceSubjectSelect = document.getElementById('attendance-subject');
    const attendanceGroupSelect = document.getElementById('attendance-group');
    const attendanceSemesterSelect = document.getElementById('attendance-semester');
    const attendanceDateInput = document.getElementById('attendance-date');
    const attendanceTimeStartInput = document.getElementById('attendance-time-start');
    const attendanceTimeEndInput = document.getElementById('attendance-time-end');

    // "Fill Attendance" Modal Form
    const fillAttendanceForm = document.getElementById('fill-attendance-form');
    const fillAttendanceCodeInput = document.getElementById('fill-attendance-code');
    const btnSearchAttendanceToFill = document.getElementById('btn-search-attendance'); // Renamed for clarity
    const fillAttendanceDateInput = document.getElementById('fill-attendance-date');
    const fillAttendanceTimeInput = document.getElementById('fill-attendance-time');
    const fillDocTypeSelect = document.querySelector('#fill-attendance-modal #document-type');
    const fillDocNumberInput = document.querySelector('#fill-attendance-modal #document-number');
    const btnSearchStudentToFill = document.querySelector('#fill-attendance-modal #btn-search-student'); // Renamed for clarity
    const attendanceStudentsListBody = document.getElementById('attendance-students-list');

    // "View Attendance" Modal Elements
    const viewSubjectNameSpan = document.getElementById('view-subject-name');
    const viewSubjectCodeSpan = document.getElementById('view-subject-code');
    const viewGroupSpan = document.getElementById('view-group');
    const viewSemesterSpan = document.getElementById('view-semester');
    const viewDateSpan = document.getElementById('view-date');
    const viewTimeSpan = document.getElementById('view-time');
    const viewAttendanceListBody = document.getElementById('view-attendance-list');
    const viewTotalStudentsSpan = document.getElementById('view-total-students');
    const viewPresentSpan = document.getElementById('view-present');
    const viewAbsentSpan = document.getElementById('view-absent');
    const viewPercentageSpan = document.getElementById('view-percentage');
    const btnPrintAttendance = document.getElementById('btn-print-attendance');

    // --- Data Storage ---
    let attendanceSessions = []; // { id, subjectCode, subjectName, group, semester, date, timeStart, timeEnd, studentRecords: [{ studentId, studentName, studentDoc, status ('P', 'A', 'E'), observation }] }
    let subjectsData = []; // Expected: [{ code, name, semester (optional) }]
    let studentRegistrationsData = []; // Expected: [{ subjectCode, group, semester, dni, name, lastname, email, id (student's unique ID) }]
    
    let currentFillingSessionId = null; // To track which session is being filled

    // --- Utility Functions ---
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    function openModal(modalElement) {
        if (modalElement) modalElement.style.display = 'flex';
    }

    function closeModal(modalElement) {
        if (modalElement) modalElement.style.display = 'none';
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Make sure to adjust for timezone if dateString is just YYYY-MM-DD
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-ES');
    }

    // --- Data Loading Simulation ---
    // In a real app, this data would come from a backend or localStorage (from Asignatura.js, Estudiante.js)
    async function loadExternalData() {
        // Simulate fetching subjects (like from Asignatura.js)
        subjectsData = [
            { code: "MAT101", name: "Matemáticas Básicas" },
            { code: "PROG202", name: "Programación Avanzada" },
            { code: "FIS301", name: "Física Moderna" }
        ];

        // Simulate fetching student registrations (like from Asignatura.js and Estudiante.js)
        studentRegistrationsData = [
            { id: "std1", subjectCode: "MAT101", group: "1", semester: "1", dni: "12345678A", name: "Ana", lastname: "Perez", email: "ana@mail.com" },
            { id: "std2", subjectCode: "MAT101", group: "1", semester: "1", dni: "87654321B", name: "Luis", lastname: "Gomez", email: "luis@mail.com" },
            { id: "std3", subjectCode: "PROG202", group: "A", semester: "3", dni: "11223344C", name: "Carlos", lastname: "Ruiz", email: "carlos@mail.com" },
            { id: "std4", subjectCode: "MAT101", group: "2", semester: "1", dni: "44556677D", name: "Sofia", lastname: "Lopez", email: "sofia@mail.com" }
        ];

        populateSubjectDropdowns();
    }

    function populateSubjectDropdowns() {
        [filterSubjectSelect, attendanceSubjectSelect].forEach(select => {
            if (!select) return;
            select.innerHTML = `<option value="all">Todas las asignaturas</option>`; // Default for filter
            if (select === attendanceSubjectSelect) {
                 select.innerHTML = `<option value="">Seleccione una asignatura</option>`; // Default for create form
            }
            subjectsData.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.code;
                option.textContent = `${subject.code} - ${subject.name}`;
                select.appendChild(option);
            });
        });
    }

    // --- Render Functions ---
    function renderAttendanceTable(sessionsToRender = attendanceSessions) {
        attendanceTableBody.innerHTML = '';
        if (sessionsToRender.length === 0) {
            attendanceTableBody.innerHTML = '<tr><td colspan="10" style="text-align:center;">No hay listas de asistencia.</td></tr>';
            return;
        }

        sessionsToRender.forEach(session => {
            const row = attendanceTableBody.insertRow();
            const studentsMarked = session.studentRecords ? session.studentRecords.filter(sr => sr.status).length : 0;
            const totalExpectedStudents = getExpectedStudentsForSession(session.subjectCode, session.group, session.semester).length;
            
            row.innerHTML = `
                <td>${session.id.slice(-6)}</td>
                <td>${formatDate(session.date)}</td>
                <td>${session.timeStart}</td>
                <td>${session.timeEnd}</td>
                <td>${session.subjectCode}</td>
                <td>${session.subjectName}</td>
                <td>${session.group}</td>
                <td>${session.semester}</td>
                <td>${studentsMarked}/${totalExpectedStudents}</td>
                <td>
                    <button class="btn btn-info btn-sm view-attendance" data-id="${session.id}"><i class="fas fa-eye"></i> Ver</button>
                    <button class="btn btn-warning btn-sm fill-session-attendance" data-id="${session.id}"><i class="fas fa-edit"></i> Llenar</button>
                    <button class="btn btn-danger btn-sm delete-attendance" data-id="${session.id}"><i class="fas fa-trash"></i> Eliminar</button>
                </td>
            `;
        });
    }

    function renderStudentsForAttendanceList(listBody, students, existingRecords = []) {
        listBody.innerHTML = '';
        if (students.length === 0) {
            listBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay estudiantes para esta sesión.</td></tr>';
            return;
        }
        students.forEach(student => {
            const existingRecord = existingRecords.find(r => r.studentId === student.id);
            const row = listBody.insertRow();
            row.dataset.studentId = student.id;
            row.dataset.studentName = `${student.name} ${student.lastname}`;
            row.dataset.studentDoc = student.dni;

            row.innerHTML = `
                <td>${student.name} ${student.lastname}</td>
                <td>${student.dni}</td>
                <td>
                    <select class="attendance-status" data-student-id="${student.id}">
                        <option value="">Seleccionar</option>
                        <option value="P" ${existingRecord && existingRecord.status === 'P' ? 'selected' : ''}>Presente</option>
                        <option value="A" ${existingRecord && existingRecord.status === 'A' ? 'selected' : ''}>Ausente</option>
                        <option value="E" ${existingRecord && existingRecord.status === 'E' ? 'selected' : ''}>Excusa</option>
                    </select>
                </td>
                <td><input type="text" class="attendance-observation" placeholder="Observación" value="${existingRecord && existingRecord.observation ? existingRecord.observation : ''}"></td>
            `;
        });
    }

    function updateStats() {
        const totalSessions = attendanceSessions.length;
        const sessionsWithSomeRegistration = attendanceSessions.filter(s => s.studentRecords && s.studentRecords.some(sr => sr.status)).length;
        
        let totalPresent = 0;
        let totalPossibleAttendances = 0;

        attendanceSessions.forEach(session => {
            const expectedStudents = getExpectedStudentsForSession(session.subjectCode, session.group, session.semester).length;
            totalPossibleAttendances += expectedStudents;
            if (session.studentRecords) {
                session.studentRecords.forEach(record => {
                    if (record.status === 'P') {
                        totalPresent++;
                    }
                });
            }
        });

        const overallPercentage = totalPossibleAttendances > 0 ? ((totalPresent / totalPossibleAttendances) * 100).toFixed(1) : 0;

        totalAttendanceSpan.textContent = totalSessions;
        registeredAttendanceSpan.textContent = sessionsWithSomeRegistration; // Or count students with status
        attendancePercentageSpan.textContent = `${overallPercentage}%`;
    }

    // --- Event Handlers ---

    // Modal Open/Close
    if (btnNewAttendance) btnNewAttendance.addEventListener('click', () => {
        attendanceForm.reset();
        attendanceCodeInput.value = ''; // Clear if it was auto-filled
        openModal(attendanceModal);
    });

    if (btnFillAttendance) btnFillAttendance.addEventListener('click', () => {
        fillAttendanceForm.reset();
        attendanceStudentsListBody.innerHTML = ''; // Clear previous student list
        currentFillingSessionId = null;
        openModal(fillAttendanceModal);
    });

    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(attendanceModal);
            closeModal(fillAttendanceModal);
            closeModal(viewAttendanceModal);
        });
    });

    // Create New Attendance Session
    if (attendanceForm) {
        attendanceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const subjectCode = attendanceCodeInput.value.trim();
            const selectedSubjectOption = attendanceSubjectSelect.options[attendanceSubjectSelect.selectedIndex];
            const subjectName = selectedSubjectOption ? selectedSubjectOption.textContent.split(' - ')[1] || subjectCode : subjectCode;
            
            const newSession = {
                id: generateId(),
                subjectCode,
                subjectName,
                group: attendanceGroupSelect.value,
                semester: attendanceSemesterSelect.value,
                date: attendanceDateInput.value,
                timeStart: attendanceTimeStartInput.value,
                timeEnd: attendanceTimeEndInput.value,
                studentRecords: [] // Initialize empty
            };

            // Basic validation
            if (!newSession.subjectCode || !newSession.group || !newSession.semester || !newSession.date || !newSession.timeStart || !newSession.timeEnd) {
                alert('Por favor complete todos los campos requeridos.');
                return;
            }

            attendanceSessions.push(newSession);
            renderAttendanceTable();
            updateStats();
            closeModal(attendanceModal);
            alert('Lista de asistencia creada exitosamente.');
        });
    }

    // Auto-fill subject name when code changes in create modal
    if (attendanceCodeInput && attendanceSubjectSelect) {
        attendanceCodeInput.addEventListener('change', () => {
            const subject = subjectsData.find(s => s.code === attendanceCodeInput.value.trim());
            if (subject) {
                attendanceSubjectSelect.value = subject.code;
            } else {
                attendanceSubjectSelect.value = ""; // Reset if not found
            }
        });
         attendanceSubjectSelect.addEventListener('change', () => {
            const selectedCode = attendanceSubjectSelect.value;
            if (selectedCode) {
                attendanceCodeInput.value = selectedCode;
            }
        });
    }

    // Fill Attendance Modal - Search for Session
    if (btnSearchAttendanceToFill) {
        btnSearchAttendanceToFill.addEventListener('click', () => {
            const codeToSearch = fillAttendanceCodeInput.value.trim();
            if (!codeToSearch) {
                alert('Ingrese un código de asignatura para buscar la sesión.');
                return;
            }

            // For simplicity, let's assume the user means the *latest* session for that code
            // A more robust search would involve date/group/semester too, or a selection mechanism
            const foundSessions = attendanceSessions.filter(s => s.subjectCode === codeToSearch).sort((a,b) => new Date(b.date) - new Date(a.date));
            
            if (foundSessions.length === 0) {
                alert('No se encontró ninguna sesión de asistencia para ese código.');
                attendanceStudentsListBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Busque una sesión válida.</td></tr>';
                currentFillingSessionId = null;
                fillAttendanceDateInput.value = '';
                fillAttendanceTimeInput.value = '';
                return;
            }

            const sessionToFill = foundSessions[0]; // Take the most recent one
            currentFillingSessionId = sessionToFill.id;

            fillAttendanceDateInput.value = sessionToFill.date;
            // Assuming timeStart is the relevant time for the session
            fillAttendanceTimeInput.value = sessionToFill.timeStart; 

            const studentsForSession = getExpectedStudentsForSession(sessionToFill.subjectCode, sessionToFill.group, sessionToFill.semester);
            renderStudentsForAttendanceList(attendanceStudentsListBody, studentsForSession, sessionToFill.studentRecords || []);
        });
    }
    
    function getExpectedStudentsForSession(subjectCode, group, semester) {
        return studentRegistrationsData.filter(reg => 
            reg.subjectCode === subjectCode &&
            reg.group === group &&
            reg.semester === semester 
        );
    }

    // Fill Attendance Modal - Save Attendance
    if (fillAttendanceForm) {
        fillAttendanceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentFillingSessionId) {
                alert('Primero busque y cargue una sesión de asistencia.');
                return;
            }

            const session = attendanceSessions.find(s => s.id === currentFillingSessionId);
            if (!session) {
                alert('Error: Sesión no encontrada.');
                return;
            }

            const updatedStudentRecords = [];
            const rows = attendanceStudentsListBody.querySelectorAll('tr');
            rows.forEach(row => {
                const studentId = row.dataset.studentId;
                if (!studentId) return; // Skip if it's a message row or similar

                const statusSelect = row.querySelector('.attendance-status');
                const observationInput = row.querySelector('.attendance-observation');
                
                updatedStudentRecords.push({
                    studentId: studentId,
                    studentName: row.dataset.studentName, // Store for convenience
                    studentDoc: row.dataset.studentDoc,   // Store for convenience
                    status: statusSelect ? statusSelect.value : '',
                    observation: observationInput ? observationInput.value.trim() : ''
                });
            });

            session.studentRecords = updatedStudentRecords;
            renderAttendanceTable();
            updateStats();
            closeModal(fillAttendanceModal);
            alert('Asistencia guardada exitosamente.');
        });
    }

    // Fill Attendance Modal - Search and Add Student Manually (Optional)
    if (btnSearchStudentToFill) {
        btnSearchStudentToFill.addEventListener('click', () => {
            // This is a simplified version. In a real app, you'd search your main student database.
            const docType = fillDocTypeSelect.value;
            const docNumber = fillDocNumberInput.value.trim();
            if (!docNumber) {
                alert('Ingrese el número de documento del estudiante.');
                return;
            }
            // Find student in the general studentRegistrationsData (this is a mock search)
            const student = studentRegistrationsData.find(s => s.dni === docNumber);
            if (student) {
                // Check if student is already in the list for the current session
                const alreadyListed = Array.from(attendanceStudentsListBody.querySelectorAll('tr'))
                                         .some(row => row.dataset.studentId === student.id);
                if (alreadyListed) {
                    alert('El estudiante ya está en la lista.');
                    return;
                }
                // Add student to the table in the modal (not saving yet, just for UI)
                const tempStudentList = [{ id: student.id, name: student.name, lastname: student.lastname, dni: student.dni }];
                // This will append, might need better logic if list is not empty
                if (attendanceStudentsListBody.querySelector('td[colspan="4"]')) { // if "no students" message is there
                    attendanceStudentsListBody.innerHTML = '';
                }
                renderStudentsForAttendanceList(attendanceStudentsListBody, 
                    tempStudentList.concat(
                        Array.from(attendanceStudentsListBody.querySelectorAll('tr')).map(r => ({
                            id: r.dataset.studentId,
                            name: r.dataset.studentName.split(' ')[0],
                            lastname: r.dataset.studentName.split(' ')[1] || '',
                            dni: r.dataset.studentDoc
                        }))
                    )
                );
            } else {
                alert('Estudiante no encontrado.');
            }
        });
    }

    // Table Actions (View, Fill, Delete) - Event Delegation
    if (attendanceTableBody) {
        attendanceTableBody.addEventListener('click', (e) => {
            const target = e.target;
            const button = target.closest('button');
            if (!button) return;

            const sessionId = button.dataset.id;

            if (button.classList.contains('view-attendance')) {
                populateViewAttendanceModal(sessionId);
            } else if (button.classList.contains('fill-session-attendance')) {
                loadSessionForFilling(sessionId);
            } else if (button.classList.contains('delete-attendance')) {
                if (confirm('¿Está seguro de que desea eliminar esta lista de asistencia?')) {
                    attendanceSessions = attendanceSessions.filter(s => s.id !== sessionId);
                    renderAttendanceTable();
                    updateStats();
                    alert('Lista de asistencia eliminada.');
                }
            }
        });
    }

    function populateViewAttendanceModal(sessionId) {
        const session = attendanceSessions.find(s => s.id === sessionId);
        if (!session) return;

        viewSubjectNameSpan.textContent = session.subjectName;
        viewSubjectCodeSpan.textContent = session.subjectCode;
        viewGroupSpan.textContent = session.group;
        viewSemesterSpan.textContent = session.semester;
        viewDateSpan.textContent = formatDate(session.date);
        viewTimeSpan.textContent = `${session.timeStart} - ${session.timeEnd}`;

        viewAttendanceListBody.innerHTML = '';
        let presentCount = 0;
        let absentCount = 0;
        const totalStudentsInSession = session.studentRecords ? session.studentRecords.length : 0;

        if (session.studentRecords && session.studentRecords.length > 0) {
            session.studentRecords.forEach((record, index) => {
                const row = viewAttendanceListBody.insertRow();
                let statusText = 'No registrado';
                if (record.status === 'P') { statusText = 'Presente'; presentCount++; }
                else if (record.status === 'A') { statusText = 'Ausente'; absentCount++; }
                else if (record.status === 'E') { statusText = 'Excusa'; presentCount++; } // Excused often counts as present for some metrics

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${record.studentName || 'N/A'}</td>
                    <td>${record.studentDoc || 'N/A'}</td>
                    <td>${statusText}</td>
                    <td>${record.observation || ''}</td>
                `;
            });
        } else {
            viewAttendanceListBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No hay registros de estudiantes para esta sesión.</td></tr>';
        }
        
        const expectedStudentsCount = getExpectedStudentsForSession(session.subjectCode, session.group, session.semester).length;
        viewTotalStudentsSpan.textContent = expectedStudentsCount; // Or totalStudentsInSession if records are definitive list
        viewPresentSpan.textContent = presentCount;
        viewAbsentSpan.textContent = absentCount;
        const percentage = expectedStudentsCount > 0 ? ((presentCount / expectedStudentsCount) * 100).toFixed(1) : 0;
        viewPercentageSpan.textContent = `${percentage}%`;

        openModal(viewAttendanceModal);
    }

    function loadSessionForFilling(sessionId) {
        const sessionToFill = attendanceSessions.find(s => s.id === sessionId);
        if (!sessionToFill) {
            alert('Sesión no encontrada.');
            return;
        }
        currentFillingSessionId = sessionToFill.id;

        fillAttendanceCodeInput.value = sessionToFill.subjectCode;
        fillAttendanceDateInput.value = sessionToFill.date;
        fillAttendanceTimeInput.value = sessionToFill.timeStart;

        const studentsForSession = getExpectedStudentsForSession(sessionToFill.subjectCode, sessionToFill.group, sessionToFill.semester);
        renderStudentsForAttendanceList(attendanceStudentsListBody, studentsForSession, sessionToFill.studentRecords || []);
        openModal(fillAttendanceModal);
    }

    // Filtering
    if (btnFilter) {
        btnFilter.addEventListener('click', handleFilterAttendance);
    }
    if (btnClearFilters) {
        btnClearFilters.addEventListener('click', () => {
            filterCodeInput.value = '';
            filterSubjectSelect.value = 'all';
            filterGroupSelect.value = 'all';
            filterSemesterSelect.value = 'all';
            filterDateFromInput.value = '';
            filterDateToInput.value = '';
            filterTimeFromInput.value = '';
            filterTimeToInput.value = '';
            renderAttendanceTable(attendanceSessions); // Show all
        });
    }

    function handleFilterAttendance() {
        const code = filterCodeInput.value.toLowerCase();
        const subject = filterSubjectSelect.value;
        const group = filterGroupSelect.value;
        const semester = filterSemesterSelect.value;
        const dateFrom = filterDateFromInput.value;
        const dateTo = filterDateToInput.value;
        const timeFrom = filterTimeFromInput.value;
        const timeTo = filterTimeToInput.value;

        const filtered = attendanceSessions.filter(session => {
            let match = true;
            if (code && !session.subjectCode.toLowerCase().includes(code)) match = false;
            if (subject !== 'all' && session.subjectCode !== subject) match = false;
            if (group !== 'all' && session.group !== group) match = false;
            if (semester !== 'all' && session.semester !== semester) match = false;
            if (dateFrom && session.date < dateFrom) match = false;
            if (dateTo && session.date > dateTo) match = false;
            if (timeFrom && session.timeStart < timeFrom) match = false;
            if (timeTo && session.timeEnd > timeTo) match = false; // Or check session.timeStart < timeTo
            return match;
        });
        renderAttendanceTable(filtered);
    }

    // Print Attendance
    if (btnPrintAttendance) {
        btnPrintAttendance.addEventListener('click', () => {
            // Simple print of the modal content. More sophisticated printing would require a library or specific CSS.
            const modalContent = viewAttendanceModal.querySelector('.modal-content').innerHTML;
            const printWindow = window.open('', '_blank', 'height=600,width=800');
            printWindow.document.write('<html><head><title>Detalle de Asistencia</title>');
            // You might want to link your stylesheet or add inline styles for better print format
            printWindow.document.write('<link rel="stylesheet" href="../css/Style.css" type="text/css" media="print"/>'); // Adjust path
            printWindow.document.write('<style> body { font-family: Arial, sans-serif; margin: 20px; } .form-actions { display: none !important; } .close-modal { display: none !important; } table { width: 100%; border-collapse: collapse; margin-bottom: 15px;} th, td { border: 1px solid #ddd; padding: 8px; text-align: left;} th { background-color: #f2f2f2;} .attendance-info, .attendance-summary { margin-bottom: 20px; } .info-row, .summary-row { margin-bottom: 5px; } .info-label { font-weight: bold; } </style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(modalContent);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus(); // Necessary for some browsers
            setTimeout(() => { printWindow.print(); }, 500); // Timeout to ensure content is loaded
            // printWindow.onafterprint = () => printWindow.close(); // Optional: close after printing
        });
    }

    // --- Initial Load ---
    async function init() {
        await loadExternalData(); // Load subjects, student registrations
        renderAttendanceTable();
        updateStats();
    }

    init();
});