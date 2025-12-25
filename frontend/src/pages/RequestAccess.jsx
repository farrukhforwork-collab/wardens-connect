import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';

const ranks = ['C', 'HC', 'ASI', 'TW', 'LTW', 'STW', 'TRC', 'DSP'];

const RequestAccess = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    rank: 'TW',
    serviceId: '',
    cnic: '',
    station: '',
    city: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/requests/register', form);
      setSuccess(data.message || 'Request submitted');
    } catch (err) {
      setError(err?.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div>
      <h2 className="font-display text-2xl">Request Access</h2>
      <p className="text-sm text-slate-500">
        Invite-only system. Submit your details for admin approval.
      </p>
      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      {success ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-green-600">{success}</p>
          <Link
            to="/"
            className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600"
          >
            Back to home
          </Link>
        </div>
      ) : null}
      {!success ? (
        <form onSubmit={submit} className="mt-6 grid gap-3 md:grid-cols-2">
          <input
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Full name"
            required
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Official email"
            type="email"
            required
          />
          <div className="flex gap-2">
            <select
              value={form.rank}
              onChange={(e) => setForm({ ...form, rank: e.target.value })}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              {ranks.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
            <input
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
              placeholder="Service ID"
              required
            />
          </div>
          <input
            value={form.cnic}
            onChange={(e) => setForm({ ...form, cnic: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="CNIC"
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
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            placeholder="Phone"
          />
          <button className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white md:col-span-2">
            Submit Request
          </button>
        </form>
      ) : null}
    </div>
  );
};

export default RequestAccess;
