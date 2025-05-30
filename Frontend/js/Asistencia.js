document.addEventListener('DOMContentLoaded', () => {
    // --- Data Storage (In a real app, this would come from a backend) ---
    // Dummy data for subjects and students, consistent with the previous HTML's structure
    const subjects = [
        { code: 'MAT101', name: 'Matemáticas Básicas', semester: 'Primer Semestre', credits: 3 },
        { code: 'FIS201', name: 'Física I', semester: 'Segundo Semestre', credits: 4 },
        { code: 'PRO301', name: 'Programación Avanzada', semester: 'Tercer Semestre', credits: 5 }
    ];

    // Dummy data for registered students (from Asignatura.html context)
    const students = [
        { subject: 'Matemáticas Básicas', group: 'G1', semester: 'Primer Semestre', dni: '123456789', name: 'Juan', lastname: 'Pérez', email: 'juan.perez@example.com' },
        { subject: 'Matemáticas Básicas', group: 'G1', semester: 'Primer Semestre', dni: '987654321', name: 'Maria', lastname: 'García', email: 'maria.garcia@example.com' },
        { subject: 'Física I', group: 'G2', semester: 'Segundo Semestre', dni: '112233445', name: 'Carlos', lastname: 'López', email: 'carlos.lopez@example.com' },
        { subject: 'Programación Avanzada', group: 'G3', semester: 'Tercer Semestre', dni: '667788990', name: 'Ana', lastname: 'Martínez', email: 'ana.martinez@example.com' }
    ];

    // Array to store created attendance records
    const attendanceRecords = [];

    // --- Get DOM Elements ---
    const attendanceModal = document.getElementById('attendance-modal');
    const fillAttendanceModal = document.getElementById('fill-attendance-modal');
    const viewAttendanceModal = document.getElementById('view-attendance-modal');

    const btnNewAttendance = document.getElementById('btn-new-attendance');
    const btnFillAttendance = document.getElementById('btn-fill-attendance');
    const closeModals = document.querySelectorAll('.close-modal');

    const attendanceForm = document.getElementById('attendance-form');
    const fillAttendanceForm = document.getElementById('fill-attendance-form');

    const attendanceSubjectSelect = document.getElementById('attendance-subject');
    const attendanceGroupSelect = document.getElementById('attendance-group');

    const fillAttendanceCodeInput = document.getElementById('fill-attendance-code');
    const btnSearchAttendance = document.getElementById('btn-search-attendance');
    const attendanceStudentsListBody = document.getElementById('attendance-students-list');

    const attendanceTableBody = document.getElementById('attendance-table-body');

    // Filter elements
    const filterSubjectSelect = document.getElementById('filter-subject');
    const filterGroupSelect = document.getElementById('filter-group');
    const filterSemesterSelect = document.getElementById('filter-semester');
    const filterCodeInput = document.getElementById('filter-code');
    const filterDateFromInput = document.getElementById('filter-date-from');
    const filterDateToInput = document.getElementById('filter-date-to');
    const filterTimeFromInput = document.getElementById('filter-time-from');
    const filterTimeToInput = document.getElementById('filter-time-to');
    const btnFilter = document.getElementById('btn-filter');
    const btnClearFilters = document.getElementById('btn-clear-filters');

    // Stats elements
    const totalAttendanceSpan = document.getElementById('total-attendance');
    const registeredAttendanceSpan = document.getElementById('registered-attendance');
    const attendancePercentageSpan = document.getElementById('attendance-percentage');

    // View attendance modal elements
    const viewSubjectName = document.getElementById('view-subject-name');
    const viewSubjectCode = document.getElementById('view-subject-code');
    const viewGroup = document.getElementById('view-group');
    const viewSemester = document.getElementById('view-semester');
    const viewDate = document.getElementById('view-date');
    const viewTime = document.getElementById('view-time');
    const viewAttendanceList = document.getElementById('view-attendance-list');
    const viewTotalStudents = document.getElementById('view-total-students');
    const viewPresent = document.getElementById('view-present');
    const viewAbsent = document.getElementById('view-absent');
    const viewPercentage = document.getElementById('view-percentage');

    // --- Modal Functions ---
    function openModal(modal) {
        modal.style.display = 'block';
        // Add a class to body to disable scrolling if needed
        document.body.classList.add('modal-open');
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        modal.querySelector('form')?.reset(); // Reset form inside modal
        // Remove the class from body
        document.body.classList.remove('modal-open');
    }

    // Close modals when clicking the 'x' or 'Cancelar' button
    closeModals.forEach(button => {
        button.addEventListener('click', (event) => {
            if (event.target.closest('.close-modal')) { // Ensure clicking on the 'x' or cancel button
                const modal = event.target.closest('.modal');
                if (modal) {
                    closeModal(modal);
                }
            }
        });
    });

    // Close modal if clicking outside the modal content
    window.addEventListener('click', (event) => {
        if (event.target === attendanceModal) {
            closeModal(attendanceModal);
        }
        if (event.target === fillAttendanceModal) {
            closeModal(fillAttendanceModal);
        }
        if (event.target === viewAttendanceModal) {
            closeModal(viewAttendanceModal);
        }
    });

    // --- Populate Dropdowns ---
    function populateSubjectDropdowns() {
        // Populate 'Crear Asistencia' modal subject dropdown
        attendanceSubjectSelect.innerHTML = '<option value="">Seleccione una asignatura</option>';
        filterSubjectSelect.innerHTML = '<option value="all">Todas las asignaturas</option>';

        subjects.forEach(subject => {
            const option1 = document.createElement('option');
            option1.value = subject.code;
            option1.textContent = subject.name;
            attendanceSubjectSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = subject.code;
            option2.textContent = subject.name;
            filterSubjectSelect.appendChild(option2);
        });
    }

    function populateGroupDropdowns() {
        // This is simplified. In a real app, groups would be tied to subjects.
        // For now, populate with some generic groups.
        attendanceGroupSelect.innerHTML = '<option value="">Seleccione un grupo</option>';
        filterGroupSelect.innerHTML = '<option value="all">Todos los grupos</option>';
        ['G1', 'G2', 'G3'].forEach(group => { // Example groups
            const option1 = document.createElement('option');
            option1.value = group;
            option1.textContent = group;
            attendanceGroupSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = group;
            option2.textContent = group;
            filterGroupSelect.appendChild(option2);
        });
    }

    function populateSemesterDropdowns() {
        filterSemesterSelect.innerHTML = '<option value="all">Todos los semestres</option>';
        // Example semesters, you might fetch these from subjects/students data
        ['Primer Semestre', 'Segundo Semestre', 'Tercer Semestre', '2023-1', '2023-2'].forEach(semester => {
             const option = document.createElement('option');
             option.value = semester;
             option.textContent = semester;
             filterSemesterSelect.appendChild(option);
        });
    }

    // --- Create New Attendance List ---
    btnNewAttendance.addEventListener('click', () => {
        openModal(attendanceModal);
    });

    attendanceForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const id = attendanceRecords.length > 0 ? Math.max(...attendanceRecords.map(a => a.id)) + 1 : 1; // Simple ID generation
        const code = document.getElementById('attendance-code').value.trim();
        const subjectCode = document.getElementById('attendance-subject').value;
        const subjectName = attendanceSubjectSelect.options[attendanceSubjectSelect.selectedIndex].text;
        const group = document.getElementById('attendance-group').value;
        const semester = document.getElementById('attendance-semester').value;
        const date = document.getElementById('attendance-date').value;
        const timeStart = document.getElementById('attendance-time-start').value;
        const timeEnd = document.getElementById('attendance-time-end').value;

        if (code && subjectCode && group && semester && date && timeStart && timeEnd) {
            const newAttendance = {
                id: id,
                code: code,
                subjectCode: subjectCode,
                subjectName: subjectName,
                group: group,
                semester: semester,
                date: date,
                timeStart: timeStart,
                timeEnd: timeEnd,
                studentsPresent: [], // To store students marked present
                studentsAbsent: [] // To store students marked absent
            };
            attendanceRecords.push(newAttendance);
            alert('Lista de asistencia creada correctamente!');
            closeModal(attendanceModal);
            renderAttendanceTable(); // Update the main attendance table
        } else {
            alert('Por favor, complete todos los campos para crear la lista de asistencia.');
        }
    });

    // --- Fill Attendance ---
    btnFillAttendance.addEventListener('click', () => {
        openModal(fillAttendanceModal);
        attendanceStudentsListBody.innerHTML = ''; // Clear previous student list
    });

    // Search attendance by code
    btnSearchAttendance.addEventListener('click', () => {
        const searchCode = fillAttendanceCodeInput.value.trim();
        const foundAttendance = attendanceRecords.find(record => record.code === searchCode);

        if (foundAttendance) {
            alert(`Asistencia para ${foundAttendance.subjectName} (${foundAttendance.code}) encontrada.`);
            // Populate attendance details if necessary (date, time can be pulled from the found record)
            document.getElementById('fill-attendance-date').value = foundAttendance.date;
            document.getElementById('fill-attendance-time').value = foundAttendance.timeStart; // Use start time as reference

            // Now, get students associated with this subject and group
            const filteredStudents = students.filter(s =>
                s.subject === foundAttendance.subjectName && s.group === foundAttendance.group
            );
            renderStudentsForAttendanceFilling(filteredStudents, foundAttendance);
        } else {
            alert('No se encontró una lista de asistencia con ese código.');
            attendanceStudentsListBody.innerHTML = ''; // Clear list if not found
        }
    });

    // Search student by document (within fill attendance modal)
    document.getElementById('btn-search-student').addEventListener('click', () => {
        const documentNumber = document.getElementById('document-number').value.trim();
        const documentType = document.getElementById('document-type').value; // You might use this in a real search

        const targetAttendanceCode = document.getElementById('fill-attendance-code').value.trim();
        const currentAttendanceRecord = attendanceRecords.find(record => record.code === targetAttendanceCode);

        if (!currentAttendanceRecord) {
            alert('Por favor, busque primero una lista de asistencia válida.');
            return;
        }

        const foundStudent = students.find(s => s.dni === documentNumber);

        if (foundStudent) {
            // Check if student is already in the list for this attendance record
            const studentAlreadyListed = Array.from(attendanceStudentsListBody.children).some(row =>
                row.dataset.dni === foundStudent.dni
            );

            if (!studentAlreadyListed) {
                // Add student to the attendance list for marking
                const row = attendanceStudentsListBody.insertRow();
                row.dataset.dni = foundStudent.dni; // Store DNI for easy lookup
                row.insertCell().textContent = `${foundStudent.name} ${foundStudent.lastname}`;
                row.insertCell().textContent = foundStudent.dni;

                const attendanceStatusCell = row.insertCell();
                const presentCheckbox = document.createElement('input');
                presentCheckbox.type = 'checkbox';
                presentCheckbox.classList.add('attendance-present-checkbox');
                // Set initial state based on previous attendance for this student/record if available
                const isPresent = currentAttendanceRecord.studentsPresent.some(s => s.dni === foundStudent.dni);
                presentCheckbox.checked = isPresent;
                attendanceStatusCell.appendChild(presentCheckbox);

                const observationsCell = row.insertCell();
                const observationsInput = document.createElement('input');
                observationsInput.type = 'text';
                observationsInput.placeholder = 'Observaciones';
                // Populate observations if already exists
                const existingObservation = currentAttendanceRecord.studentsPresent.find(s => s.dni === foundStudent.dni)?.observations ||
                                            currentAttendanceRecord.studentsAbsent.find(s => s.dni === foundStudent.dni)?.observations || '';
                observationsInput.value = existingObservation;
                observationsCell.appendChild(observationsInput);
                alert(`Estudiante ${foundStudent.name} encontrado.`);
            } else {
                alert('Este estudiante ya está en la lista de asistencia.');
            }
        } else {
            alert('No se encontró un estudiante con ese número de documento.');
        }
    });


    function renderStudentsForAttendanceFilling(studentsToFill, attendanceRecord) {
        attendanceStudentsListBody.innerHTML = '';
        studentsToFill.forEach(student => {
            const row = attendanceStudentsListBody.insertRow();
            row.dataset.dni = student.dni; // Store DNI for easy lookup
            row.insertCell().textContent = `${student.name} ${student.lastname}`;
            row.insertCell().textContent = student.dni;

            const attendanceStatusCell = row.insertCell();
            const presentCheckbox = document.createElement('input');
            presentCheckbox.type = 'checkbox';
            presentCheckbox.classList.add('attendance-present-checkbox');
            // Check if the student was already marked present in this record
            presentCheckbox.checked = attendanceRecord.studentsPresent.some(s => s.dni === student.dni);
            attendanceStatusCell.appendChild(presentCheckbox);

            const observationsCell = row.insertCell();
            const observationsInput = document.createElement('input');
            observationsInput.type = 'text';
            observationsInput.placeholder = 'Observaciones';
            // Populate observations if they exist for this student in this record
            const existingStudent = attendanceRecord.studentsPresent.find(s => s.dni === student.dni) ||
                                   attendanceRecord.studentsAbsent.find(s => s.dni === student.dni);
            if (existingStudent) {
                observationsInput.value = existingStudent.observations || '';
            }
            observationsCell.appendChild(observationsInput);
        });
    }

    fillAttendanceForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const targetAttendanceCode = document.getElementById('fill-attendance-code').value.trim();
        const currentAttendanceRecord = attendanceRecords.find(record => record.code === targetAttendanceCode);

        if (!currentAttendanceRecord) {
            alert('No hay una lista de asistencia activa para guardar.');
            return;
        }

        currentAttendanceRecord.studentsPresent = [];
        currentAttendanceRecord.studentsAbsent = [];

        // Iterate over the students in the table to record their attendance
        const studentRows = attendanceStudentsListBody.querySelectorAll('tr');
        studentRows.forEach(row => {
            const dni = row.dataset.dni;
            const isPresent = row.querySelector('.attendance-present-checkbox').checked;
            const observations = row.querySelector('input[type="text"]').value.trim();

            const studentData = students.find(s => s.dni === dni);
            if (studentData) {
                const attendanceDetail = {
                    dni: dni,
                    name: studentData.name,
                    lastname: studentData.lastname,
                    observations: observations
                };
                if (isPresent) {
                    currentAttendanceRecord.studentsPresent.push(attendanceDetail);
                } else {
                    currentAttendanceRecord.studentsAbsent.push(attendanceDetail);
                }
            }
        });

        alert('Asistencia guardada correctamente!');
        closeModal(fillAttendanceModal);
        renderAttendanceTable(); // Refresh the main table after saving attendance
    });


    // --- Render Main Attendance Table ---
    function renderAttendanceTable() {
        attendanceTableBody.innerHTML = '';
        const currentFilters = {
            code: filterCodeInput.value.trim().toLowerCase(),
            subject: filterSubjectSelect.value,
            group: filterGroupSelect.value,
            semester: filterSemesterSelect.value,
            dateFrom: filterDateFromInput.value,
            dateTo: filterDateToInput.value,
            timeFrom: filterTimeFromInput.value,
            timeTo: filterTimeToInput.value
        };

        const filteredRecords = attendanceRecords.filter(record => {
            const recordDate = new Date(record.date);
            const recordTimeStart = record.timeStart;
            const recordTimeEnd = record.timeEnd;

            // Apply filters
            const matchesCode = currentFilters.code === '' || record.code.toLowerCase().includes(currentFilters.code);
            const matchesSubject = currentFilters.subject === 'all' || record.subjectCode === currentFilters.subject;
            const matchesGroup = currentFilters.group === 'all' || record.group === currentFilters.group;
            const matchesSemester = currentFilters.semester === 'all' || record.semester === currentFilters.semester;
            const matchesDateFrom = currentFilters.dateFrom === '' || recordDate >= new Date(currentFilters.dateFrom);
            const matchesDateTo = currentFilters.dateTo === '' || recordDate <= new Date(currentFilters.dateTo);
            const matchesTimeFrom = currentFilters.timeFrom === '' || recordTimeStart >= currentFilters.timeFrom;
            const matchesTimeTo = currentFilters.timeTo === '' || recordTimeEnd <= currentFilters.timeTo;

            return matchesCode && matchesSubject && matchesGroup && matchesSemester &&
                   matchesDateFrom && matchesDateTo && matchesTimeFrom && matchesTimeTo;
        });

        filteredRecords.forEach(record => {
            const row = attendanceTableBody.insertRow();
            row.insertCell().textContent = record.id;
            row.insertCell().textContent = record.date;
            row.insertCell().textContent = record.timeStart;
            row.insertCell().textContent = record.timeEnd;
            row.insertCell().textContent = record.subjectCode;
            row.insertCell().textContent = record.subjectName;
            row.insertCell().textContent = record.group;
            row.insertCell().textContent = record.semester;

            const studentsCountCell = row.insertCell();
            const totalStudentsInRecord = record.studentsPresent.length + record.studentsAbsent.length;
            studentsCountCell.textContent = `${record.studentsPresent.length}/${totalStudentsInRecord}`;

            const actionsCell = row.insertCell();

            const viewButton = document.createElement('button');
            viewButton.innerHTML = '<i class="fas fa-eye"></i>';
            viewButton.classList.add('btn', 'btn-info', 'btn-small');
            viewButton.title = 'Ver Detalles';
            viewButton.addEventListener('click', () => {
                viewAttendanceDetails(record);
            });
            actionsCell.appendChild(viewButton);

            const editButton = document.createElement('button');
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.classList.add('btn', 'btn-edit', 'btn-small');
            editButton.title = 'Editar Asistencia';
            editButton.addEventListener('click', () => {
                alert(`Editar asistencia ID: ${record.id}`);
                // In a real app, you'd open fillAttendanceModal and pre-populate it
                // with the data from 'record' for editing.
            });
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.classList.add('btn', 'btn-delete', 'btn-small');
            deleteButton.title = 'Eliminar Asistencia';
            deleteButton.addEventListener('click', () => {
                if (confirm(`¿Estás seguro de que quieres eliminar la asistencia ID ${record.id}?`)) {
                    const index = attendanceRecords.indexOf(record);
                    if (index > -1) {
                        attendanceRecords.splice(index, 1);
                        renderAttendanceTable();
                        updateAttendanceStats();
                        alert('Asistencia eliminada.');
                    }
                }
            });
            actionsCell.appendChild(deleteButton);
        });

        updateAttendanceStats();
    }

    // --- Filter Functionality ---
    btnFilter.addEventListener('click', renderAttendanceTable);
    filterCodeInput.addEventListener('keyup', renderAttendanceTable);
    filterSubjectSelect.addEventListener('change', renderAttendanceTable);
    filterGroupSelect.addEventListener('change', renderAttendanceTable);
    filterSemesterSelect.addEventListener('change', renderAttendanceTable);
    filterDateFromInput.addEventListener('change', renderAttendanceTable);
    filterDateToInput.addEventListener('change', renderAttendanceTable);
    filterTimeFromInput.addEventListener('change', renderAttendanceTable);
    filterTimeToInput.addEventListener('change', renderAttendanceTable);


    btnClearFilters.addEventListener('click', () => {
        filterCodeInput.value = '';
        filterSubjectSelect.value = 'all';
        filterGroupSelect.value = 'all';
        filterSemesterSelect.value = 'all';
        filterDateFromInput.value = '';
        filterDateToInput.value = '';
        filterTimeFromInput.value = '';
        filterTimeToInput.value = '';
        renderAttendanceTable(); // Re-render table after clearing filters
    });

    // --- Update Statistics ---
    function updateAttendanceStats() {
        totalAttendanceSpan.textContent = attendanceRecords.length;
        // Count how many records actually have students marked
        const registeredCount = attendanceRecords.filter(record =>
            record.studentsPresent.length > 0 || record.studentsAbsent.length > 0
        ).length;
        registeredAttendanceSpan.textContent = registeredCount;

        let percentage = 0;
        if (attendanceRecords.length > 0) {
            percentage = (registeredCount / attendanceRecords.length) * 100;
        }
        attendancePercentageSpan.textContent = `${percentage.toFixed(2)}%`;
    }

    // --- View Attendance Details Modal ---
    function viewAttendanceDetails(record) {
        viewSubjectName.textContent = record.subjectName;
        viewSubjectCode.textContent = record.subjectCode;
        viewGroup.textContent = record.group;
        viewSemester.textContent = record.semester;
        viewDate.textContent = record.date;
        viewTime.textContent = `${record.timeStart} - ${record.timeEnd}`;

        viewAttendanceList.innerHTML = '';
        let presentCount = 0;
        let absentCount = 0;
        let studentCounter = 1;

        // Combine present and absent for display order
        const allStudentsInRecord = [...record.studentsPresent, ...record.studentsAbsent].sort((a,b) => (a.name + a.lastname).localeCompare(b.name + b.lastname));

        allStudentsInRecord.forEach(student => {
            const isPresent = record.studentsPresent.some(s => s.dni === student.dni);
            const row = viewAttendanceList.insertRow();
            row.insertCell().textContent = studentCounter++;
            row.insertCell().textContent = `${student.name} ${student.lastname}`;
            row.insertCell().textContent = student.dni;
            row.insertCell().textContent = isPresent ? 'Presente' : 'Ausente';
            row.insertCell().textContent = student.observations || '';

            if (isPresent) {
                presentCount++;
            } else {
                absentCount++;
            }
        });

        viewTotalStudents.textContent = record.studentsPresent.length + record.studentsAbsent.length;
        viewPresent.textContent = presentCount;
        viewAbsent.textContent = absentCount;

        let detailPercentage = 0;
        if (viewTotalStudents.textContent > 0) {
            detailPercentage = (presentCount / viewTotalStudents.textContent) * 100;
        }
        viewPercentage.textContent = `${detailPercentage.toFixed(2)}%`;

        openModal(viewAttendanceModal);
    }

    // --- Initial setup on page load ---
    populateSubjectDropdowns();
    populateGroupDropdowns();
    populateSemesterDropdowns();
    renderAttendanceTable(); // Render table even if no data initially
});