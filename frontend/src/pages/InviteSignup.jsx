import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';

const InviteSignup = () => {
  const { token } = useParams();
  const [invite, setInvite] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    cnic: '',
    password: '',
    confirmPassword: '',
    station: '',
    city: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadInvite = async () => {
      try {
        const { data } = await api.get(`/invites/${token}`);
        setInvite(data.invite);
      } catch (err) {
        setError(err?.response?.data?.message || 'Invite is not valid');
      }
    };
    loadInvite();
  }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const { data } = await api.post(`/invites/${token}/register`, {
        ...form,
        confirmPassword: undefined
      });
      setSuccess(data.message || 'Submitted for approval');
    } catch (err) {
      setError(err?.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl">Invite Registration</h2>
      <p className="text-sm text-slate-500">Complete your details to request access.</p>
      {invite ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
          <p>Email: {invite.email}</p>
          <p>Service ID: {invite.serviceId}</p>
          <p>Role: {invite.role}</p>
        </div>
      ) : null}
      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-green-600">{success}</p> : null}
      {!success && invite ? (
        <form onSubmit={submit} className="mt-6 grid gap-3 md:grid-cols-2">
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Full name"
            required
          />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Phone"
          />
          <input
            value={form.cnic}
            onChange={(e) => setForm({ ...form, cnic: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="CNIC"
            required
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Password (min 8 characters)"
            required
          />
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Confirm password"
            required
          />
          <input
            value={form.station}
            onChange={(e) => setForm({ ...form, station: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Sector/Office"
          />
          <input
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="City"
          />
          <button className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white md:col-span-2">
            Submit for approval
          </button>
        </form>
      ) : null}
    </div>
  );
};

export default InviteSignup;
