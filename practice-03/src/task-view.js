import { getTaskStats } from "./task-service.js";

// Словарь отображения приоритетов задач
const priorityLabels = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

// Создание одного DOM-элемента карточки задачи
export function createTaskElement(task) {
  const card = document.createElement("li");
  card.className = "task-card";
  card.dataset.taskId = String(task.id);

  if (task.completed) {
    card.classList.add("is-completed");
  }

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Выполнена" : "В работе";

  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = priorityLabels[task.priority] ?? task.priority;

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.dataset.action = "toggle";
  toggleBtn.setAttribute("aria-pressed", String(task.completed));
  const toggleLabel = document.createElement("span");
  toggleLabel.className = "action-label";
  toggleLabel.textContent = "Выполнена";
  toggleBtn.append(toggleLabel);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.dataset.action = "delete";
  const deleteLabel = document.createElement("span");
  deleteLabel.className = "action-label";
  deleteLabel.textContent = "Удалить";
  deleteBtn.append(deleteLabel);

  actions.append(toggleBtn, deleteBtn);
  card.append(title, status, priority, actions);

  return card;
}

// Отрисовка списка карточек внутри переданного элемента
export function renderTaskList(listElement, tasks) {
  const cards = tasks.map((task) => createTaskElement(task));
  listElement.replaceChildren(...cards);
}

// Обновление сводной информации по всему списку
export function renderSummary(summaryElement, tasks, visibleCount) {
  const stats = getTaskStats(tasks);

  const totalEl = summaryElement.querySelector('[data-stat="total"]');
  const completedEl = summaryElement.querySelector('[data-stat="completed"]');
  const pendingEl = summaryElement.querySelector('[data-stat="pending"]');
  const progressEl = summaryElement.querySelector('[data-stat="progress"]');
  const visibleEl = summaryElement.querySelector('[data-stat="visible"]');

  if (totalEl) totalEl.textContent = String(stats.total);
  if (completedEl) completedEl.textContent = String(stats.completed);
  if (pendingEl) pendingEl.textContent = String(stats.pending);
  if (progressEl) progressEl.textContent = `${stats.progress.toFixed(1)}%`;
  if (visibleEl) visibleEl.textContent = String(visibleCount);
}

// Отображение пустого состояния списка
export function renderEmptyState(messageElement, total, visibleCount) {
  if (visibleCount > 0) {
    messageElement.textContent = "";
    messageElement.hidden = true;
  } else if (total === 0) {
    messageElement.textContent = "Список задач пуст.";
    messageElement.hidden = false;
  } else {
    messageElement.textContent = "Нет задач по выбранному фильтру.";
    messageElement.hidden = false;
  }
}
