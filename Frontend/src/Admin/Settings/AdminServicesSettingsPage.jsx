import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BriefcaseBusiness,
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
  Server,
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
  Calendar,
  Layers,
  Code,
  FileText,
  Image,
  Link,
  Globe,
  CheckSquare,
  Settings2,
  Clock,
  Upload,
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import { useAuth } from '../../PrivateRouter/AuthContext';

const emptyService = {
  id: 1,
  service_code: '',
  singlepageimage: [],
  title: '',
  category: '',
  subcategory: '',
  tagline: '',
  description: '',
  detailed_description: '',
  what_we_offer: [],
  key_features: [],
  why_choose_us: {},
  technologies_we_use: [],
  service_process: [],
  industries: [],
  project_type: [],
  pricing: {
    starting_price: 0,
    currency: 'INR',
    pricing_type: 'Starting From',
  },
  duration: {
    estimated_time: '4-8 Weeks',
    delivery_type: 'Project Based',
  },
  seo: {
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    slug: '',
  },
  status: 'active',
  featured: true,
  display_order: 1,
  created_by: 1,
  updated_by: 1,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const parseList = (value) => String(value ?? '').split(',').map((item) => item.trim()).filter(Boolean);

const parseJsonObject = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const formatCommaList = (value) => (Array.isArray(value) ? value.join(', ') : '');
const formatJson = (value) => JSON.stringify(value ?? {}, null, 2);

const normalizeServiceFormValue = (service = {}) => ({
  ...emptyService,
  ...service,
  id: service.id || 1,
  pricing: service.pricing || { starting_price: 0, currency: 'INR', pricing_type: 'Starting From' },
  duration: service.duration || { estimated_time: '4-8 Weeks', delivery_type: 'Project Based' },
  seo: service.seo || { meta_title: '', meta_description: '', meta_keywords: [], slug: '' },
  singlepageimage: Array.isArray(service.singlepageimage) ? service.singlepageimage : [],
  what_we_offer: Array.isArray(service.what_we_offer) ? service.what_we_offer : [],
  key_features: Array.isArray(service.key_features) ? service.key_features : [],
  technologies_we_use: Array.isArray(service.technologies_we_use) ? service.technologies_we_use : [],
  service_process: Array.isArray(service.service_process) ? service.service_process : [],
  industries: Array.isArray(service.industries) ? service.industries : [],
  project_type: Array.isArray(service.project_type) ? service.project_type : [],
  why_choose_us: service.why_choose_us || {},
  featured: Boolean(service.featured),
  status: service.status || 'active',
  display_order: Number(service.display_order || 1),
  created_at: service.created_at || new Date().toISOString(),
  updated_at: service.updated_at || new Date().toISOString(),
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

const AdminServicesSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ ...emptyService, id: 1, display_order: 1 });
  
  const [viewMode, setViewMode] = useState('table');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteMsg, setDeleteMsg] = useState('');

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get("/services");
      setServices(response.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const total = services.length;
  const activeCount = services.filter(s => s.status === "active").length;
  const inactiveCount = services.filter(s => s.status === "inactive").length;
  const featuredCount = services.filter(s => s.featured).length;

  const filteredServices = useMemo(() => {
    const term = search.trim().toLowerCase();
    return services.filter((service) => {
      const matchSearch = !term ||
        [service.title, service.category, service.subcategory, service.service_code, service.tagline, service.short_description]
          .join(" ")
          .toLowerCase()
          .includes(term);
      const matchStatus = !statusFilter || (service.status || "active").toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [services, search, statusFilter]);

  const hasFilters = !!(statusFilter || search);
  const clearFilters = () => { setSearch(''); setStatusFilter(''); };

  const stats = [
    { label: "Total Services", value: total,         icon: BriefcaseBusiness, cls: "text-blue-400",    bg: "bg-blue-500/15" },
    { label: "Active",         value: activeCount,   icon: UserCheck,         cls: "text-emerald-400", bg: "bg-emerald-500/15" },
    { label: "Inactive",       value: inactiveCount, icon: UserX,             cls: "text-rose-400",    bg: "bg-rose-500/15" },
    { label: "Featured",       value: featuredCount, icon: TrendingUp,        cls: "text-primary",     bg: "bg-primary/15" },
  ];

  const openNewService = () => {
    const nextId = services.length ? Math.max(...services.map((item) => Number(item.id || 0))) + 1 : 1;
    const currentUserId = user?.user_id || user?.id || user?.uuid || user?.employee_id || user?.employeeId || 1;
    setEditingId(null);
    setDraft({
      ...emptyService,
      id: nextId,
      display_order: services.length + 1,
      service_code: `SRV-${String(nextId).padStart(3, "0")}`,
      created_by: currentUserId,
      updated_by: currentUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setShowForm(true);
  };

  const openEditService = (service) => {
    const currentUserId = user?.user_id || user?.id || user?.uuid || user?.employee_id || user?.employeeId || service?.updated_by || service?.created_by || 1;
    setEditingId(service.id);
    setDraft({
      ...normalizeServiceFormValue(service),
      created_by: service.created_by || currentUserId,
      updated_by: currentUserId,
    });
    setShowForm(true);
  };

  const updateField = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));
  const updateNestedObject = (section, field, value) => {
    setDraft((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [field]: value },
    }));
  };

  const addObjectEntry = (field, key = 'New Item', value = '') => {
    setDraft((prev) => {
      const current = prev[field] && typeof prev[field] === 'object' ? { ...prev[field] } : {};
      return {
        ...prev,
        [field]: { ...current, [key]: value },
      };
    });
  };

  const updateObjectEntryKey = (field, oldKey, newKey) => {
    setDraft((prev) => {
      const current = prev[field] && typeof prev[field] === 'object' ? { ...prev[field] } : {};
      const existingValue = current[oldKey];
      delete current[oldKey];
      current[newKey] = existingValue;
      return {
        ...prev,
        [field]: current,
      };
    });
  };

  const updateObjectEntryValue = (field, key, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [key]: value,
      },
    }));
  };

  const removeObjectEntry = (field, key) => {
    setDraft((prev) => {
      const current = prev[field] && typeof prev[field] === 'object' ? { ...prev[field] } : {};
      delete current[key];
      return {
        ...prev,
        [field]: current,
      };
    });
  };

  const addArrayEntry = (field, value = '') => {
    setDraft((prev) => ({
      ...prev,
      [field]: Array.isArray(prev[field]) ? [...prev[field], value] : [value],
    }));
  };

  const updateArrayEntry = (field, index, value) => {
    setDraft((prev) => {
      const current = Array.isArray(prev[field]) ? [...prev[field]] : [];
      current[index] = value;
      return {
        ...prev,
        [field]: current,
      };
    });
  };

  const removeArrayEntry = (field, index) => {
    setDraft((prev) => {
      const current = Array.isArray(prev[field]) ? [...prev[field]] : [];
      return {
        ...prev,
        [field]: current.filter((_, i) => i !== index),
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) return toast.error("Please enter a service title");

    const currentUserId = user?.user_id || user?.id || user?.uuid || user?.employee_id || user?.employeeId || draft.updated_by || draft.created_by || 1;

    try {
      const payload = {
        ...draft,
        created_by: currentUserId,
        updated_by: currentUserId,
        singlepageimage: draft.singlepageImageFiles?.length ? draft.singlepageimage : parseList(draft.singlepageimage),
        what_we_offer: parseList(draft.what_we_offer),
        key_features: parseList(draft.key_features),
        technologies_we_use: parseList(draft.technologies_we_use),
        service_process: parseList(draft.service_process),
        industries: parseList(draft.industries),
        project_type: parseList(draft.project_type),
        why_choose_us: parseJsonObject(draft.why_choose_us),
      };

      if (draft.singlepageImageFiles?.length) {
        payload.singlepageimage = [];
        for (const file of draft.singlepageImageFiles) {
          const formData = new FormData();
          formData.append("file", file);
          const uploadRes = await api.post("upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
          payload.singlepageimage.push(uploadRes.data.url || uploadRes.data.urls?.[0]);
        }
      }
      delete payload.singlepageImageFiles;

      if (editingId) {
        await api.put(`/services/${editingId}`, payload);
        toast.success("Service updated successfully");
      } else {
        await api.post("/services", payload);
        toast.success("Service added successfully");
      }
      setShowForm(false);
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save service");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/services/${deleteTarget.id}`);
      setDeleteMsg(`"${deleteTarget.title}" deleted successfully.`);
      setDeleteTarget(null);
      await fetchServices();
      setTimeout(() => setDeleteMsg(""), 3500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete service");
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
            <h3 className="text-lg font-bold text-white mb-2">Delete Service?</h3>
            <p className="text-sm text-white/50 mb-6">Are you sure you want to delete <span className="text-white font-semibold">"{deleteTarget.title}"</span>? This action cannot be undone.</p>
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
            <BriefcaseBusiness size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">All Services</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? "Loading…" : `${total} service${total !== 1 ? "s" : ""} total`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchServices}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-primary" : ""} />
          </button>
          <button
            onClick={openNewService}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-primary/25 hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
          >
            <Plus size={15} /> Add Service
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
            placeholder="Search by name, category, tagline..."
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
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Service Status</p>
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
          <button onClick={fetchServices} className="ml-auto text-xs underline underline-offset-2 hover:opacity-80">Retry</button>
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-primary/70" />
            <p className="text-sm text-white/40">Loading services…</p>
          </div>
        </div>
      )}
      {!loading && !error && filteredServices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Server size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No services found</p>
          <p className="text-xs mt-1">{hasFilters ? "Try adjusting your filters." : "Add your first service to get started."}</p>
          {!hasFilters && (
            <button
              onClick={openNewService}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
              <Plus size={14} /> Add First Service
            </button>
          )}
        </div>
      )}

      {/* ── TABLE MODE ── */}
      {!loading && !error && filteredServices.length > 0 && viewMode === "table" && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Service</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Category</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Status</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Type</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Added</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.title || s.service_code} index={i} />
                        <div>
                          <p className="text-white font-semibold text-sm leading-tight">{s.title || "Unnamed Service"}</p>
                          <p className="text-white/35 text-xs mt-0.5 max-w-[200px] truncate">{s.tagline || s.service_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <p className="text-white/70 text-xs font-semibold">{s.category || "General"}</p>
                        <p className="text-white/40 text-[10px] uppercase tracking-wider">{s.subcategory || "Main"}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={s.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      {s.featured ? (
                        <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">Featured</span>
                      ) : (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-white/35 text-xs">{fmtDate(s.created_at)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEditService(s)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition" title="View/Edit">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => openEditService(s)} className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/25 text-primary border border-transparent hover:border-primary/30 flex items-center justify-center transition" title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(s)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition" title="Delete">
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
      {!loading && !error && filteredServices.length > 0 && viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 mt-4">
          {filteredServices.map((s, i) => (
            <div key={s.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={s.title || s.service_code} index={i} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{s.title || "Unnamed Service"}</p>
                    <p className="text-white/40 text-xs truncate">{s.service_code}</p>
                  </div>
                </div>
                <StatusPill status={s.status} />
              </div>
              <div className="flex-1 space-y-3">
                <div className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                  {s.short_description || s.tagline || "No description provided."}
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.04]">
                  <span className="text-white/40 font-medium px-2 py-1 bg-white/5 rounded-md">{s.category || "General"}</span>
                  {s.featured && <span className="text-orange-400 font-bold">Featured</span>}
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                <p className="text-[10px] font-semibold text-white/30 tracking-wider">ADDED {fmtDate(s.created_at)}</p>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openEditService(s); }} className="p-1.5 text-white/40 hover:text-primary transition"><Edit2 size={13} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(s); }} className="p-1.5 text-white/40 hover:text-rose-400 transition"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Service Form Drawer ── */}
      {createPortal(
        <div className={`fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300 ${showForm ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
        <div className={`h-full w-full max-w-3xl overflow-y-auto border-l border-white/10 bg-[#12141c] p-6 shadow-2xl shadow-black/40 transition-transform duration-300 ${showForm ? "translate-x-0" : "translate-x-full"}`}>
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">{editingId ? "Edit Service" : "Add New Service"}</h2>
              <p className="text-sm text-white/40">{editingId ? "Update the selected service record." : "Create a full service record with the required metadata."}</p>
            </div>
            <button onClick={() => setShowForm(false)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10">
              <X size={18} className="text-white" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 pb-10">
              <SectionCard icon={Settings2} title="General Information">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Service Code</label>
                    <input value={draft.service_code} onChange={(e) => updateField('service_code', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="WEB-001" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Display Order</label>
                    <input type="number" min="1" value={draft.display_order} onChange={(e) => updateField('display_order', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Title</label>
                    <input value={draft.title} onChange={(e) => updateField('title', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Web Application Development" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Category</label>
                    <input value={draft.category} onChange={(e) => updateField('category', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Web Development" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Subcategory</label>
                    <input value={draft.subcategory} onChange={(e) => updateField('subcategory', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Web Application Development" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Status</label>
                    <select value={draft.status} onChange={(e) => updateField('status', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex h-[46px] w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#0a0b10] px-4 text-sm text-white hover:bg-white/5 transition-all shadow-inner">
                      <input type="checkbox" checked={Boolean(draft.featured)} onChange={(e) => updateField('featured', e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-[#0a0b10] text-primary focus:ring-primary focus:ring-offset-0" />
                      Mark as featured service
                    </label>
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={FileText} title="Overview Content">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Tagline</label>
                    <input value={draft.tagline} onChange={(e) => updateField('tagline', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Custom, Scalable..." />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Description</label>
                    <textarea value={draft.description} onChange={(e) => updateField('description', e.target.value)} rows={2} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Detailed Description</label>
                    <textarea value={draft.detailed_description} onChange={(e) => updateField('detailed_description', e.target.value)} rows={5} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={Image} title="Media & Files">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Service Images</label>
                  <div className="space-y-4">
                    <div className="relative flex items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl bg-[#0a0b10] hover:bg-white/[0.02] hover:border-primary/50 transition-all cursor-pointer">
                      <input type="file" multiple accept="image/*" onChange={(e) => { if (e.target.files?.length) setDraft((prev) => ({ ...prev, singlepageImageFiles: Array.from(e.target.files) })); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="text-center">
                        <Upload size={24} className="mx-auto text-white/30 mb-2" />
                        <p className="text-sm text-white/50">Click or drag images to upload</p>
                      </div>
                    </div>
                    {draft.singlepageImageFiles?.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {draft.singlepageImageFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                            <span className="text-xs text-primary truncate pr-4">✓ {file.name}</span>
                            <button type="button" onClick={() => setDraft((prev) => ({ ...prev, singlepageImageFiles: prev.singlepageImageFiles.filter((_, i) => i !== idx) }))} className="text-xs text-primary hover:text-red-400">✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={List} title="Service Details">
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    { key: 'what_we_offer', label: 'What We Offer', placeholder: 'Custom Web App...' },
                    { key: 'key_features', label: 'Key Features', placeholder: 'Real-time dashboard...' },
                    { key: 'technologies_we_use', label: 'Technologies', placeholder: 'React, Node.js...' },
                    { key: 'service_process', label: 'Service Process', placeholder: 'Requirement Analysis...' },
                    { key: 'industries', label: 'Industries', placeholder: 'Healthcare...' },
                    { key: 'project_type', label: 'Project Types', placeholder: 'Enterprise App...' }
                  ].map((group) => (
                    <div key={group.key} className="bg-[#0a0b10]/50 p-4 rounded-xl border border-white/5 shadow-inner">
                      <div className="mb-4 flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-white/40">{group.label}</label>
                        <button type="button" onClick={() => addArrayEntry(group.key, '')} className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-primary hover:text-white transition-all">
                          <Plus size={12} /> ADD
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(Array.isArray(draft[group.key]) ? draft[group.key] : []).map((item, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input type="text" value={item} onChange={(e) => updateArrayEntry(group.key, idx, e.target.value)} className="flex-1 rounded-lg border border-white/10 bg-[#0a0b10] px-3 py-2 text-sm text-white outline-none focus:border-primary/50 transition-all shadow-inner" placeholder={group.placeholder} />
                            <button type="button" onClick={() => removeArrayEntry(group.key, idx)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-400 hover:bg-red-500 hover:text-white transition-all">✕</button>
                          </div>
                        ))}
                        {(!draft[group.key] || draft[group.key].length === 0) && (
                          <p className="text-[11px] text-white/20 italic text-center py-3">No entries added.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard icon={Clock} title="Pricing & Duration">
                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Starting Price</label>
                    <input type="number" min="0" value={draft.pricing?.starting_price ?? 0} onChange={(e) => updateNestedObject('pricing', 'starting_price', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Currency</label>
                    <input value={draft.pricing?.currency || 'INR'} onChange={(e) => updateNestedObject('pricing', 'currency', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Pricing Type</label>
                    <input value={draft.pricing?.pricing_type || 'Starting From'} onChange={(e) => updateNestedObject('pricing', 'pricing_type', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Estimated Time</label>
                    <input value={draft.duration?.estimated_time || '4-8 Weeks'} onChange={(e) => updateNestedObject('duration', 'estimated_time', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Delivery Type</label>
                    <input value={draft.duration?.delivery_type || 'Project Based'} onChange={(e) => updateNestedObject('duration', 'delivery_type', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={CheckSquare} title="Why Choose Us">
                <div className="mb-3 flex justify-end">
                  <button type="button" onClick={() => addObjectEntry('why_choose_us', `New Item ${Object.keys(draft.why_choose_us || {}).length + 1}`, '')} className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary transition-all">
                    <Plus size={14} /> ADD ITEM
                  </button>
                </div>
                <div className="space-y-4">
                  {Object.entries(draft.why_choose_us || {}).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 bg-[#0a0b10] px-3 py-10 text-center text-sm text-white/30">
                      No advantages added yet.
                    </div>
                  ) : (
                    Object.entries(draft.why_choose_us || {}).map(([key, value]) => (
                      <div key={key} className="rounded-xl border border-white/5 bg-[#0a0b10] p-4 flex flex-col gap-3 shadow-inner">
                        <div className="flex gap-3">
                          <input type="text" value={key} onChange={(e) => updateObjectEntryKey('why_choose_us', key, e.target.value || 'New Item')} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-primary/50 transition-all" placeholder="Advantage Title" />
                          <button type="button" onClick={() => removeObjectEntry('why_choose_us', key)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-red-400 hover:bg-red-500 hover:text-white transition-all">✕</button>
                        </div>
                        <textarea value={value || ''} onChange={(e) => updateObjectEntryValue('why_choose_us', key, e.target.value)} rows={2} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 transition-all" placeholder="Explanation of why this matters..." />
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>

              <SectionCard icon={Globe} title="SEO Settings">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Meta Title</label>
                    <input value={draft.seo?.meta_title || ''} onChange={(e) => updateNestedObject('seo', 'meta_title', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Optimize for search engines..." />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Meta Description</label>
                    <textarea value={draft.seo?.meta_description || ''} onChange={(e) => updateNestedObject('seo', 'meta_description', e.target.value)} rows={2} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Meta Keywords (Comma Separated)</label>
                    <textarea value={formatCommaList(draft.seo?.meta_keywords)} onChange={(e) => updateNestedObject('seo', 'meta_keywords', e.target.value)} rows={2} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">URL Slug</label>
                    <input value={draft.seo?.slug || ''} onChange={(e) => updateNestedObject('seo', 'slug', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="e.g. web-development-services" />
                  </div>
                </div>
              </SectionCard>

              <div className="sticky bottom-0 -mx-6 -mb-6 mt-8 border-t border-white/10 bg-[#12141c]/90 p-6 backdrop-blur-md z-10">
                <button type="submit" className="w-full rounded-xl px-5 py-4 text-sm font-bold text-white transition hover:opacity-90 flex items-center justify-center gap-2 shadow-xl shadow-primary/20" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                  <Save size={18} /> Save Service Details
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

export default AdminServicesSettingsPage;
