const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Возвращает { valid, value, errors }.
// value содержит нормализованные title, priority и числовой categoryId.
export function validateTaskDraft(draft, categories = []) {
  const errors = {};

  let validTitle = null;
  if (typeof draft?.title !== "string" || draft.title.trim().length < 1 || draft.title.trim().length > 100) {
    errors.title = "Название должно содержать от 1 до 100 символов";
  } else {
    validTitle = draft.title.trim();
  }

  let validPriority = null;
  if (typeof draft?.priority !== "string" || !ALLOWED_PRIORITIES.has(draft.priority)) {
    errors.priority = "Приоритет должен быть low, medium или high";
  } else {
    validPriority = draft.priority;
  }

  let validCategoryId = null;
  const rawCatId = draft?.categoryId;
  const parsedCatId = Number(rawCatId);
  if (
    rawCatId === "" ||
    rawCatId === null ||
    rawCatId === undefined ||
    !Number.isSafeInteger(parsedCatId) ||
    parsedCatId <= 0 ||
    !categories.some((cat) => cat.id === parsedCatId)
  ) {
    errors.categoryId = "Выберите существующую категорию";
  } else {
    validCategoryId = parsedCatId;
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    value: valid
      ? {
          title: validTitle,
          priority: validPriority,
          categoryId: validCategoryId,
        }
      : null,
    errors,
  };
}
