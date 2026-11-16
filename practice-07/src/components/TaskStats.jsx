// Отображение сводной статистики по полному набору задач.
export default function TaskStats({ stats }) {
  return (
    <section aria-label="Статистика">
      <h2>Статистика</h2>
      <div className="stats-grid">
        <div className="stat-item">
          <span>Всего</span>
          <strong className="stat-value">{stats.total}</strong>
        </div>
        <div className="stat-item">
          <span>Выполнено</span>
          <strong className="stat-value">{stats.completed}</strong>
        </div>
        <div className="stat-item">
          <span>В работе</span>
          <strong className="stat-value">{stats.active}</strong>
        </div>
      </div>
    </section>
  );
}
