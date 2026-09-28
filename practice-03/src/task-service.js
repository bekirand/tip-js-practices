// Модуль сервиса управления задачами

// Проверка корректности идентификатора задачи
function validateId(id) {
  if (typeof id !== "number" || !Number.isInteger(id) || id <= 0 || id > Number.MAX_SAFE_INTEGER) {
    return { ok: false, error: "Некорректный идентификатор: ожидается положительное безопасное целое число" };
  }
  return { ok: true };
}

// Проверка и нормализация названия задачи
function validateTitle(title) {
  if (typeof title !== "string") {
    return { ok: false, error: "Название задачи должно быть строкой" };
  }
  const trimmed = title.trim();
  if (trimmed.length < 1 || trimmed.length > 100) {
    return { ok: false, error: "Длина названия задачи должна быть от 1 до 100 символов" };
  }
  return { ok: true, title: trimmed };
}

// Проверка допустимости приоритета задачи
function validatePriority(priority) {
  const allowed = ["low", "medium", "high"];
  if (!allowed.includes(priority)) {
    return { ok: false, error: "Приоритет должен быть одним из: low, medium, high" };
  }
  return { ok: true };
}

// Создание нового объекта задачи
export function createTask(id, title, priority = "medium") {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  const titleCheck = validateTitle(title);
  if (!titleCheck.ok) return titleCheck;

  const priorityCheck = validatePriority(priority);
  if (!priorityCheck.ok) return priorityCheck;

  return {
    ok: true,
    task: {
      id,
      title: titleCheck.title,
      completed: false,
      priority,
    },
  };
}

// Поиск задачи по идентификатору с сохранением ссылки
export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

// Получение списка невыполненных задач
export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

// Получение списка названий всех задач
export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

// Расчет агрегированной статистики по списку задач
export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  const pending = total - completed;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return { total, completed, pending, progress };
}

// Добавление новой задачи в конец массива без мутации
export function addTask(tasks, id, title, priority = "medium") {
  const created = createTask(id, title, priority);
  if (!created.ok) return created;

  if (tasks.some((task) => task.id === id)) {
    return { ok: false, error: "Задача с таким идентификатором уже существует" };
  }

  return {
    ok: true,
    tasks: [...tasks, created.task],
  };
}

// Изменение статуса выполнения задачи без мутации
export function setTaskCompleted(tasks, id, completed) {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  if (typeof completed !== "boolean") {
    return { ok: false, error: "Статус выполнения должен быть логическим значением (true/false)" };
  }

  const existing = findTaskById(tasks, id);
  if (!existing) {
    return { ok: false, error: "Задача с указанным идентификатором не найдена" };
  }

  return {
    ok: true,
    tasks: tasks.map((task) => (task.id === id ? { ...task, completed } : task)),
  };
}

// Переименование задачи без мутации
export function renameTask(tasks, id, title) {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  const titleCheck = validateTitle(title);
  if (!titleCheck.ok) return titleCheck;

  const existing = findTaskById(tasks, id);
  if (!existing) {
    return { ok: false, error: "Задача с указанным идентификатором не найдена" };
  }

  return {
    ok: true,
    tasks: tasks.map((task) => (task.id === id ? { ...task, title: titleCheck.title } : task)),
  };
}

// Удаление задачи по идентификатору без мутации
export function removeTask(tasks, id) {
  const idCheck = validateId(id);
  if (!idCheck.ok) return idCheck;

  const existing = findTaskById(tasks, id);
  if (!existing) {
    return { ok: false, error: "Задача с указанным идентификатором не найдена" };
  }

  return {
    ok: true,
    tasks: tasks.filter((task) => task.id !== id),
  };
}
