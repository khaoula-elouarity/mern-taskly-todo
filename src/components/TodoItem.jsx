import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Check, Pencil, Star, Trash2 } from 'lucide-react';
import { cn } from '../lib/cn';

const formatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function TodoItem({ todo, onToggleComplete, onToggleImportant, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);
  const editingRef = useRef(false);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEdit = () => {
    setDraft(todo.title);
    editingRef.current = true;
    setEditing(true);
  };

  const stopEdit = async (commit) => {
    if (!editingRef.current) return;
    editingRef.current = false;
    setEditing(false);
    const nextTitle = draft.trim();
    if (commit && nextTitle && nextTitle !== todo.title) {
      await onRename(todo._id, nextTitle);
    }
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, height: 0, transition: { duration: 0.22 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 shadow-sm backdrop-blur-md transition-colors duration-300 hover:border-brand-300/70 hover:shadow-lg hover:shadow-brand-500/5 dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-brand-400/40"
    >
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => onToggleComplete(todo)}
        aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
        className={cn(
          'grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300',
          todo.completed
            ? 'border-brand-500 bg-gradient-to-br from-brand-500 to-violet-600 text-white'
            : 'border-slate-300 text-transparent hover:border-brand-400 dark:border-slate-600'
        )}
      >
        <AnimatePresence>
          {todo.completed && (
            <motion.span
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              className="grid place-items-center"
            >
              <Check size={15} strokeWidth={4} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => stopEdit(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                inputRef.current?.blur();
              }
              if (e.key === 'Escape') stopEdit(false);
            }}
            maxLength={200}
            className="w-full border-b-2 border-brand-400 bg-transparent pb-0.5 text-[15px] font-medium text-slate-800 outline-none dark:text-slate-100"
          />
        ) : (
          <>
            <button
              type="button"
              onClick={startEdit}
              title="Click to rename"
              className="block w-full text-left"
            >
              <p
                className={cn(
                  'truncate text-[15px] font-medium transition-all duration-300',
                  todo.completed
                    ? 'text-slate-400 line-through dark:text-slate-500'
                    : 'text-slate-800 dark:text-slate-100'
                )}
              >
                {todo.title}
              </p>
            </button>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={11} />
                {formatDate(todo.createdAt)}
              </span>
              {todo.important && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 font-medium text-amber-500">
                  <Star size={10} className="fill-amber-400" />
                  Important
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {editing ? (
          <span className="mr-1 hidden text-[11px] font-medium text-slate-400 sm:inline">
            Enter to save · Esc to cancel
          </span>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.85 }}
              onClick={startEdit}
              aria-label="Rename task"
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 opacity-70 transition-all hover:bg-brand-500/10 hover:text-brand-500 group-hover:opacity-100"
            >
              <Pencil size={16} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.15, rotate: 8 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => onToggleImportant(todo)}
              aria-label={todo.important ? 'Remove from important' : 'Mark as important'}
              className={cn(
                'grid h-9 w-9 place-items-center rounded-xl transition-colors',
                todo.important
                  ? 'bg-amber-400/15 text-amber-500'
                  : 'text-slate-400 hover:bg-amber-400/10 hover:text-amber-500'
              )}
            >
              <Star size={17} className={todo.important ? 'fill-amber-400' : ''} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => onDelete(todo._id)}
              aria-label="Delete task"
              className="grid h-9 w-9 place-items-center rounded-xl text-slate-400 opacity-60 transition-all hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100"
            >
              <Trash2 size={17} />
            </motion.button>
          </>
        )}
      </div>
    </motion.li>
  );
}
