// Панель фильтрации задач с четырьмя управляемыми фильтрами и сбросом.
const STATUS_OPTIONS = [
  { value: '', label: 'Все' },
  { value: 'false', label: 'В работе' },
  { value: 'true', label: 'Завершенные' },
];

export default function TaskFilters({ filters, categories, onChange }) {
  const updateField = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  const handleReset = () => {
    onChange({ q: '', completed: '', priority: '', categoryId: '' });
  };

  return (
    <section aria-label="Фильтры">
      <h2>Фильтры</h2>
      <div>
        <span>Статус:</span>
        <div className="filter-tabs" role="group" aria-label="Фильтр по статусу">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value || 'all'}
              type="button"
              className={filters.completed === opt.value ? 'is-active' : ''}
              aria-pressed={filters.completed === opt.value}
              onClick={() => updateField('completed', opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-grid">
        <label htmlFor="filter-q">
          Поиск по названию
          <input
            id="filter-q"
            type="search"
            value={filters.q}
            placeholder="Введите текст..."
            onChange={(e) => updateField('q', e.target.value)}
          />
        </label>

        <label htmlFor="filter-priority">
          Приоритет
          <select
            id="filter-priority"
            value={filters.priority}
            onChange={(e) => updateField('priority', e.target.value)}
          >
            <option value="">Все</option>
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
        </label>

        <label htmlFor="filter-category">
          Категория
          <select
            id="filter-category"
            value={filters.categoryId}
            onChange={(e) => updateField('categoryId', e.target.value)}
          >
            <option value="">Все</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="actions">
        <button type="button" onClick={handleReset}>
          Сбросить фильтры
        </button>
      </div>
    </section>
  );
}
