import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const getMessage = (error, fallback) => error.response?.data?.message || fallback;

export function useTodos() {
  const [todos, setTodos] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get('/todos')
      .then(({ data }) => {
        if (active) setTodos(data);
      })
      .catch(() => {
        if (active) toast.error('Failed to load your tasks');
      })
      .finally(() => {
        if (active) setFetching(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const addTodo = useCallback(async (title, important = false) => {
    const clean = title.trim();
    if (!clean) return null;
    try {
      const { data } = await api.post('/todos', { title: clean, important });
      setTodos((prev) => [data, ...(prev || [])]);
      toast.success(important ? 'Important task added' : 'Task added');
      return data;
    } catch (error) {
      toast.error(getMessage(error, 'Could not add the task'));
      return null;
    }
  }, []);

  // Shared optimistic-patch for completed / important toggles
  const optimisticPatch = useCallback(async (id, patch, onSuccess, snapshot) => {
    setTodos((prev) => (prev || []).map((t) => (t._id === id ? { ...t, ...patch } : t)));
    try {
      const { data } = await api.put(`/todos/${id}`, patch);
      setTodos((prev) => (prev || []).map((t) => (t._id === id ? data : t)));
      onSuccess?.(data);
    } catch (error) {
      setTodos(snapshot);
      toast.error(getMessage(error, 'Update failed'));
    }
  }, []);

  const toggleComplete = useCallback(
    (todo) =>
      optimisticPatch(
        todo._id,
        { completed: !todo.completed },
        (data) =>
          toast.success(data.completed ? 'Task completed, nice work' : 'Task moved back to active'),
        todos || []
      ),
    [optimisticPatch, todos]
  );

  const toggleImportant = useCallback(
    (todo) =>
      optimisticPatch(
        todo._id,
        { important: !todo.important },
        (data) => toast.success(data.important ? 'Marked as important' : 'Removed from important'),
        todos || []
      ),
    [optimisticPatch, todos]
  );

  const removeTodo = useCallback(
    async (id) => {
      const previous = todos || [];
      setTodos((prev) => prev.filter((t) => t._id !== id));
      try {
        await api.delete(`/todos/${id}`);
        toast.success('Task deleted');
      } catch (error) {
        setTodos(previous);
        toast.error(getMessage(error, 'Could not delete the task'));
      }
    },
    [todos]
  );

  const renameTodo = useCallback(async (id, title) => {
    const clean = title.trim();
    if (!clean) return false;
    try {
      const { data } = await api.put(`/todos/${id}`, { title: clean });
      setTodos((prev) => (prev || []).map((t) => (t._id === id ? data : t)));
      toast.success('Task renamed');
      return true;
    } catch (error) {
      toast.error(getMessage(error, 'Could not rename the task'));
      return false;
    }
  }, []);

  const clearCompleted = useCallback(async () => {
    try {
      const { data } = await api.delete('/todos/completed');
      setTodos((prev) => (prev || []).filter((t) => !t.completed));
      toast.success(data.message || 'Cleared completed tasks');
    } catch (error) {
      toast.error(getMessage(error, 'Could not clear completed tasks'));
    }
  }, []);

  return {
    todos,
    fetching,
    addTodo,
    toggleComplete,
    toggleImportant,
    removeTodo,
    renameTodo,
    clearCompleted,
  };
}
