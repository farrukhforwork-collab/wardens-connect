import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../services/api.js';

const navItems = [
  { label: 'Feed', to: '/' },
  { label: 'Chat', to: '/chat' },
  { label: 'Pages', to: '/pages' },
  { label: 'Welfare', to: '/welfare' },
  { label: 'Admin', to: '/admin' }
];

const AppLayout = ({ children }) => {
  const { user, logout, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [welfare, setWelfare] = useState({ balance: 0, totalIncome: 0, totalExpense: 0 });
  const [monthFilter, setMonthFilter] = useState('');
  const [notice, setNotice] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    station: '',
    city: '',
    phone: '',
    avatarUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const initials = useMemo(() => {
    if (!user?.fullName) return 'WC';
    return user.fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      fullName: user.fullName || '',
      station: user.station || '',
      city: user.city || '',
      phone: user.phone || '',
      avatarUrl: user.avatarUrl || ''
    });
    const missingProfile = !user.avatarUrl || !user.station || !user.city || !user.phone;
    setProfileOpen(missingProfile);
  }, [user]);

  useEffect(() => {
    const loadSidebar = async () => {
      try {
        const [welfareRes, noticeRes] = await Promise.all([
          api.get('/welfare/dashboard', {
            params: monthFilter ? { month: monthFilter } : undefined
          }),
          api.get('/posts', { params: { official: true, limit: 1 } })
        ]);
        setWelfare({
          balance: welfareRes.data.balance || 0,
          totalIncome: welfareRes.data.totalIncome || 0,
          totalExpense: welfareRes.data.totalExpense || 0
        });
        setNotice(noticeRes.data.posts?.[0] || null);
      } catch (error) {
        // ignore sidebar load failures
      }
    };
    loadSidebar();
  }, [monthFilter]);

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/uploads', formData);
      setProfileForm((prev) => ({ ...prev, avatarUrl: data.url }));
    } catch (error) {
      setUploadError(error?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    await updateProfile(profileForm);
    setProfileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src="/wc-logo.svg" alt="Wardens Connect" className="h-10 w-10" />
            <div>
              <p className="font-display text-lg leading-none">Wardens Connect</p>
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                Private Network
              </p>
            </div>
          </Link>
          <div className="hidden flex-1 lg:block">
            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              Search wardens, posts, pages
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              className="rounded-full border border-slate-200 px-3 py-1 text-sm dark:border-slate-700"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button
              className="rounded-full bg-accent-500 px-3 py-1 text-sm font-medium text-white"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr_320px]">
        <aside className="hidden lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                  {initials}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{user?.fullName}</p>
                <p className="text-xs text-slate-500">{user?.role?.name}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-xs text-slate-500">
              <p>Station: {user?.station || 'HQ'}</p>
              <p>City: {user?.city || 'Punjab'}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-widest text-slate-400">Navigation</p>
            <nav className="mt-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-accent-500/15 text-accent-600'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-h-[70vh] space-y-6">{children}</main>

        <aside className="hidden lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-slate-400">Welfare Summary</p>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900"
              >
                <option value="">All</option>
                {Array.from({ length: 6 }).map((_, index) => {
                  const date = new Date();
                  date.setUTCMonth(date.getUTCMonth() - index);
                  const monthValue = `${date.getUTCFullYear()}-${String(
                    date.getUTCMonth() + 1
                  ).padStart(2, '0')}`;
                  const label = date.toLocaleString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  });
                  return (
                    <option key={monthValue} value={monthValue}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm">Balance: PKR {welfare.balance}</p>
              <p className="text-xs text-slate-500">Monthly Income: PKR {welfare.totalIncome}</p>
              <p className="text-xs text-slate-500">Monthly Expenses: PKR {welfare.totalExpense}</p>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-widest text-slate-400">Official Notice</p>
            {notice ? (
              <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                <p className="font-semibold">{notice.author?.fullName}</p>
                <p className="text-xs text-slate-400">
                  {notice.category} •{' '}
                  {new Date(notice.createdAt).toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </p>
                <p className="mt-2">{notice.text}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                No official notices yet. Urdu: ???? ???? ?????? ???? ???? ???? ????
              </p>
            )}
          </div>
        </aside>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
        <div className="flex items-center justify-around text-xs">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? 'text-accent-600'
                  : 'text-slate-500 dark:text-slate-400'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {profileOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-soft">
            <h3 className="font-display text-xl">Complete your profile</h3>
            <p className="mt-1 text-sm text-slate-500">
              Add profile photo and contact info to access the network.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                placeholder="Full name"
              />
              <input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                placeholder="Phone"
              />
              <input
                value={profileForm.station}
                onChange={(e) => setProfileForm({ ...profileForm, station: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                placeholder="Station"
              />
              <input
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                placeholder="City"
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              {profileForm.avatarUrl ? (
                <img
                  src={profileForm.avatarUrl}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                  {initials}
                </div>
              )}
              <label className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">
                {uploading ? 'Uploading...' : 'Upload Photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleAvatarUpload(e.target.files?.[0])}
                  disabled={uploading}
                />
              </label>
              <span className="text-xs text-slate-400">Max 10MB</span>
            </div>
            {uploadError ? <p className="mt-2 text-xs text-red-500">{uploadError}</p> : null}
            <div className="mt-6 flex justify-end">
              <button
                onClick={saveProfile}
                className="rounded-full bg-accent-500 px-6 py-2 text-sm font-semibold text-white"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AppLayout;
