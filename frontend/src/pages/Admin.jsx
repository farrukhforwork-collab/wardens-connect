import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const Admin = () => {
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState('');
  const [stationFilter, setStationFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    serviceId: '',
    cnic: '',
    roleName: 'Warden',
    station: '',
    city: '',
    phone: ''
  });
  const [createError, setCreateError] = useState('');
  const [inviteForm, setInviteForm] = useState({
    email: '',
    serviceId: '',
    roleName: 'Warden',
    expiresInDays: 7
  });
  const [inviteLink, setInviteLink] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [pendingRoles, setPendingRoles] = useState({});
  const [superAdminForm, setSuperAdminForm] = useState({
    fullName: '',
    email: '',
    password: '',
    serviceId: '',
    blockUserId: ''
  });
  const [superAdminError, setSuperAdminError] = useState('');
  const [superAdminSuccess, setSuperAdminSuccess] = useState('');
  const [hideSuperAdminForm, setHideSuperAdminForm] = useState(false);

  const loadData = async () => {
    const [pendingRes, reportsRes] = await Promise.all([
      api.get('/users/pending'),
      api.get('/reports')
    ]);
    setPending(pendingRes.data.users || []);
    setReports(reportsRes.data.reports || []);
    const usersRes = await api.get('/users');
    setUsers(usersRes.data.users || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const approveUser = async (id) => {
    await api.patch(`/users/${id}/approve`);
    const roleName = pendingRoles[id];
    if (roleName) {
      await api.patch(`/users/${id}/role`, { roleName });
    }
    loadData();
  };

  const blockUser = async (id) => {
    await api.patch(`/users/${id}/block`);
    loadData();
  };

  const createUser = async (event) => {
    event.preventDefault();
    setCreateError('');
    try {
      await api.post('/users', createForm);
      setCreateForm({
        fullName: '',
        email: '',
        serviceId: '',
        cnic: '',
        roleName: 'Warden',
        station: '',
        city: '',
        phone: ''
      });
      loadData();
    } catch (err) {
      setCreateError(err?.response?.data?.message || 'Failed to create user');
    }
  };

  const createInvite = async (event) => {
    event.preventDefault();
    setInviteError('');
    setInviteLink('');
    try {
      const { data } = await api.post('/invites', inviteForm);
      setInviteLink(data.link);
    } catch (err) {
      setInviteError(err?.response?.data?.message || 'Failed to create invite');
    }
  };

  const createSuperAdmin = async (event) => {
    event.preventDefault();
    setSuperAdminError('');
    setSuperAdminSuccess('');
    try {
      await api.post('/admin/superadmin', superAdminForm);
      setSuperAdminForm({
        fullName: '',
        email: '',
        password: '',
        serviceId: '',
        blockUserId: ''
      });
      setSuperAdminSuccess('Super admin created.');
      setHideSuperAdminForm(true);
      loadData();
    } catch (err) {
      setSuperAdminError(err?.response?.data?.message || 'Failed to create super admin');
    }
  };

  const filteredPending = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pending.filter((user) => {
      const matchesQuery =
        !query ||
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.serviceId?.toLowerCase().includes(query);
      const matchesStation = !stationFilter || user.station === stationFilter;
      const matchesCity = !cityFilter || user.city === cityFilter;
      return matchesQuery && matchesStation && matchesCity;
    });
  }, [pending, search, stationFilter, cityFilter]);

  const stationOptions = useMemo(
    () => Array.from(new Set(users.map((user) => user.station).filter(Boolean))).sort(),
    [users]
  );
  const cityOptions = useMemo(
    () => Array.from(new Set(users.map((user) => user.city).filter(Boolean))).sort(),
    [users]
  );
  const superAdmins = useMemo(
    () =>
      users.filter(
        (u) => u.isSuperAdmin || u.role?.name === 'Super Admin'
      ),
    [users]
  );

  return (
    <div className="space-y-6">
      {!hideSuperAdminForm ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-display text-lg">Create New Super Admin</h2>
          <form onSubmit={createSuperAdmin} className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              value={superAdminForm.fullName}
              onChange={(e) =>
                setSuperAdminForm({ ...superAdminForm, fullName: e.target.value })
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
              placeholder="Full name"
              required
            />
            <input
              value={superAdminForm.email}
              onChange={(e) =>
                setSuperAdminForm({ ...superAdminForm, email: e.target.value })
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
              placeholder="Official email"
              type="email"
              required
            />
            <input
              value={superAdminForm.password}
              onChange={(e) =>
                setSuperAdminForm({ ...superAdminForm, password: e.target.value })
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
              placeholder="Password (min 8)"
              type="password"
              required
            />
            <input
              value={superAdminForm.serviceId}
              onChange={(e) =>
                setSuperAdminForm({ ...superAdminForm, serviceId: e.target.value })
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
              placeholder="Service ID (optional)"
            />
            <select
              value={superAdminForm.blockUserId}
              onChange={(e) =>
                setSuperAdminForm({ ...superAdminForm, blockUserId: e.target.value })
              }
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900 md:col-span-2"
            >
              <option value="">Do not block old super admin</option>
              {superAdmins.map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.fullName} ({admin.email || admin.serviceId || 'No email'})
                </option>
              ))}
            </select>
            <button className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white md:col-span-3">
              Create Super Admin
            </button>
          </form>
          {superAdminError ? (
            <p className="mt-3 text-xs text-red-500">{superAdminError}</p>
          ) : null}
          {superAdminSuccess ? (
            <p className="mt-3 text-xs text-green-600">{superAdminSuccess}</p>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg">Create User (Invite)</h2>
        <form onSubmit={createUser} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            value={createForm.fullName}
            onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Full name"
            required
          />
          <input
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Official email"
            type="email"
            required
          />
          <input
            value={createForm.serviceId}
            onChange={(e) => setCreateForm({ ...createForm, serviceId: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Service ID"
            required
          />
          <input
            value={createForm.cnic}
            onChange={(e) => setCreateForm({ ...createForm, cnic: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="CNIC"
            required
          />
          <select
            value={createForm.roleName}
            onChange={(e) => setCreateForm({ ...createForm, roleName: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <option>Warden</option>
            <option>Moderator</option>
            <option>Admin</option>
            <option>Super Admin</option>
          </select>
          <input
            value={createForm.station}
            onChange={(e) => setCreateForm({ ...createForm, station: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Sector/Office"
          />
          <input
            value={createForm.city}
            onChange={(e) => setCreateForm({ ...createForm, city: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="City"
          />
          <input
            value={createForm.phone}
            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Phone"
          />
          <button className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white md:col-span-3">
            Create Invite
          </button>
        </form>
        {createError ? <p className="mt-3 text-xs text-red-500">{createError}</p> : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg">Generate Invite Link</h2>
        <form onSubmit={createInvite} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Invite email"
            type="email"
            required
          />
          <input
            value={inviteForm.serviceId}
            onChange={(e) => setInviteForm({ ...inviteForm, serviceId: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Service ID"
            required
          />
          <select
            value={inviteForm.roleName}
            onChange={(e) => setInviteForm({ ...inviteForm, roleName: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <option>Warden</option>
            <option>Moderator</option>
            <option>Admin</option>
            <option>Super Admin</option>
          </select>
          <input
            value={inviteForm.expiresInDays}
            onChange={(e) => setInviteForm({ ...inviteForm, expiresInDays: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Expires in days"
            type="number"
            min="1"
          />
          <button className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white md:col-span-2">
            Generate Link
          </button>
        </form>
        {inviteError ? <p className="mt-3 text-xs text-red-500">{inviteError}</p> : null}
        {inviteLink ? (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs">
            <p className="font-semibold">Invite Link</p>
            <p className="break-all text-slate-600">{inviteLink}</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg">Pending Approvals</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Search name, email, service ID"
          />
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="">All sectors/offices</option>
            {stationOptions.map((station) => (
              <option key={station} value={station}>
                {station}
              </option>
            ))}
          </select>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="">All cities</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 space-y-3">
          {filteredPending.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div>
                <p className="font-semibold">{user.fullName}</p>
                <p className="text-xs text-slate-500">
                  {user.serviceId} | {user.station || 'Sector/Office'} | {user.city || 'City'}
                </p>
                <p className="text-xs text-slate-400">{user.phone || 'No phone'}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={pendingRoles[user._id] || user.role?.name || 'Warden'}
                  onChange={(e) =>
                    setPendingRoles((prev) => ({ ...prev, [user._id]: e.target.value }))
                  }
                  className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                >
                  <option>Warden</option>
                  <option>Moderator</option>
                  <option>Admin</option>
                  <option>Super Admin</option>
                </select>
                <button
                  onClick={() => approveUser(user._id)}
                  className="rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => blockUser(user._id)}
                  className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold text-red-500"
                >
                  Block
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-display text-lg">Reported Content</h2>
        <div className="mt-4 space-y-3">
          {reports.map((report) => (
            <div
              key={report._id}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{report.type}</span>
                <span className="text-xs text-slate-400">{report.status}</span>
              </div>
              <p className="text-xs text-slate-500">Reason: {report.reason}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Admin;

