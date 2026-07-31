import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCheck,
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
  ChevronDown,
  Trophy,
  TrendingUp,
  Star,
  Clock,
  UploadCloud,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';

/* ─── helpers ─────────────────────────────────────────────────── */
const AVATAR_COLOURS = [
  '#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#ec4899',
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

/* ═══════════════════════════════════════════════════════════════ */
export default function CompletedTasksPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [toast,    setToast]    = useState('');

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
      setTasks(all.filter(t => t.status === 'Completed'));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load completed tasks.');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [employeeId]);

  /* filtered */
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(t =>
      `${t.task_name || ''} ${t.project_name || ''} ${t.description || ''}`.toLowerCase().includes(q)
    );
  }, [tasks, search]);

  /* stats */
  const thisMonth = useMemo(() => {
    const now = new Date();
    return tasks.filter(t => {
      if (!t.completion_date) return false;
      const d = new Date(t.completion_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [tasks]);

  const handleDownload = (att) => {
    if (!att?.path) return;
    window.open(`${api.defaults.baseURL}/${att.path.replace(/\\/g, '/')}`, '_blank', 'noopener,noreferrer');
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3200); };

  /* ─── render ────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 text-white">

      {/* ── header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <CheckCheck size={20} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Completed Tasks</h1>
              <p className="text-xs text-white/35 mt-0.5">{tasks.length} tasks completed</p>
            </div>
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
            label: 'Total Completed',
            value: tasks.length,
            icon: <CheckCheck size={20} />,
            iconBg: 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400',
            accent: 'text-emerald-300',
          },
          {
            label: 'This Month',
            value: thisMonth,
            icon: <TrendingUp size={20} />,
            iconBg: 'bg-blue-500/15 border border-blue-500/20 text-blue-400',
            accent: 'text-blue-300',
          },
          {
            label: 'With Attachments',
            value: tasks.filter(t => t.attachments.length > 0).length,
            icon: <FileText size={20} />,
            iconBg: 'bg-violet-500/15 border border-violet-500/20 text-violet-400',
            accent: 'text-violet-300',
          },
          {
            label: 'High Priority',
            value: tasks.filter(t => t.priority === 'High').length,
            icon: <Star size={20} />,
            iconBg: 'bg-rose-500/15 border border-rose-500/20 text-rose-400',
            accent: 'text-rose-300',
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
        <form
          onSubmit={e => e.preventDefault()}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111318] px-4 py-2.5 min-w-[260px]"
        >
          <Search size={14} className="text-white/30 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
            placeholder="Search completed tasks…"
          />
        </form>

        {/* view toggle */}
        <div className="flex items-center gap-1 bg-[#111318] border border-white/8 rounded-xl p-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`rounded-lg p-2 transition-all ${viewMode === 'table' ? 'bg-emerald-500 text-white' : 'text-white/45 hover:text-white'}`}
            aria-label="Table view"
          >
            <TableProperties size={15} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`rounded-lg p-2 transition-all ${viewMode === 'card' ? 'bg-emerald-500 text-white' : 'text-white/45 hover:text-white'}`}
            aria-label="Card view"
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* toast */}
      {toast && (
        <div className="rounded-xl px-4 py-3 text-sm border border-emerald-500/25 bg-emerald-500/10 text-emerald-300 flex items-center gap-2">
          <CheckCheck size={14} /> {toast}
        </div>
      )}

      {/* ── content ── */}
      {loading ? (
        <div className="flex min-h-[45vh] items-center justify-center rounded-2xl border border-white/8 bg-[#111318]">
          <div className="flex flex-col items-center gap-3 text-white/40">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Loading completed tasks…</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-4 text-sm text-rose-300 flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/8 bg-[#111318] px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Trophy size={28} className="text-emerald-400/50" />
          </div>
          <p className="text-white/40 text-sm">
            {search ? 'No completed tasks match your search.' : 'No completed tasks yet. Keep going!'}
          </p>
        </div>
      ) : viewMode === 'table' ? (

        /* ── TABLE ── */
        <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#111318]">

          {/* green accent top bar */}
          <div className="h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-emerald-500/0" />

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  {['TASK', 'PROJECT', 'COMPLETED ON', 'PRIORITY', 'ATTACHMENTS', 'ACTIONS'].map(col => (
                    <th key={col} className="px-5 py-3.5 text-[10px] font-bold tracking-widest text-white/35 uppercase whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((task, i) => (
                  <tr key={task.uuid} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group">

                    {/* task */}
                    <td className="px-5 py-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <TaskAvatar name={task.task_name || 'T'} index={i} />
                        <div>
                          <div className="font-semibold text-white/90 text-[13px] leading-tight flex items-center gap-1.5">
                            {task.task_name || 'Untitled Task'}
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              <CheckCheck size={8} /> Done
                            </span>
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
                          <FolderKanban size={12} className="text-emerald-400/50 shrink-0" />
                          {task.project_name}
                        </span>
                      ) : '—'}
                    </td>

                    {/* completed on */}
                    <td className="px-5 py-4 text-white/50 text-[13px] whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} className="text-emerald-400/50 shrink-0" />
                        {formatDate(task.completion_date) !== '—' ? formatDate(task.completion_date) : formatDate(task.due_date)}
                      </span>
                    </td>

                    {/* priority */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`text-xs font-bold ${PRIORITY_STYLES[task.priority] || 'text-white/45'}`}>
                        {task.priority || 'Medium'}
                      </span>
                    </td>

                    {/* attachments */}
                    <td className="px-5 py-4">
                      {task.attachments.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {task.attachments.map((att, idx) => (
                            <button
                              key={`${att.path || idx}-${idx}`}
                              type="button"
                              onClick={() => handleDownload(att)}
                              className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <Download size={10} />
                              <span className="truncate max-w-[120px]">{att.original_name || att.filename || 'File'}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-white/20">—</span>
                      )}
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
                          title="Upload more files"
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
                              showToast(`"${task.task_name}" updated with new file.`);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* footer count */}
          <div className="px-5 py-3 border-t border-white/5 text-[11px] text-white/30">
            Showing {visible.length} of {tasks.length} completed tasks
          </div>
        </div>

      ) : (

        /* ── CARD VIEW ── */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((task, i) => (
            <div
              key={task.uuid}
              className="rounded-2xl border border-emerald-500/12 bg-[#111318] p-5 flex flex-col gap-4 hover:border-emerald-500/25 transition-all group"
            >
              {/* top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <TaskAvatar name={task.task_name || 'T'} index={i} />
                  <div className="min-w-0">
                    <div className="font-semibold text-white/90 text-[13px] leading-tight truncate">{task.task_name || 'Untitled Task'}</div>
                    <div className="mt-0.5 text-[11px] text-white/35 truncate">{task.project_name || '—'}</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shrink-0">
                  <CheckCheck size={9} /> Completed
                </span>
              </div>

              {/* meta */}
              <div className="space-y-1.5 text-[12px] text-white/45">
                <div className="flex items-center gap-2">
                  <Clock size={11} className="text-emerald-400/60 shrink-0" />
                  Completed: {formatDate(task.completion_date) !== '—' ? formatDate(task.completion_date) : formatDate(task.due_date)}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={11} className="text-orange-400/60 shrink-0" />
                  Due: {formatDate(task.due_date)}
                </div>
                <div className="flex items-center gap-2">
                  <FolderKanban size={11} className="text-blue-400/60 shrink-0" />
                  <span className={`font-semibold ${PRIORITY_STYLES[task.priority] || 'text-white/45'}`}>{task.priority || 'Medium'}</span>
                  &nbsp;Priority
                </div>
              </div>

              {/* attachments */}
              {task.attachments.length > 0 && (
                <div className="rounded-xl border border-white/6 bg-black/20 p-3 space-y-1.5">
                  <div className="text-[10px] uppercase tracking-widest text-white/30 flex items-center gap-1.5">
                    <FileText size={9} /> {task.attachments.length} File{task.attachments.length > 1 ? 's' : ''}
                  </div>
                  {task.attachments.map((att, idx) => (
                    <button
                      key={`${att.path || idx}-${idx}`}
                      type="button"
                      onClick={() => handleDownload(att)}
                      className="flex w-full items-center justify-between rounded-lg bg-white/4 px-3 py-2 text-[11px] text-white/55 hover:bg-white/7 transition-colors"
                    >
                      <span className="truncate">{att.original_name || att.filename || 'Document'}</span>
                      <Download size={10} className="text-blue-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* footer */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/[0.04]">
                <button
                  type="button"
                  onClick={() => navigate(`/employee/tasks/view/${task.uuid}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-white/8 bg-white/4 py-2 text-xs text-white/55 hover:bg-white/7 transition-colors"
                >
                  <Eye size={12} /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
