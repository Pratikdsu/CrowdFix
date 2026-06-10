import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">📧</div>
        <h2 className="font-display text-xl font-bold text-ink mb-2">Check your email</h2>
        <p className="text-muted text-sm mb-6">
          We sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.
        </p>
        <Link to="/login" className="text-indigo font-medium hover:underline text-sm">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink mb-1">Create account</h1>
      <p className="text-muted text-sm mb-6">Join CrowdFix and report civic issues</p>

      {error && (
        <div className="bg-crimson-soft text-crimson text-sm px-4 py-3 rounded-[10px] mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">Full name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ramesh Sharma"
            className="w-full px-3 py-2.5 rounded-[10px] border border-line bg-bg text-ink text-sm outline-none focus:border-crimson transition-colors"
          />
        </div>

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

        <div>
          <label className="text-sm font-medium text-ink block mb-1.5">Confirm password</label>
          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 rounded-[10px] border border-line bg-bg text-ink text-sm outline-none focus:border-crimson transition-colors"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-crimson text-white py-2.5 rounded-[10px] text-sm font-semibold hover:bg-crimson-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </div>

      <p className="text-center text-sm text-muted mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}