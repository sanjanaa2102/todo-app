let tasks = [];
const taskList = document.getElementById("taskList");

function addTask() {
  const input = document.getElementById("taskInput");
  const taskName = input.value.trim();
  if (taskName === "") return;

  const task = {
    id: Date.now(),
    name: taskName
  };
  tasks.push(task);
  input.value = "";
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task";

    const span = document.createElement("span");
    span.innerText = task.name;

    const actions = document.createElement("div");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.innerText = "Edit";
    editBtn.className = "edit";
    editBtn.onclick = () => editTask(task.id);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "Delete";
    deleteBtn.onclick = () => deleteTask(task.id);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(actions);
    taskList.appendChild(li);
  });
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  renderTasks();
}

function editTask(id) {
  const task = tasks.find((t) => t.id === id);
  const newName = prompt("Edit task name:", task.name);
  if (newName !== null && newName.trim() !== "") {
    task.name = newName.trim();
    renderTasks();
  }
}
