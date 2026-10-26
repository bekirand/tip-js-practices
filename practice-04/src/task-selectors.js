// Модуль выборки и фильтрации задач

// Получение списка видимых задач в зависимости от выбранного фильтра
export function getVisibleTasks(tasks, filter = "all") {
  if (filter === "pending") {
    return tasks.filter((task) => task.completed === false);
  }
  if (filter === "completed") {
    return tasks.filter((task) => task.completed === true);
  }
  return [...tasks];
}
