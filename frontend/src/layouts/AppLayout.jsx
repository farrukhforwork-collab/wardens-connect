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
  { label: 'Profile', to: '/profile' },
  { label: 'Admin', to: '/admin' }
];

const AppLayout = ({ children }) => {
  const { user, logout, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [welfare, setWelfare] = useState({ balance: 0, totalIncome: 0, totalExpense: 0 });
  const [monthFilter, setMonthFilter] = useState('');
  const [notices, setNotices] = useState([]);
  const [noticeMonth, setNoticeMonth] = useState('');
  const [noticeSort, setNoticeSort] = useState('newest');
  const [profileOpen, setProfileOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    station: '',
    city: '',
    phone: '',
    avatarUrl: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const isAdmin =
    user?.isSuperAdmin || user?.role?.name === 'Admin' || user?.role?.name === 'Super Admin';
  const visibleNavItems = isAdmin
    ? navItems
    : navItems.filter((item) => item.to !== '/admin');

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
    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  useEffect(() => {
    const loadSidebar = async () => {
      try {
        const welfareRes = await api.get('/welfare/dashboard', {
          params: monthFilter ? { month: monthFilter } : undefined
        });
        setWelfare({
          balance: welfareRes.data.balance || 0,
          totalIncome: welfareRes.data.totalIncome || 0,
          totalExpense: welfareRes.data.totalExpense || 0
        });
      } catch (error) {
        // ignore sidebar load failures
      }
    };
    loadSidebar();
  }, [monthFilter]);

  useEffect(() => {
    const loadNotices = async () => {
      try {
        const res = await api.get('/posts', { params: { official: true, limit: 50 } });
        setNotices(res.data.posts || []);
      } catch (error) {
        // ignore
      }
    };
    loadNotices();
  }, []);

  const filteredNotices = useMemo(() => {
    const list = notices.filter((notice) => {
      if (!noticeMonth) return true;
      const date = new Date(notice.createdAt);
      const monthValue = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
        2,
        '0'
      )}`;
      return monthValue === noticeMonth;
    });
    return list.sort((a, b) => {
      const diff = new Date(a.createdAt) - new Date(b.createdAt);
      return noticeSort === 'newest' ? -diff : diff;
    });
  }, [notices, noticeMonth, noticeSort]);

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

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 sm:px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/wc-logo.svg" alt="Wardens Connect" className="h-9 w-9" />
            <div className="hidden sm:block">
              <p className="font-display text-sm uppercase tracking-[0.3em] text-slate-400">
                Wardens Connect
              </p>
            </div>
          </Link>
          <div className="hidden flex-1 lg:block">
            <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 sm:px-4 text-sm text-slate-500">
              Search wardens, posts, pages
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {installPrompt ? (
              <button
                onClick={handleInstall}
                className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
              >
                Install
              </button>
            ) : null}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200"
              aria-label="Search"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" strokeWidth="2" />
              </svg>
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200"
              aria-label="Notifications"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
                <path
                  d="M6 9a6 6 0 1112 0c0 7 3 6 3 8H3c0-2 3-1 3-8z"
                  strokeWidth="2"
                />
                <path d="M9 19a3 3 0 006 0" strokeWidth="2" />
              </svg>
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? 'L' : 'D'}
            </button>
            <button
              className="brand-button hidden rounded-full px-3 py-1 text-sm font-medium text-white sm:inline-flex"
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-3 pt-4 sm:hidden">
        <div className="brand-card rounded-2xl p-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
              Search wardens, posts, pages
            </div>
            <Link to="/#create-post" className="brand-button rounded-full px-3 py-2 text-xs text-white">
              Post
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-4 px-3 py-5 sm:gap-6 sm:px-4 lg:grid-cols-[260px_1fr_320px]">
        <aside className="hidden lg:block">
          <div className="brand-card rounded-2xl p-4">
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
                <p className="text-xs text-slate-500">
                  {(user?.rank || user?.role?.name || 'Warden') + ' | ' + (user?.station || 'HQ')}
                </p>
                <p className="text-[11px] text-slate-400">{user?.city || 'Punjab'}</p>
              </div>
            </div>
          </div>

          <div className="brand-card mt-4 rounded-2xl p-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Navigation</p>
            <nav className="mt-4 flex flex-col gap-2">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
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
          <div className="brand-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-slate-400">Welfare Summary</p>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600"
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
              <p className="text-xs text-slate-500">
                Monthly Expenses: PKR {welfare.totalExpense}
              </p>
            </div>
          </div>
          <div className="brand-card mt-4 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-slate-400">Official Notices</p>
              <div className="flex items-center gap-2">
                <select
                  value={noticeMonth}
                  onChange={(e) => setNoticeMonth(e.target.value)}
                  className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600"
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
                <select
                  value={noticeSort}
                  onChange={(e) => setNoticeSort(e.target.value)}
                  className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {filteredNotices.length ? (
                filteredNotices.slice(0, 5).map((notice) => (
                  <div key={notice._id} className="rounded-2xl bg-slate-50 p-3 text-xs">
                    <p className="font-semibold text-slate-700">
                      {notice.author?.fullName || 'Official'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(notice.createdAt).toLocaleString('en-GB', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                    <p className="mt-2 text-slate-600">{notice.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No official notices yet.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <div className="mx-auto mt-2 space-y-4 px-4 pb-24 lg:hidden">
        <div className="brand-card rounded-2xl p-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">Welfare Summary</p>
          <div className="mt-3 grid gap-2 text-sm">
            <p>Balance: PKR {welfare.balance}</p>
            <p className="text-xs text-slate-500">Monthly Income: PKR {welfare.totalIncome}</p>
            <p className="text-xs text-slate-500">Monthly Expenses: PKR {welfare.totalExpense}</p>
          </div>
        </div>
        <div className="brand-card rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-slate-400">Official Notices</p>
            <select
              value={noticeMonth}
              onChange={(e) => setNoticeMonth(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600"
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
          <div className="mt-3 space-y-3">
            {filteredNotices.length ? (
              filteredNotices.slice(0, 3).map((notice) => (
                <div key={notice._id} className="rounded-2xl bg-slate-50 p-3 text-xs">
                  <p className="font-semibold text-slate-700">
                    {notice.author?.fullName || 'Official'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(notice.createdAt).toLocaleString('en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                  <p className="mt-2 text-slate-600">{notice.text}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No official notices yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-40 mx-auto flex max-w-sm items-center justify-between rounded-full border border-slate-200 bg-white px-3 py-2 sm:px-4 text-xs shadow-soft lg:hidden">
        <Link to="/#create-post" className="brand-button rounded-full px-3 py-2 sm:px-4 text-white">
          New post
        </Link>
        <Link to="/welfare" className="rounded-full border border-slate-200 px-3 py-2 sm:px-4">
          Welfare
        </Link>
        {isAdmin ? (
          <Link to="/#create-post" className="rounded-full border border-slate-200 px-3 py-2">
            Notice
          </Link>
        ) : null}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-2 sm:px-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-around text-xs">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'text-amber-700' : 'text-slate-500'
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
                placeholder="Sector/Office"
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
              <label className="rounded-full border border-slate-200 px-3 py-2 sm:px-4 text-xs font-semibold text-slate-600">
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
                className="brand-button rounded-full px-6 py-2 text-sm font-semibold text-white"
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







