import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../PrivateRouter/AuthContext';
import api from '../../api';
import {
  FolderKanban, Search, Building2, User, Clock, AlertCircle,
  LayoutGrid, List, ChevronLeft, ChevronRight, Eye, Loader2, X, TrendingUp
} from 'lucide-react';
import { PacmanLoader } from 'react-spinners';
import { useNavigate } from 'react-router-dom';

/* ─── Helpers ─────────────────────────────────────────────────────────── */
const AVATAR_COLOURS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#14b8a6','#f97316','#8b5cf6','#ef4444','#22c55e'];
const initials = (name = '') => name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'P';
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const formatCurrency = (v) => {
  if (!v) return '—';
  const n = Number(v);
  return Number.isNaN(n) ? v : new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
};

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
const STATUS_OPTIONS = ['Planning','In Progress','Testing','On Hold','Live','Completed','Cancelled'];

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || { pill:'bg-white/10 text-white/50 border border-white/15', dot:'bg-white/40' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status || 'Unknown'}
    </span>
  );
}

const LIMIT_OPTIONS = [10, 15, 25, 50];

/* ─── Component ───────────────────────────────────────────────────────── */
const EmployeeProjects = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [allProjects, setAllProjects] = useState([]);   // full assigned list
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // filter / view state
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode]       = useState('table');
  const [page, setPage]               = useState(1);
  const [limit, setLimit]             = useState(15);

  /* ── fetch all assigned projects once ─────────────────────────────── */
  const fetchAssignedProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [projRes, assignRes] = await Promise.all([
        api.get('/projects?limit=1000&page=1'),
        api.get('/projects/assignments/all?limit=1000'),
      ]);

      const allPrj   = projRes.data?.data || [];
      const grouped  = assignRes.data?.grouped || [];

      const userId   = user?.employee_id || user?.employeeId || user?.user_id
                     || user?.id         || user?._id;
      const userName = (user?.profileName || user?.name || user?.username || '').toLowerCase();

      // project UUIDs where the logged-in user is assigned
      const assignedUuids = new Set(
        grouped
          .filter(g => g.employees?.some(e => String(e.employee_id) === String(userId)))
          .map(g => g.project_uuid)
      );

      // also include projects where user is listed as project_manager
      const mine = allPrj.filter(p =>
        assignedUuids.has(p.uuid) ||
        (p.project_manager && p.project_manager.toLowerCase() === userName)
      );

      // deduplicate
      const unique = Array.from(new Map(mine.map(p => [p.uuid, p])).values());
      setAllProjects(unique);
    } catch (err) {
      console.error('Failed to load projects', err);
      setError('Unable to load assigned projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAssignedProjects(); }, [fetchAssignedProjects]);
  useEffect(() => { setPage(1); }, [search, statusFilter, limit]);

  /* ── derived data ─────────────────────────────────────────────────── */
  const filtered = allProjects.filter(p => {
    const matchSearch = !search ||
      (p.project_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.client_name  || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.project_manager || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.current_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated  = filtered.slice((page - 1) * limit, page * limit);

  // stats
  const inProgress = allProjects.filter(p => p.current_status === 'In Progress').length;
  const completed  = allProjects.filter(p => p.current_status === 'Completed').length;
  const onHold     = allProjects.filter(p => p.current_status === 'On Hold').length;

  /* ── render ───────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <FolderKanban size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">My Projects</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? 'Loading…' : `${allProjects.length} project${allProjects.length !== 1 ? 's' : ''} assigned`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:'Total Assigned', value: allProjects.length, icon: FolderKanban, cls:'text-blue-400',    bg:'bg-blue-500/15'    },
            { label:'In Progress',    value: inProgress,         icon: TrendingUp,   cls:'text-emerald-400', bg:'bg-emerald-500/15' },
            { label:'Completed',      value: completed,          icon: FolderKanban, cls:'text-purple-400',  bg:'bg-purple-500/15'  },
            { label:'On Hold',        value: onHold,             icon: AlertCircle,  cls:'text-orange-400',  bg:'bg-orange-500/15'  },
          ].map(s => {
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
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by project, client, manager…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111318] border border-white/10 text-white text-sm rounded-xl pl-10 pr-9 py-2.5 outline-none focus:border-primary/50 transition placeholder:text-white/20"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X size={13} />
            </button>
          )}
        </div>

        {/* status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#111318] border border-white/10 text-sm text-white/70 rounded-xl px-4 py-2.5 outline-none focus:border-primary/50"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* limit */}
        <select
          value={limit}
          onChange={e => { setLimit(Number(e.target.value)); }}
          className="bg-[#111318] border border-white/10 text-sm text-white/70 rounded-xl px-4 py-2.5 outline-none focus:border-primary/50"
        >
          {LIMIT_OPTIONS.map(n => <option key={n} value={n}>{n} per page</option>)}
        </select>

        {/* view toggle */}
        <div className="flex bg-[#111318] border border-white/10 rounded-xl p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
          <AlertCircle size={16} className="shrink-0" /> {error}
          <button onClick={fetchAssignedProjects} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <PacmanLoader color="#ef4444" size={20} />
          <p className="text-white/40 text-xs font-medium">Loading your projects…</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <FolderKanban size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No projects found</p>
          <p className="text-xs mt-1">{search || statusFilter ? 'Try adjusting your filters.' : 'You are not assigned to any projects yet.'}</p>
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {!loading && !error && paginated.length > 0 && viewMode === 'table' && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">S No</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Project</th>
                 
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Status</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Progress</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Start Date</th>
                 
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p, i) => (
                  <tr key={p.uuid} className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors">
                    <td className="px-5 py-3.5 text-[13px] text-white/55 whitespace-nowrap">{(page - 1) * limit + i + 1}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.project_name} index={(page-1)*limit + i} />
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
                    
                    <td className="px-4 py-3.5"><StatusPill status={p.current_status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${p.overall_progress || 0}%` }} />
                        </div>
                        <span className="text-white/50 text-xs">{p.overall_progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-white/35 text-xs">{fmtDate(p.project_start_date)}</span></td>
                    
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/employee/projects/view/${p.uuid}`)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition"
                          title="View"
                        >
                          <Eye size={13} />
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

      {/* ── GRID VIEW ── */}
      {!loading && !error && paginated.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {paginated.map((p, i) => (
            <div
              key={p.uuid}
              className="bg-[#111318] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={p.project_name} index={(page-1)*limit + i} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm leading-tight truncate">{p.project_name}</p>
                    {p.client_name && (
                      <p className="text-white/35 text-xs mt-0.5 truncate flex items-center gap-1">
                        <Building2 size={9} /> {p.client_name}
                      </p>
                    )}
                  </div>
                </div>
                <StatusPill status={p.current_status} />
              </div>

              {p.project_manager && (
                <p className="text-white/45 text-xs flex items-center gap-2">
                  <User size={11} className="text-white/25 shrink-0" /> {p.project_manager}
                </p>
              )}

              <div>
                <div className="flex justify-between text-xs text-white/40 mb-1.5">
                  <span>Progress</span><span>{p.overall_progress || 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${p.overall_progress || 0}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-white/40 text-xs">
                  <Clock size={11} /> {fmtDate(p.project_start_date)}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white/50 text-xs font-medium">{formatCurrency(p.total_project_cost)}</span>
                  <button
                    onClick={() => navigate(`/employee/projects/view/${p.uuid}`)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 flex items-center justify-center transition"
                    title="View"
                  >
                    <Eye size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
          <p className="text-xs text-white/40">
            Page {page} of {totalPages} · {filtered.length} project{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {/* page number buttons */}
            <div className="hidden sm:flex items-center gap-1.5">
              {(() => {
                const maxBtns = 7;
                let start = Math.max(1, page - 3);
                let end   = Math.min(totalPages, start + maxBtns - 1);
                if (end - start < maxBtns - 1) start = Math.max(1, end - maxBtns + 1);
                return Array.from({ length: end - start + 1 }, (_, k) => start + k).map(pg => (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-9 h-9 rounded-xl border text-sm font-semibold transition ${
                      pg === page
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {pg}
                  </button>
                ));
              })()}
            </div>
            {/* prev / next */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProjects;
