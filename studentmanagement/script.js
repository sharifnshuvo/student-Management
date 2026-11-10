
// ======================================
// 1. SELECT HTML ELEMENTS
// ======================================

const studentForm = document.getElementById("studentForm");
const studentModal = document.getElementById("studentModal");

const studentTable = document.getElementById("studentTable");
const recentStudents = document.getElementById("recentStudents");
const attendanceTable = document.getElementById("attendanceTable");
const resultsTable = document.getElementById("resultsTable");

const searchInput = document.getElementById("searchInput");
const classFilter = document.getElementById("classFilter");
const statusFilter = document.getElementById("statusFilter");
const sortFilter = document.getElementById("sortFilter");

const editId = document.getElementById("editId");

const studentName = document.getElementById("studentName");
const studentGender = document.getElementById("studentGender");
const studentEmail = document.getElementById("studentEmail");
const studentPhone = document.getElementById("studentPhone");
const studentClass = document.getElementById("studentClass");
const studentMarks = document.getElementById("studentMarks");
const studentStatus = document.getElementById("studentStatus");

// ======================================
// 2. INITIAL DATA
// ======================================

let students = [];

let currentPage = 1;
const rowsPerPage = 5;


async function loadStudents() {

    try {

        const response = await fetch("./data.json");

        if (!response.ok) {
            throw new Error("Failed to load student data");
        }

        students = await response.json();

        saveStudents();

        renderAll();

        console.log("Students loaded:", students);

    } catch (error) {

        console.log("Error:", error);

        showToast("Unable to load student data!");

    }

}


// ======================================
// 3. SAVE DATA IN LOCAL STORAGE
// ======================================

function saveStudents() {

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );

}


// ======================================
// 4. GENERATE STUDENT ID
// ======================================

function generateStudentID() {

    const highestID = students.reduce((max, student) => {

        const number = Number(student.id.split("-")[1]);

        return Math.max(max, number);

    }, 1000);

    return `STU-${highestID + 1}`;
}


// ======================================
// 5. TOAST NOTIFICATION
// ======================================

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);

}

// ======================================
// 6. OPEN AND CLOSE MODAL
// ======================================

function openModal(){
    studentForm.reset();

    editId.value = "";
    document.getElementById("modalTitle").textContent =
        "Add New Student";

     studentMarks.value = 0;
    studentStatus.value = "Active";

    studentModal.classList.add("show");   
}

function closeModal() {

    studentModal.classList.remove("show");

}

document.getElementById("addStudentBtn").addEventListener("click",openModal);

document.getElementById("headerAddBtn").addEventListener("click",openModal);

document.getElementById("closeModal").addEventListener("click",closeModal);

document.getElementById("cancelBtn").addEventListener("click",closeModal);


// ======================================
// 7. ADD AND UPDATE STUDENT
// ======================================

studentForm.addEventListener("submit", function(e) {

    e.preventDefault();
    const name = studentName.value.trim();
    const gender = studentGender.value;
    const email =studentEmail.value.trim();
    const phone = studentPhone.value.trim();
    const className = studentClass.value;
    const marks = Number(studentMarks.value);
    const status = studentStatus.value;

    if (!name || !gender || !email || !phone || !className){
        showToast("Please complete all required fields!");
        return;
    }
        if (!Number.isFinite(marks) || marks < 0 || marks > 100) {

        showToast("Marks must be between 0 and 100!");
        return;

    }

    if(editId.value){
        const student = students.find(
            s => s.id === editId.value
        );

        if(!student){
            showToast("student not found");
            return;
        }

        Object.assign(student,{
        name,
        gender,
        email,
        phone,
        className,
        marks,
        status
        });
        showToast("Student updated successfully!");
    }
    // ADD NEW STUDENT

else {

    const newStudent = {

        id: generateStudentID(),
        name,
        gender,
        email,
        phone,
        className,
        marks,
        status,
        createdAt: Date.now()

    };

    students.unshift(newStudent);

    showToast("Student added successfully!");

}

saveStudents();

closeModal();

currentPage = 1;

renderAll();

});

    
// ======================================
// 8. DISPLAY STUDENTS
// ======================================

function renderStudents() {

    const searchValue = searchInput.value.toLowerCase().trim();

    const selectedClass =classFilter.value;

    const selectedStatus = statusFilter.value;

    let filteredStudents = students.filter(student => {

        const matchSearch = 
        student.name.toLowerCase().includes(searchValue) ||
        student.id.toLowerCase().includes(searchValue) ||
        student.phone.toLowerCase().includes(searchValue);

        const MatchClass =
        !selectedClass || student.className == selectedClass;

        const MatchStatus = 
        !selectedStatus || student.status == selectedStatus;


        return matchSearch && MatchClass && MatchStatus;
    });

       // SORT STUDENTS

    if (sortFilter.value === "name") {

        filteredStudents.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

    }

    else if (sortFilter.value === "marks") {

        filteredStudents.sort((a, b) =>
            b.marks - a.marks
        );

    }

    else if (sortFilter.value === "oldest") {

        filteredStudents.sort((a, b) =>
            a.createdAt - b.createdAt
        );

    }

    else {

        filteredStudents.sort((a, b) =>
            b.createdAt - a.createdAt
        );

    }


    // PAGINATION

    const totalPages = Math.ceil(
        filteredStudents.length /rowsPerPage
    );

    currentPage =
    Math.min(
        Math.max(1, currentPage),
        Math.max(1, totalPages)
    );

    const startIndex = (currentPage -1) * rowsPerPage;

    const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + rowsPerPage
);

     // DISPLAY TABLE

    studentTable.innerHTML = paginatedStudents.map(student => `

        <tr>

            <td class="student-id">${escapeHTML(student.id)}</td>

            <td class="student-name">${escapeHTML(student.name)}</td>

            <td>${escapeHTML(student.gender)}</td>

            <td>${escapeHTML(student.className)}</td>

            <td>${escapeHTML(student.phone)}</td>

            <td>${student.marks}</td>

            <td>
                <span class="status ${student.status}">
                    ${student.status}
                </span>
            </td>

            <td>
                <div class="action-buttons">

                    <button class="edit-btn"
                        data-id="${escapeHTML(student.id)}"
                        title="Edit">
                        <i class="fas fa-pen"></i>
                    </button>

                    <button class="delete-btn"
                        data-id="${escapeHTML(student.id)}"
                        title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>

                </div>
            </td>

        </tr>

    `).join("");

        // EMPTY MESSAGE

    if (filteredStudents.length === 0) {

        studentTable.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;padding:30px;">
                    No students found.
                </td>
            </tr>
        `;

    }

    // PAGINATION INFORMATION

    const showingStart = filteredStudents.length ? startIndex + 1 : 0;

    const showingEnd = Math.min(
        startIndex + rowsPerPage,
        filteredStudents.length
    );

    document.getElementById("paginationInfo").textContent =
        `Showing ${showingStart}-${showingEnd} of ${filteredStudents.length} students`;

    document.getElementById("prevBtn").disabled =
        currentPage === 1;

    document.getElementById("nextBtn").disabled =
        currentPage >= totalPages;

}

// ======================================
// 9. PREVENT HTML INJECTION
// ======================================

function escapeHTML(value){
     return String(value).replace(/[&<>"']/g, char => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];

    });

}


// ======================================
// 10. EDIT AND DELETE STUDENT
// ======================================

studentTable.addEventListener("click", function(e){

    const editButton = e.target.closest(".edit-btn");
    const deleteButton = e.target.closest(".delete-btn");

    if(editButton){
        const id = editButton.dataset.id;

        const student = students.find(s => s.id === id);
        if (!student) return;

        editId.value = student.id;

        studentName.value = student.name;
        studentGender.value = student.gender;
        studentEmail.value = student.email;
        studentPhone.value = student.phone;
        studentClass.value = student.className;
        studentMarks.value = student.marks;
        studentStatus.value = student.status;

        document.getElementById("modalTitle").textContent =
            "Edit Student";

        studentModal.classList.add("show");

    }

    // DELETE

    if (deleteButton) {

        const id = deleteButton.dataset.id;

        const confirmDelete = confirm(
            "Are you sure you want to delete this student?"
        );

        if(!confirmDelete) return;
        
       students = students.filter(
        student => student.id !== id
       );
       saveStudents();

        renderAll();

        showToast("Student deleted successfully!");

    }

});


// ======================================
// 11. SEARCH AND FILTER
// ======================================

searchInput.addEventListener("input", () => {

    currentPage = 1;
    renderStudents();

});

classFilter.addEventListener("change", () => {

    currentPage = 1;
    renderStudents();

});

statusFilter.addEventListener("change", () => {

    currentPage = 1;
    renderStudents();

});

sortFilter.addEventListener("change", () => {

    currentPage = 1;
    renderStudents();

});


// ======================================
// 12. PAGINATION BUTTONS
// ======================================

document.getElementById("prevBtn").addEventListener(
    "click",
    function() {

        if (currentPage > 1) {

            currentPage--;

            renderStudents();

        }

    }
);

document.getElementById("nextBtn").addEventListener(
    "click",
    function() {

        currentPage++;

        renderStudents();

    }
);


// ======================================
// 13. DASHBOARD STATISTICS
// ======================================

function renderDashboard(){

    const total = students.length;

    const active = students.filter(
        s => s.status == "Active"
    ).length;

    const male = students.filter(
        s => s.gender === "Male"
    ).length;

    const female = students.filter(
        s => s.gender === "Female"
    ).length;

    document.getElementById("totalStudents").textContent = total;

    document.getElementById("activeStudents").textContent = active;

    document.getElementById("maleStudents").textContent = male;

    document.getElementById("femaleStudents").textContent = female;

    document.getElementById("overviewTotal").textContent = total;

    const percentage = total ? Math.round((active / total) * 100) : 0;

    document.getElementById("activeProgress").style.width = percentage + "%";

    document.getElementById("activePercentage").textContent = percentage + "% active Student";

    //Recent Student 

    recentStudents.innerHTML = [...students]
    .sort((a, b) => (b.createdAt - a.createdAt))
    .slice(0, 5)
    .map(student => `
        <tr>
            <td>
                <div class="student-name">
                    ${escapeHTML(student.name)}
                </div>
                <small class="student-id">
                    ${escapeHTML(student.id)}
                </small> 
            </td>

            <td> ${escapeHTML(student.className)}</td>
            <td> ${escapeHTML(student.phone)}</td>

            <td>
                <span class="status ${student.status}">
                        ${student.status}
                </span>
            </td>

        </tr>
    `).join("");
}


// ======================================
// 14. ATTENDANCE MANAGEMENT
// ======================================

function getAttendanceKey() {
    return "attendance_" + new Date().toLocaleDateString("en-CA");
}

function getAttendance() {
    return JSON.parse(
        localStorage.getItem(getAttendanceKey()) || "{}"
    );
}

function renderAttendance() {

    const attendance = getAttendance();

    attendanceTable.innerHTML = students.map(student => {

        const savedStatus = attendance[student.id] || "Present";

        return `
            <tr>
                <td>${escapeHTML(student.id)}</td>
                <td>${escapeHTML(student.name)}</td>
                <td>${escapeHTML(student.className)}</td>

                <td>
                    <select class="attendance-select"
                        data-id="${escapeHTML(student.id)}">

                        <option value="Present"
                            ${savedStatus === "Present" ? "selected" : ""}>
                            Present
                        </option>

                        <option value="Absent"
                            ${savedStatus === "Absent" ? "selected" : ""}>
                            Absent
                        </option>

                        <option value="Late"
                            ${savedStatus === "Late" ? "selected" : ""}>
                            Late
                        </option>

                    </select>
                </td>
            </tr>
        `;
    }).join("");
}

attendanceTable.addEventListener("change", function(e) {

    if (!e.target.matches(".attendance-select")) return;

    const id = e.target.dataset.id;
    const status = e.target.value;

    const attendance = getAttendance();

    attendance[id] = status;

    localStorage.setItem(
        getAttendanceKey(),
        JSON.stringify(attendance)
    );

    showToast("Attendance saved!");

});
    

// ======================================
// 15. RESULTS AND GRADING
// ======================================

function getGrade(marks) {

    if (marks >= 80) return "A+";
    if (marks >= 70) return "A";
    if (marks >= 60) return "A-";
    if (marks >= 50) return "B";
    if (marks >= 40) return "C";
    if (marks >= 33) return "D";

    return "F";

}


function renderResults() {

    resultsTable.innerHTML = students.map(student => `

        <tr>

            <td>${escapeHTML(student.id)}</td>

            <td class="student-name">
                ${escapeHTML(student.name)}
            </td>

            <td>${escapeHTML(student.className)}</td>

            <td>${student.marks}/100</td>

            <td>
                <span class="status ${
                    student.marks >= 33 ? "Active" : "Inactive"
                }">
                    ${getGrade(student.marks)}
                </span>
            </td>

        </tr>

    `).join("");

}


// ======================================
// 16. CSV EXPORT
// ======================================

document.getElementById("exportBtn").addEventListener(
    "click",
    function() {

        if (students.length === 0) {

            showToast("No students to export!");
            return;

        }

        const headers = [
            "ID",
            "Name",
            "Gender",
            "Email",
            "Phone",
            "Class",
            "Marks",
            "Grade",
            "Status"
        ];

        const rows = students.map(student => [

            student.id,
            student.name,
            student.gender,
            student.email,
            student.phone,
            student.className,
            student.marks,
            getGrade(student.marks),
            student.status

        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(value => 
                `"${String(value).replace(/"/g,'""')}"`
            ).join(","))
            .join("\r\n");

        const blob = new Blob(
            ["\uFeFF" + csvContent],
            { type: "text/csv;charset=utf-8;" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download ="students.csv";

        link.click();
        URL.revokeObjectURL(url);

        showToast("CSV Exported successfully");
    }
);


// ======================================
// 17. NAVIGATION
// ======================================

const navlinks = document.querySelectorAll(".nav-link");

navlinks.forEach(link => {

    link.addEventListener("click", function(e) {

        e.preventDefault();

        const pageName = this.dataset.page;

        document.querySelectorAll(".page").forEach(page =>{
                page.classList.remove("active");
            });

        document.getElementById(pageName).classList.add("active");

        navlinks.forEach(nav => {
            nav.classList.remove("active");
        });

        this.classList.add("active");

         const titles = {
            dashboard: "Dashboard",
            students: "Student Management",
            attendance: "Attendance",
            results: "Results"
        };

        document.getElementById("pageTitle").textContent =
            titles[pageName];

        if (pageName === "attendance") {
            renderAttendance();
        }

        if (pageName === "results") {
            renderResults();
        }

    });

});


// Dashboard View All button

document.querySelector('[data-go="students"]').addEventListener(
    "click",
    function() {

        document.querySelector('[data-page="students"]').click();

    }
);

// ======================================
// 18. DISPLAY CURRENT DATE
// ======================================

const today = new Date();

document.getElementById("todayDate").textContent =
    today.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

document.getElementById("attendanceDate").textContent =
    today.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // ======================================
// 19. RENDER ALL APPLICATION DATA
// ======================================

function renderAll() {

    renderStudents();

    renderDashboard();

    renderAttendance();

    renderResults();

}


// ======================================
// 20. INITIALIZE APPLICATION
// ======================================

renderAll();
loadStudents();