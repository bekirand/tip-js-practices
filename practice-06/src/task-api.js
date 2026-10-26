import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      isPositiveSafeInteger(value.id) &&
      typeof value.title === "string" &&
      value.title.trim().length >= 1 &&
      value.title.trim().length <= 100 &&
      typeof value.completed === "boolean" &&
      ALLOWED_PRIORITIES.has(value.priority) &&
      isPositiveSafeInteger(value.categoryId)
  );
}

export function isCategory(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      isPositiveSafeInteger(value.id) &&
      typeof value.name === "string" &&
      value.name.trim().length >= 1 &&
      value.name.trim().length <= 100
  );
}

// Методы результата:
// getTasks, getTaskById, getCategories, loadInitialData, createTask, updateTask,
// setTaskCompleted, deleteTask и resetDemoData.
// Последний аргумент каждого метода данных — { signal }.
export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("client.requestJson должен быть функцией");
  }

  async function getTasks(filters = {}, options = {}) {
    if (filters === null || typeof filters !== "object" || Array.isArray(filters)) {
      throw new TypeError("filters должен быть объектом");
    }

    for (const key of Object.keys(filters)) {
      if (!ALLOWED_FILTERS.has(key)) {
        throw new TypeError(`Неизвестный параметр фильтрации: ${key}`);
      }
    }

    const query = {};

    if ("completed" in filters) {
      if (typeof filters.completed !== "boolean") {
        throw new TypeError("Параметр completed должен быть логическим значением");
      }
      query.completed = filters.completed;
    }

    if ("priority" in filters) {
      if (typeof filters.priority !== "string" || !ALLOWED_PRIORITIES.has(filters.priority)) {
        throw new TypeError("Параметр priority должен быть low, medium или high");
      }
      query.priority = filters.priority;
    }

    if ("categoryId" in filters) {
      if (!isPositiveSafeInteger(filters.categoryId)) {
        throw new TypeError("Параметр categoryId должен быть положительным целым числом");
      }
      query.categoryId = filters.categoryId;
    }

    if ("q" in filters) {
      if (typeof filters.q !== "string" || filters.q.length > 100) {
        throw new TypeError("Параметр q должен быть строкой длиной до 100 символов");
      }
      query.q = filters.q.trim();
    }

    const response = await client.requestJson("/tasks", { query, signal: options?.signal });

    if (
      !response ||
      typeof response !== "object" ||
      !Array.isArray(response.data) ||
      !response.meta ||
      typeof response.meta !== "object" ||
      typeof response.meta.total !== "number" ||
      response.meta.total !== response.data.length
    ) {
      throw invalidResponse("Некорректная схема ответа коллекции задач");
    }

    const seenIds = new Set();
    for (const item of response.data) {
      if (!isTask(item) || seenIds.has(item.id)) {
        throw invalidResponse("Некорректная задача в коллекции или дублирующийся id");
      }
      seenIds.add(item.id);
    }

    return {
      tasks: response.data,
      meta: response.meta,
    };
  }

  async function getTaskById(id, options = {}) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("Идентификатор задачи должен быть положительным целым числом");
    }

    const response = await client.requestJson(`/tasks/${id}`, { signal: options?.signal });

    if (!response || typeof response !== "object" || !isTask(response.data)) {
      throw invalidResponse("Некорректная структура задачи в ответе");
    }

    return response.data;
  }

  async function getCategories(options = {}) {
    const response = await client.requestJson("/categories", { signal: options?.signal });

    if (
      !response ||
      typeof response !== "object" ||
      !Array.isArray(response.data) ||
      !response.meta ||
      typeof response.meta !== "object" ||
      typeof response.meta.total !== "number" ||
      response.meta.total !== response.data.length
    ) {
      throw invalidResponse("Некорректная схема ответа категорий");
    }

    const seenIds = new Set();
    for (const item of response.data) {
      if (!isCategory(item) || seenIds.has(item.id)) {
        throw invalidResponse("Некорректная категория или дублирующийся id");
      }
      seenIds.add(item.id);
    }

    return response.data;
  }

  async function loadInitialData(filters = {}, options = {}) {
    const tasksPromise = getTasks(filters, options);
    const categoriesPromise = getCategories(options);

    const [tasksResult, categories] = await Promise.all([tasksPromise, categoriesPromise]);

    return {
      tasks: tasksResult.tasks,
      categories,
      meta: tasksResult.meta,
    };
  }

  async function createTask(draft, options = {}) {
    const response = await client.requestJson("/tasks", {
      method: "POST",
      body: draft,
      signal: options?.signal,
    });

    if (!response || typeof response !== "object" || !isTask(response.data)) {
      throw invalidResponse("Некорректная структура созданной задачи");
    }

    return response.data;
  }

  async function updateTask(id, changes, options = {}) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("Идентификатор задачи должен быть положительным целым числом");
    }

    const response = await client.requestJson(`/tasks/${id}`, {
      method: "PATCH",
      body: changes,
      signal: options?.signal,
    });

    if (!response || typeof response !== "object" || !isTask(response.data)) {
      throw invalidResponse("Некорректная структура обновленной задачи");
    }

    return response.data;
  }

  async function setTaskCompleted(id, completed, options = {}) {
    if (typeof completed !== "boolean") {
      throw new TypeError("Параметр completed должен быть логическим значением");
    }
    return updateTask(id, { completed }, options);
  }

  async function deleteTask(id, options = {}) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("Идентификатор задачи должен быть положительным целым числом");
    }

    const response = await client.requestJson(`/tasks/${id}`, {
      method: "DELETE",
      signal: options?.signal,
    });

    if (response !== null) {
      throw invalidResponse("Ожидался ответ 204 без тела");
    }

    return null;
  }

  async function resetDemoData(options = {}) {
    const response = await client.requestJson("/debug/reset", {
      method: "POST",
      signal: options?.signal,
    });

    if (!response || typeof response !== "object" || !response.data?.reset) {
      throw invalidResponse("Некорректный ответ сброса данных");
    }

    return response.data;
  }

  return {
    getTasks,
    getTaskById,
    getCategories,
    loadInitialData,
    createTask,
    updateTask,
    setTaskCompleted,
    deleteTask,
    resetDemoData,
  };
}
