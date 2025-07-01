const listInput = document.querySelector(".list-input");
const completedList = document.querySelector(".completed-list");
const uncompletedList = document.querySelector(".uncompleted-list");
const prioritySelect = document.querySelector(".priority-select");
const priorityFilter = document.querySelector(".priority-filter");
const prioritySortBtn = document.querySelector(".priority-sort");

const popAudio = new Audio("audios/pop.mp3");
popAudio.playbackRate = 1.75;
const yayAudio = new Audio("audios/yay.mp3");
yayAudio.playbackRate = 2;

let listItems = [];
let currentPriorityFilter = "All";
let isPrioritySorted = false;

window.onload = () => {
  let storageToDoItems = localStorage.getItem("listItems");
  if (storageToDoItems != null) {
    listItems = JSON.parse(storageToDoItems);
  }
  renderList();
};

listInput.onkeyup = (e) => {
  /**
   * let val: This declares a new variable called val using the let keyword. Variables declared with let are block-scoped and can be reassigned later.
   * e.target: This refers to the target property of the event object e. In an event handler, the target usually represents the DOM element that triggered the event.
   * .val: This appears to be an attempt to access a property or method called val on the target element. The purpose of this part of the code is not entirely clear without additional context.
   * .replace(/^\s+/, ""): This is a regular expression-based replacement operation applied to the value obtained from e.target.val. It is attempting to remove any leading whitespace characters from the string.
   */
  let val = e.target.value.replace(/^\s+/, "");
  if (val && e.keyCode == 13 /* Enter key */) {
    addToDoItem(val, prioritySelect.value);
    listInput.value = ""; // resetting the input box for the next to do entry
  }
};

function addToDoItem(textInput, priority) {
  listItems.push({
    id: Date.now(),
    textInput,
    isComplete: false,
    priority: priority || "Medium",
  });

  saveAndRender();
  console.log(listItems);
}

function removeToDoItem(id) {
  listItems = listItems.filter((todo) => todo.id !== Number(id));
  saveAndRender();
}

function markAsCompleted(id) {
  listItems = listItems.filter((todo) => {
    if (todo.id === Number(id)) {
      todo.isComplete = true;
    }
    return todo;
  });
  yayAudio.play();
  saveAndRender();
  
  // Trigger confetti
  launchConfetti();
}

function markAsUncompleted(id) {
  listItems = listItems.filter((todo) => {
    if (todo.id === Number(id)) {
      todo.isComplete = false;
    }
    return todo;
  });
  saveAndRender();
}

// saving in local storage
function save() {
  localStorage.setItem("listItems", JSON.stringify(listItems));
}

// Rendering
function renderList() {
  let filteredItems = listItems.filter(item => {
    if (currentPriorityFilter === "All") return true;
    return item.priority === currentPriorityFilter;
  });

  if (isPrioritySorted) {
    filteredItems = filteredItems.slice().sort((a, b) => priorityValue(b.priority) - priorityValue(a.priority));
  }

  let uncompletedToDos = filteredItems.filter((item) => !item.isComplete);
  let completedToDos = filteredItems.filter((item) => item.isComplete);

  completedList.innerHTML = "";
  uncompletedList.innerHTML = "";

  if (uncompletedToDos.length >= 1) {
    uncompletedToDos.forEach((todo) => {
      uncompletedList.append(buildToDoItem(todo));
    });
  } else {
    uncompletedList.innerHTML = `<div class='empty'>No tasks in progress...</div>`;
  }

  if (completedToDos.length >= 1) {
    completedList.innerHTML = `<div class='completed-title'>Completed: (${completedToDos.length} / ${filteredItems.length})</div>`;

    completedToDos.forEach((todo) => {
      completedList.append(buildToDoItem(todo));
    });
  }
}

function saveAndRender() {
  save();
  renderList();
}

function priorityValue(priority) {
  switch(priority) {
    case "High": return 3;
    case "Medium": return 2;
    case "Low": return 1;
    default: return 0;
  }
}

// Building the to do list items
function buildToDoItem(todo) {
  // creating to do list item containers
  const theToDo = document.createElement("div");
  theToDo.setAttribute("data-id", todo.id);
  theToDo.className = "list-items";

  // Main row: checkbox, text, X icon
  const mainRow = document.createElement("div");
  mainRow.className = "main-row";
  mainRow.style.display = "flex";
  mainRow.style.alignItems = "center";
  mainRow.style.justifyContent = "space-between";
  mainRow.style.width = "100%";

  // Left: checkbox + text
  const leftGroup = document.createElement("span");
  leftGroup.style.display = "flex";
  leftGroup.style.alignItems = "center";
  leftGroup.style.gap = "0.75rem";
  leftGroup.style.minWidth = "0";
  leftGroup.style.wordBreak = "break-word";
  leftGroup.style.flex = "1 1 0";
  leftGroup.className = (todo.textInput || '').length > 40 ? 'long-text' : '';

  // checkbox for list
  const toDoInputCheckBox = document.createElement("input");
  toDoInputCheckBox.type = "checkbox";
  toDoInputCheckBox.checked = todo.isComplete;
  toDoInputCheckBox.onclick = (e) => {
    let id = e.target.closest(".list-items").dataset.id;
    e.target.checked ? markAsCompleted(id) : markAsUncompleted(id);
  };

  // text
  const toDoText = document.createElement("span");
  toDoText.textContent = todo.textInput;
  toDoText.style.flex = "1 1 0";
  toDoText.style.wordBreak = "break-word";

  leftGroup.appendChild(toDoInputCheckBox);
  leftGroup.appendChild(toDoText);

  // delete button
  const toDoRemove = document.createElement("a");
  toDoRemove.href = "#";
  toDoRemove.innerHTML = `<svg
  xmlns="http://www.w3.org/2000/svg"
  class="icon icon-tabler icon-tabler-x"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  stroke-width="2"
  stroke="currentColor"
  fill="none"
  stroke-linecap="round"
  stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <path d="M18 6l-12 12"></path>
  <path d="M6 6l12 12"></path>
</svg>`;
  toDoRemove.onclick = (e) => {
    let id = e.target.closest(".list-items").dataset.id;
    popAudio.play();
    removeToDoItem(id);
  };

  mainRow.appendChild(leftGroup);
  mainRow.appendChild(toDoRemove);

  // Second row: priority badge
  const priorityBadge = document.createElement("span");
  priorityBadge.className = `priority-badge priority-${(todo.priority || "Medium").toLowerCase()}`;
  priorityBadge.innerText = todo.priority || "Medium";
  priorityBadge.style.marginTop = "0.5rem";

  theToDo.appendChild(mainRow);
  theToDo.appendChild(priorityBadge);

  return theToDo;
}

// Priority filter and sort event listeners
priorityFilter.addEventListener("change", (e) => {
  currentPriorityFilter = e.target.value;
  renderList();
});

prioritySortBtn.addEventListener("click", () => {
  isPrioritySorted = !isPrioritySorted;
  prioritySortBtn.textContent = isPrioritySorted ? "Unsort" : "Sort by Priority";
  renderList();
});

// Confetti animation
function launchConfetti() {
  confettiBurst('confetti-left', 'right');
  confettiBurst('confetti-right', 'left');
}

function confettiBurst(canvasId, direction) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = window.innerWidth / 2;
  const H = canvas.height = window.innerHeight;
  const confettiCount = 80;
  const confetti = [];
  const colors = ['#f7b801', '#ea5455', '#7367f0', '#32ccbc', '#f6416c', '#43e97b', '#38f9d7', '#fbc2eb', '#fd6e6a'];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: direction === 'right' ? 0 : W,
      y: H,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngleIncremental: (Math.random() * 0.07) + .05,
      tiltAngle: 0,
      vx: (direction === 'right' ? 1 : -1) * (Math.random() * 4 + 2),
      vy: -(Math.random() * 4 + 4)
    });
  }
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < confetti.length; i++) {
      let c = confetti[i];
      ctx.beginPath();
      ctx.lineWidth = c.r;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 3);
      ctx.stroke();
    }
    update();
    frame++;
    if (frame < 70) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }
  function update() {
    for (let i = 0; i < confetti.length; i++) {
      let c = confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.tiltAngle += c.tiltAngleIncremental;
      c.tilt = Math.sin(c.tiltAngle) * 15;
    }
  }
  draw();
}
