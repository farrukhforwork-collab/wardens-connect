import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

const Pages = () => {
  const [pages, setPages] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'community', description: '' });

  const loadPages = async () => {
    const { data } = await api.get('/pages');
    setPages(data.pages || []);
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    await api.post('/pages', form);
    setForm({ name: '', type: 'community', description: '' });
    loadPages();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg">Create Page</h2>
        <form onSubmit={handleCreate} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Page name"
            required
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="department">Department Official</option>
            <option value="welfare">Welfare</option>
            <option value="training">Training & Awareness</option>
            <option value="sports">Sports & Events</option>
            <option value="memorial">Shaheed Memorial</option>
            <option value="community">Community</option>
          </select>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Short description"
          />
          <button className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white md:col-span-3">
            Create
          </button>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {pages.map((page) => (
          <div
            key={page._id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display">{page.name}</h3>
              <span className="rounded-full bg-accent-500/15 px-2 py-1 text-xs text-accent-600">
                {page.type}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {page.description || 'No description yet.'}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Pages;
