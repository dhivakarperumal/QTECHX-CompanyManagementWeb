import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Plus, Search, RefreshCw, Eye, Edit2, Trash2, 
  Loader2, AlertCircle, CheckCircle, LayoutGrid, List, Users, 
  UserCheck, UserX, TrendingUp, SlidersHorizontal, ChevronDown, 
  X, Mail, Phone, Building2, UserRoundPlus
} from 'lucide-react';
import api from '../../api';
import TraineeAssignmentDrawer from './TraineeAssignmentDrawer';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ['Pending', 'Active', 'Completed', 'On Leave', 'Inactive'];
const TYPE_OPTIONS = ['Trainee', 'Intern'];

const STATUS_STYLES = {
  Pending:   { pill: 'bg-orange-500/15 text-orange-400 border border-orange-500/25', dot: 'bg-orange-400' },
  Active:    { pill: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400' },
  Completed: { pill: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',   dot: 'bg-purple-400' },
  'On Leave':{ pill: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',     dot: 'bg-amber-400' },
  Inactive:  { pill: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',        dot: 'bg-rose-400' },
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
  const s = STATUS_STYLES[status] || { pill: 'bg-white/10 text-white/50 border border-white/15', dot: 'bg-white/40' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition cursor-default ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status || 'Unknown'}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AllTraineeInterns() {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('table');
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 20;

  // Data
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [statsData, setStatsData] = useState({ total: 0, active: 0, trainees: 0, interns: 0 });

  // Modals
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedTraineeForAssignment, setSelectedTraineeForAssignment] = useState(null);
  const [assignmentDrawerOpen, setAssignmentDrawerOpen] = useState(false);

  // ── Fetch members ──
  const loadMembers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) {
        params.append('status', statusFilter);
      } else {
        params.append('exclude_status', 'Pending');
      }
      const { data } = await api.get(`/trainee-intern?${params}`);
      if (!data.success) throw new Error(data.message || 'Failed');
      setMembers(data.data || []);
      setPagination(data.pagination || { total: 0, pages: 1, page, limit });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, statusFilter]);

  // ── Fetch stats ──
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/trainee-intern?limit=500&page=1');
      if (!data.success) return;
      const all = data.data || [];
      setStatsData({
        total:    data.pagination?.total ?? all.length,
        active:   all.filter(c => c.status === 'Active').length,
        trainees: all.filter(c => c.type === 'Trainee').length,
        interns:  all.filter(c => c.type === 'Intern').length,
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadMembers(); }, [loadMembers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); }, [search, typeFilter, statusFilter]);

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

  const hasFilters = !!(statusFilter || typeFilter || search);
  const clearFilters = () => { setSearch(''); setStatusFilter(''); setTypeFilter(''); };

  const stats = [
    { label: 'Total Members', value: statsData.total,    icon: Users,         cls: 'text-blue-400',    bg: 'bg-blue-500/15'    },
    { label: 'Active',        value: statsData.active,   icon: UserCheck,     cls: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { label: 'Trainees',      value: statsData.trainees, icon: GraduationCap, cls: 'text-orange-400',  bg: 'bg-orange-500/15'  },
    { label: 'Interns',       value: statsData.interns,  icon: TrendingUp,    cls: 'text-purple-400',  bg: 'bg-purple-500/15'  },
  ];

  const pages = useMemo(() => Array.from({ length: Math.max(1, pagination.pages) }, (_, i) => i + 1), [pagination.pages]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">

      {/* ── Success toast ── */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* ── Modals ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-[#111318] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-rose-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Delete Member</h3>
                <p className="text-white/40 text-xs mt-0.5">This cannot be undone</p>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete <span className="text-white font-semibold">"{deleteTarget.full_name}"</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-40">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition disabled:opacity-60 flex items-center justify-center gap-2">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} 
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <GraduationCap size={22} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Trainees & Interns</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? 'Loading…' : `${pagination.total} member${pagination.total !== 1 ? 's' : ''} total`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { loadMembers(); fetchStats(); }}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-orange-500' : ''} />
          </button>
          {/* Assign Employee Button */}
          <button
            onClick={() => {
              setSelectedTraineeForAssignment(null);
              setAssignmentDrawerOpen(true);
            }}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400"
          >
            <UserRoundPlus size={15} /> Assign Employee
          </button>
          <button
            onClick={() => navigate('/admin/trainees/add')}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/25 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            <UserRoundPlus size={15} /> Add Trainee
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
            placeholder="Search by name, email, person ID..."
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
              ? 'bg-orange-500/15 border-orange-500/40 text-orange-500'
              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasFilters && (
            <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
              {[statusFilter, typeFilter, search].filter(Boolean).length}
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
              <button onClick={clearFilters} className="text-xs text-orange-500/70 hover:text-orange-500 flex items-center gap-1 transition">
                <X size={10} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Member Type</p>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_OPTIONS.map(s => (
                  <button key={s} onClick={() => setTypeFilter(typeFilter === s ? '' : s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${typeFilter === s ? 'bg-orange-500/20 border-orange-500/50 text-orange-500' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${statusFilter === s ? 'bg-orange-500/20 border-orange-500/50 text-orange-500' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}>
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
          <button onClick={loadMembers} className="ml-auto text-xs underline underline-offset-2 hover:opacity-80">Retry</button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-orange-500/70" />
            <p className="text-sm text-white/40">Loading members…</p>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Users size={30} className="opacity-40" />
          </div>
         
        </div>
      )}

      {/* ══════════════════════════════════════════
          TABLE MODE
      ══════════════════════════════════════════ */}
      {!loading && !error && members.length > 0 && viewMode === 'table' && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">S.No</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Member</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Contact</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Status</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Type & Dept</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Joined</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => {
                  const hasActiveAssignment = Number(m.has_active_assignment || 0) > 0;
                  return (
                    <tr
                      key={m.uuid}
                      className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors"
                    >
                    <td className="px-5 py-3.5 text-white/50">{i + 1}</td>
                    {/* Member */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.full_name} index={i} />
                        <div>
                          <p className="text-white font-semibold text-sm leading-tight">{m.full_name}</p>
                          <p className="text-white/35 text-xs mt-0.5 flex items-center gap-1">
                             {m.person_id} {m.designation ? `• ${m.designation}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {m.email_address && (
                          <p className="text-white/50 text-xs flex items-center gap-1.5">
                            <Mail size={11} className="text-white/30" /> {m.email_address}
                          </p>
                        )}
                        {m.mobile_number && (
                          <p className="text-white/50 text-xs flex items-center gap-1.5">
                            <Phone size={11} className="text-white/30" /> {m.mobile_number}
                          </p>
                        )}
                        {!m.email_address && !m.mobile_number && (
                          <span className="text-white/20 text-xs">—</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusPill status={m.status} />
                    </td>

                    {/* Type & Dept */}
                    <td className="px-4 py-3.5">
                      <div>
                         <p className="text-white/80 font-medium text-sm">{m.type}</p>
                         <p className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                           <Building2 size={10} /> {m.department || '—'}
                         </p>
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3.5">
                       <p className="text-white/60 text-xs font-medium">
                         {m.created_at ? fmtDate(m.created_at) : '—'}
                       </p>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {/* Assign or Reassign Employee */}
                        <button
                          onClick={() => {
                            setSelectedTraineeForAssignment(m);
                            setAssignmentDrawerOpen(true);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm shadow-orange-500/20 ${hasActiveAssignment ? 'text-white bg-slate-700 hover:bg-slate-600' : 'text-white bg-orange-500 hover:opacity-90'}`}
                          style={hasActiveAssignment ? {} : { background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
                          title={hasActiveAssignment ? 'Reassign Employee' : 'Assign Employee'}
                        >
                          <RefreshCw size={13} />
                          {hasActiveAssignment ? 'Reassign' : 'Assign'}
                        </button>
                        <button
                          onClick={() => navigate(`/admin/trainees/view/${m.uuid}`)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/trainees/edit/${m.uuid}`)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(m)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/15 flex items-center justify-center text-white/60 hover:text-rose-400 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
      )})}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white/[0.01] border-t border-white/8 px-5 py-3.5 flex items-center justify-between">
            <p className="text-xs text-white/40">
              Showing <span className="font-semibold text-white/70">{(page - 1) * limit + 1}</span> to <span className="font-semibold text-white/70">{Math.min(page * limit, pagination.total)}</span> of <span className="font-semibold text-white/70">{pagination.total}</span> entries
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-30"
              >
                Prev
              </button>
              {pages.map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`min-w-[32px] px-2 py-1.5 rounded-lg text-xs font-semibold transition ${
                    page === p
                      ? 'bg-orange-500 text-white border border-orange-400'
                      : 'border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          CARD MODE
      ══════════════════════════════════════════ */}
      {!loading && !error && members.length > 0 && viewMode === 'card' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((m, i) => {
              const hasActiveAssignment = Number(m.has_active_assignment || 0) > 0;
              return (
                <div key={m.uuid} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 hover:bg-white/[0.04] transition group">
                <div className="flex justify-between items-start mb-4">
                  <Avatar name={m.full_name} index={i} size="lg" />
                  <StatusPill status={m.status} />
                </div>
                
                <div className="mb-4">
                  <h3 className="text-base font-bold text-white truncate">{m.full_name}</h3>
                  <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
                    {m.person_id} {m.designation ? `• ${m.designation}` : ''}
                  </p>
                </div>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                     <Mail size={12} className="text-white/30" />
                     <span className="truncate">{m.email_address || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                     <Phone size={12} className="text-white/30" />
                     <span>{m.mobile_number || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60">
                     <Building2 size={12} className="text-white/30" />
                     <span>{m.type} • {m.department || '—'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      setSelectedTraineeForAssignment(m);
                      setAssignmentDrawerOpen(true);
                    }}
                    className={`w-10 py-2 rounded-xl border flex items-center justify-center transition ${hasActiveAssignment ? 'bg-slate-700 border-slate-700 text-white/70 hover:bg-slate-600' : 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20'}`}
                    title={hasActiveAssignment ? 'Reassign Employee' : 'Assign Employee'}
                  >
                    <RefreshCw size={14} />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/trainees/view/${m.uuid}`)}
                    className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/admin/trainees/edit/${m.uuid}`)}
                    className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(m)}
                    className="w-10 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )})}
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-white/40">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-30">Prev</button>
              {pages.map((p) => <button key={p} onClick={() => setPage(p)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${page === p ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10'}`}>{p}</button>)}
              <button disabled={page >= pagination.pages} onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-30">Next</button>
            </div>
          </div>
        </>
      )}

      {/* Assignment Drawer */}
      {assignmentDrawerOpen && (
        <TraineeAssignmentDrawer
          trainee={selectedTraineeForAssignment}
          onClose={() => {
            setAssignmentDrawerOpen(false);
            setSelectedTraineeForAssignment(null);
          }}
          onSuccess={(msg) => {
            setAssignmentDrawerOpen(false);
            setSelectedTraineeForAssignment(null);
            showToast(msg);
            loadMembers();
          }}
        />
      )}
    </div>
  );
}
