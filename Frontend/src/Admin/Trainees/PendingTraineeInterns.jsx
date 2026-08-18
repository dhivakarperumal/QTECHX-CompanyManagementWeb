import { useEffect, useMemo, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Plus, Search, RefreshCw, Eye, Edit2, Trash2, 
  Loader2, AlertCircle, CheckCircle, LayoutGrid, List, Users, 
  UserCheck, UserX, TrendingUp, SlidersHorizontal, ChevronDown, 
  X, Mail, Phone, Building2, UserRoundPlus, Clock, User
} from 'lucide-react';
import api from '../../api';

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_OPTIONS = ['Trainee', 'Intern'];

const STATUS_STYLES = {
  Pending:   { pill: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  Active:    { pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  Completed: { pill: 'bg-purple-500/10 text-purple-400 border-purple-500/20',   dot: 'bg-purple-400' },
};

const AVATAR_COLOURS = [
  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'bg-rose-500/15 text-rose-400 border-rose-500/30',
  'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '??';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function Avatar({ name, index }) {
  const colour = AVATAR_COLOURS[index % AVATAR_COLOURS.length];
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center border font-bold text-sm shrink-0 ${colour}`}>
      {initials(name)}
    </div>
  );
}

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || { pill: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status || 'Unknown'}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PendingTraineeInterns() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('table');
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;

  // Data
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [statsData, setStatsData] = useState({ total: 0, trainees: 0, interns: 0 });

  // Modals
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch members (Pending status only) ──
  const loadMembers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page, limit, status: 'Pending' });
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      const { data } = await api.get(`/trainee-intern?${params}`);
      if (!data.success) throw new Error(data.message || 'Failed');
      setMembers(data.data || []);
      setPagination(data.pagination || { total: 0, pages: 1, page, limit });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load pending members');
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  // ── Fetch stats (Pending only) ──
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/trainee-intern?limit=500&page=1&status=Pending');
      if (!data.success) return;
      const all = data.data || [];
      setStatsData({
        total:    data.pagination?.total ?? all.length,
        trainees: all.filter(c => c.type === 'Trainee').length,
        interns:  all.filter(c => c.type === 'Intern').length,
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); }, [search, typeFilter]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/trainee-intern/${deleteTarget.uuid}`);
      showToast('Member deleted successfully.');
      setDeleteTarget(null);
      loadMembers();
      fetchStats();
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── Approve (change status to Active) ──
  const handleApprove = async (member) => {
    if (!member?.uuid) return;
    try {
      const res = await api.put(`/trainee-intern/${member.uuid}`, { status: 'Active' });
      if (!res.data.success) throw new Error(res.data.message || 'Failed to approve');
      showToast('Trainee/Intern approved successfully.');
      loadMembers();
      fetchStats();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to approve');
    }
  };

  const hasFilters = typeFilter !== '' || !!search;
  const clearFilters = () => { setSearch(''); setTypeFilter(''); };

  const statsArray = [
    { label: 'Pending Total', value: statsData.total, icon: Clock, cls: 'text-amber-400', bg: 'bg-amber-500/15' },
    { label: 'Trainees', value: statsData.trainees, icon: Users, cls: 'text-blue-400', bg: 'bg-blue-500/15' },
    { label: 'Interns', value: statsData.interns, icon: UserRoundPlus, cls: 'text-purple-400', bg: 'bg-purple-500/15' },
  ];

  return (
    <div className="min-h-screen space-y-5 pb-10 text-white">

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Member?</h3>
            <p className="text-sm text-white/50 mb-6">Are you sure you want to delete <strong>{deleteTarget.full_name}</strong>? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:bg-white/10 transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 transition flex items-center justify-center gap-2">
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Error & Toast ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {toast && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 text-sm">
          <CheckCircle size={16} />
          {toast}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Clock size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Pending Registrations</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? 'Loading…' : `${pagination.total} pending request${pagination.total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadMembers} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition" title="Refresh">
            <RefreshCw size={15} className={loading ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsArray.map((s) => {
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
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
            showFilters || hasFilters ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasFilters && (
            <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
              {[typeFilter !== '', !!search].filter(Boolean).length}
            </span>
          )}
          <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button onClick={() => setViewMode('table')} className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${viewMode === 'table' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`} title="Table View">
            <List size={15} />
          </button>
          <button onClick={() => setViewMode('card')} className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${viewMode === 'card' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`} title="Card View">
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
          <div>
            <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Member Type</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setTypeFilter('')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${typeFilter === '' ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}
              >
                All
              </button>
              {TYPE_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => setTypeFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${typeFilter === s ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-primary/70" />
            <p className="text-sm text-white/40">Loading pending registrations…</p>
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Clock size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No pending registrations</p>
          <p className="text-xs mt-1">
            {hasFilters ? 'Try adjusting your filters.' : 'All new trainees and interns have been reviewed.'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-xs text-primary hover:underline">Clear filters</button>
          )}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {!loading && members.length > 0 && viewMode === 'table' && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Name</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Contact</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Type</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Status</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Applied</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, i) => (
                  <tr key={member.uuid} className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={member.full_name} index={i} />
                        <div>
                          <p className="text-white font-semibold text-sm leading-tight">{member.full_name || 'Unknown'}</p>
                          <p className="text-white/35 text-xs mt-0.5 truncate max-w-[160px]">{member.person_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-white/60 text-xs">{member.email_address || '—'}</p>
                      <p className="text-white/35 text-[11px]">{member.mobile_number || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-white/60 text-xs">{member.type || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={member.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-white/35 text-xs">{fmtDate(member.created_at)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/trainees/view/${member.uuid}`)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition"
                          title="View"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleApprove(member)}
                          className="w-7 h-7 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-500 border border-transparent hover:border-emerald-500/30 flex items-center justify-center transition"
                          title="Approve"
                        >
                          <CheckCircle size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(member)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition"
                          title="Delete"
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

      {/* ── CARD VIEW ── */}
      {!loading && members.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {members.map((member, i) => (
            <div
              key={member.uuid}
              className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={member.full_name} index={i} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{member.full_name || 'Unknown'}</p>
                    <p className="text-white/40 text-xs truncate">{member.person_id}</p>
                  </div>
                </div>
                <StatusPill status={member.status} />
              </div>

              {/* Info */}
              <div className="space-y-2 text-xs text-white/50">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-blue-400 shrink-0" />
                  <span className="truncate">{member.email_address || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-emerald-400 shrink-0" />
                  <span>{member.mobile_number || '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={12} className="text-primary shrink-0" />
                  <span>{member.type || '—'}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                <p className="text-[10px] font-semibold text-white/30 tracking-wider">{fmtDate(member.created_at)}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => navigate(`/admin/trainees/view/${member.uuid}`)} className="p-1.5 text-white/40 hover:text-blue-400 transition" title="View"><Eye size={13} /></button>
                  <button onClick={() => handleApprove(member)} className="p-1.5 text-emerald-500/70 hover:text-emerald-400 transition" title="Approve"><CheckCircle size={13} /></button>
                  <button onClick={() => setDeleteTarget(member)} className="p-1.5 text-white/40 hover:text-rose-400 transition" title="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {!loading && members.length > 0 && pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
          <p className="text-xs text-white/50">
            Showing {members.length} of {pagination.total} registrations
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-white/40 text-xs font-medium">
              {page} / {pagination.pages}
            </span>
            <button
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 hover:text-white transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
