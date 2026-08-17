import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeDollarSign,
  CheckCircle2,
  Filter,
  LayoutGrid,
  Pencil,
  Plus,
  Save,
  Search,
  TableProperties,
  Trash2,
  X,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  List,
  UserCheck,
  UserX,
  TrendingUp,
  AlertCircle,
  Loader2,
  Eye,
  Edit2,
  Settings,
  Layers,
  CircleDollarSign
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
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
  if (s === 'active') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active</span>;
  if (s === 'inactive') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Inactive</span>;
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20"><span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Draft</span>;
};

const AdminPricingSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ ...emptyPricing });
  
  const [viewMode, setViewMode] = useState('table');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pricing');
      setPlans(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const total = plans.length;
  const activeCount = plans.filter(p => p.status === 'active').length;
  const inactiveCount = plans.filter(p => p.status === 'inactive').length;
  const draftCount = plans.filter(p => p.status === 'draft').length;

  const filteredPlans = useMemo(() => {
    const term = search.trim().toLowerCase();
    return plans.filter((plan) => {
      const matchSearch = !term ||
        [plan.plan_title, plan.audience, plan.description, (plan.features || []).join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(term);
      const matchStatus = !statusFilter || (plan.status || 'active').toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [plans, search, statusFilter]);

  const hasFilters = !!(statusFilter || search);
  const clearFilters = () => { setSearch(''); setStatusFilter(''); };

  const stats = [
    { label: "Total Plans",  value: total,         icon: BadgeDollarSign, cls: "text-blue-400",    bg: "bg-blue-500/15" },
    { label: "Active",       value: activeCount,   icon: UserCheck,       cls: "text-emerald-400", bg: "bg-emerald-500/15" },
    { label: "Inactive",     value: inactiveCount, icon: UserX,           cls: "text-rose-400",    bg: "bg-rose-500/15" },
    { label: "Drafts",       value: draftCount,    icon: Layers,          cls: "text-primary",     bg: "bg-primary/15" },
  ];

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
      fetchPlans();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save pricing plan');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/pricing/${deleteTarget.id}`);
      setDeleteMsg(`"${deleteTarget.plan_title}" deleted successfully.`);
      setDeleteTarget(null);
      await fetchPlans();
      setTimeout(() => setDeleteMsg(""), 3500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete pricing plan');
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
            <h3 className="text-lg font-bold text-white mb-2">Delete Pricing Plan?</h3>
            <p className="text-sm text-white/50 mb-6">Are you sure you want to delete <span className="text-white font-semibold">"{deleteTarget.plan_title}"</span>? This action cannot be undone.</p>
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
          <button
            type="button"
            onClick={() => navigate('/admin/settings')}
            className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition"
            title="Back to settings"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <BadgeDollarSign size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">All Pricing Plans</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? "Loading…" : `${total} plan${total !== 1 ? "s" : ""} total`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchPlans}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-primary" : ""} />
          </button>
          <button
            onClick={openNewPlan}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-primary/25 hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
          >
            <Plus size={15} /> Add Pricing
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
            placeholder="Search pricing, audience, description..."
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
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Plan Status</p>
              <div className="flex flex-wrap gap-1.5">
                {["active", "inactive", "draft"].map(s => (
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
          <button onClick={fetchPlans} className="ml-auto text-xs underline underline-offset-2 hover:opacity-80">Retry</button>
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-primary/70" />
            <p className="text-sm text-white/40">Loading pricing plans…</p>
          </div>
        </div>
      )}
      {!loading && !error && filteredPlans.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <BadgeDollarSign size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No plans found</p>
          <p className="text-xs mt-1">{hasFilters ? "Try adjusting your filters." : "Add your first pricing plan to get started."}</p>
          {!hasFilters && (
            <button
              onClick={openNewPlan}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
              <Plus size={14} /> Add First Plan
            </button>
          )}
        </div>
      )}

      {/* ── TABLE MODE ── */}
      {!loading && !error && filteredPlans.length > 0 && viewMode === "table" && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Plan</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Price</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Description</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Status</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Added</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((p, i) => (
                  <tr
                    key={p.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.plan_title} index={i} />
                        <div>
                          <p className="text-white font-semibold text-sm leading-tight">{p.plan_title || "Unnamed Plan"}</p>
                          <p className="text-white/35 text-xs mt-0.5 max-w-[150px] truncate">{p.audience || "General audience"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-primary font-bold">{p.price || "Free"}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-white/50 text-xs max-w-[200px] truncate">{p.description || "—"}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-white/35 text-xs">{fmtDate(p.created_at)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEditPlan(p)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition" title="View/Edit">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => openEditPlan(p)} className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/25 text-primary border border-transparent hover:border-primary/30 flex items-center justify-center transition" title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(p)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition" title="Delete">
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
      {!loading && !error && filteredPlans.length > 0 && viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 mt-4">
          {filteredPlans.map((p, i) => (
            <div key={p.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={p.plan_title} index={i} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{p.plan_title || "Unnamed Plan"}</p>
                    <p className="text-white/40 text-xs truncate">{p.audience || "General audience"}</p>
                  </div>
                </div>
                <StatusPill status={p.status} />
              </div>
              <div className="flex-1 space-y-3">
                <div className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                  {p.description || "No description provided."}
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.04]">
                  <span className="text-primary font-bold text-sm">{p.price || "Free"}</span>
                  <span className="text-white/30 text-[10px] uppercase tracking-wider">{p.features?.length || 0} Features</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                <p className="text-[10px] font-semibold text-white/30 tracking-wider">ADDED {fmtDate(p.created_at)}</p>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openEditPlan(p); }} className="p-1.5 text-white/40 hover:text-primary transition"><Edit2 size={13} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }} className="p-1.5 text-white/40 hover:text-rose-400 transition"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pricing Form Drawer ── */}
      {createPortal(
        <div className={`fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300 ${showForm ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
          <div className={`h-full w-full max-w-3xl overflow-y-auto border-l border-white/10 bg-[#12141c] p-6 shadow-2xl shadow-black/40 transition-transform duration-300 ${showForm ? "translate-x-0" : "translate-x-full"}`}>
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
                  <input value={draft.plan_title} onChange={(e) => setDraft((prev) => ({ ...prev, plan_title: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50" placeholder="Dynamic Website" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/60">Price</label>
                  <input value={draft.price} onChange={(e) => setDraft((prev) => ({ ...prev, price: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50" placeholder="₹30,000/-" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/60">Audience</label>
                  <input value={draft.audience} onChange={(e) => setDraft((prev) => ({ ...prev, audience: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50" placeholder="Small to large businesses" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/60">Status</label>
                  <select value={draft.status} onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50">
                    <option value="active" className="bg-[#101218]">Active</option>
                    <option value="inactive" className="bg-[#101218]">Inactive</option>
                    <option value="draft" className="bg-[#101218]">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/60">Display Order</label>
                  <input type="number" min="1" value={draft.display_order} onChange={(e) => setDraft((prev) => ({ ...prev, display_order: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/60">Description</label>
                  <textarea value={draft.description} onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50" placeholder="Dynamic 7-page website with CMS features..." />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">Features</h3>
                  <button type="button" onClick={addFeature} className="inline-flex items-center gap-1 rounded-lg bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/30 transition">
                    <Plus size={14} /> Add Feature
                  </button>
                </div>

                <div className="space-y-3">
                  {(draft.features || []).map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input type="text" value={feature} onChange={(e) => updateFeature(index, e.target.value)} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-primary/50" placeholder="Example: 7 Pages + Blog/Services" />
                      <button type="button" onClick={() => removeFeature(index)} className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/20 transition flex items-center justify-center">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {!(draft.features?.length > 0) && (
                    <p className="text-xs text-white/30 italic text-center py-2">No features added yet. Click "Add Feature" to add one.</p>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 flex items-center justify-center gap-2 shadow-lg shadow-primary/25" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                <Save size={16} /> {editingId ? 'Update Pricing' : 'Save Pricing'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminPricingSettingsPage;
