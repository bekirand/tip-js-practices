import { useState } from 'react';
import { validateTaskDraft } from '../domain/task-service.js';

function buildEmptyDraft(categories) {
  return {
    title: '',
    priority: 'medium',
    categoryId: categories[0] ? String(categories[0].id) : '',
  };
}

// Управляемая форма создания и редактирования задачи.
export default function TaskForm({ categories, initialTask = null, onSave, onCancel }) {
  const isEditing = Boolean(initialTask);

  const [draft, setDraft] = useState(() =>
    initialTask
      ? {
          title: initialTask.title,
          priority: initialTask.priority,
          categoryId: String(initialTask.categoryId),
        }
      : buildEmptyDraft(categories)
  );
  const [errors, setErrors] = useState({});

  const updateField = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validateTaskDraft(draft, categories);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    const saved = onSave(validation.value);
    if (saved && !isEditing) {
      setDraft(buildEmptyDraft(categories));
    }
  };

  return (
    <section aria-label="Форма задачи">
      <h2>{isEditing ? `Редактирование задачи #${initialTask.id}` : 'Новая задача'}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="task-title">
          Название задачи
          <input
            id="task-title"
            type="text"
            value={draft.title}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? 'task-title-error' : undefined}
            onChange={(e) => updateField('title', e.target.value)}
          />
        </label>
        {errors.title && (
          <p id="task-title-error" className="error" role="alert">
            {errors.title}
          </p>
        )}

        <label htmlFor="task-priority">
          Приоритет
          <select
            id="task-priority"
            value={draft.priority}
            aria-invalid={Boolean(errors.priority)}
            aria-describedby={errors.priority ? 'task-priority-error' : undefined}
            onChange={(e) => updateField('priority', e.target.value)}
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </label>
        {errors.priority && (
          <p id="task-priority-error" className="error" role="alert">
            {errors.priority}
          </p>
        )}

        <label htmlFor="task-category">
          Категория
          <select
            id="task-category"
            value={draft.categoryId}
            aria-invalid={Boolean(errors.categoryId)}
            aria-describedby={errors.categoryId ? 'task-category-error' : undefined}
            onChange={(e) => updateField('categoryId', e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
        {errors.categoryId && (
          <p id="task-category-error" className="error" role="alert">
            {errors.categoryId}
          </p>
        )}

        <div className="actions">
          <button type="submit">
            {isEditing ? 'Сохранить изменения' : 'Добавить задачу'}
          </button>
          {isEditing && (
            <button type="button" onClick={onCancel}>
              Отменить
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
