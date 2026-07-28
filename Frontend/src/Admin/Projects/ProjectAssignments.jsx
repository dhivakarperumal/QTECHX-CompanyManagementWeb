import { useEffect, useState, useCallback } from 'react';
import {
  Users, Search, Plus, Loader2, AlertCircle, Trash2, X,
  FolderKanban, CheckCircle, RefreshCw, ChevronDown, Edit3,
} from 'lucide-react';
import api from '../../api';

const ROLES = ['Project Manager','UI/UX Designer','Frontend Developer','Backend Developer','Tester','DevOps','QA'];
const AVATAR_COLOURS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#f97316','#8b5cf6','#ef4444','#22c55e'];
const initials = (n = '') => n.trim().split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?';

function Avatar({ name, index, size = 9 }) {
  const c = AVATAR_COLOURS[(index||0) % AVATAR_COLOURS.length];
  const sz = `w-${size} h-${size}`;
  return (
    <div className={`${sz} rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0`}
      style={{ background: c+'28', border:`1.5px solid ${c}44`, color: c }}>
      {initials(name)}
    </div>
  );
}

const ROLE_STYLES = {
  'Project Manager':    'bg-violet-500/15 text-violet-400 border-violet-500/25',
  'UI/UX Designer':     'bg-pink-500/15 text-pink-400 border-pink-500/25',
  'Frontend Developer': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'Backend Developer':  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'Tester':             'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'DevOps':             'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  'QA':                 'bg-rose-500/15 text-rose-400 border-rose-500/25',
};
function RoleBadge({ role }) {
  const cls = ROLE_STYLES[role] || 'bg-white/10 text-white/50 border-white/15';
  return <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${cls}`}>{role}</span>;
}

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
                  <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                    className="w-full bg-[#0e1118] border border-white/10 text-sm text-white rounded-xl px-4 py-2.5 outline-none focus:border-orange-500/50 appearance-none pr-10">
                    <option value="">— Choose a project —</option>
                    {projects.map(p => <option key={p.uuid} value={p.uuid}>{p.project_name}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
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
  );
}

// ── Main Assignments Page ─────────────────────────────────────────────────────
export default function ProjectAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('');
  const [showAssign, setShowAssign]   = useState(false);  const [showEdit, setShowEdit] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [updating, setUpdating] = useState(false);  const [toast, setToast]             = useState('');
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving]       = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const flattenGroupedAssignments = (grouped = []) => grouped.flatMap((project) => {
    return project.employees.map((employee) => ({
      ...employee,
      project_uuid: project.project_uuid,
      project_name: project.project_name,
      current_status: project.current_status,
    }));
  });

  const fetchAssignments = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/projects/assignments/all');
      const rows = data.data?.length ? data.data : (Array.isArray(data.grouped) ? flattenGroupedAssignments(data.grouped) : []);
      setAssignments(rows);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load assignments');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await api.delete(`/projects/${removeTarget.project_uuid}/assignments`, {
        data: { employee_id: removeTarget.employee_id }
      });
      showToast('Assignment removed successfully');
      setRemoveTarget(null);
      fetchAssignments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Remove failed');
      setRemoveTarget(null);
    } finally { setRemoving(false); }
  };

  const handleEdit = async () => {
    if (!editTarget || !editRole) return;
    setUpdating(true);
    try {
      await api.put(`/projects/${editTarget.project_uuid}/assignments/${editTarget.id}`, {
        employee_id: editTarget.employee_id,
        role: editRole,
      });
      showToast('Assignment updated successfully');
      setShowEdit(false);
      setEditTarget(null);
      setEditRole('');
      fetchAssignments();
    } catch (err) {
      setError(err?.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  const filtered = assignments.filter(a => {
    const fullName = `${a.first_name} ${a.last_name}`;
    const matchSearch = !search ||
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.project_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.designation||'').toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || a.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Group by project
  const grouped = filtered.reduce((acc, a) => {
    const key = a.project_uuid;
    if (!acc[key]) acc[key] = { project_name: a.project_name, status: a.current_status, members: [] };
    acc[key].members.push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-5 pb-10 text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Remove confirm */}
      {removeTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setRemoveTarget(null)} />
          <div className="relative bg-[#111318] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center"><Trash2 size={18} className="text-rose-400" /></div>
              <div>
                <h3 className="text-white font-bold">Remove Assignment</h3>
                <p className="text-white/40 text-xs">This cannot be undone</p>
              </div>
            </div>
            <p className="text-white/60 text-sm mb-6">
              Remove <span className="text-white font-semibold">{removeTarget.first_name} {removeTarget.last_name}</span> as <span className="text-orange-400 font-semibold">{removeTarget.role}</span> from <span className="text-white font-semibold">"{removeTarget.project_name}"</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveTarget(null)} disabled={removing}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/60 hover:text-white transition">Cancel</button>
              <button onClick={handleRemove} disabled={removing}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition flex items-center justify-center gap-2">
                {removing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {removing ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssign && <AssignModal onClose={() => setShowAssign(false)} onAssigned={() => { fetchAssignments(); showToast('Employee assigned successfully!'); }} />}
      {showEdit && editTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowEdit(false)} />
          <div className="relative bg-[#111318] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <div>
                <h3 className="text-white font-bold text-lg">Edit Assignment</h3>
                <p className="text-white/40 text-xs mt-0.5">Change role for {editTarget.first_name} {editTarget.last_name}</p>
              </div>
              <button onClick={() => setShowEdit(false)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
                <X size={15} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-white/60 mb-1.5 block">Project</label>
                <div className="rounded-xl border border-white/10 bg-[#0e1118] px-4 py-3 text-sm text-white">{editTarget.project_name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-white/60 mb-1.5 block">Employee</label>
                <div className="rounded-xl border border-white/10 bg-[#0e1118] px-4 py-3 text-sm text-white">{editTarget.first_name} {editTarget.last_name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-white/60 mb-1.5 block">Role</label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ROLES.map((role) => (
                    <button key={role} type="button" onClick={() => setEditRole(role)}
                      className={`text-sm rounded-xl px-3 py-2 text-left border transition ${editRole === role ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/[0.03] border-white/10 text-white/60 hover:bg-white/[0.05] hover:text-white'}`}>
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEdit(false)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition">Cancel</button>
                <button onClick={handleEdit} disabled={!editRole || updating}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-semibold hover:opacity-90 transition disabled:opacity-50">
                  {updating ? 'Updating…' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-pink-500/15 flex items-center justify-center">
            <Users size={22} className="text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Project Assignments</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? 'Loading…' : `${assignments.length} assignment${assignments.length !== 1 ? 's' : ''} across ${Object.keys(grouped).length} project${Object.keys(grouped).length !== 1 ? 's' : ''}`}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" placeholder="Search by employee, project, designation…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#111318] border border-white/10 text-white text-sm rounded-xl pl-10 pr-9 py-2.5 outline-none focus:border-orange-500/50 transition placeholder:text-white/20" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"><X size={13} /></button>}
        </div>
        <div className="relative">
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="bg-[#111318] border border-white/10 text-sm text-white/70 rounded-xl px-4 py-2.5 outline-none focus:border-orange-500/50 appearance-none pr-8">
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
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
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Users size={28} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No assignments found</p>
          <p className="text-xs mt-1">{search || roleFilter ? 'Try adjusting your filters.' : 'Click "Assign Employee" to get started.'}</p>
          {!search && !roleFilter && (
            <button onClick={() => setShowAssign(true)}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
              <Plus size={14} /> Assign First Employee
            </button>
          )}
        </div>
      )}

      {/* Assignments Table (grouped by project) */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([projectUuid, { project_name, status, members }]) => (
            <div key={projectUuid} className="bg-white/[0.025] border border-white/8 rounded-2xl overflow-hidden">
              {/* Project header */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.03] border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                    <FolderKanban size={15} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">{project_name}</h3>
                    <p className="text-white/35 text-xs">{members.length} member{members.length !== 1 ? 's' : ''} assigned</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold border px-2.5 py-1 rounded-full bg-white/5 text-white/40 border-white/10">{status}</span>
              </div>

              {/* Members table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left text-[10px] font-bold text-white/30 uppercase tracking-widest px-5 py-2.5">Employee</th>
                      <th className="text-left text-[10px] font-bold text-white/30 uppercase tracking-widest px-4 py-2.5">Designation</th>
                      <th className="text-left text-[10px] font-bold text-white/30 uppercase tracking-widest px-4 py-2.5">Role in Project</th>
                      <th className="text-left text-[10px] font-bold text-white/30 uppercase tracking-widest px-4 py-2.5">Assigned On</th>
                      <th className="text-right text-[10px] font-bold text-white/30 uppercase tracking-widest px-5 py-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, i) => (
                      <tr key={`${m.employee_id}-${m.role}`} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={`${m.first_name} ${m.last_name}`} index={i} />
                            <div>
                              <p className="text-white font-semibold text-sm">{m.first_name} {m.last_name}</p>
                              {m.personal_email && <p className="text-white/30 text-[10px]">{m.personal_email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-white/50 text-xs">{m.designation || '—'}</span>
                        </td>
                        <td className="px-4 py-3"><RoleBadge role={m.role} /></td>
                        <td className="px-4 py-3">
                          <span className="text-white/35 text-xs">
                            {m.assigned_at ? new Date(m.assigned_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditTarget({ ...m, project_uuid: projectUuid, project_name }); setEditRole(m.role); setShowEdit(true); }}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-emerald-500/15 text-white/25 hover:text-emerald-300 border border-transparent hover:border-emerald-500/25 flex items-center justify-center transition"
                              title="Edit">
                              <Edit3 size={13} />
                            </button>
                            <button onClick={() => setRemoveTarget({ ...m, project_uuid: projectUuid, project_name })}
                              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/25 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition"
                              title="Remove">
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
          ))}
        </div>
      )}
    </div>
  );
}
