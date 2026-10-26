const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Чистая проверка данных формы. DOM и показ сообщений выполняются в main.js.
// draft: { id, title, priority }; editingId: null либо id редактируемой задачи.
export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  let validId = null;

  if (editingId !== null && editingId !== undefined) {
    const existing = tasks.find((t) => t.id === editingId);
    if (!existing) {
      errors.id = "Редактируемая задача не найдена";
    } else {
      validId = editingId;
    }
  } else {
    if (draft.id === undefined || draft.id === null) {
      errors.id = "Укажите корректный идентификатор";
    } else {
      const raw = typeof draft.id === "string" ? draft.id.trim() : draft.id;
      if (raw === "") {
        errors.id = "Идентификатор обязателен";
      } else {
        const num = Number(raw);
        if (!Number.isInteger(num) || num <= 0 || num > Number.MAX_SAFE_INTEGER) {
          errors.id = "Идентификатор должен быть положительным целым числом";
        } else if (tasks.some((t) => t.id === num)) {
          errors.id = "Задача с таким идентификатором уже существует";
        } else {
          validId = num;
        }
      }
    }
  }

  let validTitle = null;
  if (typeof draft.title !== "string") {
    errors.title = "Название задачи должно быть строкой";
  } else {
    const trimmed = draft.title.trim();
    if (trimmed.length < 1 || trimmed.length > 100) {
      errors.title = "Длина названия задачи должна быть от 1 до 100 символов";
    } else {
      validTitle = trimmed;
    }
  }

  let validPriority = null;
  if (typeof draft.priority !== "string" || !ALLOWED_PRIORITIES.has(draft.priority)) {
    errors.priority = "Приоритет должен быть одним из: low, medium, high";
  } else {
    validPriority = draft.priority;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      id: validId,
      title: validTitle,
      priority: validPriority,
    },
  };
}
