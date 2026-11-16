// Чистые функции предметной области: без React, DOM, сети и мутации аргументов.
const ALLOWED_PRIORITIES = new Set(['low', 'medium', 'high']);

export function validateTaskDraft(draft, categories) {
  const errors = {};
  let validTitle = '';
  let validPriority = '';
  let validCategoryId = NaN;

  if (!draft || typeof draft.title !== 'string') {
    errors.title = 'Название задачи должно быть строкой';
  } else {
    const trimmed = draft.title.trim();
    if (trimmed.length < 1 || trimmed.length > 100) {
      errors.title = 'Длина названия должна быть от 1 до 100 символов';
    } else {
      validTitle = trimmed;
    }
  }

  if (!draft || typeof draft.priority !== 'string' || !ALLOWED_PRIORITIES.has(draft.priority)) {
    errors.priority = 'Выберите корректный приоритет: low, medium или high';
  } else {
    validPriority = draft.priority;
  }

  const rawCat = draft?.categoryId;
  const parsedCat = typeof rawCat === 'string' && rawCat.trim() === ''
    ? NaN
    : Number(rawCat);

  if (!Number.isInteger(parsedCat) || !categories.some((c) => c.id === parsedCat)) {
    errors.categoryId = 'Выберите существующую категорию';
  } else {
    validCategoryId = parsedCat;
  }

  const valid = Object.keys(errors).length === 0;
  return {
    valid,
    value: valid ? { title: validTitle, priority: validPriority, categoryId: validCategoryId } : null,
    errors,
  };
}

export function selectTasks(tasks, filters = {}) {
  const query = typeof filters.q === 'string' ? filters.q.trim().toLowerCase() : '';
  const completedFilter = filters.completed ?? '';
  const priorityFilter = filters.priority ?? '';
  const categoryFilter = filters.categoryId ?? '';

  return tasks.filter((task) => {
    if (query && !task.title.toLowerCase().includes(query)) return false;
    if (completedFilter === 'true' && !task.completed) return false;
    if (completedFilter === 'false' && task.completed) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    if (categoryFilter !== '' && String(task.categoryId) !== String(categoryFilter)) return false;
    return true;
  });
}

export function getTaskStats(tasks) {
  let completed = 0;
  for (const task of tasks) {
    if (task.completed) completed += 1;
  }
  return {
    total: tasks.length,
    completed,
    active: tasks.length - completed,
  };
}

export function addTask(tasks, value, id) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new TypeError('Идентификатор новой задачи должен быть положительным целым числом');
  }
  if (tasks.some((task) => task.id === id)) {
    throw new Error(`Задача с id ${id} уже существует`);
  }
  return [
    ...tasks,
    {
      id,
      title: value.title,
      completed: false,
      priority: value.priority,
      categoryId: value.categoryId,
    },
  ];
}

export function updateTask(tasks, id, value) {
  if (!tasks.some((task) => task.id === id)) return tasks;
  return tasks.map((task) =>
    task.id === id
      ? { ...task, title: value.title, priority: value.priority, categoryId: value.categoryId }
      : task
  );
}

export function toggleTask(tasks, id) {
  if (!tasks.some((task) => task.id === id)) return tasks;
  return tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
}

export function removeTask(tasks, id) {
  if (!tasks.some((task) => task.id === id)) return tasks;
  return tasks.filter((task) => task.id !== id);
}
