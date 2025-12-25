import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import { connectSocket } from '../services/socket.js';
import { useAuth } from '../context/AuthContext.jsx';

const Chat = () => {
  const { user } = useAuth();
  const [view, setView] = useState('direct');
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const init = async () => {
      const [groupsRes, usersRes] = await Promise.all([
        api.get('/groups'),
        api.get('/users/chat')
      ]);
      const groupList = groupsRes.data.groups || [];
      const userList = usersRes.data.users || [];
      setGroups(groupList);
      setUsers(userList);
      if (groupList.length) setActiveGroup(groupList[0]);
      if (userList.length) setActiveUser(userList[0]);
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user._id);
    socket.on('group:message', (message) => {
      if (view === 'group' && message.group === activeGroup?._id) {
        setMessages((prev) => prev.concat(message));
      }
    });
    socket.on('message:new', (message) => {
      if (view === 'direct') {
        const matches =
          message.from === activeUser?._id || message.to === activeUser?._id;
        if (matches) setMessages((prev) => prev.concat(message));
      }
    });
    socket.on('presence:update', ({ userId, online }) => {
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isOnline: online } : u))
      );
    });
    return () => {
      socket.off('group:message');
      socket.off('message:new');
      socket.off('presence:update');
    };
  }, [user, view, activeGroup, activeUser]);

  useEffect(() => {
    if (!user || !activeGroup) return;
    const socket = connectSocket(user._id);
    socket.emit('join-group', { groupId: activeGroup._id });
  }, [user, activeGroup]);

  useEffect(() => {
    const loadMessages = async () => {
      if (view === 'group') {
        if (!activeGroup) return;
        const { data } = await api.get('/messages', { params: { groupId: activeGroup._id } });
        setMessages(data.messages || []);
      }
      if (view === 'direct') {
        if (!activeUser) return;
        const { data } = await api.get('/messages', { params: { withUser: activeUser._id } });
        setMessages(data.messages || []);
      }
    };
    loadMessages();
  }, [view, activeGroup, activeUser]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!text.trim() && !attachment) return;
    if (view === 'group' && activeGroup) {
      await api.post('/messages', { group: activeGroup._id, text: text.trim(), attachment });
    }
    if (view === 'direct' && activeUser) {
      await api.post('/messages', { to: activeUser._id, text: text.trim(), attachment });
    }
    setText('');
    setAttachment(null);
    setUploadError('');
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File too large (max 10MB)');
      return;
    }
    setUploadError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/uploads', formData);
      const type = data.type || (file.type.startsWith('video') ? 'video' : 'image');
      setAttachment({ url: data.url, type, name: file.name });
    } catch (err) {
      setUploadError(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((u) =>
      `${u.fullName} ${u.station || ''} ${u.city || ''}`.toLowerCase().includes(query)
    );
  }, [users, search]);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="brand-card rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('direct')}
            className={`rounded-full px-3 py-2 text-xs font-semibold ${
              view === 'direct' ? 'bg-amber-100 text-amber-700' : 'text-slate-500'
            }`}
          >
            Direct
          </button>
          <button
            onClick={() => setView('group')}
            className={`rounded-full px-3 py-2 text-xs font-semibold ${
              view === 'group' ? 'bg-amber-100 text-amber-700' : 'text-slate-500'
            }`}
          >
            Groups
          </button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-3 w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs"
          placeholder="Search wardens"
        />
        <div className="mt-4 space-y-2">
          {view === 'direct'
            ? filteredUsers.map((warden) => (
                <button
                  key={warden._id}
                  onClick={() => setActiveUser(warden)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                    activeUser?._id === warden._id
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-slate-600 hover:bg-amber-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        warden.isOnline ? 'bg-green-500' : 'bg-slate-300'
                      }`}
                    />
                    <span className="font-medium">{warden.fullName}</span>
                  </div>
                  <span className="block text-xs text-slate-400">
                    {(warden.rank || warden.role?.name || 'Warden') +
                      ' | ' +
                      (warden.station || 'HQ')}
                  </span>
                </button>
              ))
            : groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => setActiveGroup(group)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                    activeGroup?._id === group._id
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-slate-600 hover:bg-amber-50'
                  }`}
                >
                  {group.name}
                  <span className="block text-xs text-slate-400">{group.type}</span>
                </button>
              ))}
        </div>
      </aside>
      <section className="flex h-[70vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="font-display">
            {view === 'direct' ? activeUser?.fullName || 'Select a warden' : activeGroup?.name || 'Select a group'}
          </h3>
          <p className="text-xs text-slate-500">
            {view === 'direct'
              ? activeUser?.isOnline
                ? 'Online now'
                : 'Offline'
              : 'Group chat'}
          </p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                msg.from === user?._id
                  ? 'ml-auto bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {msg.text ? <p>{msg.text}</p> : null}
              {msg.attachment ? (
                <div className="mt-2 overflow-hidden rounded-xl bg-white/70">
                  {msg.attachment.type === 'image' ? (
                    <img
                      src={msg.attachment.url}
                      alt={msg.attachment.name || 'Attachment'}
                      className="h-40 w-full object-cover"
                    />
                  ) : msg.attachment.type === 'video' ? (
                    <video src={msg.attachment.url} controls className="h-40 w-full object-cover" />
                  ) : (
                    <a
                      href={msg.attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-24 items-center justify-center text-xs text-slate-700"
                    >
                      View document
                    </a>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="border-t border-slate-200 p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-600">
              {uploading ? 'Uploading...' : 'Add media'}
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
                disabled={uploading}
              />
            </label>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
              placeholder="Type a message"
            />
            <button className="brand-button rounded-full px-4 py-2 text-sm font-semibold text-white">
              Send
            </button>
          </div>
          {attachment ? (
            <div className="mt-2 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span>Attached: {attachment.name || attachment.type}</span>
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="text-amber-700"
              >
                Remove
              </button>
            </div>
          ) : null}
          {uploadError ? <p className="mt-2 text-xs text-red-500">{uploadError}</p> : null}
        </form>
      </section>
    </div>
  );
};

export default Chat;
