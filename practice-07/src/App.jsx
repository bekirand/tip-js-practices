import { useState } from 'react';
import { tasks as initialTasks, categories } from './data.js';
import { createInitialFilters, variant } from './variant.js';
import {
  addTask,
  getTaskStats,
  removeTask,
  selectTasks,
  toggleTask,
  updateTask,
} from './domain/task-service.js';
import TaskForm from './components/TaskForm.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskList from './components/TaskList.jsx';
import TaskStats from './components/TaskStats.jsx';

export default function App() {
  const [tasks, setTasks] = useState(() => initialTasks.map((task) => ({ ...task })));
  const [filters, setFilters] = useState(createInitialFilters);
  const [editingId, setEditingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Производные значения вычисляются на рендере без лишних состояний.
  const visibleTasks = selectTasks(tasks, filters);
  const stats = getTaskStats(tasks);
  const editingTask = editingId !== null
    ? tasks.find((task) => task.id === editingId) ?? null
    : null;

  const handleSave = (value) => {
    setErrorMessage('');
    if (editingId !== null) {
      if (!tasks.some((task) => task.id === editingId)) {
        setErrorMessage('Редактируемая задача не найдена.');
        return false;
      }
      setTasks((prev) => updateTask(prev, editingId, value));
      setEditingId(null);
      setStatusMessage('Задача обновлена.');
      return true;
    }

    setTasks((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev.map((t) => t.id)) + 1 : 1;
      return addTask(prev, value, nextId);
    });
    setStatusMessage('Задача добавлена.');
    return true;
  };

  const handleToggle = (id) => {
    setErrorMessage('');
    setTasks((prev) => toggleTask(prev, id));
    setStatusMessage('Статус задачи изменён.');
  };

  const handleEdit = (id) => {
    setErrorMessage('');
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Удалить выбранную задачу?')) return;
    setErrorMessage('');
    setTasks((prev) => removeTask(prev, id));
    if (editingId === id) {
      setEditingId(null);
    }
    setStatusMessage('Задача удалена.');
  };

  return (
    <main>
      <h1>Задачи на React</h1>
      <p>ПР7 (Вариант {variant}): данные в памяти. Обновление страницы восстанавливает исходный набор.</p>
      {statusMessage && (
        <p className="status-msg" role="status">
          {statusMessage}
        </p>
      )}
      {errorMessage && (
        <p className="error" role="alert">
          {errorMessage}
        </p>
      )}
      <TaskStats stats={stats} />
      <TaskFilters filters={filters} categories={categories} onChange={setFilters} />
      <TaskForm
        key={editingId ?? 'new'}
        categories={categories}
        initialTask={editingTask}
        onSave={handleSave}
        onCancel={handleCancelEdit}
      />
      <TaskList
        tasks={visibleTasks}
        categories={categories}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </main>
  );
}
