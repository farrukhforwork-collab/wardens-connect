import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('email');
  const [form, setForm] = useState({ email: '', serviceId: '', cnic: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      if (mode === 'email') {
        await login({ email: form.email });
      } else {
        await login({ serviceId: form.serviceId, cnic: form.cnic });
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">Sign in</h2>
          <p className="text-sm text-slate-500">Invite-only access for verified wardens</p>
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setMode('email')}
          className={`rounded-full px-4 py-2 text-sm ${
            mode === 'email'
              ? 'bg-accent-500 text-white'
              : 'border border-slate-200 text-slate-500'
          }`}
        >
          Email Login
        </button>
        <button
          onClick={() => setMode('service')}
          className={`rounded-full px-4 py-2 text-sm ${
            mode === 'service'
              ? 'bg-accent-500 text-white'
              : 'border border-slate-200 text-slate-500'
          }`}
        >
          Service ID + CNIC
        </button>
      </div>
      <form className="mt-6 space-y-4 animate-rise" onSubmit={handleSubmit}>
        {mode === 'email' ? (
          <div>
            <label className="text-xs uppercase tracking-widest text-slate-400">Official Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
              placeholder="warden@punjabpolice.gov.pk"
              required
            />
          </div>
        ) : (
          <>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-400">Service ID</label>
              <input
                value={form.serviceId}
                onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
                placeholder="PTW-00123"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-400">CNIC</label>
              <input
                value={form.cnic}
                onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"
                placeholder="12345-6789012-3"
                required
              />
            </div>
          </>
        )}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        <button className="brand-button w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white">
          Continue
        </button>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Accounts require admin approval.</span>
          <Link
            to="/request-access"
            className="brand-pill rounded-full px-3 py-1 font-semibold"
          >
            Create account (invite only)
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
