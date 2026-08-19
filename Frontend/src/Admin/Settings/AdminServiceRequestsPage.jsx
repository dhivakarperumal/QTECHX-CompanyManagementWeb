import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ClipboardList, Search, RefreshCw, Mail, Phone, Eye, Trash2, Edit2,
  Loader2, AlertCircle, LayoutGrid, List, SlidersHorizontal, X,
  ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, Hash, Clock,
  MessageSquare,
} from 'lucide-react';
import api from '../../api';

// ─── Constants ────────────────────────────────────────────────────────────────
const REQUEST_STATUSES = ['New', 'Contacted', 'Converted', 'Closed'];
const SERVICE_TYPES    = ['Website', 'Mobile App', 'Web App', 'Software', 'Other'];

const STATUS_STYLES = {
  New:       { pill: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',     dot: 'bg-amber-400'   },
  Contacted: { pill: 'bg-sky-500/15 text-sky-400 border border-sky-500/25',           dot: 'bg-sky-400'     },
  Converted: { pill: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400' },
  Closed:    { pill: 'bg-white/10 text-white/50 border border-white/15',              dot: 'bg-white/40'    },
};

const AVATAR_COLOURS = [
  '#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899',
  '#14b8a6','#f97316','#8b5cf6','#ef4444','#22c55e',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '??';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function Avatar({ name, index, size = 'md' }) {
  const c = AVATAR_COLOURS[index % AVATAR_COLOURS.length];
  const cls = size === 'lg'
    ? 'w-14 h-14 rounded-2xl text-base'
    : 'w-10 h-10 rounded-xl text-xs';
  return (
    <div
      className={`${cls} flex items-center justify-center font-bold shrink-0 select-none`}
      style={{ background: c + '28', border: `1.5px solid ${c}44`, color: c }}
    >
      {initials(name)}
    </div>
  );
}

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.New;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status || 'New'}
    </span>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ request, onConfirm, onCancel, loading }) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#111318] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-rose-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Delete Request</h3>
            <p className="text-white/40 text-xs mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-white/60 text-sm mb-6 leading-relaxed">
          Are you sure you want to delete the request from{' '}
          <span className="text-white font-semibold">"{request?.name}"</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── View Drawer ──────────────────────────────────────────────────────────────
function ViewDrawer({ request, index, onClose, onEdit }) {
  if (!request) return null;

  const Row = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
      <div className="flex gap-3 py-2.5 border-b border-white/[0.06] last:border-0">
        <div className="w-6 shrink-0 flex items-start justify-center pt-0.5">
          <Icon size={12} className="text-white/30" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-0.5">{label}</p>
          <p className="text-white/80 text-sm leading-snug break-words">{value}</p>
        </div>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md bg-[#0d0f14] border-l border-white/10 h-full overflow-y-auto shadow-2xl flex flex-col"
        style={{ animation: 'slideInRight 0.25s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0d0f14]/95 backdrop-blur border-b border-white/8 px-6 py-4 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <Avatar name={request.name} index={index} size="lg" />
            <div>
              <h2 className="text-white font-bold text-base leading-tight">{request.name}</h2>
              <p className="text-white/40 text-xs mt-0.5">{request.service_title}</p>
              <div className="mt-1.5">
                <StatusPill status={request.status} />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-5">
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Contact Information</p>
            <div className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-1">
              <Row icon={Mail}  label="Email" value={request.email} />
              <Row icon={Phone} label="Phone" value={request.phone} />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Service Details</p>
            <div className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-1">
              <Row icon={ClipboardList} label="Service"  value={request.service_title} />
              <Row icon={Hash}          label="Status"   value={request.status || 'New'} />
            </div>
          </div>

          {request.message && (
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Message</p>
              <div className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3">
                <p className="text-white/70 text-sm leading-relaxed">{request.message}</p>
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">System Info</p>
            <div className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-1">
              <Row icon={Hash}  label="UUID"       value={request.uuid} />
              <Row icon={Clock} label="Submitted"  value={fmtDate(request.created_at)} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#0d0f14]/95 backdrop-blur border-t border-white/8 px-6 py-4 shrink-0">
          <button
            onClick={onEdit}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg shadow-orange-500/25"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            <Edit2 size={14} /> Update Status
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
}

// ─── Status Edit Modal ────────────────────────────────────────────────────────
function StatusEditModal({ request, onClose, onSuccess }) {
  const [status, setStatus] = useState(request?.status || 'New');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch(`/service-requests/${request.uuid}/status`, { status });
      if (!data.success) throw new Error(data.message || 'Failed');
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111318] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-base">Update Status</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition">
            <X size={14} />
          </button>
        </div>
        <p className="text-white/40 text-xs mb-4">Request from <span className="text-white/70 font-semibold">{request?.name}</span></p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {REQUEST_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`py-2.5 rounded-xl text-xs font-semibold border transition ${
                status === s
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {error && <p className="text-rose-400 text-xs mb-3">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-40">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminServiceRequestsPage() {
  const [viewMode, setViewMode]     = useState('table');
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');

  // Pagination
  const [page, setPage]   = useState(1);
  const limit             = 15;

  // Data
  const [requests, setRequests]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [statsData, setStatsData]   = useState({ total: 0, newCount: 0, contacted: 0, converted: 0 });

  // Modals
  const [viewRequest, setViewRequest]     = useState(null);
  const [viewIndex, setViewIndex]         = useState(0);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [deleting, setDeleting]           = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [successMsg, setSuccessMsg]       = useState('');

  // ── Fetch ──
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit });
      if (search)        params.append('search', search);
      if (statusFilter)  params.append('status', statusFilter);
      if (serviceFilter) params.append('service_title', serviceFilter);

      const { data } = await api.get(`/service-requests?${params}`);
      if (data.success === false) throw new Error(data.message || 'Failed');
      const rows = data.data || [];
      // client-side pagination fallback
      const filtered = rows;
      setRequests(filtered.slice((page - 1) * limit, page * limit));
      setTotal(filtered.length);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / limit)));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, serviceFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/service-requests');
      if (!data.success) return;
      const all = data.data || [];
      setStatsData({
        total:     all.length,
        newCount:  all.filter(r => (r.status || 'New') === 'New').length,
        contacted: all.filter(r => r.status === 'Contacted').length,
        converted: all.filter(r => r.status === 'Converted').length,
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { fetchStats(); },   [fetchStats]);
  useEffect(() => { setPage(1); },     [search, statusFilter, serviceFilter]);

  // ── Delete ──
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/service-requests/${deleteTarget.uuid}`);
      setSuccessMsg(`Request from "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      if (viewRequest?.uuid === deleteTarget.uuid) setViewRequest(null);
      await fetchRequests();
      await fetchStats();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = !!(statusFilter || serviceFilter || search);
  const clearFilters = () => { setSearch(''); setStatusFilter(''); setServiceFilter(''); };

  // Stats cards — matching AllClients layout exactly
  const stats = [
    {
      label: 'Total Requests', value: statsData.total,
      icon: ClipboardList,
      cls: 'text-blue-400', bg: 'bg-blue-500/15',
    },
    {
      label: 'New', value: statsData.newCount,
      icon: MessageSquare,
      cls: 'text-amber-400', bg: 'bg-amber-500/15',
    },
    {
      label: 'Contacted', value: statsData.contacted,
      icon: Phone,
      cls: 'text-sky-400', bg: 'bg-sky-500/15',
    },
    {
      label: 'Converted', value: statsData.converted,
      icon: CheckCircle2,
      cls: 'text-emerald-400', bg: 'bg-emerald-500/15',
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">

      {/* ── Success Toast ── */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* ── Modals ── */}
      {deleteTarget && (
        <DeleteModal
          request={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
      {viewRequest && (
        <ViewDrawer
          request={viewRequest}
          index={viewIndex}
          onClose={() => setViewRequest(null)}
          onEdit={() => { setEditTarget(viewRequest); setViewRequest(null); }}
        />
      )}
      {editTarget && (
        <StatusEditModal
          request={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            setEditTarget(null);
            setSuccessMsg('Status updated successfully.');
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchRequests();
            fetchStats();
          }}
        />
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <ClipboardList size={22} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Service Requests</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? 'Loading…' : `${total} request${total !== 1 ? 's' : ''} total`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRequests}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-orange-400' : ''} />
          </button>
          {/* Placeholder "Export" action button matching AllClients style */}
          <button
            onClick={() => {
              const csv = [
                ['Name','Email','Phone','Service','Status','Date'],
                ...requests.map(r => [r.name, r.email, r.phone || '', r.service_title, r.status || 'New', fmtDate(r.created_at)]),
              ].map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url  = URL.createObjectURL(blob);
              const a    = document.createElement('a'); a.href = url; a.download = 'service-requests.csv'; a.click();
              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/25 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            <ClipboardList size={15} /> Export CSV
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
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by name, email, phone, service…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
            showFilters || hasFilters
              ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasFilters && (
            <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
              {[statusFilter, serviceFilter, search].filter(Boolean).length}
            </span>
          )}
          <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* View toggle */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === 'table' ? 'bg-orange-500 text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            title="Table View"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === 'card' ? 'bg-orange-500 text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
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
              <button onClick={clearFilters} className="text-xs text-orange-400/70 hover:text-orange-400 flex items-center gap-1 transition">
                <X size={10} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {REQUEST_STATUSES.map(s => (
                  <button key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${statusFilter === s ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Service</p>
              <div className="flex flex-wrap gap-1.5">
                {SERVICE_TYPES.map(s => (
                  <button key={s} onClick={() => setServiceFilter(serviceFilter === s ? '' : s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${serviceFilter === s ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
          <AlertCircle size={16} className="shrink-0" />
          {error}
          <button onClick={fetchRequests} className="ml-auto text-xs underline underline-offset-2 hover:opacity-80">Retry</button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-orange-400/70" />
            <p className="text-sm text-white/40">Loading requests…</p>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && requests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <ClipboardList size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No requests found</p>
          <p className="text-xs mt-1">{hasFilters ? 'Try adjusting your filters.' : 'Service requests will appear here.'}</p>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TABLE MODE
      ══════════════════════════════════════════ */}
      {!loading && !error && requests.length > 0 && viewMode === 'table' && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">S.No</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Client</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Contact</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Status</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Service</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Message</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Submitted</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r, i) => (
                  <tr
                    key={r.uuid || r.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer"
                    onDoubleClick={() => setEditTarget(r)}
                    title="Double click to update status"
                  >
                    <td className="px-5 py-3.5 text-white/50">{(page - 1) * limit + i + 1}</td>

                    {/* Client */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.name} index={i} />
                        <div>
                          <p className="text-white font-semibold text-sm leading-tight">{r.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {r.email && (
                          <p className="text-white/50 text-xs flex items-center gap-1.5">
                            <Mail size={10} className="text-white/25 shrink-0" />
                            <span className="truncate max-w-[140px]">{r.email}</span>
                          </p>
                        )}
                        {r.phone && (
                          <p className="text-white/50 text-xs flex items-center gap-1.5">
                            <Phone size={10} className="text-white/25 shrink-0" />
                            {r.phone}
                          </p>
                        )}
                        {!r.email && !r.phone && <span className="text-white/20 text-xs">—</span>}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusPill status={r.status || 'New'} />
                    </td>

                    {/* Service */}
                    <td className="px-4 py-3.5">
                      {r.service_title
                        ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/55 bg-white/[0.07] border border-white/10 px-2.5 py-1 rounded-lg">
                            <ClipboardList size={9} className="text-white/25" /> {r.service_title}
                          </span>
                        : <span className="text-white/20 text-xs">—</span>}
                    </td>

                    {/* Message preview */}
                    <td className="px-4 py-3.5 max-w-[200px]">
                      {r.message
                        ? <p className="text-white/40 text-xs truncate">{r.message}</p>
                        : <span className="text-white/20 text-xs">—</span>}
                    </td>

                    {/* Submitted */}
                    <td className="px-4 py-3.5">
                      <span className="text-white/35 text-xs">{fmtDate(r.created_at)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setViewRequest(r); setViewIndex(i); }}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition"
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => setEditTarget(r)}
                          className="w-7 h-7 rounded-lg bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 border border-transparent hover:border-orange-500/30 flex items-center justify-center transition"
                          title="Update Status"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(r)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition"
                          title="Delete Request"
                        >
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

      {/* ══════════════════════════════════════════
          CARD MODE
      ══════════════════════════════════════════ */}
      {!loading && !error && requests.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {requests.map((r, i) => {
            const colour = AVATAR_COLOURS[i % AVATAR_COLOURS.length];
            return (
              <div
                key={r.uuid || r.id}
                className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                onDoubleClick={() => setEditTarget(r)}
                title="Double click to update status"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={r.name} index={i} />
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm leading-tight truncate">{r.name}</p>
                      {r.service_title && (
                        <p className="text-white/35 text-xs mt-0.5 truncate">{r.service_title}</p>
                      )}
                    </div>
                  </div>
                  <StatusPill status={r.status || 'New'} />
                </div>

                {/* Contact */}
                <div className="space-y-1.5">
                  {r.email && (
                    <p className="text-white/45 text-xs flex items-center gap-2 truncate">
                      <Mail size={11} className="text-white/25 shrink-0" /> {r.email}
                    </p>
                  )}
                  {r.phone && (
                    <p className="text-white/45 text-xs flex items-center gap-2">
                      <Phone size={11} className="text-white/25 shrink-0" /> {r.phone}
                    </p>
                  )}
                </div>

                {/* Message preview */}
                {r.message && (
                  <p className="text-white/35 text-xs leading-relaxed line-clamp-2 border-t border-white/[0.06] pt-3">{r.message}</p>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {r.service_title && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: colour + '20', color: colour }}>
                      {r.service_title}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.07]">
                  <span className="text-[10px] text-white/25 flex items-center gap-1">
                    <Clock size={9} /> {fmtDate(r.created_at)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => { setViewRequest(r); setViewIndex(i); }}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition"
                      title="View"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={() => setEditTarget(r)}
                      className="w-7 h-7 rounded-lg bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 flex items-center justify-center transition"
                      title="Update Status"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(r)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-white/30">
            Page <span className="text-white/55 font-semibold">{page}</span> / <span className="text-white/55 font-semibold">{totalPages}</span>
            &nbsp;·&nbsp;{total} total
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
              const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + idx;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                    pg === page ? 'bg-orange-500 text-white shadow-md' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10'
                  }`}>
                  {pg}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
