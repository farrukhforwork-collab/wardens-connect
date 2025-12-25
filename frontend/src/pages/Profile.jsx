import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const loadProfile = async () => {
    if (!user?._id) return;
    try {
      const { data } = await api.get(`/users/${user._id}/profile`);
      setProfile(data.user);
      setPosts(data.posts || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load profile');
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?._id]);

  const uploadFile = async (file, type) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/uploads', formData);
      const updates = type === 'cover' ? { coverUrl: data.url } : { avatarUrl: data.url };
      await updateProfile(updates);
      await loadProfile();
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    await api.patch('/users/me/password', {
      currentPassword: passwordForm.currentPassword || undefined,
      newPassword: passwordForm.newPassword
    });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordSuccess('Password updated.');
  };

  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <section className="brand-card overflow-hidden rounded-3xl">
        <div className="relative">
          {profile?.coverUrl ? (
            <img src={profile.coverUrl} alt="Cover" className="h-48 w-full object-cover" />
          ) : (
            <div className="h-48 bg-gradient-to-r from-[#BDB76B] via-[#FDFBD4] to-[#CE8946]" />
          )}
          <div className="absolute -bottom-8 left-6 flex items-end gap-4">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="h-20 w-20 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="h-20 w-20 rounded-full border-4 border-white bg-slate-200" />
            )}
            <div className="pb-3">
              <h2 className="text-xl font-semibold text-slate-900">{profile?.fullName}</h2>
              <p className="text-xs text-slate-500">
                {(profile?.rank || profile?.role?.name || 'Warden') +
                  ' | ' +
                  (profile?.station || 'HQ') +
                  ' | ' +
                  (profile?.city || 'Punjab')}
              </p>
            </div>
          </div>
          <div className="absolute right-4 top-4 flex gap-2">
            <label className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
              {uploading ? 'Uploading...' : 'Update cover'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => uploadFile(e.target.files?.[0], 'cover')}
                disabled={uploading}
              />
            </label>
            <label className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
              Update photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => uploadFile(e.target.files?.[0], 'avatar')}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
        <div className="px-6 pb-6 pt-12">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Service ID</p>
              <p className="text-sm text-slate-700">{profile?.serviceId || '-'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Phone</p>
              <p className="text-sm text-slate-700">{profile?.phone || '-'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="brand-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-700">Security</h3>
          <form onSubmit={handlePasswordUpdate} className="mt-4 grid gap-3 md:grid-cols-3">
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="Current password"
            />
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="New password"
              required
            />
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              placeholder="Confirm password"
              required
            />
            {passwordError ? (
              <p className="text-xs text-red-500 md:col-span-3">{passwordError}</p>
            ) : null}
            {passwordSuccess ? (
              <p className="text-xs text-green-600 md:col-span-3">{passwordSuccess}</p>
            ) : null}
            <button className="brand-button rounded-full px-4 py-2 text-sm font-semibold text-white md:col-span-3">
              Update password
            </button>
          </form>
        </div>

        <h3 className="text-sm font-semibold text-slate-700">Recent Posts</h3>
        {posts.length ? (
          posts.map((post) => (
            <article key={post._id} className="brand-card rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    {post.category}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {new Date(post.createdAt).toLocaleString('en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
                {post.isOfficialNotice ? (
                  <span className="brand-pill rounded-full px-2 py-1 text-xs">Official</span>
                ) : null}
              </div>
              <p className="mt-3 text-sm text-slate-700">{post.text}</p>
              {post.media?.length ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {post.media.slice(0, 3).map((item) => (
                    <div
                      key={item.url}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                    >
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.name || 'Media'}
                          className="h-40 w-full object-cover"
                        />
                      ) : item.type === 'video' ? (
                        <video src={item.url} controls className="h-40 w-full object-cover" />
                      ) : (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-40 items-center justify-center text-xs text-slate-600"
                        >
                          View document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <p className="text-sm text-slate-500">No posts yet.</p>
        )}
      </section>
    </div>
  );
};

export default Profile;

