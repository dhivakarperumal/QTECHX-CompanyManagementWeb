import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { useAuth } from '../../PrivateRouter/AuthContext';
import api from '../../api';
import { Toaster, toast } from 'react-hot-toast';
import {
  GraduationCap, Plus, Edit2, Trash2, Loader2, Save, X,
  Search, UploadCloud, UserCheck, Eye, RefreshCw, Users, Activity, BookOpen, TrendingUp
} from 'lucide-react';
import ModalPortal from '../../Componets/CommonComponents/ModalPortal';
import EmployeeTraineeTaskAssign from './TraineeTaskAssign';

// ── custom react-select styles ──────────────────────────────────────────────
const customSelectStyles = {
  control: (p, s) => ({
    ...p,
    backgroundColor: '#0e1118',
    border: `1px solid ${s.isFocused ? 'rgba(249,115,22,.7)' : 'rgba(255,255,255,.1)'}`,
    boxShadow: 'none',
    minHeight: '42px',
    height: '42px',
    borderRadius: '12px',
    '&:hover': { border: '1px solid rgba(249,115,22,.7)' },
  }),
  valueContainer: (p) => ({ ...p, padding: '0 12px', fontSize: '13px' }),
  singleValue: (p) => ({ ...p, color: '#fff', fontSize: '13px' }),
  placeholder: (p) => ({ ...p, color: 'rgba(255,255,255,.35)', fontSize: '13px' }),
  input: (p) => ({ ...p, color: '#fff', fontSize: '13px', margin: 0, padding: 0 }),
  menu: (p) => ({ ...p, background: '#0e1118', border: '1px solid rgba(255,255,255,.1)', borderRadius: '12px', overflow: 'hidden', zIndex: 9999 }),
  menuList: (p) => ({ ...p, padding: 0, fontSize: '13px' }),
  option: (p, s) => ({
    ...p, fontSize: '13px', padding: '8px 14px',
    backgroundColor: s.isSelected ? '#f97316' : s.isFocused ? 'rgba(249,115,22,.15)' : '#0e1118',
    color: '#fff', cursor: 'pointer', ':active': { backgroundColor: '#ea580c' },
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (p) => ({ ...p, color: '#888', padding: '6px' }),
};

// ── Modal ───────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#111318] p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button type="button" onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white transition">
              <X size={18} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </ModalPortal>
  );
}

// ── Avatar initials ──────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-orange-500/20 text-orange-400',
  'bg-blue-500/20 text-blue-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-purple-500/20 text-purple-400',
  'bg-rose-500/20 text-rose-400',
  'bg-amber-500/20 text-amber-400',
];
function initials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean);
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : (parts[0]?.[0] || '?');
}
function avatarColor(name = '') {
  let h = 0;
  for (let c of name) h += c.charCodeAt(0);
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconClass, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#111318] px-5 py-4 flex-1 min-w-[140px]">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white leading-none">{value}</p>
        <p className="text-xs text-white/40 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
const TraineeTaskMaster = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId      = user?.user_id || user?.id || user?.employee_id || '';          // UUID for created_by filter
  const employeeId  = user?.employee_id || user?.user_id || user?.id || '';               // employee id for trainee filter

  // ── state ──
  const [trainees, setTrainees]     = useState([]);
  const [loadingT, setLoadingT]     = useState(true);
  const [tasks, setTasks]           = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [taskSearch, setTaskSearch] = useState('');

  // form
  const [showForm, setShowForm]         = useState(false);
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [editingUuid, setEditingUuid]   = useState(null);
  const [taskName, setTaskName]         = useState('');
  const [description, setDescription]   = useState('');
  const [taskDocument, setTaskDocument] = useState(null);

  // ── fetches ──
  const fetchTrainees = async () => {
    try {
      setLoadingT(true);
      const params = new URLSearchParams();
      if (employeeId) params.append('employee_id', employeeId);
      const res = await api.get(`/trainee-intern${params.toString() ? `?${params}` : ''}`);
      setTrainees(res.data.data || res.data || []);
    } catch (e) {
      console.error('fetchTrainees', e);
    } finally {
      setLoadingT(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const params = new URLSearchParams();
      if (userId) params.append('created_by', userId);
      const res = await api.get(`/trainee-tasks${params.toString() ? `?${params}` : ''}`);
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('fetchTasks', e);
      toast.error('Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => { fetchTrainees(); fetchTasks(); }, [employeeId, userId]);

  // ── filtered trainees ──
  const filteredTrainees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return trainees.filter(t => {
      const matchType = typeFilter === 'All' || t.type === typeFilter;
      const matchSearch = !term || `${t.full_name} ${t.person_id} ${t.email_address} ${t.mobile_number}`.toLowerCase().includes(term);
      return matchType && matchSearch;
    });
  }, [trainees, searchTerm, typeFilter]);

  // ── stats ──
  const totalMembers = trainees.length;
  const activeMembers = trainees.filter(t => (t.status || '').toLowerCase() === 'active').length;
  const traineeCount = trainees.filter(t => (t.type || '').toLowerCase() === 'trainee').length;
  const internCount  = trainees.filter(t => (t.type || '').toLowerCase() === 'intern').length;

  const filteredTotalMembers = filteredTrainees.length;
  const filteredActiveMembers = filteredTrainees.filter(t => (t.status || '').toLowerCase() === 'active').length;
  const filteredTraineeCount = filteredTrainees.filter(t => (t.type || '').toLowerCase() === 'trainee').length;
  const filteredInternCount  = filteredTrainees.filter(t => (t.type || '').toLowerCase() === 'intern').length;

  const hasMemberFilters = Boolean(searchTerm.trim() || typeFilter !== 'All');

  // ── filtered tasks ──
  const filteredTasks = useMemo(() => {
    const term = taskSearch.trim().toLowerCase();
    return tasks.filter(t => !term || `${t.task_name} ${t.description}`.toLowerCase().includes(term));
  }, [tasks, taskSearch]);

  const hasTaskFilters = Boolean(taskSearch.trim());
  const taskCountLabel = hasTaskFilters
    ? `Showing ${filteredTasks.length} of ${tasks.length} tasks`
    : `${tasks.length} task${tasks.length === 1 ? '' : 's'}`;

  // ── form helpers ──
  const resetForm = () => { setEditingUuid(null); setTaskName(''); setDescription(''); setTaskDocument(null); setShowForm(false); };
  const handleEdit = (task) => { setEditingUuid(task.uuid); setTaskName(task.task_name); setDescription(task.description || ''); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName.trim()) { toast.error('Task name is required'); return; }
    try {
      const fd = new FormData();
      fd.append('task_name', taskName);
      fd.append('description', description || '');
      if (taskDocument) fd.append('task_document', taskDocument);
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingUuid) {
        await api.put(`/trainee-tasks/${editingUuid}`, fd, cfg);
        toast.success('Task updated');
      } else {
        await api.post('/trainee-tasks', fd, cfg);
        toast.success('Task created');
      }
      resetForm(); fetchTasks();
    } catch (e) {
      toast.error('Failed to save task');
    }
  };

  const handleDelete = async (uuid) => {
    if (!window.confirm('Delete this task?')) return;
    try { await api.delete(`/trainee-tasks/${uuid}`); toast.success('Task deleted'); fetchTasks(); }
    catch { toast.error('Failed to delete task'); }
  };

  const getDocUrl = (p) => {
    if (!p) return null;
    if (p.startsWith('http')) return p;
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '') || 'http://localhost:5000';
    return `${base}${p}`;
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-10 text-white min-h-screen">
      <Toaster position="top-right" />

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <GraduationCap size={22} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Trainees &amp; Interns</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {hasMemberFilters ? `Showing ${filteredTotalMembers} of ${totalMembers} members` : `${totalMembers} members total`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { fetchTrainees(); fetchTasks(); }}
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition" title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowAssignPopup(true)}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
            <UserCheck size={15} /> Assign Task
          </button>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="flex flex-wrap gap-3">
        <StatCard icon={Users}      iconClass="bg-blue-500/15 text-blue-400"    label="Total Members" value={hasMemberFilters ? filteredTotalMembers : totalMembers} />
        <StatCard icon={Activity}   iconClass="bg-emerald-500/15 text-emerald-400" label="Active"     value={hasMemberFilters ? filteredActiveMembers : activeMembers} />
        <StatCard icon={GraduationCap} iconClass="bg-orange-500/15 text-orange-500" label="Trainees"  value={hasMemberFilters ? filteredTraineeCount : traineeCount} />
        <StatCard icon={TrendingUp} iconClass="bg-purple-500/15 text-purple-400" label="Interns"      value={hasMemberFilters ? filteredInternCount : internCount} />
      </div>

      {/* ── Search + filter ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, person ID..."
            className="w-full rounded-xl border border-white/10 bg-[#111318] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-orange-500/50 transition"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['All','Trainee','Intern'].map(f => (
            <button key={f} onClick={() => setTypeFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${typeFilter === f
                ? 'border-orange-500/50 bg-orange-500/20 text-orange-400'
                : 'border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10'}`}>
              {f}
            </button>
          ))}
          {hasMemberFilters && (
            <button onClick={() => { setSearchTerm(''); setTypeFilter('All'); }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white">
              Clear filters
            </button>
          )}
        </div>
      </div>

     

      {/* ── Predefined Tasks section ── */}
      <div className="rounded-2xl border border-white/8 bg-[#111318] overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-4 border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-orange-400" />
            <h2 className="text-sm font-bold text-white">Predefined Tasks</h2>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 text-white/50 text-xs font-medium">{taskCountLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input value={taskSearch} onChange={e => setTaskSearch(e.target.value)} placeholder="Search tasks…"
                className="w-52 rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-8 pr-3 text-xs text-white outline-none focus:border-orange-500/50 transition" />
            </div>
            {hasTaskFilters && (
              <button onClick={() => setTaskSearch('')}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-white/60 transition hover:bg-white/10 hover:text-white">
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.03] border-b border-white/8">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider w-12">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Task Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loadingTasks ? (
                <tr><td colSpan={4} className="py-10 text-center">
                  <Loader2 size={20} className="mx-auto animate-spin text-white/30" />
                </td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr><td colSpan={4} className="py-10 text-center text-white/30 text-sm">No tasks found</td></tr>
              ) : filteredTasks.map((task, i) => (
                <tr key={task.uuid} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 text-white/40 text-xs">{i + 1}</td>
                  <td className="px-5 py-3.5 font-semibold text-white">{task.task_name}</td>
                  <td className="px-5 py-3.5 text-white/50 max-w-xs">
                    <div className="truncate">{task.description || '—'}</div>
                    {task.document_path && (
                      <a href={getDocUrl(task.document_path)} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 mt-0.5">
                        <UploadCloud size={11} /> View Document
                      </a>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleEdit(task)}
                        className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition" title="Edit">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(task.uuid)}
                        className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition" title="Delete">
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

      {/* ── Add / Edit Task Modal ── */}
      <Modal open={showForm} onClose={resetForm} title={editingUuid ? 'Edit Task' : 'Add New Task'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Task Name *</label>
            <input type="text" value={taskName} onChange={e => setTaskName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition"
              placeholder="Enter task name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition resize-none"
              rows={4} placeholder="Enter task description" />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Upload Document</label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-white/60 hover:border-orange-500/50 transition">
              <span className="truncate">{taskDocument ? taskDocument.name : 'Choose PDF, DOC, image or ZIP'}</span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/8 px-3 py-1.5 text-xs font-medium text-white/70 shrink-0">
                <UploadCloud size={13} /> Browse
              </span>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.rar"
                onChange={e => setTaskDocument(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={resetForm}
              className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition">
              Cancel
            </button>
            <button type="submit"
              className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
              <Save size={14} /> {editingUuid ? 'Update' : 'Save Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Assign Task Modal ── */}
      <Modal open={showAssignPopup} onClose={() => setShowAssignPopup(false)} title="New Task Assignment">
        <EmployeeTraineeTaskAssign defaultOpenForm={true} />
      </Modal>
    </div>
  );
};

export default TraineeTaskMaster;
