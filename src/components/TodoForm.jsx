import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Star } from 'lucide-react';
import { cn } from '../lib/cn';

export default function TodoForm({ onAdd, inputRef }) {
  const [title, setTitle] = useState('');
  const [important, setImportant] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    const created = await onAdd(title, important);
    if (created) {
      setTitle('');
      setImportant(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-2xl border p-1.5 transition-all duration-300 sm:gap-2',
          focused
            ? 'border-brand-400 bg-white/80 ring-4 ring-brand-500/15 dark:bg-white/[0.06]'
            : 'border-slate-200/80 bg-white/50 hover:border-brand-300 dark:border-white/10 dark:bg-white/[0.04]'
        )}
      >
        <motion.button
          type="button"
          onClick={() => setImportant((v) => !v)}
          whileTap={{ scale: 0.8 }}
          aria-label="Mark task as important"
          title="Mark as important"
          className={cn(
            'grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors duration-300',
            important
              ? 'bg-amber-400/15 text-amber-500'
              : 'text-slate-400 hover:bg-black/5 hover:text-amber-500 dark:hover:bg-white/10'
          )}
        >
          <motion.span whileHover={{ rotate: important ? 0 : 30 }} whileTap={{ scale: 0.8 }}>
            <Star size={20} className={important ? 'fill-amber-400' : ''} />
          </motion.span>
        </motion.button>

        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="What needs to be done?"
          maxLength={200}
          className="h-11 w-full min-w-0 bg-transparent px-2 text-[15px] font-medium text-slate-800 placeholder:text-slate-400 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
        />

        <motion.button
          type="submit"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          className="relative flex h-11 shrink-0 items-center gap-1.5 overflow-hidden rounded-xl bg-gradient-to-r from-brand-600 via-violet-600 to-fuchsia-600 px-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-shadow hover:shadow-xl hover:shadow-brand-600/40 sm:px-4"
        >
          <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <Plus size={18} strokeWidth={3} />
          <span className="hidden sm:inline">Add task</span>
        </motion.button>
      </div>

      <div className="mt-2 flex items-center justify-between px-2 text-xs text-slate-400 dark:text-slate-500">
        <span>{important ? 'Starred — this task will be marked important' : 'Tip: press Enter to add quickly'}</span>
        <span>{title.length}/200</span>
      </div>
    </form>
  );
}
