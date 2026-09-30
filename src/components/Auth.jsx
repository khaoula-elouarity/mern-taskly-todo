import { useId, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Gauge,
  ListTodo,
  Loader2,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  Target,
  User as UserIcon,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { cn } from '../lib/cn';

const spring = { type: 'spring', stiffness: 420, damping: 34 };
const shake = { x: [0, -9, 9, -5, 5, 0], transition: { duration: 0.42 } };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const HIGHLIGHTS = [
  {
    icon: Zap,
    title: 'Capture in one tap',
    copy: 'Log a task the moment it crosses your mind and retire the sticky notes forever.',
  },
  {
    icon: Target,
    title: 'Track what matters',
    copy: 'Star your priorities, filter by status, and watch the progress ring climb.',
  },
  {
    icon: Gauge,
    title: 'Stay in flow',
    copy: 'A calm, distraction-free board that protects your attention while you work.',
  },
];

const STATS = [
  { value: '1-tap', label: 'task capture' },
  { value: 'Live', label: 'progress insights' },
  { value: '100%', label: 'private to you' },
];

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Toggle dark mode"
      className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-slate-500 transition-all duration-300 hover:border-black/25 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:border-white/30 dark:hover:text-white"
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
  );
}

function Field({ id, icon: Icon, label, error, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-white/40"
      >
        {label}
      </label>
      <div
        className={cn(
          'relative flex items-center rounded-xl border transition-all duration-300',
          error
            ? 'border-rose-500/60 bg-rose-500/[0.04] focus-within:ring-4 focus-within:ring-rose-500/10'
            : 'border-black/10 bg-black/[0.02] focus-within:border-black/40 focus-within:ring-4 focus-within:ring-black/[0.04] dark:border-white/10 dark:bg-white/[0.03] dark:focus-within:border-white/40 dark:focus-within:ring-white/[0.06]'
        )}
      >
        <Icon
          size={17}
          className="pointer-events-none absolute left-4 text-slate-400 transition-colors dark:text-white/30"
        />
        {children}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-xs font-medium text-rose-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export default function Auth({ onLoginSuccess, theme, onToggleTheme }) {
  const [mode, setMode] = useState('register');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const controls = useAnimationControls();

  const isRegister = mode === 'register';
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const switchMode = (next) => {
    if (next === mode) return;
    setMode(next);
    setErrors({});
    setShowPassword(false);
    setForm((prev) => ({ ...prev, name: '', password: '' }));
  };

  const validate = () => {
    const next = {};
    if (isRegister && form.name.trim().length < 2) {
      next.name = 'Please enter your full name';
    }
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      next.email = 'Enter a valid email address';
    }
    if (form.password.length < 6) {
      next.password = 'Password must be at least 6 characters';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading || !validate()) return;

    setLoading(true);
    try {
      const { data } = await api.post(isRegister ? '/auth/register' : '/auth/login', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const firstName = (data.user?.name || '').split(' ')[0];
      toast.success(
        isRegister
          ? `Welcome to Taskly, ${firstName}! Let's get productive.`
          : `Welcome back, ${firstName}!`
      );
      onLoginSuccess(data.user);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.response
          ? 'Something went wrong. Please try again.'
          : 'Cannot reach the server. Check your connection and retry.');
      setErrors({ form: message });
      toast.error(message);
      controls.start(shake);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 bg-black text-white transition-colors dark:border-white/20 dark:bg-white dark:text-black">
              <ListTodo size={19} />
            </div>
            <div>
              <p className="font-display text-base font-bold leading-tight text-slate-900 dark:text-white">
                Taskly
              </p>
              <p className="text-xs text-slate-400 dark:text-white/30">Focus · Plan · Done</p>
            </div>
          </div>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* Intro / about */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-black/10 bg-white p-7 transition-colors duration-500 sm:p-10 dark:border-white/10 dark:bg-white/[0.02]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-black/[0.04] blur-3xl dark:bg-white/[0.06]"
            />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:border-white/15 dark:text-white/50">
                <CheckCircle2 size={12} />
                Purpose-built for focus
              </span>

              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                Your ultimate
                <br />
                smart planner.
              </h1>

              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-500 dark:text-white/45">
                Taskly helps you organize tasks, boost productivity, and achieve your daily goals —
                without the noise. Plan the day, protect your focus, and finish knowing exactly what
                matters.
              </p>

              <ul className="mt-9 space-y-5">
                {HIGHLIGHTS.map((item, index) => (
                  <motion.li
                    key={item.title}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.09, duration: 0.45 }}
                    className="flex gap-4"
                  >
                    <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-black/10 text-slate-700 dark:border-white/12 dark:text-white/85">
                      <item.icon size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-slate-500 dark:text-white/40">
                        {item.copy}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="relative mt-9 grid grid-cols-3 gap-3 border-t border-black/10 pt-6 dark:border-white/10">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-wider text-slate-400 dark:text-white/35">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Auth card */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
            className="rounded-3xl border border-black/10 bg-white p-7 transition-colors duration-500 sm:p-9 dark:border-white/10 dark:bg-white/[0.02]"
          >
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-white/45">
              {isRegister
                ? 'Start organizing your day in under a minute.'
                : 'Sign in to pick up right where you left off.'}
            </p>

            <div
              role="tablist"
              aria-label="Authentication mode"
              className="relative mt-7 grid w-full grid-cols-2 gap-1 rounded-xl border border-black/10 p-1 dark:border-white/10"
            >
              {[
                { id: 'register', label: 'Register' },
                { id: 'login', label: 'Login' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={mode === tab.id}
                  onClick={() => switchMode(tab.id)}
                  className={cn(
                    'relative rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors duration-300',
                    mode === tab.id
                      ? 'text-white dark:text-black'
                      : 'text-slate-500 hover:text-slate-900 dark:text-white/45 dark:hover:text-white'
                  )}
                >
                  {mode === tab.id && (
                    <motion.span
                      layoutId="auth-tab"
                      className="absolute inset-0 rounded-lg bg-black dark:bg-white"
                      transition={spring}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            <motion.div animate={controls} className="mt-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.form
                  key={mode}
                  onSubmit={handleSubmit}
                  noValidate
                  initial={{ opacity: 0, x: isRegister ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isRegister ? -20 : 20 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="space-y-4"
                >
                  {isRegister && (
                    <Field id={nameId} icon={UserIcon} label="Full name" error={errors.name}>
                      <input
                        id={nameId}
                        type="text"
                        value={form.name}
                        onChange={setField('name')}
                        placeholder="Alex Carter"
                        autoComplete="name"
                        aria-invalid={Boolean(errors.name)}
                        className="w-full bg-transparent py-3.5 pl-12 pr-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-400/70 outline-none dark:text-white dark:placeholder:text-white/25"
                      />
                    </Field>
                  )}

                  <Field id={emailId} icon={Mail} label="Email address" error={errors.email}>
                    <input
                      id={emailId}
                      type="email"
                      value={form.email}
                      onChange={setField('email')}
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={Boolean(errors.email)}
                      className="w-full bg-transparent py-3.5 pl-12 pr-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-400/70 outline-none dark:text-white dark:placeholder:text-white/25"
                    />
                  </Field>

                  <Field
                    id={passwordId}
                    icon={Lock}
                    label="Password"
                    error={errors.password}
                  >
                    <input
                      id={passwordId}
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={setField('password')}
                      placeholder={isRegister ? 'At least 6 characters' : 'Your password'}
                      autoComplete={isRegister ? 'new-password' : 'current-password'}
                      aria-invalid={Boolean(errors.password)}
                      className="w-full bg-transparent py-3.5 pl-12 pr-12 text-[15px] font-medium text-slate-900 placeholder:text-slate-400/70 outline-none dark:text-white dark:placeholder:text-white/25"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3.5 text-slate-400 transition-colors hover:text-slate-700 dark:text-white/30 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </Field>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-black py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-black/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:focus-visible:ring-white/20"
                  >
                    <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-black/15" />
                    {loading ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Lock size={16} />
                    )}
                    {loading
                      ? isRegister
                        ? 'Creating account…'
                        : 'Signing in…'
                      : isRegister
                        ? 'Create account'
                        : 'Sign in'}
                  </button>

                  {errors.form && (
                    <p
                      role="alert"
                      className="rounded-lg border border-rose-500/25 bg-rose-500/[0.07] px-3.5 py-2.5 text-center text-xs font-medium text-rose-500"
                    >
                      {errors.form}
                    </p>
                  )}
                </motion.form>
              </AnimatePresence>
            </motion.div>

            <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400 dark:text-white/30">
              <ShieldCheck size={13} />
              Passwords are hashed and your tasks stay private.
            </p>

            <p className="mt-4 text-center text-sm text-slate-500 dark:text-white/45">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => switchMode(isRegister ? 'login' : 'register')}
                className="font-semibold text-slate-900 underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-black/60 dark:text-white dark:decoration-white/25 dark:hover:decoration-white/70"
              >
                {isRegister ? 'Login' : 'Register'}
              </button>
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
