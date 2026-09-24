import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  ListChecks,
  ListTodo,
  LogOut,
  Moon,
  Star,
  Sun,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTodos } from '../hooks/useTodos';
import { cn } from '../lib/cn';
import TodoForm from './TodoForm';
import TodoItem from './TodoItem';
import EmptyState from './EmptyState';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Burning the midnight oil';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function ProgressRing({ value }) {
  const size = 96;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative grid h-24 w-24 shrink-0 place-items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-200 dark:stroke-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (circumference * value) / 100 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          className="stroke-brand-500 drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]"
        />
      </svg>
      <div className="absolute text-center">
        <span className="font-display text-2xl font-bold text-slate-800 dark:text-white">
          {value}
          <span className="text-sm">%</span>
        </span>
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          done
        </span>
      </div>
    </div>
  );
}

function CountValue({ value }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -12, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="font-display text-2xl font-bold text-slate-800 dark:text-white"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export default function TodoList({ user, theme, onToggleTheme, onLogout }) {
  const {
    todos,
    fetching,
    addTodo,
    toggleComplete,
    toggleImportant,
    removeTodo,
    renameTodo,
    clearCompleted,
  } = useTodos();
  const [filter, setFilter] = useState('all');
  const inputRef = useRef(null);

  const counts = useMemo(() => {
    const list = todos ?? [];
    return {
      total: list.length,
      active: list.filter((t) => !t.completed).length,
      completed: list.filter((t) => t.completed).length,
      important: list.filter((t) => t.important).length,
    };
  }, [todos]);

  const filtered = useMemo(() => {
    const list = todos ?? [];
    if (filter === 'active') return list.filter((t) => !t.completed);
    if (filter === 'completed') return list.filter((t) => t.completed);
    return [...list].sort(
      (a, b) =>
        Number(b.important) - Number(a.important) ||
        Date.parse(b.createdAt) - Date.parse(a.createdAt)
    );
  }, [todos, filter]);

  const completedPct = counts.total ? Math.round((counts.completed / counts.total) * 100) : 0;

  const stats = [
    { key: 'total', label: 'Total tasks', value: counts.total, icon: ListTodo, tint: 'bg-brand-500/12 text-brand-500' },
    { key: 'active', label: 'Active', value: counts.active, icon: Circle, tint: 'bg-cyan-500/15 text-cyan-500' },
    { key: 'completed', label: 'Completed', value: counts.completed, icon: CheckCircle2, tint: 'bg-emerald-500/15 text-emerald-500' },
    { key: 'important', label: 'Important', value: counts.important, icon: Star, tint: 'bg-amber-500/15 text-amber-500' },
  ];

  const handleEmptyAction = () => {
    if (filter !== 'all') setFilter('all');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const firstName = (user?.name || 'there').split(' ')[0];

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      {/* Top bar */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:px-5"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-lg shadow-brand-600/30">
            <ListTodo size={20} />
          </div>
          <div>
            <p className="font-display text-base font-bold leading-tight text-slate-800 dark:text-white">
              Taskly
            </p>
            <p className="text-xs text-slate-400">Focus · Plan · Done</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className="grid h-10 w-10 place-items-center rounded-xl bg-black/[0.04] text-slate-500 transition-colors hover:bg-black/[0.08] hover:text-slate-700 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <div className="mx-1 hidden h-8 w-px bg-slate-200 dark:bg-white/10 sm:block" />

          <div className="hidden items-center gap-2.5 sm:flex">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 text-xs font-bold text-white">
              {getInitials(user?.name)}
            </div>
            <div className="hidden max-w-[170px] md:block">
              <p className="truncate text-sm font-semibold leading-tight text-slate-800 dark:text-white">
                {user?.name}
              </p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onLogout();
              toast('Logged out. See you soon!');
            }}
            className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-3.5 py-2.5 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-500/20"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Greeting + progress */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass mt-5 flex flex-wrap items-center justify-between gap-6 rounded-3xl p-6 sm:mt-6 sm:p-8"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">{today}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {getGreeting()},{' '}
            <span className="text-gradient">{firstName}</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {counts.active === 0
              ? 'You are all caught up. Enjoy the calm.'
              : `You have ${counts.active} active task${counts.active === 1 ? '' : 's'} today.`}
          </p>
        </div>
        <ProgressRing value={completedPct} />
      </motion.section>

      {/* Stats */}
      <section className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:grid-cols-4 sm:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="glass rounded-2xl p-4"
          >
            <div className={cn('mb-3 grid h-9 w-9 place-items-center rounded-xl', stat.tint)}>
              <stat.icon size={18} />
            </div>
            <CountValue value={stat.value} />
            <p className="mt-0.5 text-xs font-medium text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* Tasks panel */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass mt-5 rounded-3xl p-4 sm:mt-6 sm:p-6"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/12 text-brand-500">
              <ListChecks size={17} />
            </div>
            <h2 className="font-display text-lg font-bold text-slate-800 dark:text-white">Your tasks</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-black/[0.04] p-1.5 dark:bg-white/[0.06]">
              {FILTERS.map((f) => {
                const count = f.id === 'all' ? counts.total : counts[f.id];
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={cn(
                      'relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors sm:px-4',
                      filter === f.id
                        ? 'text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                    )}
                  >
                    {filter === f.id && (
                      <motion.span
                        layoutId="filter-pill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 shadow-md shadow-brand-600/30"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {f.label}
                      {count > 0 && (
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
                            filter === f.id
                              ? 'bg-white/20'
                              : 'bg-black/[0.06] text-slate-500 dark:bg-white/10 dark:text-slate-400'
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {counts.completed > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={clearCompleted}
                className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-3 py-2.5 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-500/20"
              >
                <Trash2 size={15} />
                <span className="hidden sm:inline">Clear</span> completed
              </motion.button>
            )}
          </div>
        </div>

        <TodoForm onAdd={addTodo} inputRef={inputRef} />

        <ul className="mt-5 flex flex-col gap-3">
          {fetching ? (
            [0, 1, 2].map((index) => (
              <li key={index} className="h-[72px] animate-pulse rounded-2xl bg-slate-200/70 dark:bg-white/5" />
            ))
          ) : filtered.length === 0 ? (
            <EmptyState filter={filter} onAction={handleEmptyAction} />
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((todo) => (
                <TodoItem
                  key={todo._id}
                  todo={todo}
                  onToggleComplete={toggleComplete}
                  onToggleImportant={toggleImportant}
                  onDelete={removeTodo}
                  onRename={renameTodo}
                />
              ))}
            </AnimatePresence>
          )}
        </ul>
      </motion.section>

      <footer className="mt-6 pb-4 text-center text-xs text-slate-400">
        Taskly — a focused way to get things done.
      </footer>
    </div>
  );
}
