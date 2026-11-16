import { useEffect, useRef, useState } from 'react';

// Кастомный хук синхронизации состояния React с HTTP API.
export function useTaskData({ api, filters }) {
  const [snapshot, setSnapshot] = useState({ tasks: [], categories: [], meta: { total: 0 } });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [pending, setPending] = useState(false);
  const [revision, setRevision] = useState(0);

  const mountedRef = useRef(false);
  const mutationAbortRef = useRef(null);

  const { q = '', completed = '', priority = '', categoryId = '' } = filters ?? {};

  // Отслеживание жизненного цикла компонента и отмена активной мутации при размонтировании.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      mutationAbortRef.current?.abort();
    };
  }, []);

  // Загрузка списка задач и категорий при изменении фильтров или счётчика обновлений.
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    setStatus('loading');
    setError(null);

    async function load() {
      try {
        const nextSnapshot = await api.loadInitialData(
          { q, completed, priority, categoryId },
          { signal: controller.signal }
        );
        if (!active || !mountedRef.current) return;
        setSnapshot(nextSnapshot);
        setStatus('ready');
        setError(null);
      } catch (err) {
        if (!active || !mountedRef.current || controller.signal.aborted) return;
        setError(err);
        setStatus('error');
      }
    }

    void load();

    return () => {
      active = false;
      controller.abort();
    };
  }, [api, q, completed, priority, categoryId, revision]);

  async function mutate(operation) {
    if (!mountedRef.current || mutationAbortRef.current) {
      return false;
    }

    const controller = new AbortController();
    mutationAbortRef.current = controller;
    setPending(true);
    setMutationError(null);

    try {
      await operation(controller.signal);
      if (!mountedRef.current || controller.signal.aborted) {
        return false;
      }
      setRevision((prev) => prev + 1);
      return true;
    } catch (err) {
      if (!mountedRef.current || controller.signal.aborted) {
        return false;
      }
      setMutationError(err);
      return false;
    } finally {
      if (mutationAbortRef.current === controller) {
        mutationAbortRef.current = null;
      }
      if (mountedRef.current) {
        setPending(false);
      }
    }
  }

  return {
    snapshot,
    tasks: snapshot.tasks,
    status,
    isLoading: status === 'loading',
    error,
    mutationError,
    pending,
    refresh() {
      setRevision((prev) => prev + 1);
    },
    saveTask(id, value) {
      return mutate((signal) =>
        id === null
          ? api.createTask(value, { signal })
          : api.updateTask(id, value, { signal })
      );
    },
    toggleTask(task) {
      return mutate((signal) =>
        api.setTaskCompleted(task.id, !task.completed, { signal })
      );
    },
    deleteTask(id) {
      return mutate((signal) => api.deleteTask(id, { signal }));
    },
    resetData() {
      return mutate((signal) => api.resetDemoData({ signal }));
    },
  };
}
