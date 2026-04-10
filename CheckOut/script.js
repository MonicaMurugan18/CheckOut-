let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let streak = parseInt(localStorage.getItem("streak")) || 0;
let lastDate = localStorage.getItem("lastDate");

let todayObj = new Date();
let today = todayObj.toDateString();
let selectedDate = today;

// Initialize Display
document.getElementById("date").innerText = today;
document.getElementById("streak").innerText = streak;

// 💡 Daily Quotes
const quotes = ["Consistency beats motivation.", "Discipline creates freedom.", "Win the day.", "One task at a time."];
let quoteText = quotes[todayObj.getDate() % quotes.length];
let quoteEl = document.createElement("p");
quoteEl.innerText = "💡 " + quoteText;
document.querySelector(".info").appendChild(quoteEl);

// 🔥 Handle Streak & Date Migration
if (lastDate !== today) {
    tasks.forEach(task => {
        if (!task.completed && task.date === lastDate) task.date = today;
    });

    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    let yesterdayStr = yesterday.toDateString();
    let yesterdayTasks = tasks.filter(t => t.date === yesterdayStr);

    if (lastDate === yesterdayStr && yesterdayTasks.length > 0 && yesterdayTasks.every(t => t.completed)) {
        streak++;
    } else if (lastDate !== yesterdayStr) {
        streak = 0;
    }

    localStorage.setItem("lastDate", today);
    localStorage.setItem("streak", streak);
    document.getElementById("streak").innerText = streak;
}

function addTask() {
    let input = document.getElementById("taskInput");
    if (input.value.trim() === "") return;
    tasks.push({ text: input.value, completed: false, date: selectedDate, id: Date.now() });
    input.value = "";
    save();
}

function loadCalendar() {
    let cal = document.getElementById("calendar");
    cal.innerHTML = "";
    let month = todayObj.getMonth();
    let year = todayObj.getFullYear();

    for (let i = 1; i <= 31; i++) {
        let day = new Date(year, month, i);
        if (day.getMonth() !== month) break; // Stop at end of month

        let dayString = day.toDateString();
        let div = document.createElement("div");
        div.innerText = i;
        if (dayString === selectedDate) div.classList.add("active");

        div.onclick = () => {
            selectedDate = dayString;
            document.getElementById("date").innerText = selectedDate; // THE FIX: Update header text
            loadCalendar();
            renderTasks();
        };
        cal.appendChild(div);
    }
}

function renderTasks() {
    let list = document.getElementById("taskList");
    list.innerHTML = "";
    let filtered = tasks.filter(t => t.date === selectedDate);

    filtered.forEach((task) => {
        let div = document.createElement("div");
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <span>${task.text}</span>
            <div>
                <button onclick="toggleTask(${task.id})"><i class="fa-solid fa-check"></i></button>
                <button onclick="deleteTask(${task.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        list.appendChild(div);
    });

    let completedCount = filtered.filter(t => t.completed).length;
    let progress = filtered.length === 0 ? 0 : (completedCount / filtered.length) * 100;
    document.getElementById("progress").style.width = progress + "%";
}

// Logic using IDs instead of indexes to prevent array mismatch
function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    save();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
}

function aiSuggest() {
    let suggestions = ["Study for 1 hour", "Workout 20 mins", "Practice coding", "Read 10 pages"];
    document.getElementById("taskInput").value = suggestions[Math.floor(Math.random() * suggestions.length)];
}

function setTheme(i) {
    const themes = ["linear-gradient(120deg,#1f1f1f,#0f4c75)", "linear-gradient(120deg,#6a0572,#ab83a1)", "linear-gradient(120deg,#1b262c,#0f4c75)"];
    document.body.style.background = themes[i];
}

function save() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

loadCalendar();
renderTasks();