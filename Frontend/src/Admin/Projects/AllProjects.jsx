import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, Search, TrendingUp, RefreshCw, Plus,
  LayoutGrid, List, CheckCircle, AlertCircle, PlayCircle,
  Eye, Edit2, Trash2, Building2, User, X, Loader2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import api from '../../api';

const formatCurrency = (value) => {
  if (!value) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const AVATAR_COLOURS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#14b8a6','#f97316','#8b5cf6','#ef4444','#22c55e'];
const initials = (name = '') => name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'P';

function Avatar({ name, index }) {
  const c = AVATAR_COLOURS[index % AVATAR_COLOURS.length];
  return (
    <div className="w-10 h-10 rounded-xl text-xs flex items-center justify-center font-bold shrink-0 select-none"
      style={{ background: c + '28', border: `1.5px solid ${c}44`, color: c }}>
      {initials(name)}
    </div>
  );
}

const STATUS_STYLES = {
  'Planning':    { pill: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',         dot: 'bg-blue-400' },
  'In Progress': { pill: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400' },
  'Testing':     { pill: 'bg-violet-500/15 text-violet-400 border border-violet-500/25',    dot: 'bg-violet-400' },
  'On Hold':     { pill: 'bg-orange-500/15 text-orange-400 border border-orange-500/25',    dot: 'bg-orange-400' },
  'Live':        { pill: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',          dot: 'bg-cyan-400' },
  'Completed':   { pill: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',    dot: 'bg-purple-400' },
  'Cancelled':   { pill: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',          dot: 'bg-rose-400' },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || { pill: 'bg-white/10 text-white/50 border border-white/15', dot: 'bg-white/40' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status || 'Unknown'}
    </span>
  );
}

const STATUS_OPTIONS = ['Planning', 'In Progress', 'Testing', 'On Hold', 'Live', 'Completed', 'Cancelled'];

export default function AllProjects() {
  const navigate = useNavigate();
  const [projects, setProjects]         = useState([]);
  const [total, setTotal]               = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]                 = useState(1);
  const [viewMode, setViewMode]         = useState('table');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [toast, setToast]               = useState('');
  const limit = 15;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchProjects = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const p = new URLSearchParams({ page, limit });
      if (search)       p.append('search', search);
      if (statusFilter) p.append('current_status', statusFilter);
      const { data } = await api.get(`/projects?${p}`);
      if (data.success === false) throw new Error(data.message || 'Failed');
      setProjects(data.data || []);
      setTotal(data.pagination?.total ?? (data.data || []).length);
      setTotalPages(data.pagination?.pages ?? 1);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load projects');
    } finally { setLoading(false); }
  }, [page, limit, search, statusFilter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/projects/${deleteTarget.uuid}`);
      showToast(`"${deleteTarget.project_name}" deleted.`);
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
      setDeleteTarget(null);
    } finally { setDeleting(false); }
  };

  const inProgress = projects.filter(p => p.current_status === 'In Progress').length;
  const completed  = projects.filter(p => p.current_status === 'Completed').length;
  const onHold     = projects.filter(p => p.current_status === 'On Hold').length;

  const stats = [
    { label: 'Total',       value: total,       icon: FolderKanban, cls: 'text-blue-400',    bg: 'bg-blue-500/15'    },
    { label: 'In Progress', value: inProgress,   icon: PlayCircle,   cls: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { label: 'Completed',   value: completed,    icon: CheckCircle,  cls: 'text-purple-400',  bg: 'bg-purple-500/15'  },
    { label: 'On Hold',     value: onHold,       icon: AlertCircle,  cls: 'text-orange-400',  bg: 'bg-orange-500/15'  },
  ];

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-[#111318] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                <Trash2 size={18} className="text-rose-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Delete Project</h3>
                <p className="text-white/40 text-xs mt-0.5">This cannot be undone</p>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              Delete <span className="text-white font-semibold">"{deleteTarget.project_name}"</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition flex items-center justify-center gap-2">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <FolderKanban size={22} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">All Projects</h1>
            <p className="text-white/40 text-xs mt-0.5">{loading ? 'Loading…' : `${total} project${total !== 1 ? 's' : ''} total`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchProjects}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition">
            <RefreshCw size={15} className={loading ? 'animate-spin text-orange-500' : ''} />
          </button>
          <button onClick={() => navigate('/admin/projects/add')}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
            <Plus size={15} /> Add Project
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#111318] border border-white/10 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.02] transition">
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

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Search by project, client, manager…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111318] border border-white/10 text-white text-sm rounded-xl pl-10 pr-9 py-2.5 outline-none focus:border-orange-500/50 transition placeholder:text-white/20" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X size={13} />
            </button>
          )}
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#111318] border border-white/10 text-sm text-white/70 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500/50">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex bg-[#111318] border border-white/10 rounded-xl p-1">
          <button onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'}`}>
            <List size={16} />
          </button>
          <button onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'}`}>
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
          <AlertCircle size={16} className="shrink-0" /> {error}
          <button onClick={fetchProjects} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-orange-500/70" />
            <p className="text-sm text-white/40">Loading projects…</p>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <FolderKanban size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No projects found</p>
          <p className="text-xs mt-1">{search || statusFilter ? 'Try adjusting your filters.' : 'Add your first project to get started.'}</p>
          {!search && !statusFilter && (
            <button onClick={() => navigate('/admin/projects/add')}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
              <Plus size={14} /> Add First Project
            </button>
          )}
        </div>
      )}

      {/* Table View */}
      {!loading && !error && projects.length > 0 && viewMode === 'table' && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Project</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Manager</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Status</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Progress</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Start Date</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Cost</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => (
                  <tr key={p.uuid} className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.project_name} index={i} />
                        <div>
                          <div className="text-white font-semibold text-sm leading-tight">{p.project_name}</div>
                          {p.client_name && (
                            <p className="text-white/35 text-xs mt-0.5 flex items-center gap-1">
                              <Building2 size={9} /> {p.client_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {p.project_manager
                        ? <p className="text-white/50 text-xs flex items-center gap-1.5"><User size={10} className="text-white/25 shrink-0" /> {p.project_manager}</p>
                        : <span className="text-white/20 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3.5"><StatusPill status={p.current_status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${p.overall_progress || 0}%` }} />
                        </div>
                        <span className="text-white/50 text-xs">{p.overall_progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-white/35 text-xs">{fmtDate(p.project_start_date)}</span></td>
                    <td className="px-4 py-3.5">
                      <span className="text-white/60 text-xs font-medium bg-white/[0.05] border border-white/10 px-2.5 py-1 rounded-md">
                        {formatCurrency(p.total_project_cost)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition" title="View">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => navigate(`/admin/projects/edit/${p.uuid}`)}
                          className="w-7 h-7 rounded-lg bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 border border-transparent hover:border-orange-500/30 flex items-center justify-center transition" title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteTarget(p)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition" title="Delete">
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

      {/* Grid View */}
      {!loading && !error && projects.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <div key={p.uuid} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={p.project_name} index={i} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm leading-tight truncate">{p.project_name}</p>
                    {p.client_name && <p className="text-white/35 text-xs mt-0.5 truncate flex items-center gap-1"><Building2 size={9} /> {p.client_name}</p>}
                  </div>
                </div>
                <StatusPill status={p.current_status} />
              </div>
              {p.project_manager && (
                <p className="text-white/45 text-xs flex items-center gap-2"><User size={11} className="text-white/25 shrink-0" /> {p.project_manager}</p>
              )}
              <div>
                <div className="flex justify-between text-xs text-white/40 mb-1.5">
                  <span>Progress</span><span>{p.overall_progress || 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${p.overall_progress || 0}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                <span className="text-white/50 text-xs font-medium">{formatCurrency(p.total_project_cost)}</span>
                <div className="flex items-center gap-1.5">
                  <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 flex items-center justify-center transition"><Eye size={13} /></button>
                  <button onClick={() => navigate(`/admin/projects/edit/${p.uuid}`)} className="w-7 h-7 rounded-lg bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 flex items-center justify-center transition"><Edit2 size={13} /></button>
                  <button onClick={() => setDeleteTarget(p)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 flex items-center justify-center transition"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-white/40">Page {page} of {totalPages} · {total} total</p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-30">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-30">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
