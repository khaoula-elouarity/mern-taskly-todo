import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ListTodo } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import api from './lib/api';
import { useTheme } from './hooks/useTheme';
import Auth from './components/Auth';
import TodoList from './components/TodoList';

function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#f4f4f5_0%,#ffffff_45%,#fafafa_100%)] dark:bg-[linear-gradient(135deg,#08080a_0%,#0e0e10_45%,#0a0a0c_100%)]" />
      <div className="orb -left-24 -top-28 h-80 w-80 animate-float bg-black/[0.10] dark:bg-white/[0.10]" />
      <div className="orb -right-20 -top-10 h-96 w-96 animate-float-slow bg-black/[0.08] dark:bg-white/[0.08]" />
      <div className="orb bottom-[-18%] left-[26%] h-[26rem] w-[26rem] animate-float bg-black/[0.07] dark:bg-white/[0.07] [animation-delay:-5s]" />
      <div className="orb bottom-[6%] right-[10%] h-72 w-72 animate-float-slow bg-black/[0.06] dark:bg-white/[0.06] [animation-delay:-9s]" />
      <div className="grid-overlay" />
    </div>
  );
}

function SplashScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-3 rounded-3xl border-2 border-dashed border-brand-400/40"
          />
          <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-white text-black dark:border-black/15 dark:bg-black dark:text-white">
            <ListTodo size={28} />
          </div>
        </div>
        <p className="font-display text-lg font-bold text-slate-700 dark:text-slate-200">Taskly</p>
        <p className="animate-pulse-soft text-sm text-slate-400">Verifying your session</p>
      </div>
    </div>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() =>
    localStorage.getItem('token') ? 'loading' : 'signedOut'
  );

  // Verify the persisted session against the server on mount
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    let active = true;

    api
      .get('/auth/me')
      .then(({ data }) => {
        if (!active) return;
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setStatus('signedIn');
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setStatus('signedOut');
      });

    return () => {
      active = false;
    };
  }, []);

  // Log out everywhere when a token expires mid-session
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setStatus('signedOut');
    };
    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setStatus('signedIn');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setStatus('signedOut');
  };

  const toastOptions = {
    duration: 3200,
    style: {
      borderRadius: '14px',
      background: theme === 'dark' ? 'rgba(15, 23, 42, 0.92)' : '#ffffff',
      color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
      border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(226,232,240,0.9)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      backdropFilter: 'blur(12px)',
      fontSize: '14px',
      fontWeight: 500,
      padding: '12px 16px',
      maxWidth: '360px',
    },
    success: {
      iconTheme: {
        primary: theme === 'dark' ? '#ffffff' : '#0a0a0a',
        secondary: theme === 'dark' ? '#0a0a0a' : '#ffffff',
      },
    },
    error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' } },
  };

  return (
    <>
      <Background />
      <main className="relative z-10">
        {status === 'loading' ? (
          <SplashScreen />
        ) : (
          <AnimatePresence mode="wait">
            {status === 'signedIn' && user ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <TodoList user={user} theme={theme} onToggleTheme={toggleTheme} onLogout={handleLogout} />
              </motion.div>
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Auth onLoginSuccess={handleLogin} theme={theme} onToggleTheme={toggleTheme} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
      <Toaster position="top-center" toastOptions={toastOptions} />
    </>
  );
}
