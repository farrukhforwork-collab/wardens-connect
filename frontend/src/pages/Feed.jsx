import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Feed = () => {
  const { user } = useAuth();
  const location = useLocation();
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

  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return (params.get('q') || '').trim().toLowerCase();
  }, [location.search]);

  const filteredPosts = useMemo(() => {
    if (!query) return posts;
    return posts.filter((post) => {
      const author = post.author?.fullName || '';
      const station = post.author?.station || '';
      const city = post.author?.city || '';
      const category = post.category || '';
      const textValue = post.text || '';
      const haystack = ${author}    .toLowerCase();
      return haystack.includes(query);
    });
  }, [posts, query]);

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
            className="h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm"
            placeholder="Write something for wardens..."
          />
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isOfficialNotice}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm"
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
            <button className="brand-button rounded-full px-4 py-2 text-sm font-semibold text-white">
              Publish
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4 animate-stagger">
        {filteredPosts.length ? (
          filteredPosts.map((post) => (
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
                  <Link to={post.author?._id ? '/profile/' + post.author._id : '/profile'} className="text-sm font-semibold text-slate-900 hover:text-amber-700">{post.author?.fullName}</Link>
                  <p className="text-xs text-slate-400">
                    {(post.author?.rank || post.author?.role?.name || 'Warden') +
                      ' | ' +
                      (post.author?.station || 'HQ') +
                      ' | ' +
                      (post.author?.city || 'Punjab')}
                  </p>
                  <p className="text-xs text-slate-500">{post.category}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {post.isOfficialNotice ? (
                  <span className="brand-pill rounded-full px-2 py-1 text-xs">Official Notice</span>
                ) : null}
                {post.isPinned ? (
                  <span className="rounded-full bg-slate-200 px-2 py-1 text-xs text-slate-500">
                    Pinned
                  </span>
                ) : null}
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-700">{post.text}</p>
            {post.media?.length ? (
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {post.media.slice(0, 3).map((item) => (
                  <div
                    key={item.url}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                  >
                    {item.type === 'image' ? (
                      <img src={item.url} alt={item.name || 'Media'} className="h-40 w-full object-cover" />
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
            <div className="mt-4 flex gap-3 text-xs text-slate-500">
              <button
                className="rounded-full border border-slate-200 px-3 py-1"
                onClick={() => toggleLike(post._id)}
              >
                Like ({post.likes?.length || 0})
              </button>
              <button
                className="rounded-full border border-slate-200 px-3 py-1"
                onClick={() => toggleComments(post._id)}
              >
                Comment
              </button>
              <button className="rounded-full border border-slate-200 px-3 py-1">
                Share
              </button>
            </div>
            {openComments[post._id] && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                <form onSubmit={(event) => submitComment(event, post._id)} className="flex gap-2">
                  <input
                    value={commentDrafts[post._id] || ''}
                    onChange={(e) =>
                      setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))
                    }
                    className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs"
                    placeholder="Write a comment..."
                  />
                  <button className="brand-button rounded-full px-4 py-2 text-xs font-semibold text-white">
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
          ))
        ) : (
          <p className="text-sm text-slate-500">No posts found for this search.</p>
        )}
      </section>
    </div>
  );
};

export default Feed;







