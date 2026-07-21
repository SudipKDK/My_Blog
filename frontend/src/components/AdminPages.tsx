import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  PlusCircle, Trash2, Edit3, Terminal,
  Eye, EyeOff, ChevronRight, ImagePlus, Loader2,
} from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import toast from 'react-hot-toast';
import { postsApi, uploadApi, authApi } from '../api/posts';
import { useAuth } from '../hooks/useAuth';
import { readingTime } from './CodeBlock';
import type { Post, PostFormData } from '../types';

// ─── Admin Login ──────────────────────────────────────────────────────────────

export const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/admin');
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { access_token } = await authApi.login(username, password);
      login(access_token);
      navigate('/admin');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 relative overflow-hidden w-full">
      <div className="absolute inset-0 bg-indigo-600/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-violet-600/5 blur-[100px] pointer-events-none" />

      <form
        onSubmit={handleLogin}
        className="bg-zinc-900/60 backdrop-blur-xl p-10 rounded-3xl border border-zinc-800 w-full max-w-md shadow-2xl relative z-10 animate-fade-in"
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/20">
            <Terminal size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Console</h1>
          <p className="text-zinc-600 text-xs mt-1.5 font-medium">Authenticate to access the dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="Enter username"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-700 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pr-11 text-white text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-700 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20 mt-2"
          >
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export const AdminDashboard = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    postsApi.getAll(page)
      .then(res => {
        setPosts(res.data);
        setTotalPages(Math.ceil(res.total / res.limit));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await postsApi.remove(id);
      setPosts(prev => prev.filter(p => p._id !== id));
      toast.success('Post deleted successfully');
    } catch {
      toast.error('Failed to delete post. Please try again.');
    }
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 rounded-xl skeleton" />
      {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl skeleton" />)}
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in text-left w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Registry</h1>
          <p className="text-zinc-600 text-xs font-semibold uppercase tracking-widest mt-1">
            {posts.length} post{posts.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link
          to="/admin/create"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-500/20"
        >
          <PlusCircle size={16} />New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-600 font-semibold text-sm mb-4">No posts yet</p>
          <Link to="/admin/create" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            <PlusCircle size={13} />Create your first post
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-black border-b border-zinc-900">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Post</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest hidden sm:table-cell">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {posts.map(post => (
                <tr key={post._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white text-sm mb-0.5 leading-snug">{post.title}</p>
                    <p className="text-[10px] text-zinc-600 font-mono-custom">{post.slug}</p>
                    <p className="text-[10px] text-zinc-700 mt-0.5">{readingTime(post.content)}</p>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={[
                      'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full',
                      post.published
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                    ].join(' ')}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/post/${post.slug}`}
                        target="_blank"
                        title="View post"
                        className="p-2 text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 rounded-lg transition-all"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        to={`/admin/edit/${post._id}`}
                        title="Edit post"
                        className="p-2 text-zinc-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                      >
                        <Edit3 size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(post._id, post.title)}
                        title="Delete post"
                        className="p-2 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-8 border-t border-zinc-900 pt-6">
          <button
            disabled={page === 1}
            onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            ← Previous
          </button>
          <span className="text-xs font-medium text-zinc-600">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

// ─── PostForm (shared by Create & Edit) ──────────────────────────────────────

interface PostFormProps {
  initialData?: Post;
  onSubmit: (data: PostFormData) => Promise<void>;
  submitting: boolean;
}

const PostForm = ({ initialData, onSubmit, submitting }: PostFormProps) => {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage ?? '');
  const [content, setContent] = useState(initialData?.content ?? '# New Post\n\nStart writing here…');
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [insertingImage, setInsertingImage] = useState(false);
  const contentImageRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title only when creating a new post
  useEffect(() => {
    if (!initialData) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  }, [title, initialData]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadApi.uploadImage(file);
      setCoverImage(url);
    } catch {
      toast.error('Image upload failed. Please try again.');
    }
  };

  const handleContentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInsertingImage(true);
    try {
      const url = await uploadApi.uploadImage(file);
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      setContent(prev => `${prev}\n![${alt}](${url})\n`);
    } catch {
      toast.error('Image upload failed. Please try again.');
    } finally {
      setInsertingImage(false);
      if (contentImageRef.current) contentImageRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ title, slug, content, coverImage, published });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-left animate-fade-in">

      {/* ── Title + Slug ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-zinc-900/40 p-7 rounded-2xl border border-zinc-800 space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Post Title</label>
            <input
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter post title"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-700 font-semibold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">URL Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-zinc-600 text-xs font-mono-custom">/post/</span>
              <input
                required
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="post-url-slug"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-700 font-mono-custom"
              />
            </div>
          </div>
        </div>

        {/* ── Cover Image ── */}
        <div className="bg-zinc-900/40 p-7 rounded-2xl border border-zinc-800">
          <label className="block text-[11px] font-bold text-zinc-500 mb-3 uppercase tracking-widest">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:uppercase file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 file:transition-colors cursor-pointer"
          />
          {coverImage && (
            <div className="mt-4 rounded-xl overflow-hidden border border-zinc-800 relative group">
              <img src={coverImage} alt="Cover preview" className="h-36 w-full object-cover" />
              <button
                type="button"
                onClick={() => setCoverImage('')}
                className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove cover image"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Content Editor ── */}
      <div data-color-mode="dark" className="bg-zinc-900/40 p-7 rounded-2xl border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Content</label>
          <input
            ref={contentImageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleContentImageUpload}
          />
          <button
            type="button"
            disabled={insertingImage}
            onClick={() => contentImageRef.current?.click()}
            className="inline-flex items-center gap-2 text-[11px] font-bold text-zinc-400 hover:text-white uppercase tracking-wider px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700 border border-zinc-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {insertingImage
              ? <><Loader2 size={12} className="animate-spin" /><span>Uploading…</span></>
              : <><ImagePlus size={12} /><span>Insert Image</span></>}
          </button>
        </div>
        <MDEditor
          value={content}
          onChange={v => setContent(v ?? '')}
          height={550}
          className="!border-zinc-800 !rounded-xl overflow-hidden"
        />
        <p className="text-[10px] text-zinc-700 mt-3 font-medium">
          Tip: You can also write <code className="text-zinc-600">![alt text](url)</code> directly in the editor.
        </p>
      </div>

      {/* ── Publish + Submit ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800 gap-5">
        <label className="flex items-center gap-4 cursor-pointer">
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-800 border border-zinc-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-indigo-600" />
          </div>
          <div>
            <span className="text-sm font-bold text-zinc-300">{published ? 'Published' : 'Draft'}</span>
            <p className="text-[10px] text-zinc-600 mt-0.5">
              {published ? 'Visible to everyone' : 'Only visible to admins'}
            </p>
          </div>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2.5 bg-white hover:bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed text-black hover:text-white px-7 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg group"
        >
          <span>{submitting ? 'Saving…' : 'Save Post'}</span>
          <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </form>
  );
};

// ─── Create Post ──────────────────────────────────────────────────────────────

export const CreatePost = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: PostFormData) => {
    setSubmitting(true);
    try {
      await postsApi.create(data);
      toast.success('Post created!');
      navigate('/admin');
    } catch {
      toast.error('Failed to create post. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left w-full">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">New Post</h1>
        <p className="text-zinc-600 text-xs font-medium mt-1">Fill in the details and publish when ready.</p>
      </div>
      <PostForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
};

// ─── Edit Post ────────────────────────────────────────────────────────────────

export const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    postsApi.getById(id)
      .then(setPost)
      .catch(console.error)
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (data: PostFormData) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await postsApi.update(id, data);
      toast.success('Post updated!');
      navigate('/admin');
    } catch {
      toast.error('Failed to update post.');
    } finally {
      setSubmitting(false);
    }
  };

  if (fetching) return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl skeleton" />)}
    </div>
  );

  if (!post) return (
    <div className="text-zinc-600 font-medium py-20 text-center">Post not found.</div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left w-full">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Edit Post</h1>
        <p className="text-zinc-600 text-xs font-medium mt-1 font-mono-custom">/{post.slug}</p>
      </div>
      <PostForm initialData={post} onSubmit={handleSubmit} submitting={submitting} />
    </div>
  );
};
