function getData(key) {
    return JSON.parse(localStorage.getItem(key) || "[]");
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// LOGIN
function login(event) {
    event.preventDefault();

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value;
    let role = document.getElementById("role").value;

    if (role === "admin" && username === "admin" && password === "admin123") {
        localStorage.setItem("currentUser", JSON.stringify({ name: "Admin", role: "admin" }));
        window.location.href = "admin.html";
        return;
    }

    let users = getData("users");
    let user = users.find(function(u) {
        return u.username === username && u.password === password && role === "student";
    });

    if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = "student.html";
    } else {
        document.getElementById("message").textContent = "Invalid username or password";
    }
}

// FIRST-TIME SIGNUP
function signup(event) {
    event.preventDefault();

    let name = document.getElementById("name").value.trim();
    let studentId = document.getElementById("studentId").value.trim();
    let username = document.getElementById("newUsername").value.trim();
    let password = document.getElementById("newPassword").value;

    let users = getData("users");
    let exists = users.find(function(u) {
        return u.username === username || u.studentId === studentId;
    });

    if (exists) {
        document.getElementById("message").textContent = "Username or Student ID already exists";
        return;
    }

    users.push({
        name: name,
        studentId: studentId,
        username: username,
        password: password,
        role: "student"
    });

    saveData("users", users);
    document.getElementById("message").textContent = "Account created! You can now login.";
    event.target.reset();
}

function checkUser(role) {
    let user = JSON.parse(localStorage.getItem("currentUser") || "null");

    if (!user || user.role !== role) {
        window.location.href = "index.html";
        return null;
    }
    return user;
}

// STUDENT DASHBOARD
function showStudent() {
    let user = checkUser("student");
    if (!user) return;

    document.getElementById("studentName").textContent = "Name: " + user.name;
    document.getElementById("studentId").textContent = "Student ID: " + user.studentId;

    showAnnouncements();
    showMyComplaints(user);
}

function addComplaint(event) {
    event.preventDefault();

    let user = checkUser("student");
    if (!user) return;

    let text = document.getElementById("complaint").value.trim();
    if (text === "") return;

    let complaints = getData("complaints");
    complaints.push({ name: user.name, studentId: user.studentId, text: text });
    saveData("complaints", complaints);

    document.getElementById("complaint").value = "";
    document.getElementById("result").textContent = "Complaint submitted successfully!";
    showMyComplaints(user);
}

function showMyComplaints(user) {
    let list = document.getElementById("myComplaints");
    if (!list) return;

    list.innerHTML = "";
    getData("complaints").forEach(function(c) {
        if (c.studentId === user.studentId) {
            let item = document.createElement("li");
            item.textContent = c.text;
            list.appendChild(item);
        }
    });
}

// ADMIN DASHBOARD
function showAdmin() {
    if (!checkUser("admin")) return;

    let studentList = document.getElementById("studentList");
    studentList.innerHTML = "";

    getData("users").forEach(function(user) {
        let item = document.createElement("li");
        item.textContent = user.name + " - " + user.studentId;
        studentList.appendChild(item);
    });

    let complaintList = document.getElementById("complaintList");
    complaintList.innerHTML = "";

    getData("complaints").forEach(function(c) {
        let item = document.createElement("li");
        item.textContent = c.name + " (" + c.studentId + "): " + c.text;
        complaintList.appendChild(item);
    });

    showAnnouncements();
}

function addAnnouncement(event) {
    event.preventDefault();

    if (!checkUser("admin")) return;

    let text = document.getElementById("announcement").value.trim();
    if (text === "") return;

    let announcements = getData("announcements");
    announcements.push(text);
    saveData("announcements", announcements);

    document.getElementById("announcement").value = "";
    document.getElementById("result").textContent = "Announcement posted successfully!";
    showAnnouncements();
}

function showAnnouncements() {
    let announcements = getData("announcements");
    let studentList = document.getElementById("announcementList");
    let adminList = document.getElementById("adminAnnouncements");

    if (studentList) studentList.innerHTML = "";
    if (adminList) adminList.innerHTML = "";

    announcements.forEach(function(text) {
        if (studentList) {
            let item = document.createElement("li");
            item.textContent = text;
            studentList.appendChild(item);
        }
        if (adminList) {
            let item = document.createElement("li");
            item.textContent = text;
            adminList.appendChild(item);
        }
    });
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// RUN THE CORRECT PAGE FUNCTION
if (window.location.pathname.endsWith("student.html")) {
    showStudent();
}

if (window.location.pathname.endsWith("admin.html")) {
    showAdmin();
}
