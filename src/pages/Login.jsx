import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Lock, User } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { isAuthenticated, setToken, setUser } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axiosClient.post('/auth/login', { username, password });
      const token = res?.data?.data?.token;
      const user = res?.data?.data?.user;

      if (!token) {
        setError('Phản hồi đăng nhập không hợp lệ. Vui lòng thử lại.');
        return;
      }

      setToken(token);
      if (user) setUser(user);
      navigate('/', { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 401
          ? 'Sai tên đăng nhập hoặc mật khẩu.'
          : 'Đăng nhập thất bại. Vui lòng thử lại.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(135deg, var(--color-background) 0%, var(--color-surface-container) 45%, #dce9ff 100%)',
        }}
      />
      <div
        className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-30 blur-3xl -z-10"
        style={{ background: 'var(--color-primary-tint)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl -z-10"
        style={{ background: 'var(--color-secondary)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--color-primary)] text-white mb-4"
            style={{ boxShadow: 'var(--shadow-modal)' }}
          >
            <Building2 size={28} />
          </motion.div>
          <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">Quản Lý Phòng Trọ</h1>
          <p className="text-[var(--color-on-surface-variant)] mt-1 text-sm">
            Đăng nhập để tiếp tục quản lý
          </p>
        </div>

        <div
          className="bg-white p-6 sm:p-8 border border-[var(--color-outline)]"
          style={{ borderRadius: 'var(--radius-modal)', boxShadow: 'var(--shadow-modal)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-lg border border-red-200 bg-[var(--color-error-light)] px-4 py-3 text-sm text-[var(--color-error)]"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label htmlFor="username" className="ds-label block mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                />
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  disabled={loading}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field !pl-10 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[var(--color-surface-container-low)]"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="ds-label block mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-10 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[var(--color-surface-container-low)]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="btn-primary w-full !py-3"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--color-muted)] mt-6">
          Mặc định: admin / admin123
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
