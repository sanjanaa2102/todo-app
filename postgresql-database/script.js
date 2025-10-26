const taskList = document.getElementById("taskList");
const logoutBtn = document.getElementById("logoutBtn");


const token = localStorage.getItem("token");


function handleAuthError(response) {
  if (response.status === 401 || response.status === 403) {
  
    localStorage.removeItem("token");
    window.location.href = "login.html"; 
    return true; 
  }
  return false;
}


logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

async function fetchTasks() {
  const res = await fetch("http://localhost:3000/tasks", {
    headers: {
      "Authorization": `Bearer ${token}` 
    }
  });

  if (handleAuthError(res)) return;

  const tasks = await res.json();
  renderTasks(tasks);
}

async function addTask() {
  const input = document.getElementById("taskInput");
  const priority = document.getElementById("priorityInput").value;
  const name = input.value.trim();
  if (!name) return;

  const res = await fetch("http://localhost:3000/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify({ name, priority })
  });

  if (handleAuthError(res)) return;

  input.value = "";
  fetchTasks();
}

function renderTasks(tasks) {
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "task";
    
    if (task.completed) {
      li.classList.add("completed");
    }

    const span = document.createElement("span");
    span.innerText = `${task.name} (${task.priority})`;
    
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.onclick = () => toggleTaskCompleted(task.id, task.name, task.priority, !task.completed);

    const actions = document.createElement("div");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.className = "edit";
    
    editBtn.onclick = () => editTask(task);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.onclick = () => deleteTask(task.id);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

async function deleteTask(id) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  const res = await fetch(`http://localhost:3000/tasks/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}` 
    }
  });

  if (handleAuthError(res)) return;
  fetchTasks();
}


async function editTask(task) {
  const newName = prompt("Edit task name:", task.name);
  if (!newName) return;
  
  const newPriority = prompt("Edit priority (High, Medium, Low):", task.priority);
  if (!newPriority) return; 

  const res = await fetch(`http://localhost:3000/tasks/${task.id}`, {
    method: "PUT", 
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify({
      name: newName,
      priority: newPriority,
      completed: task.completed 
    })
  });

  if (handleAuthError(res)) return;
  fetchTasks();
}


async function toggleTaskCompleted(id, name, priority, isCompleted) {
  const res = await fetch(`http://localhost:3000/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      name: name,
      priority: priority,
      completed: isCompleted
    })
  });

  if (handleAuthError(res)) return;
  fetchTasks();
}

if (!token) {
  window.location.href = "login.html"; 
} else {
  fetchTasks();
}
