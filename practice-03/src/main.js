import { demoTasks, variantTasks, variantNumber } from "./data.js";
import { findTaskById, setTaskCompleted, removeTask } from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import { renderTaskList, renderSummary, renderEmptyState } from "./task-view.js";

const elements = {
  list: document.querySelector("#task-list"),
  filters: document.querySelector("#task-filters"),
  summary: document.querySelector("#task-summary"),
  empty: document.querySelector("#empty-message"),
  message: document.querySelector("#operation-message"),
  datasetLabel: document.querySelector("#dataset-label"),
};

// Служебное переключение набора данных через query-параметр
const isVariant = new URLSearchParams(window.location.search).get("dataset") === "variant";
const initialTasks = isVariant ? variantTasks : demoTasks;
let currentTasks = initialTasks.map((task) => ({ ...task }));
let currentFilter = "all";

elements.datasetLabel.textContent = isVariant
  ? `Индивидуальный вариант: ${variantNumber ?? "не указан"}`
  : "Общий контрольный набор";

// Согласованное обновление представления
function renderApp() {
  const visibleTasks = getVisibleTasks(currentTasks, currentFilter);

  renderTaskList(elements.list, visibleTasks);
  renderSummary(elements.summary, currentTasks, visibleTasks.length);
  renderEmptyState(elements.empty, currentTasks.length, visibleTasks.length);

  const filterButtons = elements.filters.querySelectorAll("button[data-filter]");
  for (const button of filterButtons) {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
}

// Делегированный обработчик действий со списком задач
function handleTaskListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button || !elements.list.contains(button)) {
    return;
  }

  const action = button.dataset.action;
  if (action !== "toggle" && action !== "delete") {
    return;
  }

  const card = button.closest("li[data-task-id]");
  if (!card) {
    return;
  }

  const id = Number(card.dataset.taskId);
  if (!Number.isInteger(id) || id <= 0) {
    elements.message.textContent = "Некорректный идентификатор задачи";
    return;
  }

  if (action === "toggle") {
    const task = findTaskById(currentTasks, id);
    if (!task) {
      elements.message.textContent = "Задача не найдена";
      return;
    }
    const result = setTaskCompleted(currentTasks, id, !task.completed);
    if (!result.ok) {
      elements.message.textContent = result.error;
      return;
    }
    currentTasks = result.tasks;
    elements.message.textContent = "";
    renderApp();
    restoreTaskFocus(id, action);
  } else if (action === "delete") {
    const result = removeTask(currentTasks, id);
    if (!result.ok) {
      elements.message.textContent = result.error;
      return;
    }
    currentTasks = result.tasks;
    elements.message.textContent = "";
    renderApp();
    restoreTaskFocus(id, action);
  }
}

// Обработчик переключения фильтров отображения
function handleFilterClick(event) {
  const button = event.target.closest("button[data-filter]");
  if (!button || !elements.filters.contains(button)) {
    return;
  }

  const filter = button.dataset.filter;
  if (!["all", "pending", "completed"].includes(filter)) {
    return;
  }

  currentFilter = filter;
  elements.message.textContent = "";
  renderApp();
}

// Восстановление позиции фокуса доступности после рендера
function restoreTaskFocus(id, action) {
  const actionButton = elements.list.querySelector(
    `[data-task-id="${id}"] button[data-action="${action}"]`,
  );
  const filterButton = elements.filters.querySelector(`[data-filter="${currentFilter}"]`);
  (actionButton ?? filterButton)?.focus();
}

// Единовременная подписка на события контейнеров
elements.list.addEventListener("click", handleTaskListClick);
elements.filters.addEventListener("click", handleFilterClick);

try {
  renderApp();
} catch (error) {
  elements.message.textContent = `Ошибка запуска: ${error.message}`;
  console.error(error);
}
