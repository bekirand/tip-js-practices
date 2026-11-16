import { categories as seedCategories, tasks as seedTasks } from './data.js';
import { selectTasks, findTask } from './task-service.js';

const noFilters = { completed: null, priority: null, categoryId: null, q: '' };

export function createStore() {
  let tasks;
  let nextId;
  const categories = seedCategories.map((item) => ({ ...item }));

  function reset() {
    tasks = seedTasks.map((item) => ({ ...item }));
    nextId = Math.max(0, ...tasks.map((item) => item.id)) + 1;
    return { reset: true, total: tasks.length };
  }

  reset();

  return {
    listTasks: (filters = noFilters) => selectTasks(tasks, filters).map((item) => ({ ...item })),
    getTask: (id) => {
      const task = findTask(tasks, id);
      return task ? { ...task } : null;
    },
    listCategories: () => categories.map((item) => ({ ...item })),
    reset,
    createTask(value) {
      const created = {
        id: nextId,
        title: value.title,
        completed: false,
        priority: value.priority,
        categoryId: value.categoryId,
      };
      nextId += 1;
      tasks.push(created);
      return { ...created };
    },
    updateTask(id, changes) {
      const index = tasks.findIndex((item) => item.id === id);
      if (index === -1) return null;
      const updated = { ...tasks[index], ...changes, id };
      tasks[index] = updated;
      return { ...updated };
    },
    deleteTask(id) {
      const index = tasks.findIndex((item) => item.id === id);
      if (index === -1) return false;
      tasks.splice(index, 1);
      return true;
    },
  };
}
