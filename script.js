const API_BASE = "https://cloud-practice-6-api.fantomerika576.workers.dev";

const tasksContainer = document.getElementById("tasks");
const statsContainer = document.getElementById("stats");
const message = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");
const categoryFilter = document.getElementById("categoryFilter");

let allTasks = [];

function getCategoryName(task) {
  return task.category?.name || "Без категорії";
}

async function loadTasks() {
  message.textContent = "Завантаження завдань...";
  message.className = "";

  try {
    const response = await fetch(`${API_BASE}/api/tasks`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    allTasks = data.tasks;
    fillCategoryOptions();
    applyFilter();
  } catch (error) {
    message.textContent = `Помилка: ${error.message}`;
    message.className = "error";
  }
}

async function loadStats() {
  try {
    const response = await fetch(`${API_BASE}/api/stats`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const s = data.stats;

    statsContainer.innerHTML = `
      <div class="stat"><strong>Усього</strong><br>${s.total}</div>
      <div class="stat"><strong>Нові</strong><br>${s.new}</div>
      <div class="stat"><strong>У роботі</strong><br>${s.in_progress}</div>
      <div class="stat"><strong>Виконані</strong><br>${s.done}</div>
      <div class="stat"><strong>Пріоритет 3</strong><br>${s.high_priority}</div>
    `;
  } catch (error) {
    statsContainer.innerHTML = `<p class="error">Не вдалося завантажити статистику</p>`;
  }
}

// Індивідуальне завдання: dropdown з категоріями
function fillCategoryOptions() {
  const previous = categoryFilter.value;
  const names = [...new Set(allTasks.map(getCategoryName))].sort();

  categoryFilter.innerHTML = '<option value="all">Усі категорії</option>';
  for (const name of names) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    categoryFilter.appendChild(option);
  }

  if (names.includes(previous)) {
    categoryFilter.value = previous;
  }
}

function applyFilter() {
  const selected = categoryFilter.value;
  const filtered = selected === "all"
    ? allTasks
    : allTasks.filter(task => getCategoryName(task) === selected);

  renderTasks(filtered);
  message.textContent = `Показано: ${filtered.length} із ${allTasks.length}`;
  message.className = "";
}

function renderTasks(tasks) {
  tasksContainer.innerHTML = "";

  for (const task of tasks) {
    const card = document.createElement("article");
    card.className = `task priority-${task.priority}`;

    card.innerHTML = `
      <h3>${escapeHtml(task.title)}</h3>
      <p><strong>Категорія:</strong> ${escapeHtml(getCategoryName(task))}</p>
      <p><strong>Статус:</strong> ${escapeHtml(task.status)}</p>
      <p><strong>Пріоритет:</strong> ${task.priority}</p>
    `;

    tasksContainer.appendChild(card);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadAll() {
  await Promise.all([loadTasks(), loadStats()]);
}

refreshBtn.addEventListener("click", loadAll);
categoryFilter.addEventListener("change", applyFilter);

loadAll();
