// Фильтрация задач по всем заданным критериям (объединение через И).
export function selectTasks(tasks, filters = {}) {
  const { completed = null, priority = null, categoryId = null, q = '' } = filters;
  const queryNeedle = q ? q.toLocaleLowerCase('ru-RU') : '';

  if (completed === null && priority === null && categoryId === null && queryNeedle === '') {
    return [...tasks];
  }

  return tasks.filter((task) => {
    if (completed !== null && task.completed !== completed) return false;
    if (priority !== null && task.priority !== priority) return false;
    if (categoryId !== null && task.categoryId !== categoryId) return false;
    if (queryNeedle && !task.title.toLocaleLowerCase('ru-RU').includes(queryNeedle)) return false;
    return true;
  });
}

// Поиск задачи по идентификатору (не по индексу массива).
export function findTask(tasks, id) {
  return tasks.find((task) => task.id === id) ?? null;
}
