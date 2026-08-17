import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Filter,
  LayoutGrid,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  List,
  UserCheck,
  UserX,
  Clock,
  AlertCircle,
  Loader2,
  Eye,
  Edit2,
  Settings,
  MessageSquareQuote,
  Star,
  Settings2,
  FileText,
  MessageCircle
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import { useAuth } from '../../PrivateRouter/AuthContext';

const emptyReview = {
  id: null,
  customer_name: '',
  product_name: '',
  rating: 5,
  review_title: '',
  review: '',
  admin_reply: '',
  status: 'Pending',
  featured: false,
};

const normalizeReview = (review = {}) => ({
  ...emptyReview,
  ...review,
  rating: Number(review.rating || 5),
  featured: Boolean(review.featured),
  status: review.status || 'Pending',
});

const ratingOptions = [1, 2, 3, 4, 5];
const statusOptions = ['Pending', 'Approved', 'Rejected', 'Reported'];

const fmtDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const Avatar = ({ name, index }) => {
  const AVATAR_COLOURS = [
    'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'bg-purple-500/15 text-purple-400 border-purple-500/30',
    'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  ];
  const colour = AVATAR_COLOURS[index % AVATAR_COLOURS.length];
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center border font-bold text-sm shrink-0 ${colour}`}>
      {initial}
    </div>
  );
};

const StatusPill = ({ status }) => {
  const s = (status || '').toLowerCase();
  if (s === 'approved') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Approved</span>;
  if (s === 'rejected' || s === 'reported') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> {s === 'reported' ? 'Reported' : 'Rejected'}</span>;
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pending</span>;
};

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
      <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <h2 className="text-sm font-bold text-white tracking-wide">{title}</h2>
    </div>
    <div className="space-y-5">
      {children}
    </div>
  </div>
);

const AdminReviewsSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ ...emptyReview });
  
  const [viewMode, setViewMode] = useState('table');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews');
      setReviews(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const total = reviews.length;
  const approvedCount = reviews.filter(r => r.status === 'Approved').length;
  const pendingCount = reviews.filter(r => r.status === 'Pending').length;
  const rejectedCount = reviews.filter(r => ['Rejected', 'Reported'].includes(r.status)).length;

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reviews.filter((r) => {
      const matchSearch = !term ||
        [r.customer_name, r.product_name, r.review_title, r.review, r.admin_reply]
          .join(' ')
          .toLowerCase()
          .includes(term);
      const matchStatus = !statusFilter || (r.status || 'Pending').toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [reviews, search, statusFilter]);

  const hasFilters = !!(statusFilter || search);
  const clearFilters = () => { setSearch(''); setStatusFilter(''); };

  const stats = [
    { label: "Total Reviews", value: total,         icon: MessageSquareQuote, cls: "text-blue-400",    bg: "bg-blue-500/15" },
    { label: "Approved",      value: approvedCount, icon: UserCheck,          cls: "text-emerald-400", bg: "bg-emerald-500/15" },
    { label: "Pending",       value: pendingCount,  icon: Clock,              cls: "text-amber-400",   bg: "bg-amber-500/15" },
    { label: "Rejected",      value: rejectedCount, icon: UserX,              cls: "text-rose-400",    bg: "bg-rose-500/15" },
  ];

  const openNewReview = () => {
    const currentUserId = user?.user_id || user?.id || user?.uuid || user?.employee_id || user?.employeeId || 1;
    setEditingId(null);
    setDraft({
      ...emptyReview,
      created_by: currentUserId,
      updated_by: currentUserId,
    });
    setShowForm(true);
  };

  const openEditReview = (review) => {
    const currentUserId = user?.user_id || user?.id || user?.uuid || user?.employee_id || user?.employeeId || review?.updated_by || review?.created_by || 1;
    setEditingId(review.id);
    setDraft({
      ...normalizeReview(review),
      created_by: review.created_by || currentUserId,
      updated_by: currentUserId,
    });
    setShowForm(true);
  };

  const updateField = (field, value) => {
    setDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!draft.customer_name?.trim()) return toast.error('Customer name is required');
    if (!draft.product_name?.trim()) return toast.error('Product / service is required');
    if (!draft.review?.trim()) return toast.error('Review text is required');

    const currentUserId = user?.user_id || user?.id || user?.uuid || user?.employee_id || user?.employeeId || draft.updated_by || draft.created_by || 1;
    const payload = {
      ...draft,
      customer_name: draft.customer_name.trim(),
      product_name: draft.product_name.trim(),
      rating: Number(draft.rating || 5),
      review_title: draft.review_title?.trim() || '',
      review: draft.review.trim(),
      admin_reply: draft.admin_reply?.trim() || '',
      status: draft.status || 'Pending',
      featured: Boolean(draft.featured),
      created_by: currentUserId,
      updated_by: currentUserId,
    };

    try {
      if (editingId) {
        await api.put(`/reviews/${editingId}`, payload);
        toast.success('Review updated successfully');
      } else {
        await api.post('/reviews', payload);
        toast.success('Review added successfully');
      }
      setShowForm(false);
      setDraft({ ...emptyReview });
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save review');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/reviews/${deleteTarget.id}`);
      setDeleteMsg(`Review from "${deleteTarget.customer_name}" deleted successfully.`);
      setDeleteTarget(null);
      await fetchReviews();
      setTimeout(() => setDeleteMsg(""), 3500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">
      
      {/* ── Success toast ── */}
      {deleteMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={16} /> {deleteMsg}
        </div>
      )}

      {/* ── Modals ── */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Review?</h3>
            <p className="text-sm text-white/50 mb-6">Are you sure you want to delete the review by <span className="text-white font-semibold">"{deleteTarget.customer_name}"</span>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition">Cancel</button>
              <button onClick={handleDeleteConfirm} disabled={deleting} className="flex-1 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 transition flex items-center justify-center gap-2">
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <MessageSquareQuote size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">All Reviews</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? "Loading…" : `${total} review${total !== 1 ? "s" : ""} total`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchReviews}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-primary" : ""} />
          </button>
          <button
            onClick={openNewReview}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-primary/25 hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
          >
            <Plus size={15} /> Add Review
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.06] transition">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={18} className={s.cls} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-white/50 text-xs">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search customer, product, review, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
              <X size={13} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(v => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
            showFilters || hasFilters
              ? "bg-primary/15 border-primary/40 text-primary"
              : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasFilters && (
            <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
              {[statusFilter, search].filter(Boolean).length}
            </span>
          )}
          <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>

        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === "table" ? "bg-primary text-white shadow-md" : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
            title="Table View"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === "card" ? "bg-primary text-white shadow-md" : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
            title="Card View"
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Filter By</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 transition">
                <X size={10} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Review Status</p>
              <div className="flex flex-wrap gap-1.5">
                {statusOptions.map(s => (
                  <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition capitalize ${statusFilter === s ? "bg-primary/20 border-primary/50 text-primary" : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Error & Loading & Empty ── */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
          <AlertCircle size={16} className="shrink-0" />
          {error}
          <button onClick={fetchReviews} className="ml-auto text-xs underline underline-offset-2 hover:opacity-80">Retry</button>
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-primary/70" />
            <p className="text-sm text-white/40">Loading reviews…</p>
          </div>
        </div>
      )}
      {!loading && !error && filteredReviews.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <MessageSquareQuote size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No reviews found</p>
          <p className="text-xs mt-1">{hasFilters ? "Try adjusting your filters." : "Add a review manually to get started."}</p>
          {!hasFilters && (
            <button
              onClick={openNewReview}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
              <Plus size={14} /> Add First Review
            </button>
          )}
        </div>
      )}

      {/* ── TABLE MODE ── */}
      {!loading && !error && filteredReviews.length > 0 && viewMode === "table" && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Customer</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Review</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Rating</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Status</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Added</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors"
                  >
                    <td className="px-5 py-3.5 align-top">
                      <div className="flex items-start gap-3">
                        <Avatar name={r.customer_name} index={i} />
                        <div>
                          <p className="text-white font-semibold text-sm leading-tight">{r.customer_name || "Anonymous"}</p>
                          <p className="text-white/40 text-xs mt-0.5">{r.product_name || "Unknown Product"}</p>
                          {r.featured && <span className="inline-block mt-1 bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-[280px]">
                      <p className="text-white font-medium text-xs truncate mb-1">{r.review_title || "Customer Feedback"}</p>
                      <p className="text-white/50 text-[11px] line-clamp-2 leading-relaxed">{r.review}</p>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={12} fill={star <= Number(r.rating) ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <span className="text-white/35 text-xs">{fmtDate(r.created_at)}</span>
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEditReview(r)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition" title="View/Edit">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => openEditReview(r)} className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/25 text-primary border border-transparent hover:border-primary/30 flex items-center justify-center transition" title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(r)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CARD MODE ── */}
      {!loading && !error && filteredReviews.length > 0 && viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 mt-4">
          {filteredReviews.map((r, i) => (
            <div key={r.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={r.customer_name} index={i} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate flex items-center gap-1">
                      {r.customer_name || "Anonymous"} 
                      {r.featured && <Star size={12} className="text-primary fill-primary" />}
                    </p>
                    <p className="text-white/40 text-xs truncate">{r.product_name}</p>
                  </div>
                </div>
                <StatusPill status={r.status} />
              </div>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={12} fill={star <= Number(r.rating) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-semibold text-white truncate">{r.review_title}</p>
                <p className="text-xs text-white/50 line-clamp-3 leading-relaxed">
                  "{r.review}"
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                <p className="text-[10px] font-semibold text-white/30 tracking-wider">ADDED {fmtDate(r.created_at)}</p>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openEditReview(r); }} className="p-1.5 text-white/40 hover:text-primary transition"><Edit2 size={13} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }} className="p-1.5 text-white/40 hover:text-rose-400 transition"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Review Form Drawer ── */}
      {createPortal(
        <div className={`fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300 ${showForm ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
          <div className={`h-full w-full max-w-3xl overflow-y-auto border-l border-white/10 bg-[#12141c] p-6 shadow-2xl shadow-black/40 transition-transform duration-300 ${showForm ? "translate-x-0" : "translate-x-full"}`}>
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Review' : 'Add New Review'}</h2>
                <p className="text-sm text-white/40">{editingId ? 'Update review details and admin response.' : 'Create a customer review entry.'}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10">
                <X size={18} className="text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-10">
              <SectionCard icon={Settings2} title="General Information">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Customer Name</label>
                    <input value={draft.customer_name} onChange={(e) => updateField('customer_name', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Product / Service</label>
                    <input value={draft.product_name} onChange={(e) => updateField('product_name', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Website Development" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Rating (Out of 5)</label>
                    <select value={draft.rating} onChange={(e) => updateField('rating', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner">
                      {ratingOptions.map((option) => (
                        <option key={option} value={option}>{option} Star{option > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Status</label>
                    <select value={draft.status} onChange={(e) => updateField('status', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner">
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex h-[46px] w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#0a0b10] px-4 text-sm text-white hover:bg-white/5 transition-all shadow-inner">
                      <input type="checkbox" checked={Boolean(draft.featured)} onChange={(e) => updateField('featured', e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-[#0a0b10] text-primary focus:ring-primary focus:ring-offset-0" />
                      Mark as featured review (displays prominently)
                    </label>
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={FileText} title="Review Content">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Review Title</label>
                    <input value={draft.review_title} onChange={(e) => updateField('review_title', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Excellent work!" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Customer Review</label>
                    <textarea value={draft.review} onChange={(e) => updateField('review', e.target.value)} rows={5} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Write the customer feedback here..." />
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={MessageCircle} title="Admin Response">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Admin Reply</label>
                  <textarea value={draft.admin_reply} onChange={(e) => updateField('admin_reply', e.target.value)} rows={3} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Thank you for your feedback! (Optional)" />
                </div>
              </SectionCard>

              <div className="sticky bottom-0 -mx-6 -mb-6 mt-8 border-t border-white/10 bg-[#12141c]/90 p-6 backdrop-blur-md z-10">
                <button type="submit" className="w-full rounded-xl px-5 py-4 text-sm font-bold text-white transition hover:opacity-90 flex items-center justify-center gap-2 shadow-xl shadow-primary/20" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                  <Save size={18} /> {editingId ? 'Update Review' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminReviewsSettingsPage;
