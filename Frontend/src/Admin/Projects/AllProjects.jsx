import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban, Search, TrendingUp, RefreshCw, Plus,
  LayoutGrid, List, CheckCircle, AlertCircle, PlayCircle,
  Eye, Edit2, Trash2, Building2, User, X, Loader2, ChevronLeft, ChevronRight, ChevronDown,
} from 'lucide-react';
import api from '../../api';
import ModalPortal from '../../Componets/CommonComponents/ModalPortal';

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
const ROLES = ['Project Manager','UI/UX Designer','Frontend Developer','Backend Developer','Tester','DevOps','QA'];

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
  const [assignmentProjects, setAssignmentProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [assignmentEmployees, setAssignmentEmployees] = useState([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalProject, setStatusModalProject] = useState(null);
  const [statusModalSelection, setStatusModalSelection] = useState('Planning');
  const [statusModalLoading, setStatusModalLoading] = useState(false);
  const [statusModalError, setStatusModalError] = useState('');
  const [limit, setLimit] = useState(15);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const loadAssignmentProjects = useCallback(async () => {
    try {
      const { data } = await api.get('/projects?limit=100&page=1');
      const list = (data.data || []).filter((project) => project.current_status !== 'Cancelled');
      setAssignmentProjects(list);
      setSelectedProjectId((current) => current || list[0]?.uuid || '');
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadAssignedEmployees = useCallback(async (projectUuid) => {
    if (!projectUuid) return;
    try {
      setAssignedLoading(true);
      const { data } = await api.get(`/projects/${projectUuid}/assignments`);
      const assignments = data.assignedEmployees || data.project?.assignedEmployees || data.project?.employees || data.data || [];
      setAssignedEmployees(assignments);
    } catch (err) {
      setAssignmentError(err?.response?.data?.message || 'Failed to load assigned employees');
    } finally {
      setAssignedLoading(false);
    }
  }, []);

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
  useEffect(() => { loadAssignmentProjects(); }, [loadAssignmentProjects]);
  useEffect(() => { setPage(1); }, [limit]);
  useEffect(() => {
    if (selectedProjectId) {
      loadAssignedEmployees(selectedProjectId);
    }
  }, [selectedProjectId, loadAssignedEmployees]);

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

  const openStatusModal = (project) => {
    setStatusModalProject(project);
    setStatusModalSelection(project.current_status || 'Planning');
    setStatusModalError('');
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setStatusModalProject(null);
    setStatusModalError('');
  };

  const handleStatusUpdate = async () => {
    if (!statusModalProject) return;
    setStatusModalLoading(true);
    setStatusModalError('');
    try {
      const { data } = await api.put(`/projects/${statusModalProject.uuid}`, {
        current_status: statusModalSelection,
      });
      if (data.success === false) throw new Error(data.message || 'Failed to update status');
      showToast(`Status updated to ${statusModalSelection}`);
      closeStatusModal();
      fetchProjects();
    } catch (err) {
      setStatusModalError(err?.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setStatusModalLoading(false);
    }
  };

  const handleEmployeeSearch = async (value) => {
    const term = value.trim();
    setAssignmentSearch(value);
    setAssignmentError('');
    if (!term) {
      setAssignmentEmployees([]);
      return;
    }
    try {
      setAssignmentLoading(true);
      const { data } = await api.get('/projects/employees/search', { params: { search: term, status: 'Active' } });
      setAssignmentEmployees(data.data || []);
    } catch (err) {
      setAssignmentError(err?.response?.data?.message || 'Unable to search employees');
      setAssignmentEmployees([]);
    } finally {
      setAssignmentLoading(false);
    }
  };

  const toggleEmployeeSelection = (employee) => {
    setSelectedEmployeeIds((current) => {
      const exists = current.includes(employee.employee_id);
      if (exists) {
        return current.filter((item) => item !== employee.employee_id);
      }
      return [...current, employee.employee_id];
    });
    setAssignmentError('');
    setAssignmentSuccess('');
  };

  const handleAssignEmployees = async () => {
    if (!selectedProjectId) {
      setAssignmentError('Please select a project first.');
      return;
    }
    if (!selectedEmployeeIds.length) {
      setAssignmentError('Select at least one employee to assign.');
      return;
    }

    try {
      setAssignmentSubmitting(true);
      const { data } = await api.post(`/projects/${selectedProjectId}/assignments`, {
        employee_ids: selectedEmployeeIds,
      });
      setAssignmentSuccess(data.message || 'Employees assigned successfully');
      setSelectedEmployeeIds([]);
      setSelectedRole('');
      setAssignmentSearch('');
      setAssignmentEmployees([]);
      await loadAssignedEmployees(selectedProjectId);
    } catch (err) {
      setAssignmentError(err?.response?.data?.message || 'Failed to assign employees');
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  const handleRemoveEmployee = async (employeeId, role) => {
    if (!selectedProjectId) return;
    try {
      await api.delete(`/projects/${selectedProjectId}/assignments`, { data: { employee_id: employeeId } });
      setAssignmentSuccess('Employee removed from project');
      await loadAssignedEmployees(selectedProjectId);
    } catch (err) {
      setAssignmentError(err?.response?.data?.message || 'Failed to remove employee');
    }
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
        <ModalPortal>
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
        </ModalPortal>
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
          <button
            onClick={() => {
              setShowAssignmentModal(true);
              setAssignmentError('');
              setAssignmentSuccess('');
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/20"
          >
            <User size={15} /> Assign Employees
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

      {showAssignmentModal && (
        <ModalPortal>
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowAssignmentModal(false)} />
          <div className="relative bg-[#111318] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/8 shrink-0">
              <div>
                <h3 className="text-white font-bold text-lg">Assign Employee to Project</h3>
                <p className="text-white/40 text-xs mt-0.5">Select a project, employee and their role</p>
              </div>
              <button onClick={() => setShowAssignmentModal(false)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
                <X size={15} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Project selector */}
              <div>
                <label className="text-sm font-medium text-white/60 mb-1.5 block">Select Project</label>
                <div className="relative">
                  <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}
                    className="w-full bg-[#0e1118] border border-white/10 text-sm text-white rounded-xl px-4 py-2.5 outline-none focus:border-orange-500/50 appearance-none pr-10">
                    <option value="">— Choose a project —</option>
                    {assignmentProjects.map(p => <option key={p.uuid} value={p.uuid}>{p.project_name}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="text-sm font-medium text-white/60 mb-1.5 block">Assign as Role</label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map(r => (
                    <button key={r} type="button" onClick={() => setSelectedRole(r)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                        selectedRole === r ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white hover:border-white/25'
                      }`}>
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
                  <input value={assignmentSearch} onChange={e => handleEmployeeSearch(e.target.value)} placeholder="Search employees…"
                    className="w-full bg-[#0e1118] border border-white/10 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-orange-500/50 placeholder:text-white/20" />
                </div>
                {selectedEmployeeIds.length > 0 && (
                  <p className="text-xs text-white/50 mb-2">{selectedEmployeeIds.length} employee{selectedEmployeeIds.length !== 1 ? 's' : ''} selected</p>
                )}
                <div className="max-h-44 overflow-y-auto space-y-1 border border-white/8 rounded-xl p-2 bg-white/[0.02]">
                  {assignmentLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 size={18} className="animate-spin text-orange-500/60" />
                    </div>
                  ) : assignmentEmployees.length === 0 ? (
                    <p className="text-center text-white/25 text-xs py-4">
                      {assignmentSearch ? 'No employees found' : 'Type to search employees…'}
                    </p>
                  ) : assignmentEmployees.map((e, i) => {
                    const isSelected = selectedEmployeeIds.includes(e.employee_id);
                    return (
                      <button key={e.employee_id} type="button"
                        onClick={() => toggleEmployeeSelection(e)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition text-left ${
                          isSelected ? 'bg-orange-500/20 border border-orange-500/30' : 'hover:bg-white/[0.04] border border-transparent'
                        }`}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{ background: '#f9731628', border: '1.5px solid #f9731644', color: '#f97316' }}>
                          {(e.first_name?.[0] || '') + (e.last_name?.[0] || '')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{e.first_name} {e.last_name}</p>
                          <p className="text-white/35 text-[10px] truncate">{e.designation || 'No designation'}</p>
                        </div>
                        {isSelected && <CheckCircle size={14} className="ml-auto text-orange-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {assignmentError && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs px-4 py-2.5 rounded-xl">
                  <AlertCircle size={13} /> {assignmentError}
                </div>
              )}
              {assignmentSuccess && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs px-4 py-2.5 rounded-xl">
                  <CheckCircle size={13} /> {assignmentSuccess}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-white/8 shrink-0 flex gap-3">
              <button onClick={() => setShowAssignmentModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition">
                Cancel
              </button>
              <button
                onClick={handleAssignEmployees}
                disabled={assignmentSubmitting || !selectedProjectId || !selectedEmployeeIds.length}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                {assignmentSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {assignmentSubmitting ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Search by project, client, manager…"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#111318] border border-white/10 text-white text-sm rounded-xl pl-10 pr-9 py-2.5 outline-none focus:border-orange-500/50 transition placeholder:text-white/20" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <X size={13} />
            </button>
          )}
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-[#111318] border border-white/10 text-sm text-white/70 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500/50">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-[#111318] border border-white/10 text-sm text-white/70 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500/50">
            {[10, 15, 25, 50].map((size) => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
        </div>
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
                  <tr
                    key={p.uuid}
                    className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer"
                    onDoubleClick={() => openStatusModal(p)}
                    title="Double click to update project status"
                  >
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
                        <button onClick={() => navigate(`/admin/projects/view/${p.uuid}`)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition" title="View">
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
            <div
              key={p.uuid}
              className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              onDoubleClick={() => openStatusModal(p)}
              title="Double click to update project status"
            >
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
                  <button onClick={() => navigate(`/admin/projects/view/${p.uuid}`)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 flex items-center justify-center transition"><Eye size={13} /></button>
                  <button onClick={() => navigate(`/admin/projects/edit/${p.uuid}`)} className="w-7 h-7 rounded-lg bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 flex items-center justify-center transition"><Edit2 size={13} /></button>
                  <button onClick={() => setDeleteTarget(p)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 flex items-center justify-center transition"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showStatusModal && statusModalProject && (
        <ModalPortal>
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeStatusModal} />
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#111318] p-5 shadow-2xl">
              <button
                type="button"
                onClick={closeStatusModal}
                className="absolute right-4 top-4 text-white/40 hover:text-white"
              >
                ×
              </button>
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold text-white">Update Project Status</p>
                  <p className="text-sm text-white/45">Double clicked on <span className="font-semibold text-white">{statusModalProject.project_name}</span>.</p>
                </div>
                {statusModalError && (
                  <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-400">{statusModalError}</div>
                )}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-white/35">Current Status</div>
                  <StatusPill status={statusModalProject.current_status} />
                </div>
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-white/35">Choose New Status</div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusModalSelection(status)}
                        className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${statusModalSelection === status ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={statusModalLoading}
                    className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {statusModalLoading ? 'Saving…' : 'Save Status'}
                  </button>
                  <button
                    type="button"
                    onClick={closeStatusModal}
                    className="inline-flex items-center justify-center rounded-2xl bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
          <p className="text-xs text-white/40">Page {page} of {totalPages} · {total} total</p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5">
              {(() => {
                const buttons = [];
                const maxButtons = 7;
                let startPage = Math.max(1, page - 3);
                let endPage = Math.min(totalPages, startPage + maxButtons - 1);
                if (endPage - startPage < maxButtons - 1) {
                  startPage = Math.max(1, endPage - maxButtons + 1);
                }
                for (let pg = startPage; pg <= endPage; pg += 1) {
                  buttons.push(pg);
                }
                return buttons.map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setPage(pg)}
                    className={`w-9 h-9 rounded-xl border text-sm font-semibold transition ${pg === page ? 'bg-orange-500 text-white border-orange-500' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'}`}
                  >
                    {pg}
                  </button>
                ));
              })()}
            </div>
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
        </div>
      )}
    </div>
  );
}
