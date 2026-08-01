import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Eye,
  Download,
  FileText,
  FolderKanban,
  CalendarDays,
  Loader2,
  AlertCircle,
  Search,
  TableProperties,
  LayoutGrid,
  CheckCircle2,
  UploadCloud,
  Clock,
  ListTodo,
  ChevronDown,
  Star,
  Zap,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';

const AVATAR_COLOURS = [
  '#f59e0b', '#6366f1', '#10b981', '#3b82f6', '#ec4899',
  '#14b8a6', '#f97316', '#8b5cf6', '#ef4444', '#22c55e',
];

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'T';
}

function TaskAvatar({ name, index }) {
  const c = AVATAR_COLOURS[(index || 0) % AVATAR_COLOURS.length];
  return (
    <div
      className="w-9 h-9 rounded-xl text-xs flex items-center justify-center font-bold shrink-0 select-none"
      style={{ background: c + '22', border: `1.5px solid ${c}40`, color: c }}
    >
      {initials(name)}
    </div>
  );
}

const STATUS_STYLES = {
  'Pending':     { pill: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',     dot: 'bg-amber-400' },
  'To Do':       { pill: 'bg-slate-500/15 text-slate-300 border border-slate-500/25',     dot: 'bg-slate-400' },
  'In Progress': { pill: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',        dot: 'bg-blue-400' },
  'Review':      { pill: 'bg-violet-500/15 text-violet-300 border border-violet-500/30',  dot: 'bg-violet-400' },
  'Testing':     { pill: 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30', dot: 'bg-fuchsia-400' },
  'Completed':   { pill: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30', dot: 'bg-emerald-400' },
  'On Hold':     { pill: 'bg-orange-500/15 text-orange-300 border border-orange-500/20',  dot: 'bg-orange-400' },
  'Cancelled':   { pill: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',        dot: 'bg-rose-400' },
};

const STATUS_OPTIONS = ['Pending', 'To Do', 'In Progress', 'Review', 'Testing', 'Completed', 'On Hold', 'Cancelled'];

const PRIORITY_STYLES = {
  High: 'text-rose-300',
  Medium: 'text-amber-300',
  Low: 'text-emerald-300',
};

const normalizeStatus = (status) => {
  if (!status) return 'Pending';
  const v = status.toString().trim();
  if (['Pending', 'To Do'].includes(v)) return 'Pending';
  if (['In Progress', 'Progress'].includes(v)) return 'In Progress';
  if (['Completed', 'Done'].includes(v)) return 'Completed';
  return v;
};

const parseAttachments = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isSameDay = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
};

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result?.split(',')[1] || '');
  reader.onerror = () => reject(new Error('Unable to read file for upload'));
  reader.readAsDataURL(file);
});

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || { pill: 'bg-white/10 text-white/50 border border-white/15', dot: 'bg-white/40' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status || 'Pending'}
    </span>
  );
}

export default function TodayTasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [updatingId, setUpdatingId] = useState('');
  const [toast, setToast] = useState({ text: '', type: 'success' });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, task: null, reason: '' });

  const employeeId = user?.employee_id || user?.employeeId || user?.user_id;

  const loadTasks = async () => {
    if (!employeeId) {
      setLoading(false);
      setError('Unable to resolve your employee profile.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/tasks', {
        params: { page: 1, limit: 200, assigned_to: employeeId },
      });

      const all = (data?.data || []).map(task => ({
        ...task,
        status: normalizeStatus(task.status),
        attachments: parseAttachments(task.attachments),
      }));

      setTasks(all.filter(task => isSameDay(task.due_date) || isSameDay(task.assignment_date)));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load today tasks.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, [employeeId]);

  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(task =>
      `${task.task_name || ''} ${task.project_name || ''} ${task.description || ''}`.toLowerCase().includes(q)
    );
  }, [tasks, search]);

  const stats = useMemo(() => ({
    total: tasks.length,
    highPrio: tasks.filter(t => t.priority === 'High').length,
    pending: tasks.filter(t => ['Pending', 'To Do'].includes(t.status)).length,
    inProgress: tasks.filter(t => ['In Progress', 'Review', 'Testing'].includes(t.status)).length,
  }), [tasks]);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: 'success' }), 3200);
  };

  const updateTaskStatus = async (task, nextStatus = 'Completed', zipFile = null, reason = null) => {
    try {
      setUpdatingId(task.uuid);
      const payload = {
        status: nextStatus,
        completion_date: nextStatus === 'Completed' ? new Date().toISOString() : task.completion_date,
      };

      if (reason) {
        payload.comments = task.comments ? `${task.comments}\n[Cancelled]: ${reason}` : `[Cancelled]: ${reason}`;
      }

      if (zipFile) {
        const base64 = await readFileAsBase64(zipFile);
        payload.attachmentBase64 = base64;
        payload.attachmentName = zipFile.name;
        payload.attachmentType = zipFile.type || 'application/zip';
      }

      await api.put(`/tasks/${task.uuid}`, payload);
      showToast(`"${task.task_name || 'Task'}" marked as ${nextStatus}.`);
      await loadTasks();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Unable to update task status right now.', 'error');
    } finally {
      setUpdatingId('');
    }
  };

  const handleDownload = (attachment) => {
    if (!attachment?.path) return;
    const safePath = attachment.path.replace(/\\/g, '/');
    window.open(`${api.defaults.baseURL}/${safePath}`, '_blank', 'noopener,noreferrer');
  };

  const handleStatusChange = (task, newStatus) => {
    if (newStatus === 'Cancelled') {
      setCancelModal({ isOpen: true, task, reason: '' });
    } else {
      updateTaskStatus(task, newStatus);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <CalendarDays size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Today Tasks</h1>
            <p className="text-xs text-white/35 mt-0.5">{stats.total} tasks due or assigned today</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/employee/tasks')}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/65 hover:bg-white/8 transition-all self-start sm:self-auto"
        >
          All Tasks
        </button>
      </div>

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total Today',
            value: stats.total,
            icon: <ListTodo size={20} />,
            iconBg: 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400',
            accent: 'text-emerald-300',
          },
          {
            label: 'Pending',
            value: stats.pending,
            icon: <Clock size={20} />,
            iconBg: 'bg-amber-500/15 border border-amber-500/20 text-amber-400',
            accent: 'text-amber-300',
          },
          {
            label: 'In Progress',
            value: stats.inProgress,
            icon: <Zap size={20} />,
            iconBg: 'bg-blue-500/15 border border-blue-500/20 text-blue-400',
            accent: 'text-blue-300',
          },
          {
            label: 'High Priority',
            value: stats.highPrio,
            icon: <Star size={20} />,
            iconBg: 'bg-violet-500/15 border border-violet-500/20 text-violet-400',
            accent: 'text-violet-300',
          },
        ].map(card => (
          <div key={card.label} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#111318] px-4 py-4 shadow-[0_6px_20px_rgba(0,0,0,0.2)]">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
            <div>
              <div className={`text-2xl font-bold ${card.accent}`}>{card.value}</div>
              <div className="text-xs text-white/45 mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111318] px-4 py-2.5 min-w-[280px]">
          <Search size={15} className="text-white/35 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            placeholder="Search today tasks…"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#111318] border border-white/8 rounded-xl p-1">
          <button type="button" onClick={() => setViewMode('table')} className={`rounded-lg p-2 transition-all duration-200 ${viewMode === 'table' ? 'bg-primary text-black' : 'text-white/50 hover:text-white'}`}>
            <TableProperties size={16} />
          </button>
          <button type="button" onClick={() => setViewMode('card')} className={`rounded-lg p-2 transition-all duration-200 ${viewMode === 'card' ? 'bg-primary text-black' : 'text-white/50 hover:text-white'}`}>
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {toast.text && (
        <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${toast.type === 'error' ? 'border border-rose-500/25 bg-rose-500/10 text-rose-300' : 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-300'}`}>
          {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          {toast.text}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-white/8 bg-[#111318]">
          <div className="flex flex-col items-center gap-3 text-white/40">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Loading today tasks…</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-5 text-sm text-rose-300 flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111318] px-4 py-14 text-center">
          <ClipboardList size={32} className="mx-auto text-white/20 mb-3" />
          <p className="text-sm text-white/40">No tasks are scheduled for today.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#111318]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  {['S No', 'TASK', 'PROJECT', 'DUE DATE', 'PRIORITY', 'STATUS', 'ATTACHMENTS', 'ACTIONS'].map(col => (
                    <th key={col} className="px-5 py-3.5 text-[10px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((task, index) => {
                  const isUpdating = updatingId === task.uuid;
                  return (
                    <tr key={task.uuid} className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors group">
                      <td className="px-5 py-4 text-[13px] text-white/55 whitespace-nowrap">{index + 1}</td>
                      <td className="px-5 py-4 min-w-[180px]">
                        <div className="flex items-center gap-3">
                          <TaskAvatar name={task.task_name || 'T'} index={index} />
                          <div>
                            <div className="font-semibold text-white text-[13px] leading-tight">{task.task_name || 'Untitled Task'}</div>
                            {task.module_name && <div className="mt-0.5 text-[11px] text-white/40">{task.module_name}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white/55 text-[13px] whitespace-nowrap">
                        {task.project_name ? (
                          <span className="flex items-center gap-1.5">
                            <FolderKanban size={13} className="text-emerald-400/60 shrink-0" />
                            {task.project_name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4 text-white/55 text-[13px] whitespace-nowrap">
                        {task.due_date ? (
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={13} className="text-orange-400/60 shrink-0" />
                            {formatDate(task.due_date)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-xs font-bold ${PRIORITY_STYLES[task.priority] || 'text-white/50'}`}>{task.priority || 'Medium'}</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={task.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(task, e.target.value)}
                            className={`appearance-none rounded-full border text-[10px] font-bold pl-6 pr-5 py-1 outline-none cursor-pointer transition-all ${(STATUS_STYLES[task.status] || STATUS_STYLES.Pending).pill} bg-transparent`}
                          >
                            {STATUS_OPTIONS.map(v => <option key={v} value={v} className="bg-[#111318] text-white font-normal text-xs">{v}</option>)}
                          </select>
                          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none ${(STATUS_STYLES[task.status] || STATUS_STYLES.Pending).dot}`} />
                          {isUpdating ? (
                            <Loader2 size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 animate-spin text-white/50 pointer-events-none" />
                          ) : (
                            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {task.attachments.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {task.attachments.map((att, i) => (
                              <button key={`${att.path || i}-${i}`} type="button" onClick={() => handleDownload(att)} className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                                <Download size={11} />
                                <span className="truncate max-w-[120px]">{att.original_name || att.filename || 'File'}</span>
                              </button>
                            ))}
                          </div>
                        ) : <span className="text-[11px] text-white/25">No files</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button type="button" title="View details" onClick={() => navigate(`/employee/tasks/view/${task.uuid}`)} className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                            <Eye size={14} />
                          </button>
                          <label title="Upload ZIP" className="w-8 h-8 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 cursor-pointer transition-all">
                            <UploadCloud size={14} />
                            <input type="file" accept=".zip,.rar,.7z,application/zip" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              await updateTaskStatus(task, task.status === 'Completed' ? task.status : 'Completed', file);
                              e.target.value = '';
                            }} />
                          </label>
                          {task.status !== 'Completed' && (
                            <button type="button" title="Mark complete" onClick={() => updateTaskStatus(task, 'Completed')} disabled={isUpdating} className="w-8 h-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleTasks.map((task, index) => {
            const isUpdating = updatingId === task.uuid;
            return (
              <div key={task.uuid} className="rounded-2xl border border-white/8 bg-[#111318] p-5 flex flex-col gap-4 hover:border-white/14 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <TaskAvatar name={task.task_name || 'T'} index={index} />
                    <div>
                      <div className="font-semibold text-white text-[13px] leading-tight">{task.task_name || 'Untitled Task'}</div>
                      <div className="mt-0.5 text-[11px] text-white/40">{task.project_name || '—'}</div>
                    </div>
                  </div>
                  <StatusPill status={task.status} />
                </div>
                <div className="space-y-1.5 text-[12px] text-white/50">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={12} className="text-orange-400/70 shrink-0" />
                    {formatDate(task.due_date)}
                  </div>
                  {task.description && (
                    <div className="flex items-start gap-2">
                      <FileText size={12} className="text-blue-400/70 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{task.description}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FolderKanban size={12} className="text-emerald-400/70 shrink-0" />
                    <span className={`font-semibold ${PRIORITY_STYLES[task.priority] || 'text-white/50'}`}>{task.priority || 'Medium'}</span> Priority
                  </div>
                </div>
                {task.attachments.length > 0 && (
                  <div className="rounded-xl border border-white/6 bg-black/20 p-3 space-y-1.5">
                    <div className="text-[10px] uppercase tracking-widest text-white/35 flex items-center gap-1.5">
                      <FileText size={10} /> Attachments
                    </div>
                    {task.attachments.map((att, i) => (
                      <button key={`${att.path || i}-${i}`} type="button" onClick={() => handleDownload(att)} className="flex w-full items-center justify-between rounded-lg bg-white/4 px-3 py-2 text-[11px] text-white/60 hover:bg-white/8 transition-colors">
                        <span className="truncate">{att.original_name || att.filename || 'Document'}</span>
                        <Download size={11} className="text-blue-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <button type="button" onClick={() => navigate(`/employee/tasks/view/${task.uuid}`)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/4 py-2 text-xs text-white/65 hover:bg-white/8 transition-colors">
                    <Eye size={13} /> View
                  </button>
                  <label className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-blue-500/25 bg-blue-500/10 py-2 text-xs text-blue-400 hover:bg-blue-500/18 cursor-pointer transition-colors">
                    <UploadCloud size={13} /> Upload
                    <input type="file" accept=".zip,.rar,.7z,application/zip" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await updateTaskStatus(task, task.status === 'Completed' ? task.status : 'Completed', file);
                      e.target.value = '';
                    }} />
                  </label>
                  {task.status !== 'Completed' && (
                    <button type="button" title="Mark complete" disabled={isUpdating} onClick={() => updateTaskStatus(task, 'Completed')} className="w-9 h-9 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                      {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1d24] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-rose-400 mb-2">Cancel Task</h3>
            <p className="text-sm text-white/50 mb-4">Please provide a reason for cancelling <strong>{cancelModal.task?.task_name}</strong>.</p>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-rose-500/50 min-h-[100px]"
              placeholder="Enter cancellation reason..."
              value={cancelModal.reason}
              onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
            />
            <div className="flex items-center justify-end gap-3 mt-5">
              <button type="button" onClick={() => setCancelModal({ isOpen: false, task: null, reason: '' })} className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all">Go Back</button>
              <button type="button" disabled={!cancelModal.reason.trim()} onClick={() => {
                updateTaskStatus(cancelModal.task, 'Cancelled', null, cancelModal.reason);
                setCancelModal({ isOpen: false, task: null, reason: '' });
              }} className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
