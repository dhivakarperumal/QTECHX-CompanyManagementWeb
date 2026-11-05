import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  FolderKanban, Search, RefreshCw, Plus,
  LayoutGrid, List, CheckCircle, AlertCircle, PlayCircle,
  Eye, Edit2, Trash2, Building2, User, X, Loader2,
  ChevronLeft, ChevronRight, ChevronDown, FlaskConical,
} from 'lucide-react';
import api from '../../api';
import ModalPortal from '../../Componets/CommonComponents/ModalPortal';

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#1a1d24',
    border: `1px solid ${state.isFocused ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
    boxShadow: 'none',
    outline: 'none',
    minHeight: '42px',
    height: '42px',
    borderRadius: '12px',
    '&:hover': { border: '1px solid #a855f7' },
  }),
  valueContainer: (p) => ({ ...p, padding: '0 12px', fontSize: '13px' }),
  singleValue: (p) => ({ ...p, color: '#fff', fontSize: '13px' }),
  placeholder: (p) => ({ ...p, color: 'rgba(255,255,255,.35)', fontSize: '13px' }),
  input: (p) => ({ ...p, color: '#fff', fontSize: '13px', margin: 0, padding: 0 }),
  menu: (p) => ({
    ...p, background: '#1a1d24', border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '12px', overflow: 'hidden', zIndex: 9999,
  }),
  menuList: (p) => ({ ...p, padding: 0, fontSize: '13px' }),
  option: (p, s) => ({
    ...p, fontSize: '13px', padding: '8px 14px',
    backgroundColor: s.isSelected ? '#a855f7' : s.isFocused ? 'rgba(168,85,247,.15)' : '#1a1d24',
    color: '#fff', cursor: 'pointer',
    ':active': { backgroundColor: '#9333ea' },
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (p) => ({ ...p, color: '#888', padding: '6px' }),
};

const STATUS_OPTIONS = ['Planning', 'In Progress', 'Testing', 'On Hold', 'Live', 'Completed', 'Cancelled'];

const STATUS_CONFIG = {
  'Planning':    { color: '#6366f1', bg: 'rgba(99,102,241,.15)',  icon: FolderKanban },
  'In Progress': { color: '#f59e0b', bg: 'rgba(245,158,11,.15)', icon: PlayCircle },
  'Testing':     { color: '#06b6d4', bg: 'rgba(6,182,212,.15)',  icon: CheckCircle },
  'On Hold':     { color: '#ef4444', bg: 'rgba(239,68,68,.15)',  icon: AlertCircle },
  'Live':        { color: '#10b981', bg: 'rgba(16,185,129,.15)', icon: CheckCircle },
  'Completed':   { color: '#10b981', bg: 'rgba(16,185,129,.15)', icon: CheckCircle },
  'Cancelled':   { color: '#6b7280', bg: 'rgba(107,114,128,.15)',icon: X },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Planning'];
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
      {status}
    </span>
  );
}

function ProgressBar({ value }) {
  const v = Math.min(100, Math.max(0, Number(value) || 0));
  const color = v >= 100 ? '#10b981' : v >= 60 ? '#a855f7' : v >= 30 ? '#f59e0b' : '#6366f1';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all" style={{ width: `${v}%`, background: color }} />
      </div>
      <span className="text-xs text-white/50 w-7 text-right">{v}%</span>
    </div>
  );
}

function ConfirmDeleteModal({ project, onConfirm, onCancel, loading }) {
  if (!project) return null;
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111318] p-6 shadow-2xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,.15)' }}>
              <Trash2 size={18} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Demo Project</h3>
              <p className="text-xs text-white/40">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-sm text-white/70 mb-5">
            Are you sure you want to delete <span className="font-semibold text-white">"{project.project_name}"</span>?
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-50">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {loading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function ProjectDetailModal({ project, onClose, onEdit }) {
  if (!project) return null;
  const rows = [
    ['Project Code', project.project_code],
    ['Category', project.project_category],
    ['Industry', project.industry],
    ['Client', project.client_name],
    ['Company', project.company_name],
    ['Contact Person', project.contact_person],
    ['Email', project.email],
    ['Phone', project.phone_number],
    ['Project Manager', project.project_manager],
    ['Start Date', project.project_start_date ? new Date(project.project_start_date).toLocaleDateString('en-IN') : null],
    ['End Date', project.project_end_date ? new Date(project.project_end_date).toLocaleDateString('en-IN') : null],
    ['Go Live', project.go_live_date ? new Date(project.go_live_date).toLocaleDateString('en-IN') : null],
    ['Support Period', project.support_period],
    ['Total Cost', project.total_project_cost ? `₹${Number(project.total_project_cost).toLocaleString('en-IN')}` : null],
    ['Frontend Tech', project.frontend_tech],
    ['Backend Tech', project.backend_tech],
    ['Database', project.database_tech],
    ['GitHub', project.github_link],
  ].filter(([, v]) => v);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.75)' }}>
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111318] shadow-2xl my-8">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,.15)' }}>
                <FlaskConical size={20} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{project.project_name}</h2>
                <p className="text-xs text-white/40 mt-0.5">{project.project_code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={project.current_status} />
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition">
                <X size={16} />
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="p-6 space-y-5">
            {project.description && (
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-1.5">Description</p>
                <p className="text-sm text-white/70 leading-relaxed">{project.description}</p>
              </div>
            )}
            {/* Progress bars */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">Phase Progress</p>
              {[['Overall', project.overall_progress], ['UI/UX', project.ui_progress], ['Frontend', project.frontend_progress], ['Backend', project.backend_progress], ['Testing', project.testing_progress], ['Deployment', project.deployment_progress]].map(([label, val]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-white/50 w-20 shrink-0">{label}</span>
                  <ProgressBar value={val} />
                </div>
              ))}
            </div>
            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3">
              {rows.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/40 mb-0.5">{label}</p>
                  <p className="text-sm text-white font-medium break-all">{value}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-white/10">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition">
              Close
            </button>
            <button onClick={() => onEdit(project.uuid)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
              <Edit2 size={14} /> Edit Project
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

export default function AllDemoProjects() {
  const navigate = useNavigate();
  const [projects, setProjects]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode]         = useState('table'); // 'table' | 'grid'
  const [page, setPage]                 = useState(1);
  const [pagination, setPagination]     = useState({ total: 0, pages: 1 });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewTarget, setViewTarget]     = useState(null);
  const LIMIT = 15;

  const fetchProjects = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter)  params.append('current_status', statusFilter);
      const { data } = await api.get(`/demo-projects?${params}`);
      if (!data.success) throw new Error(data.message || 'Failed');
      setProjects(data.data || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load demo projects');
    } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const { data } = await api.delete(`/demo-projects/${deleteTarget.uuid}`);
      if (!data.success) throw new Error(data.message || 'Failed');
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Delete failed');
      setDeleteTarget(null);
    } finally { setDeleteLoading(false); }
  };

  const handleEdit = (uuid) => {
    setViewTarget(null);
    navigate(`/admin/demo-projects/edit/${uuid}`);
  };

  const totalPages = pagination.pages || 1;

  return (
    <div className="space-y-6 pb-6 text-white min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,.15)', border: '1px solid rgba(168,85,247,.25)' }}>
            <FlaskConical size={18} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Demo Projects</h1>
            <p className="text-sm text-white/40 mt-0.5">
              {loading ? 'Loading…' : `${pagination.total || 0} demo project${pagination.total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode(v => v === 'table' ? 'grid' : 'table')}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition flex items-center justify-center">
            {viewMode === 'table' ? <LayoutGrid size={16} /> : <List size={16} />}
          </button>
          <button onClick={fetchProjects}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition flex items-center justify-center">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => navigate('/admin/demo-projects/add')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
            <Plus size={16} /> Add Demo Project
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, client, code…"
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 placeholder:text-white/30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="w-full sm:w-56">
          <Select
            options={[{ value: '', label: 'All Statuses' }, ...STATUS_OPTIONS.map(s => ({ value: s, label: s }))]}
            value={statusFilter ? { value: statusFilter, label: statusFilter } : { value: '', label: 'All Statuses' }}
            onChange={(opt) => setStatusFilter(opt?.value || '')}
            styles={customSelectStyles}
            isSearchable={false}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-purple-500/70" />
            <p className="text-sm text-white/40">Loading demo projects…</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,.1)', border: '1px solid rgba(168,85,247,.2)' }}>
            <FlaskConical size={28} className="text-purple-400/60" />
          </div>
          <div className="text-center">
            <p className="text-white/50 font-medium">No demo projects found</p>
            <p className="text-sm text-white/30 mt-1">
              {search || statusFilter ? 'Try adjusting your filters' : 'Create your first demo project to get started'}
            </p>
          </div>
          {!search && !statusFilter && (
            <button onClick={() => navigate('/admin/demo-projects/add')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 mt-2"
              style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>
              <Plus size={16} /> Add Demo Project
            </button>
          )}
        </div>
      )}

      {/* Table View */}
      {!loading && projects.length > 0 && viewMode === 'table' && (
        <div className="rounded-2xl border border-white/10 bg-[#111318] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  {['Code', 'Project Name', 'Client / Company', 'Status', 'Progress', 'Manager', 'Start Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-white/40 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.map((p) => (
                  <tr key={p.uuid} className="hover:bg-white/[0.03] transition group">
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg">{p.project_code || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white leading-tight">{p.project_name}</div>
                      {p.short_name && <div className="text-xs text-white/40 mt-0.5">{p.short_name}</div>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-white/70">{p.client_name || '—'}</div>
                      {p.company_name && <div className="text-xs text-white/40">{p.company_name}</div>}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={p.current_status} /></td>
                    <td className="px-4 py-3.5 min-w-[120px]"><ProgressBar value={p.overall_progress} /></td>
                    <td className="px-4 py-3.5">
                      <span className="text-white/60 text-xs">{p.project_manager || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-white/60 text-xs">
                        {p.project_start_date ? new Date(p.project_start_date).toLocaleDateString('en-IN') : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewTarget(p)} title="View"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-purple-400 hover:bg-purple-500/10 transition">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => navigate(`/admin/demo-projects/edit/${p.uuid}`)} title="Edit"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(p)} title="Delete"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition">
                          <Trash2 size={14} />
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
      {!loading && projects.length > 0 && viewMode === 'grid' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.uuid} className="rounded-2xl border border-white/10 bg-[#111318] p-5 hover:border-purple-500/30 transition group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg">{p.project_code || '—'}</span>
                  <h3 className="mt-2 text-sm font-bold text-white leading-tight truncate">{p.project_name}</h3>
                  {p.client_name && (
                    <p className="text-xs text-white/40 mt-0.5 flex items-center gap-1 truncate">
                      <Building2 size={10} /> {p.client_name}
                    </p>
                  )}
                </div>
                <StatusBadge status={p.current_status} />
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/40">Overall Progress</span>
                </div>
                <ProgressBar value={p.overall_progress} />
              </div>
              {p.project_manager && (
                <p className="text-xs text-white/40 flex items-center gap-1 mb-3 truncate">
                  <User size={10} /> {p.project_manager}
                </p>
              )}
              <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                <button onClick={() => setViewTarget(p)} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition flex items-center justify-center gap-1.5">
                  <Eye size={12} /> View
                </button>
                <button onClick={() => navigate(`/admin/demo-projects/edit/${p.uuid}`)} className="flex-1 py-2 rounded-xl text-xs font-semibold text-blue-400/80 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 transition flex items-center justify-center gap-1.5">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => setDeleteTarget(p)} className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400/60 hover:text-red-400 bg-red-500/10 hover:bg-red-500/15 transition">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/40">
            Page {page} of {totalPages} &bull; {pagination.total} total
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition disabled:opacity-30">
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition ${p === page ? 'text-white' : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}
                  style={p === page ? { background: 'linear-gradient(135deg,#a855f7,#7c3aed)' } : {}}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition disabled:opacity-30">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmDeleteModal
        project={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
      <ProjectDetailModal
        project={viewTarget}
        onClose={() => setViewTarget(null)}
        onEdit={handleEdit}
      />
    </div>
  );
}
