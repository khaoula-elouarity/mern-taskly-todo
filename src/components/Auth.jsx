import { useId, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import {
  Eye,
  EyeOff,
  ListTodo,
  Loader2,
  Lock,
  Mail,
  Moon,
  Sparkles,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { cn } from '../lib/cn';

const spring = { type: 'spring', stiffness: 450, damping: 32 };

function TextField({ icon: Icon, label, type = 'text', value, onChange, placeholder, autoComplete, trailing }) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </label>
      <div
        className={cn(
          'relative flex items-center rounded-2xl border bg-white/70 transition-all duration-300 dark:bg-white/[0.05]',
          focused
            ? 'border-brand-400 ring-4 ring-brand-500/10'
            : 'border-slate-200 dark:border-white/10'
        )}
      >
        <Icon size={17} className="pointer-events-none absolute left-4 text-slate-400" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent py-3 pl-11 pr-11 text-[15px] font-medium text-slate-800 placeholder:text-slate-400/80 outline-none dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        {trailing}
      </div>
    </div>
  );
}

export default function Auth({ onLoginSuccess, theme, onToggleTheme }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const shake = useAnimationControls();

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const switchMode = (next) => {
    if (next === mode) return;
    setForm({ name: '', email: '', password: '' });
    setShowPassword(false);
    setMode(next);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (mode === 'register' && form.password.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.45 } });
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
      const { data } = await api.post(endpoint, {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      localStorage.setItem('token', data.token);
      toast.success(
        mode === 'login'
          ? `Welcome back, ${data.user.name.split(' ')[0]}`
          : 'Account created. Welcome to Taskly!'
      );
      onLoginSuccess(data.user);
    } catch (error) {
      console.error(`[Auth:${mode}] request failed`, error.response?.data || error.message, error);
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
      shake.start({ x: [0, -10, 10, -6, 6, 0], transition: { duration: 0.45 } });
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 23 }}
        className="w-full max-w-md"
      >
        <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <button
            type="button"
            onClick={onToggleTheme}
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-xl bg-black/[0.04] text-slate-500 transition-colors hover:bg-black/[0.08] hover:text-slate-700 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Toggle dark mode"
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
          </button>

          <div className="mb-8 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.1 }}
              className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 via-violet-500 to-fuchsia-500 text-white shadow-xl shadow-brand-600/40"
            >
              <ListTodo size={26} />
            </motion.div>
            <h1 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">Taskly</h1>
            <p className="mt-1 text-sm text-slate-400">Organize your world, one task at a time</p>
          </div>

          <div className="relative mx-auto mb-7 grid w-full max-w-xs grid-cols-2 rounded-2xl bg-black/[0.05] p-1.5 dark:bg-white/[0.06]">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  'relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                  mode === m
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                )}
              >
                {mode === m && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 shadow-md shadow-brand-600/30"
                    transition={spring}
                  />
                )}
                <span className="relative z-10">{m === 'login' ? 'Sign in' : 'Create account'}</span>
              </button>
            ))}
          </div>

          <motion.div animate={shake}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.form
                key={mode}
                onSubmit={handleSubmit}
                noValidate
                initial={{ opacity: 0, x: isLogin ? -24 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 24 : -24 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="space-y-4"
              >
                {mode === 'register' && (
                  <TextField
                    icon={UserIcon}
                    label="Full name"
                    type="text"
                    value={form.name}
                    onChange={setField('name')}
                    placeholder="Alex Carter"
                    autoComplete="name"
                  />
                )}

                <TextField
                  icon={Mail}
                  label="Email address"
                  type="email"
                  value={form.email}
                  onChange={setField('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                />

                <TextField
                  icon={Lock}
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={setField('password')}
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-violet-600 to-fuchsia-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-shadow hover:shadow-xl hover:shadow-brand-600/40 disabled:opacity-70"
                >
                  <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  {loading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
                  {loading
                    ? isLogin
                      ? 'Signing in'
                      : 'Creating account'
                    : isLogin
                      ? 'Sign in'
                      : 'Create account'}
                </motion.button>
              </motion.form>
            </AnimatePresence>
          </motion.div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Your data is encrypted and only visible to you.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          {isLogin ? (
            <>
              New to Taskly?{' '}
              <button
                onClick={() => switchMode('register')}
                className="font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => switchMode('login')}
                className="font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}
