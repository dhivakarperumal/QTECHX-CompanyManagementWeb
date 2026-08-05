import { useEffect, useState, useCallback } from 'react';
import {
  Users, Search, Plus, Loader2, AlertCircle, Trash2, X,
  FolderKanban, CheckCircle, RefreshCw, ChevronDown, Edit3,
  LayoutGrid, Table2, Eye, User, Building2, TrendingUp,
  ChevronLeft, ChevronRight, Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import ModalPortal from '../../Componets/CommonComponents/ModalPortal';
import Select from 'react-select';

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#0e1118',
    border: `1px solid ${state.isFocused ? 'rgba(249,115,22,0.7)' : 'rgba(255,255,255,0.1)'}`,
    boxShadow: 'none',
    outline: 'none',
    minHeight: '42px',
    height: '42px',
    borderRadius: '12px',

    '&:hover': {
      border: '1px solid rgba(249,115,22,0.7)',
    },
  }),

  valueContainer: (provided) => ({
    ...provided,
    padding: '0 12px',
    fontSize: '14px',
  }),

  singleValue: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '14px',
  }),

  placeholder: (provided) => ({
    ...provided,
    color: 'rgba(255,255,255,.35)',
    fontSize: '14px',
  }),

  input: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '14px',
    margin: 0,
    padding: 0,
  }),

  menu: (provided) => ({
    ...provided,
    background: '#0e1118',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '12px',
    overflow: 'hidden',
    zIndex: 9999,
  }),

  menuList: (provided) => ({
    ...provided,
    padding: 0,
    fontSize: '14px',
  }),

  option: (provided, state) => ({
    ...provided,
    fontSize: '14px',
    padding: '8px 14px',
    backgroundColor: state.isSelected
      ? '#f97316'
      : state.isFocused
        ? 'rgba(249,115,22,.15)'
        : '#0e1118',
    color: '#fff',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#ea580c',
    },
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),

  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#888',
    padding: '6px',
  }),
};

const ROLES = ['Project Manager','UI/UX Designer','Frontend Developer','Backend Developer','Tester','DevOps','QA'];
const AVATAR_COLOURS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#f97316','#8b5cf6','#ef4444','#22c55e'];
const initials = (n = '') => n.trim().split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?';

function Avatar({ name, image, index, size = 9 }) {
  const c = AVATAR_COLOURS[(index||0) % AVATAR_COLOURS.length];
  const sz = `w-${size} h-${size}`;
  if (image) {
    return (
      <img
        src={image}
        alt={name || 'Avatar'}
        className={`${sz} rounded-xl object-cover shrink-0`}
        onError={(e) => { e.target.onerror = null; e.target.src = ''; }}
      />
    );
  }
  return (
    <div className={`${sz} rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0`}
      style={{ background: c+'28', border:`1.5px solid ${c}44`, color: c }}>
      {initials(name)}
    </div>
  );
}

const PROJECT_STATUS_STYLES = {
  Planning:      'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  'In Progress': 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  Testing:       'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  'On Hold':     'bg-orange-500/10 text-orange-300 border border-orange-500/20',
  Live:          'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
  Completed:     'bg-purple-500/10 text-purple-300 border border-purple-500/20',
  Cancelled:     'bg-rose-500/10 text-rose-300 border border-rose-500/20',
};
function ProjectStatusPill({ status }) {
  const cls = PROJECT_STATUS_STYLES[status] || 'bg-white/10 text-white/60 border border-white/15';
  return <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${cls} inline-flex items-center gap-1.5`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status === 'Planning' ? 'bg-blue-400' : status === 'In Progress' ? 'bg-emerald-400' : status === 'Completed' ? 'bg-purple-400' : status === 'On Hold' ? 'bg-orange-400' : status === 'Live' ? 'bg-cyan-400' : status === 'Cancelled' ? 'bg-rose-400' : status === 'Testing' ? 'bg-violet-400' : 'bg-white/40'}`} />
    {status || 'Unknown'}
  </span>;
}

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

// ── Assign Modal ──────────────────────────────────────────────────────────────
function AssignModal({ onClose, onAssigned }) {
  const [projects, setProjects]     = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [empSearch, setEmpSearch]   = useState('');
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/projects?limit=200'),
      api.get('/employees?limit=200'),
    ]).then(([pRes, eRes]) => {
      setProjects(pRes.data.data || []);
      setEmployees(eRes.data.data || []);
    }).catch(() => setError('Failed to load data')).finally(() => setLoadingData(false));
  }, []);

  const filteredEmps = employees.filter(e => {
    const full = `${e.first_name} ${e.last_name} ${e.designation||''}`.toLowerCase();
    return full.includes(empSearch.toLowerCase());
  });

  const isSelectedEmployee = (employee) => selectedEmployeeIds.includes(employee.employee_id);

  const toggleEmployeeSelection = (employee) => {
    setSelectedEmployeeIds((current) => {
      const exists = current.includes(employee.employee_id);
      if (exists) {
        return current.filter((item) => item !== employee.employee_id);
      }
      return [...current, employee.employee_id];
    });
    setError('');
  };

  const handleAssign = async () => {
    if (!selectedProject) { setError('Select a project'); return; }
    if (!selectedEmployeeIds.length) { setError('Select one or more employees'); return; }
    setSaving(true); setError('');
    try {
      const { data } = await api.post(`/projects/${selectedProject}/assignments`, {
        employee_ids: selectedEmployeeIds,
      });
      if (!data.success) throw new Error(data.message || 'Failed');
      onAssigned();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Assignment failed');
    } finally { setSaving(false); }
  };

  const chosenProject  = projects.find(p => p.uuid === selectedProject);
  const selectedCount = selectedEmployeeIds.length;

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111318] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8 shrink-0">
          <div>
            <h3 className="text-white font-bold text-lg">Assign Employee to Project</h3>
            <p className="text-white/40 text-xs mt-0.5">Select a project, employee and their role</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
            <X size={15} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {loadingData ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-orange-500/60" />
            </div>
          ) : (
            <>
              {/* Project selector */}
              <div>
                <label className="text-sm font-medium text-white/60 mb-1.5 block">Select Project</label>
                <div className="relative">
                  <Select
                    value={selectedProject ? { value: selectedProject, label: projects.find(p => p.uuid === selectedProject)?.project_name || selectedProject } : null}
                    onChange={option => setSelectedProject(option ? option.value : '')}
                    options={projects.map(p => ({ value: p.uuid, label: p.project_name }))}
                    placeholder="— Choose a project —"
                    styles={customSelectStyles}
                    isSearchable={false}
                    isClearable
                  />
                </div>
                {chosenProject && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-white/[0.03] rounded-xl border border-white/8">
                    <FolderKanban size={13} className="text-orange-400 shrink-0" />
                    <div>
                      <p className="text-white text-xs font-semibold">{chosenProject.project_name}</p>
                      <p className="text-white/35 text-[10px]">{chosenProject.current_status} {chosenProject.client_name ? `· ${chosenProject.client_name}` : ''}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Role selector */}
              <div>
                <label className="text-sm font-medium text-white/60 mb-1.5 block">Assign as Role</label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map(r => (
                    <button key={r} type="button" onClick={() => setSelectedRole(r)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${selectedRole === r ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white hover:border-white/25'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Employee selector */}
              <div>
                <label className="text-sm font-medium text-white/60 mb-1.5 block">Select Employees</label>
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={empSearch} onChange={e => setEmpSearch(e.target.value)} placeholder="Search employees…"
                    className="w-full bg-[#0e1118] border border-white/10 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-orange-500/50 placeholder:text-white/20" />
                </div>
                {selectedCount > 0 && (
                  <p className="text-xs text-white/50 mb-2">{selectedCount} employee{selectedCount !== 1 ? 's' : ''} selected</p>
                )}
                <div className="max-h-44 overflow-y-auto space-y-1 border border-white/8 rounded-xl p-2 bg-white/[0.02]">
                  {filteredEmps.length === 0 ? (
                    <p className="text-center text-white/25 text-xs py-4">No employees found</p>
                  ) : filteredEmps.map((e, i) => {
                    const selected = isSelectedEmployee(e);
                    return (
                      <button key={e.employee_id} type="button"
                        onClick={() => toggleEmployeeSelection(e)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left ${selected ? 'bg-orange-500/20 border border-orange-500/30' : 'hover:bg-white/[0.04] border border-transparent'}`}>
                        <Avatar name={`${e.first_name} ${e.last_name}`} index={i} size={8} />
                        <div className="min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{e.first_name} {e.last_name}</p>
                          <p className="text-white/35 text-[10px] truncate">{e.designation || 'No designation'}</p>
                        </div>
                        {selected && (
                          <CheckCircle size={14} className="ml-auto text-orange-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs px-4 py-2.5 rounded-xl">
                  <AlertCircle size={13} /> {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/8 shrink-0 flex gap-3">
          <button onClick={onClose} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition">
            Cancel
          </button>
          <button onClick={handleAssign} disabled={saving || !selectedProject || !selectedEmployeeIds.length}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {saving ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}

// ── Main Assignments Page ─────────────────────────────────────────────────────
export default function ProjectAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]               = useState(1);
  const [limit, setLimit]             = useState(15);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(1);
  const [showAssign, setShowAssign]   = useState(false);
  const [toast, setToast]             = useState('');
  const [deleteProjectTarget, setDeleteProjectTarget] = useState(null);
  const [deletingProject, setDeletingProject] = useState(false);
  const [viewMode, setViewMode] = useState('table');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const STATUS_OPTIONS = ['Planning', 'In Progress', 'Testing', 'On Hold', 'Live', 'Completed', 'Cancelled'];

  const fetchAssignments = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);
      if (statusFilter) params.append('role', statusFilter);
      const { data } = await api.get(`/projects/assignments/all?${params}`);
      const rows = data.data || [];
      setAssignments(rows);
      setTotal(data.pagination?.total ?? rows.length);
      setTotalPages(data.pagination?.pages ?? 1);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load assignments');
    } finally { setLoading(false); }
  }, [page, limit, search, statusFilter]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);
  useEffect(() => { setPage(1); }, [search, statusFilter, limit]);

  const handleDeleteProject = async () => {
    if (!deleteProjectTarget) return;
    setDeletingProject(true);
    try {
      await api.delete(`/projects/${deleteProjectTarget.project_uuid}`);
      showToast('Project deleted successfully');
      setDeleteProjectTarget(null);
      fetchAssignments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Delete failed');
      setDeleteProjectTarget(null);
    } finally { setDeletingProject(false); }
  };

  // Group assignments by project to build project-level data
  const projectsMap = {};
  assignments.forEach((a) => {
    const key = a.project_uuid;
    if (!key) return;
    if (!projectsMap[key]) {
      projectsMap[key] = {
        project_uuid: key,
        project_name: a.project_name || 'Unnamed Project',
        current_status: a.current_status || a.status || 'Planning',
        project_manager: a.project_manager || '',
        client_name: a.client_name || '',
        total_project_cost: a.total_project_cost || null,
        overall_progress: a.overall_progress ?? 0,
        project_start_date: a.project_start_date || '',
        estimated_completion_date: a.estimated_completion_date || '',
        members: [],
      };
    }
    projectsMap[key].members.push(a);
    // Pick up manager name from a Project Manager role
    if (a.role === 'Project Manager' && !projectsMap[key].project_manager) {
      projectsMap[key].project_manager = a.full_name || [a.first_name, a.last_name].filter(Boolean).join(' ') || '';
    }
  });

  const projectsList = Object.values(projectsMap);

  // Filter by status if set
  const filteredProjects = statusFilter
    ? projectsList.filter(p => p.current_status === statusFilter)
    : projectsList;

  // Stats
  const totalProjects = filteredProjects.length;
  const totalMembers = filteredProjects.reduce((sum, p) => sum + p.members.length, 0);
  const activeProjects = filteredProjects.filter(p => ['In Progress', 'Planning', 'Live', 'Testing'].includes(p.current_status)).length;
  const completedProjects = filteredProjects.filter(p => p.current_status === 'Completed').length;

  const stats = [
    { label: 'Total Projects',    value: totalProjects,    icon: FolderKanban, cls: 'text-blue-400',    bg: 'bg-blue-500/15' },
    { label: 'Total Members',     value: totalMembers,     icon: Users,        cls: 'text-orange-400',  bg: 'bg-orange-500/15' },
    { label: 'Active Projects',   value: activeProjects,   icon: TrendingUp,   cls: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { label: 'Completed',         value: completedProjects,icon: CheckCircle,  cls: 'text-purple-400',  bg: 'bg-purple-500/15' },
  ];

  return (
    <div className="space-y-5 pb-10 text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Delete Project confirm */}
      {deleteProjectTarget && (
        <ModalPortal>
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setDeleteProjectTarget(null)} />
          <div className="relative bg-[#111318] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center"><Trash2 size={18} className="text-rose-400" /></div>
              <div>
                <h3 className="text-white font-bold">Delete Project</h3>
                <p className="text-white/40 text-xs">This will permanently remove the project and its assignments</p>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-6">
              Delete <span className="text-white font-semibold">"{deleteProjectTarget.project_name}"</span> and all its assignment data?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteProjectTarget(null)} disabled={deletingProject}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/60 hover:text-white transition">Cancel</button>
              <button onClick={handleDeleteProject} disabled={deletingProject}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition flex items-center justify-center gap-2">
                {deletingProject ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deletingProject ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {showAssign && <AssignModal onClose={() => setShowAssign(false)} onAssigned={() => { fetchAssignments(); showToast('Employee assigned successfully!'); }} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-pink-500/15 flex items-center justify-center">
            <Users size={22} className="text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Assigned Projects</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? 'Loading…' : `${totalProjects} project${totalProjects !== 1 ? 's' : ''} with ${totalMembers} team member${totalMembers !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAssignments}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
            <RefreshCw size={15} className={loading ? 'animate-spin text-orange-500' : ''} />
          </button>
          <button onClick={() => setShowAssign(true)}
            className="inline-flex items-center gap-2 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
            <Plus size={15} /> Assign Employee
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && !error && filteredProjects.length > 0 && (
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
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Search by project name, manager…"
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#111318] border border-white/10 text-white text-sm rounded-xl pl-10 pr-9 py-2.5 outline-none focus:border-orange-500/50 transition placeholder:text-white/20" />
          {search && <button onClick={() => { setSearch(''); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"><X size={13} /></button>}
        </div>
        <div className="relative min-w-[160px]">
          <Select
            value={statusFilter ? { value: statusFilter, label: statusFilter } : null}
            onChange={option => { setStatusFilter(option ? option.value : ''); setPage(1); }}
            options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
            placeholder="All Statuses"
            styles={customSelectStyles}
            isSearchable={false}
            isClearable
          />
        </div>

        <div className="relative min-w-[140px]">
          <Select
            value={{ value: limit, label: `${limit} per page` }}
            onChange={option => { setLimit(option ? Number(option.value) : 15); setPage(1); }}
            options={[15, 25, 50].map(size => ({ value: size, label: `${size} per page` }))}
            styles={customSelectStyles}
            isSearchable={false}
          />
        </div>

        <div className="inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${viewMode === 'table' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-white/60 hover:text-white'}`}
          >
            <Table2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${viewMode === 'card' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-white/60 hover:text-white'}`}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
          <AlertCircle size={16} /> {error}
          <button onClick={fetchAssignments} className="ml-auto text-xs underline">Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-orange-500/60" />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <FolderKanban size={28} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No assigned projects found</p>
          <p className="text-xs mt-1">{search || statusFilter ? 'Try adjusting your filters.' : 'Click "Assign Employee" to get started.'}</p>
          {!search && !statusFilter && (
            <button onClick={() => setShowAssign(true)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
              <Plus size={14} /> Assign First Employee
            </button>
          )}
        </div>
      )}

      {/* Table View */}
      {!loading && !error && filteredProjects.length > 0 && viewMode === 'table' && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Project</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Status</th>
                 
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Members</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Progress</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Cost</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p, i) => (
                  <tr
                    key={p.project_uuid}
                    className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.project_name} index={i} size={10} />
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
                    <td className="px-4 py-3.5"><ProjectStatusPill status={p.current_status} /></td>
                    
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {p.members.slice(0, 4).map((m, mi) => (
                            <div key={m.employee_id || mi} className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-[#111318]"
                              style={{ background: AVATAR_COLOURS[mi % AVATAR_COLOURS.length] + '40', color: AVATAR_COLOURS[mi % AVATAR_COLOURS.length] }}>
                              {initials(m.full_name || [m.first_name, m.last_name].filter(Boolean).join(' ') || '?')}
                            </div>
                          ))}
                          {p.members.length > 4 && (
                            <div className="w-6 h-6 rounded-full bg-white/10 text-white/50 text-[8px] font-bold flex items-center justify-center border-2 border-[#111318]">
                              +{p.members.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="text-white/40 text-xs">{p.members.length}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${p.overall_progress || 0}%` }} />
                        </div>
                        <span className="text-white/50 text-xs">{p.overall_progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-white/60 text-xs font-medium bg-white/[0.05] border border-white/10 px-2.5 py-1 rounded-md">
                        {formatCurrency(p.total_project_cost)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => navigate(`/admin/projects/assignments/view/${p.project_uuid}`)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition" title="View Details">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => setDeleteProjectTarget({ project_uuid: p.project_uuid, project_name: p.project_name })}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition" title="Delete Project">
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

      {/* Grid/Card View */}
      {!loading && !error && filteredProjects.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProjects.map((p, i) => (
            <div
              key={p.project_uuid}
              className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Project header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={p.project_name} index={i} size={10} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm leading-tight truncate">{p.project_name}</p>
                    {p.client_name && <p className="text-white/35 text-xs mt-0.5 truncate flex items-center gap-1"><Building2 size={9} /> {p.client_name}</p>}
                  </div>
                </div>
                <ProjectStatusPill status={p.current_status} />
              </div>

              {/* Manager */}
              {p.project_manager && (
                <p className="text-white/45 text-xs flex items-center gap-2">
                  <User size={11} className="text-white/25 shrink-0" /> {p.project_manager}
                </p>
              )}

              {/* Team avatars */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {p.members.slice(0, 5).map((m, mi) => (
                    <div key={m.employee_id || mi} className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold border-2 border-[#111318]"
                      style={{ background: AVATAR_COLOURS[mi % AVATAR_COLOURS.length] + '40', color: AVATAR_COLOURS[mi % AVATAR_COLOURS.length] }}>
                      {initials(m.full_name || [m.first_name, m.last_name].filter(Boolean).join(' ') || '?')}
                    </div>
                  ))}
                  {p.members.length > 5 && (
                    <div className="w-7 h-7 rounded-full bg-white/10 text-white/50 text-[9px] font-bold flex items-center justify-center border-2 border-[#111318]">
                      +{p.members.length - 5}
                    </div>
                  )}
                </div>
                <span className="text-white/40 text-xs">{p.members.length} member{p.members.length !== 1 ? 's' : ''}</span>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between text-xs text-white/40 mb-1.5">
                  <span>Progress</span><span>{p.overall_progress || 0}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${p.overall_progress || 0}%` }} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                <span className="text-white/50 text-xs font-medium">{formatCurrency(p.total_project_cost)}</span>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => navigate(`/admin/projects/assignments/view/${p.project_uuid}`)}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 flex items-center justify-center transition"><Eye size={13} /></button>
                  <button onClick={() => setDeleteProjectTarget({ project_uuid: p.project_uuid, project_name: p.project_name })}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 flex items-center justify-center transition"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-white/40">Page {page} of {totalPages} · {total} total</p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
              const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + idx;
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${pg === page ? 'bg-orange-500 text-white shadow-md' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10'}`}>
                  {pg}
                </button>
              );
            })}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
