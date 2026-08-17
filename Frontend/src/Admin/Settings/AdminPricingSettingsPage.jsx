import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, Plus, Search, SlidersHorizontal, Trash2, X, BadgeDollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../PrivateRouter/AuthContext';

const emptyPricing = {
  id: null,
  plan_title: '',
  price: '',
  audience: '',
  description: '',
  features: [],
  status: 'active',
  display_order: 1,
};

const normalizePricing = (plan = {}) => ({
  ...emptyPricing,
  ...plan,
  features: Array.isArray(plan.features) ? plan.features : [],
  status: plan.status || 'active',
  display_order: Number(plan.display_order || 1),
});

const AdminPricingSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ ...emptyPricing });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pricing');
      setPlans(res.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filteredPlans = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return plans;
    return plans.filter((plan) => [plan.plan_title, plan.audience, plan.description, (plan.features || []).join(' ')].join(' ').toLowerCase().includes(term));
  }, [plans, search]);

  const openNewPlan = () => {
    const currentUserId = user?.user_id || user?.id || user?.uuid || user?.employee_id || user?.employeeId || 1;
    setEditingId(null);
    setDraft({
      ...emptyPricing,
      display_order: plans.length + 1,
      created_by: currentUserId,
      updated_by: currentUserId,
    });
    setShowForm(true);
  };

  const openEditPlan = (plan) => {
    const currentUserId = user?.user_id || user?.id || user?.uuid || user?.employee_id || user?.employeeId || plan?.updated_by || plan?.created_by || 1;
    setEditingId(plan.id);
    setDraft({
      ...normalizePricing(plan),
      updated_by: currentUserId,
      created_by: plan.created_by || currentUserId,
    });
    setShowForm(true);
  };

  const updateFeature = (index, value) => {
    setDraft((prev) => {
      const next = [...(prev.features || [])];
      next[index] = value;
      return { ...prev, features: next };
    });
  };

  const addFeature = () => {
    setDraft((prev) => ({ ...prev, features: [...(prev.features || []), ''] }));
  };

  const removeFeature = (index) => {
    setDraft((prev) => ({ ...prev, features: (prev.features || []).filter((_, idx) => idx !== index) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const title = draft.plan_title?.trim();
    if (!title) return toast.error('Please enter a plan title');

    const currentUserId = user?.user_id || user?.id || user?.uuid || user?.employee_id || user?.employeeId || draft.updated_by || draft.created_by || 1;
    const payload = {
      ...draft,
      plan_title: title,
      price: draft.price?.trim() || '',
      audience: draft.audience?.trim() || '',
      description: draft.description?.trim() || '',
      features: (draft.features || []).map((feature) => feature.trim()).filter(Boolean),
      created_by: currentUserId,
      updated_by: currentUserId,
      display_order: Number(draft.display_order || 1),
    };

    try {
      if (editingId) {
        await api.put(`/pricing/${editingId}`, payload);
        toast.success('Pricing plan updated successfully');
      } else {
        await api.post('/pricing', payload);
        toast.success('Pricing plan added successfully');
      }
      setShowForm(false);
      setDraft({ ...emptyPricing });
      await fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save pricing plan');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/pricing/${deleteTarget.id}`);
      toast.success('Pricing plan deleted');
      setDeleteTarget(null);
      await fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete pricing plan');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8 text-white min-h-screen">
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-bold text-white">Delete pricing plan?</h3>
            <p className="mb-6 text-sm text-white/50">Are you sure you want to delete <span className="font-semibold text-white">"{deleteTarget.plan_title}"</span>? This action cannot be undone.</p>
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
              <BadgeDollarSign size={22} className="text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Pricing Plans</h1>
              <p className="text-sm text-white/40">Manage website pricing cards and plan details.</p>
            </div>
          </div>
          <button onClick={openNewPlan} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600">
            <Plus size={16} /> Add Pricing
          </button>
        </div>
      </div>

      <div className="rounded-4xl border border-white/10 bg-[#12131a]/70 p-4 shadow-2xl shadow-black/20">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pricing, audience, description..." className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/35 outline-none focus:border-orange-500/50" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
            <SlidersHorizontal size={12} /> {filteredPlans.length} plans
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 py-10 text-white/40">
            <Loader2 size={18} className="mr-2 animate-spin" /> Loading pricing plans...
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className="rounded-3xl border border-white/10 bg-[#0f1117] p-5 shadow-lg shadow-black/10">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-bold text-white">{plan.plan_title}</p>
                    <p className="text-sm text-primary">{plan.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditPlan(plan)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white/70 hover:bg-white/10">Edit</button>
                    <button onClick={() => setDeleteTarget(plan)} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20">Delete</button>
                  </div>
                </div>
                <p className="mb-3 text-xs italic text-white/40">{plan.audience || 'General audience'}</p>
                <p className="mb-3 text-sm text-white/60">{plan.description || 'No description provided.'}</p>
                <ul className="space-y-2">
                  {(plan.features || []).slice(0, 5).map((feature, index) => (
                    <li key={`${plan.id}-${index}`} className="flex items-start gap-2 text-xs text-white/70">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-orange-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
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
                <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Pricing Plan' : 'Add New Pricing Plan'}</h2>
                <p className="text-sm text-white/40">{editingId ? 'Update pricing plan data.' : 'Create a pricing plan with pricing details and included features.'}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10">
                <X size={18} className="text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pb-10">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/60">Plan Title</label>
                  <input value={draft.plan_title} onChange={(e) => setDraft((prev) => ({ ...prev, plan_title: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" placeholder="Dynamic Website" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/60">Price</label>
                  <input value={draft.price} onChange={(e) => setDraft((prev) => ({ ...prev, price: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" placeholder="₹30,000/-" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/60">Audience</label>
                  <input value={draft.audience} onChange={(e) => setDraft((prev) => ({ ...prev, audience: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" placeholder="Small to large businesses" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/60">Description</label>
                  <textarea value={draft.description} onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" placeholder="Dynamic 7-page website with CMS features..." />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">Features</h3>
                  <button type="button" onClick={addFeature} className="inline-flex items-center gap-1 rounded-lg bg-orange-500/20 px-2 py-1 text-xs font-medium text-orange-400 hover:bg-orange-500/30">
                    <Plus size={12} /> Add
                  </button>
                </div>

                <div className="space-y-2">
                  {(draft.features || []).map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input type="text" value={feature} onChange={(e) => updateFeature(index, e.target.value)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" placeholder="Example: 7 Pages + Blog/Services" />
                      <button type="button" onClick={() => removeFeature(index)} className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/20">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10">Cancel</button>
                <button type="submit" className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600">{editingId ? 'Update Pricing' : 'Save Pricing'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricingSettingsPage;
