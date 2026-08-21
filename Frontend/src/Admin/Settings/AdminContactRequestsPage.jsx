import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  UserCheck,
  Send,
  ExternalLink,
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────
const CONTACT_STATUSES = ['New', 'Contacted', 'In Progress', 'Resolved', 'Closed'];

const STATUS_STYLES = {
  New:         { pill: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',     dot: 'bg-amber-400'   },
  Contacted:   { pill: 'bg-sky-500/15 text-sky-400 border border-sky-500/25',           dot: 'bg-sky-400'     },
  'In Progress':{ pill: 'bg-purple-500/15 text-purple-400 border border-purple-500/25', dot: 'bg-purple-400' },
  Resolved:    { pill: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400' },
  Closed:      { pill: 'bg-white/10 text-white/50 border border-white/15',              dot: 'bg-white/40'    },
};

const AVATAR_COLOURS = [
  '#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899',
  '#06b6d4', '#eab308', '#6366f1', '#14b8a6', '#f43f5e',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '??';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const fmtDateShort = (d) => {
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
      className={`${cls} flex items-center justify-center font-bold shrink-0 select-none shadow-sm`}
      style={{ background: c + '22', border: `1.5px solid ${c}44`, color: c }}
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

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function DeleteModal({ request, onConfirm, onCancel, loading }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#111318] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-rose-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-base">Delete Contact Request</h3>
            <p className="text-white/40 text-xs mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-white/60 text-sm mb-6 leading-relaxed">
          Are you sure you want to delete the inquiry from{' '}
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end">
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
              <p className="text-white/40 text-xs mt-0.5 truncate max-w-[200px]">{request.subject || 'General Inquiry'}</p>
              <div className="mt-1.5">
                <StatusPill status={request.status} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-5 space-y-5">
          {/* Quick Contact Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* {request.email && (
              <a
                href={`mailto:${request.email}?subject=Re: ${encodeURIComponent(request.subject || 'Inquiry')}`}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition"
              >
                <Mail size={13} /> Send Email
              </a>
            )} */}
            {(request.mobile || request.phone) && (
              <a
                href={`tel:${request.mobile || request.phone}`}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition"
              >
                <Phone size={13} /> Call Now
              </a>
            )}
          </div>

          {/* Contact Details */}
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Sender Information</p>
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-primary/70 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-white/30 uppercase font-semibold">Email Address</p>
                  <p className="text-white/80 text-sm font-medium break-all">{request.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                <Phone size={14} className="text-primary/70 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-white/30 uppercase font-semibold">Mobile Number</p>
                  <p className="text-white/80 text-sm font-medium">{request.mobile || request.phone || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subject & Request Details */}
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Subject / Topic</p>
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4">
              <p className="text-white font-semibold text-sm leading-snug">{request.subject || 'General Inquiry'}</p>
            </div>
          </div>

          {/* Message */}
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Message Content</p>
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4">
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{request.message || 'No message provided.'}</p>
            </div>
          </div>

          {/* Admin Notes if available */}
          {request.admin_notes && (
            <div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Internal Admin Notes</p>
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4">
                <p className="text-orange-300/80 text-xs leading-relaxed whitespace-pre-wrap">{request.admin_notes}</p>
              </div>
            </div>
          )}

          {/* System Info */}
          <div>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Submission Metadata</p>
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-white/50">
                <span>Status</span>
                <StatusPill status={request.status} />
              </div>
              <div className="flex justify-between items-center text-white/50 pt-2 border-t border-white/[0.06]">
                <span>Submitted On</span>
                <span className="text-white/80">{fmtDate(request.created_at)}</span>
              </div>
              <div className="flex justify-between items-center text-white/50 pt-2 border-t border-white/[0.06]">
                <span>Identifier</span>
                <span className="text-white/40 font-mono text-[11px] truncate max-w-[180px]">{request.uuid}</span>
              </div>
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
            <Edit2 size={14} /> Update Request Status
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
  const [adminNotes, setAdminNotes] = useState(request?.admin_notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.patch(`/contacts/${request.uuid}/status`, {
        status,
        admin_notes: adminNotes,
      });
      if (!data.success) throw new Error(data.message || 'Failed');
      toast.success('Status updated successfully');
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111318] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center">
              <Edit2 size={15} className="text-orange-400" />
            </div>
            <h3 className="text-white font-bold text-base">Update Status</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition"
          >
            <X size={14} />
          </button>
        </div>

        <p className="text-white/40 text-xs mb-4">
          Updating status for inquiry by <span className="text-white font-semibold">"{request?.name}"</span>
        </p>

        {/* Status choices */}
        <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Select Status</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {CONTACT_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`py-2 rounded-xl text-xs font-semibold border transition text-center ${
                status === s
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-sm'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Admin Notes */}
        <div className="mb-5">
          <label className="block text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-1.5">
            Internal Follow-Up Notes (Optional)
          </label>
          <textarea
            rows={3}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add follow-up notes, phone call logs, or resolution details..."
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition resize-none"
          />
        </div>

        {error && <p className="text-rose-400 text-xs mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60 flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-orange-500/20"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────────
export default function AdminContactRequestsPage() {
  const navigate = useNavigate();

  // Mode and Filters
  const [viewMode, setViewMode] = useState('table');
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Data & State
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals & Action Target
  const [viewRequest, setViewRequest] = useState(null);
  const [viewIndex, setViewIndex] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteMsg, setDeleteMsg] = useState('');

  // Fetch Requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/contacts');
      if (data.success === false) throw new Error(data.message || 'Failed to load requests');
      setRequests(data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load contact requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Derived filtered requests
  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((r) => {
      const matchSearch =
        !term ||
        [r.name, r.email, r.mobile, r.phone, r.subject, r.message, r.admin_notes]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term);

      const matchStatus =
        !statusFilter || (r.status || 'New').toLowerCase() === statusFilter.toLowerCase();

      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilter]);

  // Counts & Stats
  const total = requests.length;
  const newCount = requests.filter((r) => (r.status || 'New') === 'New').length;
  const contactedCount = requests.filter((r) => r.status === 'Contacted').length;
  const inProgressCount = requests.filter((r) => r.status === 'In Progress').length;
  const resolvedCount = requests.filter((r) => r.status === 'Resolved' || r.status === 'Closed').length;

  const stats = [
    { label: 'Total Inquiries', value: total,          icon: Mail,          cls: 'text-blue-400',    bg: 'bg-blue-500/15' },
    { label: 'New Requests',    value: newCount,       icon: MessageSquare, cls: 'text-amber-400',   bg: 'bg-amber-500/15' },
    { label: 'Contacted',       value: contactedCount,  icon: Phone,         cls: 'text-sky-400',     bg: 'bg-sky-500/15' },
    { label: 'Resolved/Closed', value: resolvedCount,   icon: CheckCircle2,  cls: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  ];

  const hasFilters = !!(statusFilter || search);
  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/contacts/${deleteTarget.uuid}`);
      setDeleteMsg(`Inquiry from "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
      if (viewRequest?.uuid === deleteTarget.uuid) setViewRequest(null);
      await fetchRequests();
      setTimeout(() => setDeleteMsg(''), 3500);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete request');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // Export CSV Action
  const handleExportCSV = () => {
    const dataToExport = filteredRequests.length ? filteredRequests : requests;
    const csv = [
      ['Name', 'Email', 'Phone/Mobile', 'Subject', 'Status', 'Message', 'Date Submitted'],
      ...dataToExport.map((r) => [
        r.name || '',
        r.email || '',
        r.mobile || r.phone || '',
        r.subject || '',
        r.status || 'New',
        (r.message || '').replace(/\r?\n|\r/g, ' '),
        fmtDate(r.created_at),
      ]),
    ]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">
      {/* ── Success Toast ── */}
      {deleteMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={16} /> {deleteMsg}
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
          onEdit={() => {
            setEditTarget(viewRequest);
            setViewRequest(null);
          }}
        />
      )}

      {editTarget && (
        <StatusEditModal
          request={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            setEditTarget(null);
            fetchRequests();
          }}
        />
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
            <Mail size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Contact Requests</h1>
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
            <RefreshCw size={15} className={loading ? 'animate-spin text-primary' : ''} />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-primary/25 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            <FileText size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.06] transition"
            >
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
            placeholder="Search by name, email, phone, subject, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
            showFilters || hasFilters
              ? 'bg-primary/15 border-primary/40 text-primary'
              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasFilters && (
            <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
              {[statusFilter, search].filter(Boolean).length}
            </span>
          )}
          <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* View toggle */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === 'table' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            title="Table View"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === 'card' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            title="Card View"
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Filter By Status</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 transition"
              >
                <X size={10} /> Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {CONTACT_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition capitalize ${
                  statusFilter === s
                    ? 'bg-primary/20 border-primary/50 text-primary shadow-sm'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Error & Loading ── */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
          <AlertCircle size={16} className="shrink-0" />
          {error}
          <button onClick={fetchRequests} className="ml-auto text-xs underline underline-offset-2 hover:opacity-80">
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-primary/70" />
            <p className="text-sm text-white/40">Loading contact requests…</p>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && filteredRequests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Mail size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No contact requests found</p>
          <p className="text-xs mt-1">
            {hasFilters ? 'Try adjusting your search or filters.' : 'Messages submitted from the contact page will appear here.'}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/60 hover:text-white transition border border-white/10"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TABLE MODE
      ══════════════════════════════════════════ */}
      {!loading && !error && filteredRequests.length > 0 && viewMode === 'table' && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden mt-4 shadow-lg shadow-black/20">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">
                    S.No
                  </th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">
                    Sender
                  </th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">
                    Contact
                  </th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">
                    Subject
                  </th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">
                    Status
                  </th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">
                    Message
                  </th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">
                    Submitted
                  </th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((r, i) => (
                  <tr
                    key={r.uuid || r.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer"
                    onDoubleClick={() => setEditTarget(r)}
                    title="Double click to update status"
                  >
                    <td className="px-5 py-3.5 text-white/40 text-xs">{i + 1}</td>

                    {/* Sender */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.name} index={i} />
                        <div>
                          <p className="text-white font-semibold text-sm leading-tight">{r.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact info */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {r.email && (
                          <a
                            href={`mailto:${r.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-white/60 hover:text-primary text-xs flex items-center gap-1.5 transition"
                          >
                            <Mail size={10} className="text-white/30 shrink-0" />
                            <span className="truncate max-w-[150px]">{r.email}</span>
                          </a>
                        )}
                        {(r.mobile || r.phone) && (
                          <a
                            href={`tel:${r.mobile || r.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-white/50 hover:text-emerald-400 text-xs flex items-center gap-1.5 transition"
                          >
                            <Phone size={10} className="text-white/30 shrink-0" />
                            {r.mobile || r.phone}
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex text-xs font-semibold text-white/80 max-w-[160px] truncate">
                        {r.subject || 'General Inquiry'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusPill status={r.status || 'New'} />
                    </td>

                    {/* Message snippet */}
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <p className="text-white/40 text-xs truncate" title={r.message}>
                        {r.message || '—'}
                      </p>
                    </td>

                    {/* Submitted Date */}
                    <td className="px-4 py-3.5">
                      <span className="text-white/40 text-xs">{fmtDateShort(r.created_at)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setViewRequest(r);
                            setViewIndex(i);
                          }}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition"
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => setEditTarget(r)}
                          className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/25 text-primary border border-transparent hover:border-primary/30 flex items-center justify-center transition"
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
      {!loading && !error && filteredRequests.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 mt-4">
          {filteredRequests.map((r, i) => (
            <div
              key={r.uuid || r.id}
              className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-lg shadow-black/20"
              onDoubleClick={() => setEditTarget(r)}
              title="Double click to update status"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={r.name} index={i} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm leading-tight truncate">{r.name}</p>
                    <p className="text-white/40 text-xs mt-0.5 truncate">{r.subject || 'General Inquiry'}</p>
                  </div>
                </div>
                <StatusPill status={r.status || 'New'} />
              </div>

              {/* Contact info */}
              <div className="space-y-1.5">
                {r.email && (
                  <p className="text-white/50 text-xs flex items-center gap-2 truncate">
                    <Mail size={11} className="text-white/30 shrink-0" />
                    <span className="truncate">{r.email}</span>
                  </p>
                )}
                {(r.mobile || r.phone) && (
                  <p className="text-white/50 text-xs flex items-center gap-2">
                    <Phone size={11} className="text-white/30 shrink-0" />
                    <span>{r.mobile || r.phone}</span>
                  </p>
                )}
              </div>

              {/* Message preview */}
              {r.message && (
                <p className="text-white/40 text-xs leading-relaxed line-clamp-3 border-t border-white/[0.06] pt-3">
                  {r.message}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.07] mt-auto">
                <span className="text-[10px] text-white/30 flex items-center gap-1">
                  <Clock size={10} /> {fmtDateShort(r.created_at)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setViewRequest(r);
                      setViewIndex(i);
                    }}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 flex items-center justify-center transition"
                    title="View Details"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={() => setEditTarget(r)}
                    className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/25 text-primary flex items-center justify-center transition"
                    title="Update Status"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(r)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 flex items-center justify-center transition"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
