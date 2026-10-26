import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

// view — адаптер из dom-app.js. Контроллер не должен обращаться к document.
// Обязательные методы результата:
// start, applyFilters, refresh, submit, beginEdit, cancelEdit,
// toggleTask, deleteTask, resetData и destroy.
export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (!api || !view) {
    throw new TypeError("api и view обязательны");
  }

  const requiredApiMethods = [
    "loadInitialData",
    "getTasks",
    "createTask",
    "updateTask",
    "setTaskCompleted",
    "deleteTask",
    "resetDemoData",
  ];
  for (const method of requiredApiMethods) {
    if (typeof api[method] !== "function") {
      throw new TypeError(`api должен содержать метод ${method}`);
    }
  }

  const requiredViewMethods = [
    "setListState",
    "setTasks",
    "setCategories",
    "setTotal",
    "setFormTask",
    "showFormErrors",
    "setMutationPending",
    "notify",
  ];
  for (const method of requiredViewMethods) {
    if (typeof view[method] !== "function") {
      throw new TypeError(`view должен содержать метод ${method}`);
    }
  }

  let tasks = [];
  let categories = [];
  let filters = {};
  let editingId = null;
  let activeAbortController = null;
  let loadSeq = 0;

  async function loadData(isInitial = false) {
    if (activeAbortController) {
      activeAbortController.abort();
    }
    const controller = new AbortController();
    activeAbortController = controller;
    const currentSeq = ++loadSeq;

    view.setListState("loading", "Загрузка задач...");

    try {
      let result;
      if (isInitial || categories.length === 0) {
        result = await api.loadInitialData(filters, { signal: controller.signal });
        if (currentSeq !== loadSeq) return;
        categories = result.categories;
        view.setCategories(categories);
      } else {
        result = await api.getTasks(filters, { signal: controller.signal });
        if (currentSeq !== loadSeq) return;
      }

      tasks = result.tasks;
      const total = result.meta?.total ?? tasks.length;
      view.setTasks(tasks, categories);
      view.setTotal(total);

      if (tasks.length === 0) {
        view.setListState("empty", "Нет задач по выбранным условиям.");
      } else {
        view.setListState("ready");
      }
    } catch (error) {
      if (currentSeq !== loadSeq) return;
      if (error instanceof ApiError && error.kind === "aborted") {
        return;
      }
      view.setListState("error", messageForError(error));
    } finally {
      if (currentSeq === loadSeq) {
        activeAbortController = null;
      }
    }
  }

  async function performMutation(action) {
    view.setMutationPending(true);
    try {
      await action();
      await loadData(false);
    } catch (error) {
      view.notify(messageForError(error), "error");
    } finally {
      view.setMutationPending(false);
    }
  }

  async function start(initialFilters = {}) {
    filters = { ...initialFilters };
    await loadData(true);
  }

  async function applyFilters(newFilters) {
    filters = { ...newFilters };
    await loadData(false);
  }

  async function refresh() {
    await loadData(categories.length === 0);
  }

  async function submit(draft) {
    const validation = validateDraft(draft, categories);
    if (!validation.valid) {
      view.showFormErrors(validation.errors);
      return;
    }
    view.showFormErrors({});

    await performMutation(async () => {
      if (editingId === null) {
        await api.createTask(validation.value);
        view.notify("Задача создана.", "success");
        view.setFormTask(null);
      } else {
        await api.updateTask(editingId, validation.value);
        view.notify("Задача обновлена.", "success");
        editingId = null;
        view.setFormTask(null);
      }
    });
  }

  function beginEdit(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    editingId = id;
    view.setFormTask(task);
  }

  function cancelEdit() {
    editingId = null;
    view.setFormTask(null);
    view.showFormErrors({});
  }

  async function toggleTask(id) {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    await performMutation(async () => {
      await api.setTaskCompleted(id, !target.completed);
      view.notify("Статус задачи изменён.", "success");
    });
  }

  async function deleteTask(id) {
    await performMutation(async () => {
      await api.deleteTask(id);
      if (editingId === id) {
        editingId = null;
        view.setFormTask(null);
      }
      view.notify("Задача удалена.", "success");
    });
  }

  async function resetData() {
    await performMutation(async () => {
      await api.resetDemoData();
      view.notify("Данные сброшены к исходному набору.", "success");
    });
  }

  function destroy() {
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
  }

  return {
    start,
    applyFilters,
    refresh,
    submit,
    beginEdit,
    cancelEdit,
    toggleTask,
    deleteTask,
    resetData,
    destroy,
  };
}
