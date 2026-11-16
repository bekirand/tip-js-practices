import { ApiError } from './errors.js';

const ALLOWED_FILTER_KEYS = new Set(['completed', 'priority', 'categoryId', 'q']);
const ALLOWED_PRIORITIES = new Set(['low', 'medium', 'high']);

// Проверка положительного безопасного целого идентификатора без ведущих нулей.
export function parsePositiveId(raw) {
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) {
    return null;
  }
  const value = Number(raw);
  return Number.isSafeInteger(value) ? value : null;
}

// Разбор и валидация query-параметров фильтрации списка задач.
export function parseFilters(searchParams) {
  const seenKeys = new Set();

  for (const key of searchParams.keys()) {
    if (!ALLOWED_FILTER_KEYS.has(key)) {
      throw new ApiError(400, 'INVALID_QUERY', `Неизвестный параметр фильтрации: ${key}`);
    }
    if (seenKeys.has(key)) {
      throw new ApiError(400, 'INVALID_QUERY', `Повторяющийся параметр фильтрации: ${key}`);
    }
    seenKeys.add(key);
  }

  let completed = null;
  if (searchParams.has('completed')) {
    const rawCompleted = searchParams.get('completed');
    if (rawCompleted !== 'true' && rawCompleted !== 'false') {
      throw new ApiError(400, 'INVALID_QUERY', 'Параметр completed должен быть true или false.');
    }
    completed = rawCompleted === 'true';
  }

  let priority = null;
  if (searchParams.has('priority')) {
    const rawPriority = searchParams.get('priority');
    if (!ALLOWED_PRIORITIES.has(rawPriority)) {
      throw new ApiError(400, 'INVALID_QUERY', 'Параметр priority должен быть low, medium или high.');
    }
    priority = rawPriority;
  }

  let categoryId = null;
  if (searchParams.has('categoryId')) {
    const parsedCategory = parsePositiveId(searchParams.get('categoryId'));
    if (parsedCategory === null) {
      throw new ApiError(400, 'INVALID_QUERY', 'Параметр categoryId должен быть положительным целым числом.');
    }
    categoryId = parsedCategory;
  }

  let q = '';
  if (searchParams.has('q')) {
    const trimmed = searchParams.get('q').trim();
    if (trimmed.length > 100) {
      throw new ApiError(400, 'INVALID_QUERY', 'Параметр q не должен превышать 100 символов.');
    }
    q = trimmed;
  }

  return { completed, priority, categoryId, q };
}
