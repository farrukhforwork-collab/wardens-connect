import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { connectSocket } from '../services/socket.js';
import { useAuth } from '../context/AuthContext.jsx';

const Chat = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data } = await api.get('/groups');
      setGroups(data.groups || []);
      if (data.groups?.length) setActiveGroup(data.groups[0]);
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user._id);
    socket.on('group:message', (message) => {
      if (message.group === activeGroup?._id) {
        setMessages((prev) => prev.concat(message));
      }
    });
    return () => {
      socket.off('group:message');
    };
  }, [user, activeGroup]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeGroup) return;
      const { data } = await api.get('/messages', { params: { groupId: activeGroup._id } });
      setMessages(data.messages || []);
    };
    loadMessages();
  }, [activeGroup]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!text.trim() || !activeGroup) return;
    await api.post('/messages', { group: activeGroup._id, text });
    setText('');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-display text-lg">Groups</h3>
        <div className="mt-4 space-y-2">
          {groups.map((group) => (
            <button
              key={group._id}
              onClick={() => setActiveGroup(group)}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm ${
                activeGroup?._id === group._id
                  ? 'bg-accent-500/15 text-accent-600'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {group.name}
              <span className="block text-xs text-slate-400">{group.type}</span>
            </button>
          ))}
        </div>
      </aside>
      <section className="flex h-[70vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h3 className="font-display">{activeGroup?.name || 'Select a group'}</h3>
          <p className="text-xs text-slate-500">WhatsApp-style real-time chat</p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                msg.from === user?._id
                  ? 'ml-auto bg-accent-500 text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
              placeholder="Type a message"
            />
            <button className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white">
              Send
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Chat;
