import { motion } from 'framer-motion';
import { ListChecks, Plus, Sparkles } from 'lucide-react';

const COPY = {
  all: {
    title: 'Your list is beautifully empty',
    subtitle: 'Add your first task and start turning ideas into done.',
    action: 'Add your first task',
  },
  active: {
    title: 'All caught up!',
    subtitle: 'No pending tasks right now. Enjoy the calm while it lasts.',
    action: 'View all tasks',
  },
  completed: {
    title: 'Nothing completed yet',
    subtitle: 'Check off a task and it will appear here with a satisfying tick.',
    action: 'View active tasks',
  },
};

export default function EmptyState({ filter = 'all', onAction }) {
  const copy = COPY[filter] || COPY.all;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative mb-7">
        <div className="absolute inset-0 -z-10 scale-150 rounded-full bg-brand-500/10 blur-2xl" />
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          className="grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-violet-600 text-white shadow-xl shadow-brand-600/30"
        >
          <ListChecks size={34} />
        </motion.div>
        <motion.div
          animate={{ x: [0, 6, 0], y: [0, 4, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute -left-7 -top-3 grid h-10 w-10 place-items-center rounded-2xl bg-amber-400 text-white shadow-lg shadow-amber-400/40"
        >
          <Sparkles size={18} />
        </motion.div>
      </div>

      <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">{copy.title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-slate-400">{copy.subtitle}</p>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        onClick={onAction}
        className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-shadow hover:shadow-xl hover:shadow-brand-600/40"
      >
        <Plus size={16} strokeWidth={3} />
        {copy.action}
      </motion.button>
    </div>
  );
}