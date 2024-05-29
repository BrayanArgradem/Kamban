const $modal = document.getElementById("modal");
const $descriptionInput = document.getElementById("description");
const $priorityInput = document.getElementById("priority");
const $deadlineInput = document.getElementById("deadline");
const $columnInput = document.getElementById("column");
const $idInput = document.getElementById("idInput");

const $creationModeTitle = document.getElementById("creationModeTitle");
const $editingModeTitle = document.getElementById("editingModeTitle");

const $creationModeBtn = document.getElementById("creationModeBtn");
const $editingModeBtn = document.getElementById("editingModeBtn");

var tasks = localStorage.getItem("tasks");

var taskList = tasks ? JSON.parse(tasks) : [];

const $searchInput = document.getElementById("searchInput");
$searchInput.addEventListener("input", function () {
  const searchTerm = $searchInput.value.trim().toLowerCase();
  const allCards = document.querySelectorAll(".card");

  allCards.forEach((card) => {
    const cardTitle = card
      .querySelector(".info .title")
      .textContent.trim()
      .toLowerCase();
    if (cardTitle.includes(searchTerm)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});

generateCards();

function openModal(data_column) {
  $modal.style.display = "flex";

  $columnInput.value = data_column;

  $creationModeTitle.style.display = "block";
  $creationModeBtn.style.display = "block";

  $editingModeTitle.style.display = "none";
  $editingModeBtn.style.display = "none";
}

function openModalToEdit(id) {
  $modal.style.display = "flex";

  $creationModeTitle.style.display = "none";
  $creationModeBtn.style.display = "none";

  $editingModeTitle.style.display = "block";
  $editingModeBtn.style.display = "block";

  const index = taskList.findIndex(function (task) {
    return task.id == id;
  });

  const task = taskList[index];

  $idInput.value = task.id;
  $descriptionInput.value = task.description;
  $priorityInput.value = task.priority;
  $deadlineInput.value = task.deadline;
  $columnInput.value = task.column;
}

function closeModal() {
  $modal.style.display = "none";

  $idInput.value = "";
  $descriptionInput.value = "";
  $priorityInput.value = "";
  $deadlineInput.value = "";
  $columnInput.value = "";
}

function resetColumns() {
  document.querySelector('[data-column="1"] .body .cards_list').innerHTML = "";
  document.querySelector('[data-column="2"] .body .cards_list').innerHTML = "";
  document.querySelector('[data-column="3"] .body .cards_list').innerHTML = "";
  document.querySelector('[data-column="4"] .body .cards_list').innerHTML = "";
}

function generateCards() {
  resetColumns();

  taskList.forEach(function (task) {
    const formattedDate = moment(task.deadline).format("DD/MM/YYYY");
    const columnBody = document.querySelector(
      `[data-column="${task.column}"] .body .cards_list`
    );

    const card = `
      <div
        id="${task.id}"
        class="card ${task.priority}"
        ondblclick="openModalToEdit(${task.id})"
        draggable="true"
        ondragstart="dragstart_handler(event)"
      >
        <div class="info">
          <b>Titulo:</b>
          <span><span class="title">${task.description}</span></span>
        </div>

        <div class="info">
          <b>Prioridade:</b>
          <span><span class="priority">${task.priority}</span></span>
        </div>

        <div class="info">
          <b>Prazo:</b>
          <span><span class="date">${formattedDate}</span></span>
        </div>
      </div>
    `;

    columnBody.innerHTML += card;
  });
}

function createTask() {
  const newTask = {
    id: Math.floor(Math.random() * 9999999),
    description: $descriptionInput.value,
    priority: $priorityInput.value,
    deadline: $deadlineInput.value,
    column: $columnInput.value,
  };

  taskList.push(newTask);

  localStorage.setItem("tasks", JSON.stringify(taskList));

  closeModal();
  generateCards();
  updateCardCount(); // Adiciona esta linha para atualizar o contador após criar uma tarefa
}

function updateTask() {
  const task = {
    id: $idInput.value,
    description: $descriptionInput.value,
    priority: $priorityInput.value,
    deadline: $deadlineInput.value,
    column: $columnInput.value,
  };

  const index = taskList.findIndex(function (task) {
    return task.id == $idInput.value;
  });

  taskList[index] = task;

  localStorage.setItem("tasks", JSON.stringify(taskList));

  closeModal();
  generateCards();
  updateCardCount(); // Adiciona esta linha para atualizar o contador após editar uma tarefa
}

function changeColumn(task_id, column_id) {
  if (task_id && column_id) {
    taskList = taskList.map((task) => {
      if (task_id != task.id) return task;

      const originalColumn = task.column;

      task.column = column_id;

      if (originalColumn !== column_id) {
        const originalColumnElement = document.querySelector(
          `[data-column="${originalColumn}"]`
        );
        const originalColumnCardCount =
          originalColumnElement.querySelector(".card-count");
        if (originalColumnCardCount) {
          originalColumnCardCount.textContent =
            parseInt(originalColumnCardCount.textContent) - 1;
        }

        const columnElement = document.querySelector(
          `[data-column="${column_id}"]`
        );
        const columnCardCount = columnElement.querySelector(".card-count");
        if (columnCardCount) {
          columnCardCount.textContent =
            parseInt(columnCardCount.textContent) + 1;
        }
      }

      return task;
    });
  }

  localStorage.setItem("tasks", JSON.stringify(taskList));

  generateCards();
}

function updateCardCount() {
  const columns = document.querySelectorAll(".column");
  columns.forEach((column) => {
    const cardCount = column.querySelectorAll(".card").length;
    const columnCardCount = column.querySelector(".card-count");
    if (columnCardCount) {
      columnCardCount.textContent = cardCount;
    }
  });
}

function dragstart_handler(ev) {
  console.log(ev);

  ev.dataTransfer.setData("my_custom_data", ev.target.id);
  ev.dataTransfer.effectAllowed = "move";
}

function dragover_handler(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move";
}

function drop_handler(ev) {
  ev.preventDefault();

  const task_id = ev.dataTransfer.getData("my_custom_data");
  const column_id = ev.target.dataset.column;

  changeColumn(task_id, column_id);
}

window.addEventListener("unload", function () {
  localStorage.removeItem("tasks");
});
