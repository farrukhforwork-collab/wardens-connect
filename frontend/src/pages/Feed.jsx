import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [category, setCategory] = useState('personal');
  const [isOfficialNotice, setIsOfficialNotice] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});

  const loadPosts = async () => {
    const { data } = await api.get('/posts');
    setPosts(data.posts || []);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (isOfficialNotice) setCategory('departmental');
  }, [isOfficialNotice]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    await api.post('/posts', { text, category, isOfficialNotice });
    setText('');
    setIsOfficialNotice(false);
    loadPosts();
  };

  const isAdmin =
    user?.isSuperAdmin || user?.role?.name === 'Admin' || user?.role?.name === 'Super Admin';

  const toggleLike = async (postId) => {
    const { data } = await api.patch(`/posts/${postId}/like`);
    setPosts((prev) => prev.map((post) => (post._id === postId ? data.post : post)));
  };

  const toggleComments = async (postId) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!commentsByPost[postId]) {
      const { data } = await api.get(`/comments/${postId}`);
      setCommentsByPost((prev) => ({ ...prev, [postId]: data.comments || [] }));
    }
  };

  const submitComment = async (event, postId) => {
    event.preventDefault();
    const textValue = commentDrafts[postId]?.trim();
    if (!textValue) return;
    const { data } = await api.post(`/comments/${postId}`, { text: textValue });
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: (prev[postId] || []).concat(data.comment)
    }));
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-6">
      <section id="create-post" className="brand-card rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-slate-200" />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-slate-400">Create Post</p>
            <p className="text-sm text-slate-600">Share official notices or updates</p>
          </div>
        </div>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950"
            placeholder="Write something for wardens..."
          />
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isOfficialNotice}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <option value="departmental">Departmental</option>
              <option value="personal">Personal</option>
              <option value="welfare">Welfare</option>
              <option value="training">Training</option>
              <option value="achievements">Achievements</option>
            </select>
            {isAdmin ? (
              <label className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={isOfficialNotice}
                  onChange={(e) => setIsOfficialNotice(e.target.checked)}
                />
                Official notice
              </label>
            ) : null}
            <button className="rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-white">
              Publish
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4 animate-stagger">
        {posts.map((post) => (
          <article key={post._id} className="brand-card rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {post.author?.avatarUrl ? (
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.fullName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-slate-200" />
                )}
                <div>
                  <p className="text-sm font-semibold">{post.author?.fullName}</p>
                  <p className="text-xs text-slate-500">{post.category}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {post.isOfficialNotice ? (
                  <span className="rounded-full bg-accent-500/15 px-2 py-1 text-xs text-accent-600">
                    Official Notice
                  </span>
                ) : null}
                {post.isPinned ? (
                  <span className="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-500">
                    Pinned
                  </span>
                ) : null}
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-700 dark:text-slate-300">{post.text}</p>
            <div className="mt-4 flex gap-3 text-xs text-slate-500">
              <button
                className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700"
                onClick={() => toggleLike(post._id)}
              >
                Like ({post.likes?.length || 0})
              </button>
              <button
                className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700"
                onClick={() => toggleComments(post._id)}
              >
                Comment
              </button>
              <button className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
                Share
              </button>
            </div>
            {openComments[post._id] && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                <form onSubmit={(event) => submitComment(event, post._id)} className="flex gap-2">
                  <input
                    value={commentDrafts[post._id] || ''}
                    onChange={(e) =>
                      setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))
                    }
                    className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs dark:border-slate-800 dark:bg-slate-900"
                    placeholder="Write a comment..."
                  />
                  <button className="rounded-full bg-accent-500 px-4 py-2 text-xs font-semibold text-white">
                    Post
                  </button>
                </form>
                <div className="mt-3 space-y-2">
                  {(commentsByPost[post._id] || []).map((comment) => (
                    <div key={comment._id} className="rounded-xl bg-white p-3 text-xs shadow-sm">
                      <p className="font-semibold">{comment.author?.fullName || 'Warden'}</p>
                      <p className="text-slate-600">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
};

export default Feed;
