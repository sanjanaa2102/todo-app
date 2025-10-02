const taskList = document.getElementById("taskList");

async function fetchTasks() {
  const res = await fetch("http://localhost:3000/tasks");
  const tasks = await res.json();
  renderTasks(tasks);
}

async function addTask() {
  const input = document.getElementById("taskInput");
  const priority = document.getElementById("priorityInput").value;
  const name = input.value.trim();
  if (!name) return;

  await fetch("http://localhost:3000/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, priority })
  });

  input.value = "";
  fetchTasks();
}

function renderTasks(tasks) {
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task";

    const span = document.createElement("span");
    span.innerText = `${task.name} (${task.priority})`;

    const actions = document.createElement("div");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.className = "edit";
    editBtn.onclick = () => editTask(task._id);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.onclick = () => deleteTask(task._id);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

async function deleteTask(id) {
  await fetch(`http://localhost:3000/tasks/${id}`, { method: "DELETE" });
  fetchTasks();
}

async function editTask(id) {
  const newName = prompt("Edit task name:");
  const newPriority = prompt("Edit priority (High, Medium, Low):", "Medium");
  if (!newName) return;

  await fetch(`http://localhost:3000/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newName, priority: newPriority })
  });
  fetchTasks();
}

// Load tasks on startup
fetchTasks();


