import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

const Welfare = () => {
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

  const loadDashboard = async () => {
    const { data } = await api.get('/welfare/dashboard');
    setDashboard(data);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await api.post('/welfare/transactions', {
      ...form,
      amount: Number(form.amount)
    });
    setForm({ type: 'income', amount: '', category: '', reason: '', beneficiaryName: '' });
    loadDashboard();
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-soft dark:bg-slate-900">
          <p className="text-xs uppercase text-slate-400">Total Balance</p>
          <p className="mt-2 font-display text-2xl text-accent-600">PKR {dashboard.balance}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft dark:bg-slate-900">
          <p className="text-xs uppercase text-slate-400">Monthly Income</p>
          <p className="mt-2 font-display text-2xl">PKR {dashboard.totalIncome}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft dark:bg-slate-900">
          <p className="text-xs uppercase text-slate-400">Monthly Expenses</p>
          <p className="mt-2 font-display text-2xl">PKR {dashboard.totalExpense}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-soft dark:bg-slate-900">
          <p className="text-xs uppercase text-slate-400">Transparency</p>
          <p className="mt-2 text-sm text-slate-500">Updated daily</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg">Add Welfare Transaction (Admin)</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 md:grid-cols-3">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Amount"
            required
          />
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Category (medical, accident)"
            required
          />
          <input
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Reason"
          />
          <input
            value={form.beneficiaryName}
            onChange={(e) => setForm({ ...form, beneficiaryName: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Beneficiary (optional)"
          />
          <button className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white md:col-span-3">
            Add Transaction
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
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
