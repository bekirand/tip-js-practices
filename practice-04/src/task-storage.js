export const STORAGE_VERSION = 1;

// Проверка структуры всего списка задач и уникальности идентификаторов
export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;

  const seenIds = new Set();
  for (const task of value) {
    if (!task || typeof task !== "object") return false;

    if (
      typeof task.id !== "number" ||
      !Number.isInteger(task.id) ||
      task.id <= 0 ||
      task.id > Number.MAX_SAFE_INTEGER
    ) {
      return false;
    }

    if (seenIds.has(task.id)) return false;
    seenIds.add(task.id);

    if (typeof task.title !== "string") return false;
    const trimmedTitle = task.title.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 100) return false;

    if (typeof task.completed !== "boolean") return false;

    if (
      typeof task.priority !== "string" ||
      !["low", "medium", "high"].includes(task.priority)
    ) {
      return false;
    }
  }

  return true;
}

// Загрузка задач из переданного хранилища с защитой от ошибок и повреждений
export function loadTasks(storage, key, fallbackTasks) {
  const fallbackCopy = fallbackTasks.map((task) => ({ ...task }));

  let raw;
  try {
    raw = storage.getItem(key);
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackCopy,
      error: `Ошибка чтения хранилища: ${error.message}`,
    };
  }

  if (raw === null || raw === undefined) {
    return {
      ok: true,
      source: "initial",
      tasks: fallbackCopy,
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackCopy,
      error: `Ошибка разбора JSON: ${error.message}`,
    };
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    parsed.version !== STORAGE_VERSION ||
    !isValidTaskList(parsed.tasks)
  ) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackCopy,
      error: "Некорректная структура или версия данных в хранилище",
    };
  }

  return {
    ok: true,
    source: "storage",
    tasks: parsed.tasks.map((task) => ({ ...task })),
  };
}

// Сохранение списка задач в хранилище в формате { version, tasks }
export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Некорректный список задач" };
  }

  try {
    storage.setItem(
      key,
      JSON.stringify({
        version: STORAGE_VERSION,
        tasks,
      })
    );
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Ошибка записи в хранилище: ${error.message}` };
  }
}

// Удаление сохранённого ключа из хранилища
export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Ошибка удаления из хранилища: ${error.message}` };
  }
}
