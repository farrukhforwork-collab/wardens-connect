import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const Welfare = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState({
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
    transactions: []
  });
  const [form, setForm] = useState({
    type: 'income',
    amount: '',
    category: '',
    reason: '',
    beneficiaryName: ''
  });
  const [polls, setPolls] = useState([]);
  const [pollForm, setPollForm] = useState({
    title: '',
    description: '',
    options: ''
  });
  const [pollError, setPollError] = useState('');
  const [pollSubmitting, setPollSubmitting] = useState(false);

  const loadDashboard = async () => {
    const { data } = await api.get('/welfare/dashboard');
    setDashboard(data);
  };

  const loadPolls = async () => {
    const { data } = await api.get('/welfare/polls');
    setPolls(data.polls || []);
  };

  useEffect(() => {
    loadDashboard();
    loadPolls();
  }, []);

  const isAdmin =
    user?.isSuperAdmin || user?.role?.name === 'Admin' || user?.role?.name === 'Super Admin';

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post('/welfare/transactions', {
      ...form,
      amount: Number(form.amount)
    });
    setForm({ type: 'income', amount: '', category: '', reason: '', beneficiaryName: '' });
    loadDashboard();
  };

  const handleCreatePoll = async (event) => {
    event.preventDefault();
    setPollError('');
    const options = pollForm.options
      .split(',')
      .map((opt) => opt.trim())
      .filter(Boolean);
    if (!pollForm.title.trim() || options.length < 2) {
      setPollError('Title and at least two options are required.');
      return;
    }
    setPollSubmitting(true);
    try {
      await api.post('/welfare/polls', {
        title: pollForm.title,
        description: pollForm.description,
        options
      });
      setPollForm({ title: '', description: '', options: '' });
      loadPolls();
    } finally {
      setPollSubmitting(false);
    }
  };

  const votePoll = async (pollId, optionIndex) => {
    await api.post(`/welfare/polls/${pollId}/vote`, { optionIndex });
    loadPolls();
  };

  const closePoll = async (pollId) => {
    await api.patch(`/welfare/polls/${pollId}/close`);
    loadPolls();
  };

  return (
    <div className="space-y-6">
      <section className={`grid gap-4 ${isAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <div className="brand-card rounded-2xl p-5">
          <p className="text-xs uppercase text-slate-400">Total Balance</p>
          <p className="mt-2 font-display text-2xl text-amber-700">PKR {dashboard.balance}</p>
        </div>
        <div className="brand-card rounded-2xl p-5">
          <p className="text-xs uppercase text-slate-400">Monthly Income</p>
          <p className="mt-2 font-display text-2xl">PKR {dashboard.totalIncome}</p>
        </div>
        <div className="brand-card rounded-2xl p-5">
          <p className="text-xs uppercase text-slate-400">Monthly Expenses</p>
          <p className="mt-2 font-display text-2xl">PKR {dashboard.totalExpense}</p>
        </div>
        {isAdmin ? (
          <div className="brand-card rounded-2xl p-5">
            <p className="text-xs uppercase text-slate-400">Transparency</p>
            <p className="mt-2 text-sm text-slate-500">Updated daily</p>
          </div>
        ) : null}
      </section>

      {isAdmin ? (
        <section className="brand-card rounded-2xl p-5">
          <h2 className="font-display text-lg">Add Welfare Transaction (Admin)</h2>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="Amount"
              required
            />
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="Category (medical, accident)"
              required
            />
            <input
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="Reason"
            />
            <input
              value={form.beneficiaryName}
              onChange={(e) => setForm({ ...form, beneficiaryName: e.target.value })}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="Beneficiary (optional)"
            />
            <button className="brand-button rounded-full px-4 py-2 text-sm font-semibold text-white md:col-span-3">
              Add Transaction
            </button>
          </form>
        </section>
      ) : null}

      <section className="brand-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg">Welfare Voting</h2>
          <span className="text-xs text-slate-500">
            Highest votes indicate priority support need.
          </span>
        </div>
        {isAdmin ? (
          <form onSubmit={handleCreatePoll} className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              value={pollForm.title}
              onChange={(e) => setPollForm({ ...pollForm, title: e.target.value })}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm md:col-span-2"
              placeholder="Poll title (e.g., Medical aid for wardens)"
              required
            />
            <input
              value={pollForm.description}
              onChange={(e) => setPollForm({ ...pollForm, description: e.target.value })}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="Short description"
            />
            <input
              value={pollForm.options}
              onChange={(e) => setPollForm({ ...pollForm, options: e.target.value })}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm md:col-span-3"
              placeholder="Options (comma separated)"
              required
            />
            {pollError ? <p className="text-xs text-red-500 md:col-span-3">{pollError}</p> : null}
            <button
              className="brand-button rounded-full px-4 py-2 text-sm font-semibold text-white md:col-span-3"
              disabled={pollSubmitting}
            >
              {pollSubmitting ? 'Creating...' : 'Create Poll'}
            </button>
          </form>
        ) : null}

        <div className="mt-6 space-y-4">
          {polls.length ? (
            polls.map((poll) => (
              <div key={poll.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{poll.title}</p>
                    {poll.description ? (
                      <p className="text-xs text-slate-500">{poll.description}</p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                    {poll.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {poll.options.map((option, idx) => (
                    <div
                      key={`${poll.id}-${option.label}`}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm"
                    >
                      <span>{option.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{option.votes} votes</span>
                        <button
                          className="rounded-full border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700"
                          onClick={() => votePoll(poll.id, idx)}
                          disabled={poll.status !== 'open' || poll.hasVoted}
                        >
                          {poll.hasVoted ? 'Voted' : 'Vote'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {poll.winner ? (
                  <p className="mt-3 text-xs text-slate-500">
                    Leading: <span className="font-semibold">{poll.winner.label}</span>
                  </p>
                ) : null}
                {isAdmin && poll.status === 'open' ? (
                  <button
                    onClick={() => closePoll(poll.id)}
                    className="mt-3 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                  >
                    Close poll
                  </button>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No polls yet.</p>
          )}
        </div>
      </section>

      <section className="brand-card rounded-2xl p-5">
        <h2 className="font-display text-lg">Transaction History</h2>
        <div className="mt-4 space-y-3">
          {dashboard.transactions.map((tx) => (
            <div
              key={tx._id}
              className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{tx.category}</span>
                <span className={tx.type === 'income' ? 'text-green-600' : 'text-red-500'}>
                  {tx.type === 'income' ? '+' : '-'} PKR {tx.amount}
                </span>
              </div>
              <p className="text-xs text-slate-500">{tx.reason || 'No reason provided'}</p>
              <p className="text-xs text-slate-400">
                Beneficiary: {tx.beneficiaryAnonymized ? 'Anonymous' : tx.beneficiaryName || 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Welfare;
