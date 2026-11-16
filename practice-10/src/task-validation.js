import { ApiError } from './errors.js';

const ALLOWED_PRIORITIES = new Set(['low', 'medium', 'high']);

// Проверка и нормализация входящего JSON-объекта задачи для POST и PATCH.
export function validateTaskInput(value, { partial = false, categoryIds } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    const details = Object.create(null);
    details.body = 'Тело запроса должно быть JSON-объектом.';
    throw new ApiError(400, 'VALIDATION_ERROR', 'Некорректный формат тела запроса.', details);
  }

  const details = Object.create(null);
  const allowedFields = partial
    ? new Set(['title', 'priority', 'categoryId', 'completed'])
    : new Set(['title', 'priority', 'categoryId']);

  const keys = Object.keys(value);
  for (const key of keys) {
    if (!allowedFields.has(key)) {
      details[key] = 'Поле не разрешено или неизвестно.';
    }
  }

  if (partial && keys.length === 0) {
    details.body = 'Передайте хотя бы одно поле для обновления.';
  }

  const normalized = {};

  if (!partial && !Object.hasOwn(value, 'title')) {
    details.title = 'Название обязательно.';
  } else if (Object.hasOwn(value, 'title')) {
    if (typeof value.title !== 'string') {
      details.title = 'Название должно быть строкой.';
    } else {
      const trimmed = value.title.trim();
      if (trimmed.length < 1 || trimmed.length > 100) {
        details.title = 'Длина названия должна быть от 1 до 100 символов.';
      } else {
        normalized.title = trimmed;
      }
    }
  }

  if (!partial && !Object.hasOwn(value, 'priority')) {
    details.priority = 'Приоритет обязателен.';
  } else if (Object.hasOwn(value, 'priority')) {
    if (typeof value.priority !== 'string' || !ALLOWED_PRIORITIES.has(value.priority)) {
      details.priority = 'Приоритет должен быть одним из: low, medium, high.';
    } else {
      normalized.priority = value.priority;
    }
  }

  if (!partial && !Object.hasOwn(value, 'categoryId')) {
    details.categoryId = 'Категория обязательна.';
  } else if (Object.hasOwn(value, 'categoryId')) {
    if (!Number.isSafeInteger(value.categoryId) || !categoryIds?.has(value.categoryId)) {
      details.categoryId = 'Укажите существующий числовой идентификатор категории.';
    } else {
      normalized.categoryId = value.categoryId;
    }
  }

  if (partial && Object.hasOwn(value, 'completed')) {
    if (typeof value.completed !== 'boolean') {
      details.completed = 'Статус должен быть логическим значением (true/false).';
    } else {
      normalized.completed = value.completed;
    }
  }

  if (Object.keys(details).length > 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Данные не прошли проверку.', details);
  }

  return normalized;
}
