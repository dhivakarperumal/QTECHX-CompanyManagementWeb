import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileText,
  FolderKanban,
  Loader2,
  Search,
  TableProperties,
  LayoutGrid,
  UploadCloud,
  Clock,
  CheckCheck,
  ListTodo,
  Zap,
  ChevronDown,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';

/* ─── helpers ─────────────────────────────────────────────────── */
const FILTERS = [
  { key: 'all',        label: 'All Tasks' },
  { key: 'today',      label: 'Today' },
  { key: 'pending',    label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'completed',  label: 'Completed' },
];

const STATUS_STYLES = {
  'Pending':     { pill: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',     dot: 'bg-amber-400' },
  'To Do':       { pill: 'bg-slate-500/15 text-slate-300 border border-slate-500/25',     dot: 'bg-slate-400' },
  'In Progress': { pill: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',        dot: 'bg-blue-400' },
  'Review':      { pill: 'bg-violet-500/15 text-violet-300 border border-violet-500/30',  dot: 'bg-violet-400' },
  'Testing':     { pill: 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30', dot: 'bg-fuchsia-400' },
  'Completed':   { pill: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30', dot: 'bg-emerald-400' },
  'On Hold':     { pill: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',  dot: 'bg-orange-400' },
  'Cancelled':   { pill: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',        dot: 'bg-rose-400' },
  'Issue':       { pill: 'bg-red-500/15 text-red-300 border border-red-500/30',           dot: 'bg-red-400' },
};

const PRIORITY_STYLES = {
  High:   'text-rose-300',
  Medium: 'text-amber-300',
  Low:    'text-emerald-300',
};

const AVATAR_COLOURS = [
  '#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899',
  '#14b8a6','#f97316','#8b5cf6','#ef4444','#22c55e',
];

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'T';
}

const getCancelReason = (comments) => {
  if (!comments) return null;
  const matches = comments.match(/\[Cancelled\]:\s*(.*)/g);
  if (!matches || matches.length === 0) return null;
  const lastMatch = matches[matches.length - 1];
  return lastMatch.replace(/\[Cancelled\]:\s*/, '').trim();
};

const getIssueReason = (comments) => {
  if (!comments) return null;
  const matches = comments.match(/\[Issue\]:\s*(.*)/g);
  if (!matches || matches.length === 0) return null;
  const lastMatch = matches[matches.length - 1];
  return lastMatch.replace(/\[Issue\]:\s*/, '').trim();
};

function TaskAvatar({ name, index }) {
  const c = AVATAR_COLOURS[(index || 0) % AVATAR_COLOURS.length];
  return (
    <div
      className="w-9 h-9 rounded-xl text-xs flex items-center justify-center font-bold shrink-0 select-none"
      style={{ background: c + '28', border: `1.5px solid ${c}44`, color: c }}
    >
      {initials(name)}
    </div>
  );
}

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || { pill: 'bg-white/10 text-white/50 border border-white/15', dot: 'bg-white/40' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status || 'Pending'}
    </span>
  );
}

const normalizeStatus = (status) => {
  if (!status) return 'Pending';
  const value = status.toString().trim();
  if (['Pending', 'To Do'].includes(value)) return 'Pending';
  if (['In Progress', 'Progress'].includes(value)) return 'In Progress';
  if (['Completed', 'Done'].includes(value)) return 'Completed';
  return value;
};

const parseAttachments = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  return [];
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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

/* ─── status select dropdown ──────────────────────────────────── */
const STATUS_OPTIONS = ['Pending', 'To Do', 'In Progress', 'Review', 'Testing', 'Completed', 'On Hold', 'Cancelled', 'Issue'];

/* ═══════════════════════════════════════════════════════════════ */
export default function EmployeeTasks() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(new URLSearchParams(location.search).get('search') || '');
  const [viewMode, setViewMode] = useState('table');
  const [updatingTaskId, setUpdatingTaskId] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: 'success' });
  const [cancelModal, setCancelModal] = useState({ isOpen: false, task: null, reason: '' });
  const [issueModal, setIssueModal] = useState({ isOpen: false, task: null, taskName: '', description: '', facingIssue: '', document: null });
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const employeeId = user?.employee_id || user?.employeeId || user?.user_id || user?.id || user?.uuid || null;

  const filterKey = useMemo(() => {
    if (location.pathname.endsWith('/pending'))    return 'pending';
    if (location.pathname.endsWith('/completed'))  return 'completed';
    if (location.pathname.endsWith('/today'))      return 'today';
    if (location.pathname.endsWith('/processing')) return 'processing';
    if (location.pathname.endsWith('/board'))      return 'all';
    return 'all';
  }, [location.pathname]);

  /* load ─────────────────────────────────────────────────────── */
  const loadTasks = async (customSearch = searchQuery, customPage = page) => {
    if (!employeeId) { setLoading(false); setError('Unable to resolve your employee profile.'); return; }
    try {
      setLoading(true); setError('');
      const { data } = await api.get('/tasks', {
        params: {
          page: customPage,
          limit,
          assigned_to: employeeId,
          search: customSearch || undefined,
        },
      });
      setTasks((data?.data || []).map(task => ({
        ...task,
        status: normalizeStatus(task.status),
        attachments: parseAttachments(task.attachments),
      })));
      setPagination(data?.pagination || { page: customPage, limit, total: 0, pages: 1 });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your assigned tasks.');
      setTasks([]);
      setPagination({ page: customPage, limit, total: 0, pages: 1 });
    } finally { setLoading(false); }
  };

  useEffect(() => { loadTasks(searchQuery, page); }, [employeeId, searchQuery, page, filterKey]);

  /* derived ──────────────────────────────────────────────────── */
  const visibleTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks.filter(task => {
      const ok = !q || `${task.task_name || ''} ${task.description || ''} ${task.project_name || ''}`.toLowerCase().includes(q);
      if (!ok) return false;
      if (filterKey === 'pending')    return ['Pending', 'To Do', 'Issue', 'On Hold'].includes(task.status);
      if (filterKey === 'completed')  return task.status === 'Completed';
      if (filterKey === 'today')      return isSameDay(task.assignment_date) || isSameDay(task.created_at);
      if (filterKey === 'processing') return ['In Progress', 'Review', 'Testing'].includes(task.status);
      return true;
    });
  }, [filterKey, searchQuery, tasks]);

  const counts = useMemo(() => ({
    total:      pagination.total || tasks.length,
    completed:  tasks.filter(t => t.status === 'Completed').length,
    pending:    tasks.filter(t => ['Pending', 'To Do', 'Issue', 'On Hold'].includes(t.status)).length,
    inProgress: tasks.filter(t => ['In Progress', 'Review', 'Testing'].includes(t.status)).length,
  }), [pagination.total, tasks]);

  const boardColumns = useMemo(() => ({
    'Pending':     visibleTasks.filter(t => t.status === 'Pending'),
    'In Progress': visibleTasks.filter(t => t.status === 'In Progress'),
    'Completed':   visibleTasks.filter(t => t.status === 'Completed'),
  }), [visibleTasks]);

  /* actions ──────────────────────────────────────────────────── */
  const showToast = (text, type = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: 'success' }), 3500);
  };

  const updateTaskStatus = async (task, nextStatus = 'Completed', zipFile = null, reason = null, issueData = null) => {
    try {
      setUpdatingTaskId(task.uuid);
      const payload = {
        status: nextStatus,
        completion_date: nextStatus === 'Completed' ? new Date().toISOString() : task.completion_date,
      };
      if (reason) {
        payload.comments = task.comments ? `${task.comments}\n[Cancelled]: ${reason}` : `[Cancelled]: ${reason}`;
      }
      if (issueData) {
        payload.task_name = issueData.taskName;
        payload.description = issueData.description;
        payload.comments = task.comments ? `${task.comments}\n[Issue]: ${issueData.facingIssue}` : `[Issue]: ${issueData.facingIssue}`;
      }
      if (zipFile) {
        const base64 = await readFileAsBase64(zipFile);
        payload.attachmentBase64 = base64;
        payload.attachmentName   = zipFile.name;
        payload.attachmentType   = zipFile.type || 'application/zip';
      }
      await api.put(`/tasks/${task.uuid}`, payload);
      showToast(`"${task.task_name || 'Task'}" marked as ${nextStatus}.`);
      await loadTasks(searchQuery);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Unable to update task status right now.', 'error');
    } finally { setUpdatingTaskId(''); }
  };

  const handleDownload = (attachment) => {
    if (!attachment?.path) return;
    const safePath = attachment.path.replace(/\\/g, '/');
    window.open(`${api.defaults.baseURL}/${safePath}`, '_blank', 'noopener,noreferrer');
  };

  const handleStatusChange = (task, newStatus) => {
    if (newStatus === 'Cancelled') {
      setCancelModal({ isOpen: true, task, reason: '' });
    } else if (newStatus === 'Issue') {
      setIssueModal({ isOpen: true, task, taskName: task.task_name || '', description: task.description || '', facingIssue: '', document: null });
    } else {
      updateTaskStatus(task, newStatus);
    }
  };

  /* stat cards ───────────────────────────────────────────────── */
  const statCards = [
    {
      label: 'Total',
      value: counts.total,
      icon: <ListTodo size={20} />,
      iconBg: 'bg-indigo-500/15 text-indigo-400',
      accent: 'text-white',
    },
    {
      label: 'In Progress',
      value: counts.inProgress,
      icon: <Zap size={20} />,
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      accent: 'text-emerald-300',
    },
    {
      label: 'Completed',
      value: counts.completed,
      icon: <CheckCheck size={20} />,
      iconBg: 'bg-violet-500/15 text-violet-400',
      accent: 'text-violet-300',
    },
    {
      label: 'On Hold',
      value: tasks.filter(t => t.status === 'On Hold').length,
      icon: <Clock size={20} />,
      iconBg: 'bg-orange-500/15 text-orange-400',
      accent: 'text-orange-300',
    },
  ];

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <div className="space-y-6 text-white">

      {/* ── page header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
              <ClipboardList size={18} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold text-white">My Tasks</h1>
          </div>
          <p className="mt-1 text-sm text-white/40 ml-11">{counts.total} tasks total</p>
        </div>
      </div>

      {/* ── stat cards ── */}
      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#111318] px-4 py-4 shadow-[0_6px_20px_rgba(0,0,0,0.2)]"
          >
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

      {/* ── toolbar ── */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            const params = new URLSearchParams(location.search);
            if (searchQuery.trim()) params.set('search', searchQuery.trim());
            else params.delete('search');
            navigate({ pathname: '/employee/tasks', search: params.toString() ? `?${params.toString()}` : '' });
          }}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111318] px-4 py-2.5 min-w-[280px]"
        >
          <Search size={15} className="text-white/35 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            placeholder="Search by task, project…"
          />
        </form>

        <div className="flex items-center gap-3 flex-wrap">
          {/* filter tabs */}
          <div className="flex items-center gap-1.5 bg-[#111318] border border-white/8 rounded-xl p-1">
            {FILTERS.map((tab) => {
              const active = tab.key === filterKey;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    navigate(`/employee/tasks${tab.key === 'all' ? '' : `/${tab.key}`}`);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    active ? 'bg-primary text-black shadow-[0_2px_8px_rgba(248,116,14,0.35)]' : 'text-white/55 hover:text-white hover:bg-white/6'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* view toggle */}
          <div className="flex items-center gap-1 bg-[#111318] border border-white/8 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`rounded-lg p-2 transition-all duration-200 ${viewMode === 'table' ? 'bg-primary text-black' : 'text-white/50 hover:text-white'}`}
              aria-label="Table view"
            >
              <TableProperties size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`rounded-lg p-2 transition-all duration-200 ${viewMode === 'card' ? 'bg-primary text-black' : 'text-white/50 hover:text-white'}`}
              aria-label="Card view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── toast ── */}
      {statusMessage.text && (
        <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
          statusMessage.type === 'error'
            ? 'border border-rose-500/25 bg-rose-500/10 text-rose-300'
            : 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
        }`}>
          {statusMessage.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          {statusMessage.text}
        </div>
      )}

      {/* ── content ── */}
      {loading ? (
        <div className="flex min-h-[50vh] items-center justify-center rounded-2xl border border-white/8 bg-[#111318]">
          <div className="flex flex-col items-center gap-3 text-white/40">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Loading your tasks…</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-5 text-sm text-rose-300 flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      ) : visibleTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111318] px-4 py-14 text-center">
          <ClipboardList size={32} className="mx-auto text-white/20 mb-3" />
          <p className="text-sm text-white/40">No tasks found for this filter.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* ───── TABLE VIEW ───── */
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#111318]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  {['S No', 'TASK', 'PROJECT', 'START DATE', 'END DATE', 'PRIORITY', 'STATUS', 'ATTACHMENTS', 'ACTIONS'].map((col) => (
                    <th key={col} className="px-5 py-3.5 text-[10px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((task, index) => {
                  const isUpdating = updatingTaskId === task.uuid;
                  return (
                    <tr
                      key={task.uuid}
                      className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors group"
                    >                      <td className="px-5 py-4 text-[13px] text-white/55 whitespace-nowrap">
                        {(page - 1) * limit + index + 1}
                      </td>                      {/* task name */}
                      <td className="px-5 py-4 min-w-[180px]">
                        <div className="flex items-center gap-3">
                          <TaskAvatar name={task.task_name || 'T'} index={index} />
                          <div>
                            <div className="font-semibold text-white text-[13px] leading-tight">
                              {task.task_name || 'Untitled Task'}
                            </div>
                            {task.module_name && (
                              <div className="mt-0.5 text-[11px] text-white/40">{task.module_name}</div>
                            )}
                            {task.status === 'Cancelled' && getCancelReason(task.comments) && (
                              <div className="mt-1.5 text-[11px] text-rose-300/80 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20 max-w-sm line-clamp-2" title={getCancelReason(task.comments)}>
                                <span className="font-semibold mr-1">Reason:</span>
                                {getCancelReason(task.comments)}
                              </div>
                            )}
                            {task.status === 'Issue' && getIssueReason(task.comments) && (
                              <div className="mt-1.5 text-[11px] text-red-300/80 bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/20 max-w-sm line-clamp-2" title={getIssueReason(task.comments)}>
                                <span className="font-semibold mr-1">Issue:</span>
                                {getIssueReason(task.comments)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* project */}
                      <td className="px-5 py-4 text-white/55 text-[13px] whitespace-nowrap">
                        {task.project_name ? (
                          <span className="flex items-center gap-1.5">
                            <FolderKanban size={13} className="text-emerald-400/60 shrink-0" />
                            {task.project_name}
                          </span>
                        ) : '—'}
                      </td>

                      {/* start date */}
                      <td className="px-5 py-4 text-white/55 text-[13px] whitespace-nowrap">
                        {task.start_date ? (
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={13} className="text-sky-400/60 shrink-0" />
                            {formatDate(task.start_date)}
                          </span>
                        ) : '—'}
                      </td>

                      {/* end date */}
                      <td className="px-5 py-4 text-white/55 text-[13px] whitespace-nowrap">
                        {task.due_date ? (
                          <span className="flex items-center gap-1.5">
                            <CalendarDays size={13} className="text-orange-400/60 shrink-0" />
                            {formatDate(task.due_date)}
                          </span>
                        ) : '—'}
                      </td>

                      {/* priority */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-xs font-bold ${PRIORITY_STYLES[task.priority] || 'text-white/50'}`}>
                          {task.priority || 'Medium'}
                        </span>
                      </td>

                      {/* status select */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={task.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(task, e.target.value)}
                            className={`appearance-none rounded-full border text-[10px] font-bold pl-6 pr-5 py-1 outline-none cursor-pointer transition-all ${
                              (STATUS_STYLES[task.status] || STATUS_STYLES.Pending).pill
                            } bg-transparent`}
                          >
                            {STATUS_OPTIONS.map((v) => (
                              <option key={v} value={v} className="bg-[#111318] text-white font-normal text-xs">{v}</option>
                            ))}
                          </select>
                          {/* dot overlay */}
                          <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none ${
                            (STATUS_STYLES[task.status] || STATUS_STYLES.Pending).dot
                          }`} />
                          {isUpdating ? (
                            <Loader2 size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 animate-spin text-white/50 pointer-events-none" />
                          ) : (
                            <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                          )}
                        </div>
                      </td>

                      {/* attachments */}
                      <td className="px-5 py-4">
                        {task.attachments.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {task.attachments.map((att, i) => (
                              <button
                                key={`${att.path || i}-${i}`}
                                type="button"
                                onClick={() => handleDownload(att)}
                                className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <Download size={11} />
                                <span className="truncate max-w-[120px]">{att.original_name || att.filename || 'File'}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-white/25">No files</span>
                        )}
                      </td>

                      {/* actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {/* view */}
                          <button
                            type="button"
                            title="View details"
                            onClick={() => navigate(`/employee/tasks/view/${task.uuid}`)}
                            className="w-8 h-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                          >
                            <Eye size={14} />
                          </button>

                          {/* upload */}
                          <label
                            title="Upload ZIP"
                            className="w-8 h-8 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-center text-blue-400 hover:bg-blue-500/20 cursor-pointer transition-all"
                          >
                            <UploadCloud size={14} />
                            <input
                              type="file"
                              accept=".zip,.rar,.7z,application/zip"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                await updateTaskStatus(task, task.status === 'Completed' ? task.status : 'Completed', file);
                                e.target.value = '';
                              }}
                            />
                          </label>

                          {/* report issue */}
                          {task.status !== 'Completed' && (
                            <button
                              type="button"
                              title="Report Issue"
                              disabled={isUpdating}
                              onClick={() => setIssueModal({ isOpen: true, task, taskName: task.task_name || '', description: task.description || '', facingIssue: '', document: null })}
                              className="w-8 h-8 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                            >
                              <AlertCircle size={14} />
                            </button>
                          )}

                          {/* quick complete */}
                          {task.status !== 'Completed' && (
                            <button
                              type="button"
                              title="Mark complete"
                              onClick={() => updateTaskStatus(task, 'Completed')}
                              disabled={isUpdating}
                              className="w-8 h-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                            >
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
      ) : viewMode === 'card' ? (
        /* ───── CARD VIEW ───── */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleTasks.map((task, index) => {
            const isUpdating = updatingTaskId === task.uuid;
            return (
              <div
                key={task.uuid}
                className="rounded-2xl border border-white/8 bg-[#111318] p-5 flex flex-col gap-4 hover:border-white/14 transition-all"
              >
                {/* header */}
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

                {/* cancel reason */}
                {task.status === 'Cancelled' && getCancelReason(task.comments) && (
                  <div className="mt-0.5 mb-1 text-[11px] text-rose-300/80 bg-rose-500/10 px-2.5 py-1.5 rounded-lg border border-rose-500/20 line-clamp-3">
                    <span className="font-semibold block mb-0.5 text-rose-400/80">Cancellation Reason:</span>
                    {getCancelReason(task.comments)}
                  </div>
                )}
                {task.status === 'Issue' && getIssueReason(task.comments) && (
                  <div className="mt-0.5 mb-1 text-[11px] text-red-300/80 bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/20 line-clamp-3">
                    <span className="font-semibold block mb-0.5 text-red-400/80">Facing Issue:</span>
                    {getIssueReason(task.comments)}
                  </div>
                )}

                {/* meta */}
                <div className="space-y-1.5 text-[12px] text-white/50">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={12} className="text-sky-400/70 shrink-0" />
                    <span>Start: {formatDate(task.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays size={12} className="text-orange-400/70 shrink-0" />
                    <span>End: {formatDate(task.due_date)}</span>
                  </div>
                  {task.description && (
                    <div className="flex items-start gap-2">
                      <FileText size={12} className="text-blue-400/70 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{task.description}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FolderKanban size={12} className="text-emerald-400/70 shrink-0" />
                    <span className={`font-semibold ${PRIORITY_STYLES[task.priority] || 'text-white/50'}`}>
                      {task.priority || 'Medium'}
                    </span> Priority
                  </div>
                </div>

                {/* attachments */}
                {task.attachments.length > 0 && (
                  <div className="rounded-xl border border-white/6 bg-black/20 p-3 space-y-1.5">
                    <div className="text-[10px] uppercase tracking-widest text-white/35 flex items-center gap-1.5">
                      <FileText size={10} /> Attachments
                    </div>
                    {task.attachments.map((att, i) => (
                      <button
                        key={`${att.path || i}-${i}`}
                        type="button"
                        onClick={() => handleDownload(att)}
                        className="flex w-full items-center justify-between rounded-lg bg-white/4 px-3 py-2 text-[11px] text-white/60 hover:bg-white/8 transition-colors"
                      >
                        <span className="truncate">{att.original_name || att.filename || 'Document'}</span>
                        <Download size={11} className="text-blue-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {/* footer actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => navigate(`/employee/tasks/view/${task.uuid}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/4 py-2 text-xs text-white/65 hover:bg-white/8 transition-colors"
                  >
                    <Eye size={13} /> View
                  </button>
                  <label className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-blue-500/25 bg-blue-500/10 py-2 text-xs text-blue-400 hover:bg-blue-500/18 cursor-pointer transition-colors">
                    <UploadCloud size={13} /> Upload
                    <input
                      type="file"
                      accept=".zip,.rar,.7z,application/zip"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await updateTaskStatus(task, task.status === 'Completed' ? task.status : 'Completed', file);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {task.status !== 'Completed' && (
                    <button
                      type="button"
                      title="Report Issue"
                      disabled={isUpdating}
                      onClick={() => setIssueModal({ isOpen: true, task, taskName: task.task_name || '', description: task.description || '', facingIssue: '', document: null })}
                      className="w-9 h-9 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      <AlertCircle size={13} />
                    </button>
                  )}
                  {task.status !== 'Completed' && (
                    <button
                      type="button"
                      title="Mark complete"
                      disabled={isUpdating}
                      onClick={() => updateTaskStatus(task, 'Completed')}
                      className="w-9 h-9 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {!loading && !error && pagination.pages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
          <p className="text-xs text-white/30">
            Page <span className="text-white/55 font-semibold">{page}</span> / <span className="text-white/55 font-semibold">{pagination.pages}</span>
            &nbsp;·&nbsp;{pagination.total} total
          </p>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition"
            >
              <ChevronDown size={14} className="rotate-90" />
            </button>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, idx) => {
              const pg = Math.max(1, Math.min(page - 2, pagination.pages - 4)) + idx;
              const safePg = Math.min(pg, pagination.pages);
              return (
                <button
                  key={safePg}
                  type="button"
                  onClick={() => setPage(safePg)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                    safePg === page ? 'bg-primary text-white shadow-md' : 'bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {safePg}
                </button>
              );
            })}
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition"
            >
              <ChevronDown size={14} className="-rotate-90" />
            </button>
          </div>
        </div>
      )}

      {/* cancel modal */}
      {cancelModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
        </div>,
        document.body
      )}

      {/* issue modal */}
      {issueModal.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1d24] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-red-400 mb-2">Report Issue</h3>
            <p className="text-sm text-white/50 mb-4">
              Please provide the issue details for <strong>{issueModal.task?.task_name}</strong>.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/50 mb-1">Task Name</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red-500/50"
                  placeholder="Task Name"
                  value={issueModal.taskName}
                  onChange={(e) => setIssueModal(prev => ({ ...prev, taskName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Description</label>
                <textarea
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red-500/50 min-h-[80px]"
                  placeholder="Task Description"
                  value={issueModal.description}
                  onChange={(e) => setIssueModal(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Facing Issue</label>
                <textarea
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-red-500/50 min-h-[100px]"
                  placeholder="Describe the issue you are facing..."
                  value={issueModal.facingIssue}
                  onChange={(e) => setIssueModal(prev => ({ ...prev, facingIssue: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1">Upload Document (Optional)</label>
                <div className="relative">
                  <input
                    type="file"
                    className="w-full rounded-xl border border-white/10 bg-black/20 p-2 text-sm text-white file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20 cursor-pointer"
                    onChange={(e) => setIssueModal(prev => ({ ...prev, document: e.target.files?.[0] || null }))}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setIssueModal({ isOpen: false, task: null, taskName: '', description: '', facingIssue: '', document: null })}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                Go Back
              </button>
              <button
                type="button"
                disabled={!issueModal.facingIssue.trim()}
                onClick={() => {
                  let docToUpload = issueModal.document;
                  if (docToUpload) {
                    docToUpload = new File([docToUpload], `IssueDoc_${docToUpload.name}`, { type: docToUpload.type });
                  }
                  updateTaskStatus(issueModal.task, 'Issue', docToUpload, null, {
                    taskName: issueModal.taskName,
                    description: issueModal.description,
                    facingIssue: issueModal.facingIssue
                  });
                  setIssueModal({ isOpen: false, task: null, taskName: '', description: '', facingIssue: '', document: null });
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Issue
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
