// Карточка отдельной задачи. Не хранит собственное состояние задачи.
const PRIORITY_LABELS = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export default function TaskItem({ task, categoryName, onToggle, onEdit, onDelete }) {
  return (
    <li className={task.completed ? 'task-completed' : ''} data-task-id={task.id}>
      <strong className="task-title">{task.title}</strong>
      <div className="task-meta">
        <span>Статус: {task.completed ? 'Выполнена' : 'В работе'}</span>
        <span>Приоритет: {PRIORITY_LABELS[task.priority] ?? task.priority}</span>
        <span>Категория: {categoryName}</span>
      </div>
      <div className="actions">
        <button type="button" onClick={() => onToggle(task.id)}>
          {task.completed ? 'Вернуть в работу' : 'Выполнена'}
        </button>
        <button type="button" onClick={() => onEdit(task.id)}>
          Редактировать
        </button>
        <button type="button" onClick={() => onDelete(task.id)}>
          Удалить
        </button>
      </div>
    </li>
  );
}
