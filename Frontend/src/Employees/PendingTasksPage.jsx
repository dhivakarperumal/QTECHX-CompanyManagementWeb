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
  Flame,
  Clock,
  ListTodo,
  ChevronDown,
  Star,
  Zap,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';

/* ─── helpers ─────────────────────────────────────────────────── */
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
};

const STATUS_OPTIONS = ['Pending', 'To Do', 'In Progress', 'Review', 'Testing', 'Completed', 'On Hold', 'Cancelled'];

const PRIORITY_STYLES = {
  High:   'text-rose-300',
  Medium: 'text-amber-300',
  Low:    'text-emerald-300',
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
    try { const p = JSON.parse(value); return Array.isArray(p) ? p : []; }
    catch { return []; }
  }
  return [];
};

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  return !Number.isNaN(d.getTime()) && d < new Date();
};

const isDueToday = (dueDate) => {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload  = () => resolve(reader.result?.split(',')[1] || '');
  reader.onerror = () => reject(new Error('Unable to read file'));
  reader.readAsDataURL(file);
});

/* ═══════════════════════════════════════════════════════════════ */
export default function PendingTasksPage() {
  const { user }  = useAuth();
  const navigate   = useNavigate();

  const [allPending, setAllPending]       = useState([]);
  const [loading,    setLoading]          = useState(true);
  const [error,      setError]            = useState('');
  const [search,     setSearch]           = useState('');
  const [viewMode,   setViewMode]         = useState('table');
  const [updatingId, setUpdatingId]       = useState('');
  const [toast,      setToast]            = useState({ text: '', type: 'success' });
  const [cancelModal, setCancelModal]     = useState({ isOpen: false, task: null, reason: '' });

  const employeeId = user?.employee_id || user?.employeeId || user?.user_id;

  /* load */
  const load = async () => {
    if (!employeeId) { setLoading(false); setError('Unable to resolve employee profile.'); return; }
    try {
      setLoading(true); setError('');
      const { data } = await api.get('/tasks', {
        params: { page: 1, limit: 200, assigned_to: employeeId },
      });
      const all = (data?.data || []).map(t => ({
        ...t,
        status:      normalizeStatus(t.status),
        attachments: parseAttachments(t.attachments),
      }));
      // pending = Pending, To Do, In Progress, Review, Testing (NOT completed/cancelled/on hold)
      setAllPending(all.filter(t => !['Completed', 'Cancelled', 'On Hold'].includes(t.status)));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load pending tasks.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [employeeId]);

  /* filtered */
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allPending;
    return allPending.filter(t =>
      `${t.task_name || ''} ${t.project_name || ''} ${t.description || ''}`.toLowerCase().includes(q)
    );
  }, [allPending, search]);

  /* stats */
  const stats = useMemo(() => ({
    total:     allPending.length,
    overdue:   allPending.filter(t => isOverdue(t.due_date)).length,
    dueToday:  allPending.filter(t => isDueToday(t.due_date)).length,
    highPrio:  allPending.filter(t => t.priority === 'High').length,
  }), [allPending]);

  const showToast = (text, type = 'success') => { setToast({ text, type }); setTimeout(() => setToast({ text: '', type: 'success' }), 3200); };

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
        payload.attachmentName   = zipFile.name;
        payload.attachmentType   = zipFile.type || 'application/zip';
      }
      await api.put(`/tasks/${task.uuid}`, payload);
      showToast(`"${task.task_name}" marked as ${nextStatus}!`);
      await load();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Unable to update task.', 'error');
    } finally { setUpdatingId(''); }
  };

  const handleStatusChange = (task, newStatus) => {
    if (newStatus === 'Cancelled') {
      setCancelModal({ isOpen: true, task, reason: '' });
    } else {
      updateTaskStatus(task, newStatus);
    }
  };

  const handleDownload = (att) => {
    if (!att?.path) return;
    window.open(`${api.defaults.baseURL}/${att.path.replace(/\\/g, '/')}`, '_blank', 'noopener,noreferrer');
  };

  /* ─── render ────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 text-white">

      {/* ── header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
            <ListTodo size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Pending Tasks</h1>
            <p className="text-xs text-white/35 mt-0.5">{allPending.length} tasks need your attention</p>
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

      {/* ── stat cards ── */}
      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total Pending',
            value: stats.total,
            icon: <ListTodo size={20} />,
            iconBg: 'bg-amber-500/15 border border-amber-500/20 text-amber-400',
            accent: 'text-amber-300',
          },
          {
            label: 'Overdue',
            value: stats.overdue,
            icon: <Flame size={20} />,
            iconBg: 'bg-rose-500/15 border border-rose-500/20 text-rose-400',
            accent: 'text-rose-300',
          },
          {
            label: 'Due Today',
            value: stats.dueToday,
            icon: <Clock size={20} />,
            iconBg: 'bg-orange-500/15 border border-orange-500/20 text-orange-400',
            accent: 'text-orange-300',
          },
          {
            label: 'High Priority',
            value: stats.highPrio,
            icon: <Star size={20} />,
            iconBg: 'bg-violet-500/15 border border-violet-500/20 text-violet-400',
            accent: 'text-violet-300',
          },
        ].map(card => (
          <div
            key={card.label}
            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#111318] px-4 py-4"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
            <div>
              <div className={`text-2xl font-bold ${card.accent}`}>{card.value}</div>
              <div className="text-[11px] text-white/40 mt-0.5">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={e => e.preventDefault()}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111318] px-4 py-2.5 min-w-[260px]"
        >
          <Search size={14} className="text-white/30 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
            placeholder="Search pending tasks…"
          />
        </form>

        <div className="flex items-center gap-1 bg-[#111318] border border-white/8 rounded-xl p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`rounded-lg p-2 transition-all ${viewMode === 'table' ? 'bg-amber-500 text-white' : 'text-white/45 hover:text-white'}`}
            aria-label="Table view"
          >
            <TableProperties size={15} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`rounded-lg p-2 transition-all ${viewMode === 'card' ? 'bg-amber-500 text-white' : 'text-white/45 hover:text-white'}`}
            aria-label="Card view"
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* toast */}
      {toast.text && (
        <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
          toast.type === 'error'
            ? 'border border-rose-500/25 bg-rose-500/10 text-rose-300'
            : 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
          {toast.text}
        </div>
      )}

      {/* ── content ── */}
      {loading ? (
        <div className="flex min-h-[45vh] items-center justify-center rounded-2xl border border-white/8 bg-[#111318]">
          <div className="flex flex-col items-center gap-3 text-white/40">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Loading pending tasks…</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-4 text-sm text-rose-300 flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/8 bg-[#111318] px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-emerald-400/50" />
          </div>
          <p className="text-white/40 text-sm">
            {search ? 'No tasks match your search.' : '🎉 All caught up! No pending tasks.'}
          </p>
        </div>
      ) : viewMode === 'table' ? (

        /* ── TABLE ── */
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#111318]">

          {/* amber accent bar */}
          <div className="h-0.5 bg-gradient-to-r from-amber-500/0 via-amber-500/60 to-amber-500/0" />

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  {['S No', 'TASK', 'PROJECT', 'DUE DATE', 'PRIORITY', 'STATUS', 'ACTIONS'].map(col => (
                    <th key={col} className="px-5 py-3.5 text-[10px] font-bold tracking-widest text-white/35 uppercase whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((task, i) => {
                  const overdue   = isOverdue(task.due_date);
                  const dueToday  = isDueToday(task.due_date);
                  const updating  = updatingId === task.uuid;
                  const sStyle    = STATUS_STYLES[task.status] || STATUS_STYLES.Pending;

                  return (
                    <tr
                      key={task.uuid}
                      className={`border-b border-white/[0.04] transition-colors group ${
                        overdue ? 'hover:bg-rose-500/[0.03]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="px-5 py-4 text-[13px] text-white/55 whitespace-nowrap">
                        {i + 1}
                      </td>
                      {/* task */}
                      <td className="px-5 py-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <TaskAvatar name={task.task_name || 'T'} index={i} />
                          <div>
                            <div className="font-semibold text-white/90 text-[13px] leading-tight flex items-center gap-1.5 flex-wrap">
                              {task.task_name || 'Untitled Task'}
                              {overdue && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20">
                                  <Flame size={8} /> Overdue
                                </span>
                              )}
                              {dueToday && !overdue && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">
                                  <Zap size={8} /> Today
                                </span>
                              )}
                            </div>
                            {task.module_name && (
                              <div className="mt-0.5 text-[11px] text-white/35">{task.module_name}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* project */}
                      <td className="px-5 py-4 text-white/50 text-[13px] whitespace-nowrap">
                        {task.project_name ? (
                          <span className="flex items-center gap-1.5">
                            <FolderKanban size={12} className="text-amber-400/50 shrink-0" />
                            {task.project_name}
                          </span>
                        ) : '—'}
                      </td>

                      {/* due date */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`flex items-center gap-1.5 text-[13px] ${overdue ? 'text-rose-400' : 'text-white/50'}`}>
                          <CalendarDays size={12} className="shrink-0" />
                          {formatDate(task.due_date)}
                        </span>
                      </td>

                      {/* priority */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-xs font-bold ${PRIORITY_STYLES[task.priority] || 'text-white/45'}`}>
                          {task.priority || 'Medium'}
                        </span>
                      </td>

                      {/* status dropdown */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={task.status}
                            disabled={updating}
                            onChange={(e) => handleStatusChange(task, e.target.value)}
                            className={`appearance-none rounded-full border text-[10px] font-bold pl-6 pr-5 py-1 outline-none cursor-pointer transition-all ${
                              sStyle.pill
                            } bg-transparent`}
                          >
                            {STATUS_OPTIONS.map((v) => (
                              <option key={v} value={v} className="bg-[#111318] text-white font-normal text-xs">{v}</option>
                            ))}
                          </select>
                          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none ${
                            sStyle.dot
                          }`} />
                          {updating ? (
                            <Loader2 size={10} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-white/50" />
                          ) : (
                            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                          )}
                        </div>
                      </td>

                      {/* actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            title="View details"
                            onClick={() => navigate(`/employee/tasks/view/${task.uuid}`)}
                            className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/55 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <Eye size={14} />
                          </button>

                          <label
                            title="Upload ZIP"
                            className="w-8 h-8 rounded-xl border border-blue-500/25 bg-blue-500/8 flex items-center justify-center text-blue-400/70 hover:bg-blue-500/15 cursor-pointer transition-all"
                          >
                            <UploadCloud size={14} />
                            <input
                              type="file"
                              accept=".zip,.rar,.7z,application/zip"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                await updateTaskStatus(task, 'Completed', file);
                                e.target.value = '';
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            title="Mark complete"
                            disabled={updating}
                            onClick={() => updateTaskStatus(task, 'Completed')}
                            className="w-8 h-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                          >
                            {updating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* footer */}
          <div className="px-5 py-3 border-t border-white/5 text-[11px] text-white/30">
            Showing {visible.length} of {allPending.length} pending tasks
            {stats.overdue > 0 && (
              <span className="ml-3 text-rose-400/70">· {stats.overdue} overdue</span>
            )}
          </div>
        </div>

      ) : (

        /* ── CARD VIEW ── */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((task, i) => {
            const overdue  = isOverdue(task.due_date);
            const dueToday = isDueToday(task.due_date);
            const updating = updatingId === task.uuid;
            const sStyle   = STATUS_STYLES[task.status] || STATUS_STYLES.Pending;

            return (
              <div
                key={task.uuid}
                className={`rounded-2xl bg-[#111318] p-5 flex flex-col gap-4 transition-all ${
                  overdue
                    ? 'border border-rose-500/20 hover:border-rose-500/35'
                    : 'border border-white/8 hover:border-amber-500/20'
                }`}
              >
                {/* top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <TaskAvatar name={task.task_name || 'T'} index={i} />
                    <div className="min-w-0">
                      <div className="font-semibold text-white/90 text-[13px] leading-tight truncate">
                        {task.task_name || 'Untitled Task'}
                      </div>
                      <div className="mt-0.5 text-[11px] text-white/35 truncate">{task.project_name || '—'}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="relative inline-block">
                      <select
                        value={task.status}
                        disabled={updating}
                        onChange={(e) => handleStatusChange(task, e.target.value)}
                        className={`appearance-none rounded-full border text-[9px] font-bold pl-5 pr-4 py-0.5 outline-none cursor-pointer transition-all ${
                          sStyle.pill
                        } bg-transparent`}
                      >
                        {STATUS_OPTIONS.map((v) => (
                          <option key={v} value={v} className="bg-[#111318] text-white font-normal text-xs">{v}</option>
                        ))}
                      </select>
                      <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none ${
                        sStyle.dot
                      }`} />
                    </div>
                    {overdue && (
                      <span className="text-[9px] font-bold text-rose-400 flex items-center gap-0.5">
                        <Flame size={8} /> Overdue
                      </span>
                    )}
                    {dueToday && !overdue && (
                      <span className="text-[9px] font-bold text-orange-400 flex items-center gap-0.5">
                        <Zap size={8} /> Due Today
                      </span>
                    )}
                  </div>
                </div>

                {/* meta */}
                <div className="space-y-1.5 text-[12px] text-white/45">
                  <div className={`flex items-center gap-2 ${overdue ? 'text-rose-400' : ''}`}>
                    <CalendarDays size={11} className="shrink-0" />
                    Due: {formatDate(task.due_date)}
                  </div>
                  {task.description && (
                    <div className="flex items-start gap-2">
                      <FileText size={11} className="text-blue-400/60 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{task.description}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FolderKanban size={11} className="text-amber-400/60 shrink-0" />
                    <span className={`font-semibold ${PRIORITY_STYLES[task.priority] || 'text-white/45'}`}>{task.priority || 'Medium'}</span>
                    &nbsp;Priority
                  </div>
                </div>

                {/* footer actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => navigate(`/employee/tasks/view/${task.uuid}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/4 py-2 text-xs text-white/55 hover:bg-white/7 transition-colors"
                  >
                    <Eye size={12} /> View
                  </button>

                  <label className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/8 py-2 text-xs text-blue-400/80 hover:bg-blue-500/14 cursor-pointer transition-colors">
                    <UploadCloud size={12} /> Upload
                    <input
                      type="file"
                      accept=".zip,.rar,.7z,application/zip"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await updateTaskStatus(task, 'Completed', file);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    title="Mark complete"
                    disabled={updating}
                    onClick={() => updateTaskStatus(task, 'Completed')}
                    className="w-9 h-9 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50 shrink-0"
                  >
                    {updating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* cancel modal */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1d24] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-rose-400 mb-2">Cancel Task</h3>
            <p className="text-sm text-white/50 mb-4">
              Please provide a reason for cancelling <strong>{cancelModal.task?.task_name}</strong>.
            </p>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-rose-500/50 min-h-[100px]"
              placeholder="Enter cancellation reason..."
              value={cancelModal.reason}
              onChange={(e) => setCancelModal(prev => ({ ...prev, reason: e.target.value }))}
            />
            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setCancelModal({ isOpen: false, task: null, reason: '' })}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={!cancelModal.reason.trim()}
                onClick={() => {
                  updateTaskStatus(cancelModal.task, 'Cancelled', null, cancelModal.reason);
                  setCancelModal({ isOpen: false, task: null, reason: '' });
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
