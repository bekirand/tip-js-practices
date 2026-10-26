import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isTask(value) {
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

function isCategory(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      isPositiveSafeInteger(value.id) &&
      typeof value.name === "string" &&
      value.name.trim().length >= 1 &&
      value.name.trim().length <= 100
  );
}

// client — объект, созданный createApiClient.
// Контракт результата:
// getTasks(filters) -> Promise<{ tasks, meta }>
// getTaskById(id) -> Promise<task>
// getCategories() -> Promise<category[]>
// loadInitialData(filters) -> Promise<{ tasks, categories, meta }>
export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("client.requestJson должен быть функцией");
  }

  async function getTasks(filters = {}) {
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

    const response = await client.requestJson("/tasks", { query });

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

  async function getTaskById(id) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("Идентификатор задачи должен быть положительным целым числом");
    }

    const response = await client.requestJson(`/tasks/${id}`);

    if (!response || typeof response !== "object" || !isTask(response.data)) {
      throw invalidResponse("Некорректная структура задачи в ответе");
    }

    return response.data;
  }

  async function getCategories() {
    const response = await client.requestJson("/categories");

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

  async function loadInitialData(filters = {}) {
    const tasksPromise = getTasks(filters);
    const categoriesPromise = getCategories();

    const [tasksResult, categories] = await Promise.all([tasksPromise, categoriesPromise]);

    return {
      tasks: tasksResult.tasks,
      categories,
      meta: tasksResult.meta,
    };
  }

  return {
    getTasks,
    getTaskById,
    getCategories,
    loadInitialData,
  };
}
