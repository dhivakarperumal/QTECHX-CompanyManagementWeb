import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Search, SlidersHorizontal, Star, Trash2, X, MessageSquareQuote } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
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

const AdminReviewsSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ ...emptyReview });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews');
      setReviews(res.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reviews;
    return reviews.filter((review) => [
      review.customer_name,
      review.product_name,
      review.review_title,
      review.review,
      review.admin_reply,
      review.status,
    ].join(' ').toLowerCase().includes(term));
  }, [reviews, search]);

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
      await fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save review');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/reviews/${deleteTarget.id}`);
      toast.success('Review deleted');
      setDeleteTarget(null);
      await fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 text-white min-h-screen">
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-bold text-white">Delete review?</h3>
            <p className="mb-6 text-sm text-white/50">Are you sure you want to delete <span className="font-semibold text-white">"{deleteTarget.customer_name}"</span>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10">Cancel</button>
              <button onClick={handleDeleteConfirm} disabled={deleting} className="flex-1 rounded-xl border border-rose-500/30 bg-rose-500/10 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 disabled:opacity-60">
                {deleting ? <Loader2 size={15} className="mx-auto animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="rounded-4xl border border-white/10 bg-[#12131a]/70 p-6 shadow-2xl shadow-black/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/settings')} className="h-11 w-11 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15">
              <MessageSquareQuote size={22} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Review Management</h1>
              <p className="text-sm text-white/40">Manage customer reviews, rating status, and admin replies.</p>
            </div>
          </div>
          <button onClick={openNewReview} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600">
            <Plus size={16} /> Add Review
          </button>
        </div>
      </div>

      <div className="rounded-4xl border border-white/10 bg-[#12131a]/70 p-4 shadow-2xl shadow-black/20">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer, product, review, status..." className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/35 outline-none focus:border-orange-500/50" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            <SlidersHorizontal size={12} /> {filteredReviews.length} reviews
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-10 text-white/40">
            <Loader2 size={18} className="mr-2 animate-spin" /> Loading reviews...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredReviews.map((review) => (
              <div key={review.id} className="rounded-3xl border border-white/10 bg-[#0f1117] p-5 shadow-lg shadow-black/10">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-bold text-white">{review.customer_name}</p>
                    <p className="text-sm text-white/50">{review.product_name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditReview(review)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white/70 hover:bg-white/10">Edit</button>
                    <button onClick={() => setDeleteTarget(review)} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20">Delete</button>
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-2 text-amber-400">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} size={14} fill={star <= Number(review.rating || 0) ? 'currentColor' : 'none'} />
                  ))}
                </div>

                <p className="mb-2 text-sm font-semibold text-white/80">{review.review_title || 'Customer feedback'}</p>
                <p className="mb-3 line-clamp-4 text-sm text-white/60">{review.review || 'No review content yet.'}</p>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/60">{review.status}</span>
                  {review.featured && <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-orange-400">Featured</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="h-full w-full max-w-3xl overflow-y-auto border-l border-white/10 bg-[#12141c] p-6 shadow-2xl shadow-black/40">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Review' : 'Add New Review'}</h2>
                <p className="text-sm text-white/40">{editingId ? 'Update the review details.' : 'Create a customer review entry with correct status and rating.'}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10">
                <X size={18} className="text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-10">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/60">Customer Name</label>
                  <input value={draft.customer_name} onChange={(e) => setDraft((prev) => ({ ...prev, customer_name: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" placeholder="John Doe" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/60">Product / Service</label>
                  <input value={draft.product_name} onChange={(e) => setDraft((prev) => ({ ...prev, product_name: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" placeholder="Website development" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/60">Rating</label>
                  <select value={draft.rating} onChange={(e) => setDraft((prev) => ({ ...prev, rating: Number(e.target.value) }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50">
                    {ratingOptions.map((option) => (
                      <option key={option} value={option} className="bg-[#12141c] text-white">{option} Star{option > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/60">Status</label>
                  <select value={draft.status} onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50">
                    {statusOptions.map((option) => (
                      <option key={option} value={option} className="bg-[#12141c] text-white">{option}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/60">Review Title</label>
                  <input value={draft.review_title} onChange={(e) => setDraft((prev) => ({ ...prev, review_title: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" placeholder="Excellent work and smooth communication" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/60">Review</label>
                  <textarea value={draft.review} onChange={(e) => setDraft((prev) => ({ ...prev, review: e.target.value }))} rows={5} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" placeholder="Write the customer feedback here..." />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/60">Admin Reply</label>
                  <textarea value={draft.admin_reply} onChange={(e) => setDraft((prev) => ({ ...prev, admin_reply: e.target.value }))} rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" placeholder="Optional admin response..." />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/75">
                <input type="checkbox" checked={Boolean(draft.featured)} onChange={(e) => setDraft((prev) => ({ ...prev, featured: e.target.checked }))} className="h-4 w-4 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500" />
                Featured review
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10">Cancel</button>
                <button type="submit" className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">{editingId ? 'Update Review' : 'Save Review'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviewsSettingsPage;
