import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../lib/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      setAuth(res.data.user, res.data.token);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Welcome back</h1>
      <p className="text-muted text-sm mb-6">Sign in to your CrowdFix account</p>

      {error && (
        <div className="bg-crimson-soft text-crimson text-sm px-4 py-3 rounded-[10px] mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 rounded-[10px] border border-line bg-bg text-ink text-sm outline-none focus:border-crimson transition-colors"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 rounded-[10px] border border-line bg-bg text-ink text-sm outline-none focus:border-crimson transition-colors"
          />
        </div>

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-indigo hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-crimson text-white py-2.5 rounded-[10px] text-sm font-semibold hover:bg-crimson-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>

      <p className="text-center text-sm text-muted mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}