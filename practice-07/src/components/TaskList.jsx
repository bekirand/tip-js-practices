import TaskItem from './TaskItem.jsx';

// Список отфильтрованных задач с условным отображением пустого состояния.
export default function TaskList({ tasks, categories, onToggle, onEdit, onDelete }) {
  const categoryNames = new Map(categories.map((cat) => [cat.id, cat.name]));

  return (
    <section aria-label="Список задач">
      <h2>Задачи (найдено: {tasks.length})</h2>
      {tasks.length === 0 ? (
        <p>Список задач пуст</p>
      ) : (
        <ul>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              categoryName={categoryNames.get(task.categoryId) ?? 'Без категории'}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
