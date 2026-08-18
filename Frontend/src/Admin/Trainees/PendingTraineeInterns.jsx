import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, Plus, Search, RefreshCw, Eye, Edit2, Trash2, 
  Loader2, AlertCircle, CheckCircle, LayoutGrid, List, Users, 
  UserCheck, UserX, TrendingUp, SlidersHorizontal, ChevronDown, 
  X, Mail, Phone, Building2, UserRoundPlus, Clock
} from 'lucide-react';
import api from '../../api';

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_OPTIONS = ['Trainee', 'Intern'];

const STATUS_STYLES = {
  Pending:   { pill: 'bg-amber-500/15 text-amber-400 border border-amber-500/25', dot: 'bg-amber-400' },
  Active:    { pill: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400' },
  Completed: { pill: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',   dot: 'bg-purple-400' },
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

  const statsArray = [
    { label: 'Pending Registrations', value: statsData.total, icon: Clock, accent: 'from-amber-500/20 to-amber-600/10' },
    { label: 'Trainees', value: statsData.trainees, icon: Users, accent: 'from-blue-500/20 to-blue-600/10' },
    { label: 'Interns', value: statsData.interns, icon: UserRoundPlus, accent: 'from-purple-500/20 to-purple-600/10' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05070b] via-[#0a0d12] to-[#05070b] px-4 sm:px-6 lg:px-8 py-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ────── HEADER ────── */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Clock size={20} className="text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Pending Registrations</h1>
          </div>
          <p className="text-sm text-white/50">New trainees & interns awaiting approval from Book Now</p>
        </div>

        {/* ────── STATS ────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsArray.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className={`rounded-2xl border border-white/10 bg-gradient-to-br ${stat.accent} p-5 backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white/60 tracking-wide uppercase">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                  </div>
                  <Icon size={24} className="text-white/20" />
                </div>
              </div>
            );
          })}
        </div>

        {/* ────── FILTERS & ACTIONS ────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:ring-1 focus:ring-orange-500/30 focus:border-orange-500/50 outline-none transition"
                />
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition flex items-center gap-2 text-sm font-medium"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-white/60">
                  <span className="block mb-2 font-medium">Type</span>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500/50 transition"
                  >
                    <option value="">All Types</option>
                    {TYPE_OPTIONS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ────── ERROR & TOAST ────── */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 px-4 py-3 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        {toast && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-4 py-3 text-sm">
            <CheckCircle size={16} />
            {toast}
          </div>
        )}

        {/* ────── TABLE ────── */}
        <div className="rounded-2xl border border-white/10 bg-[#111318] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock size={48} className="text-white/20 mb-4" />
              <p className="text-lg font-semibold text-white/60">No pending registrations</p>
              <p className="text-sm text-white/40">All new trainees and interns have been reviewed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Applied</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-white/60 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-white/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {members.map((member, idx) => (
                    <tr key={member.uuid} className="hover:bg-white/5 transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={member.full_name} index={idx} />
                          <div>
                            <p className="font-medium text-white">{member.full_name || '—'}</p>
                            <p className="text-xs text-white/40">{member.person_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white/60">{member.type || '—'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-white/60">
                            <Mail size={14} />
                            {member.email_address || '—'}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-white/60">
                            <Phone size={14} />
                            {member.mobile_number || '—'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-white/60">{fmtDate(member.created_at)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={member.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => navigate(`/admin/trainees/view/${member.uuid}`)}
                            className="p-2 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleApprove(member)}
                            className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition"
                            title="Approve registration"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(member)}
                            className="p-2 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ────── PAGINATION ────── */}
        {!loading && members.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">
              Showing {members.length} of {pagination.total} pending registrations
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-white/60 text-sm">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ────── DELETE MODAL ────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="rounded-2xl border border-white/10 bg-[#111318] p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Delete Member?</h3>
            <p className="text-sm text-white/60">
              Are you sure you want to delete <strong>{deleteTarget.full_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
