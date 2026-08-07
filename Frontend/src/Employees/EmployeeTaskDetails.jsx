import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle, ArrowLeft, CalendarDays, CheckCircle2, ClipboardList,
  Download, FileText, FolderKanban, Loader2, UploadCloud, ChevronDown,
  Tag, Clock, User2,
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';

/* ─── helpers ─────────────────────────────────────────────────── */
const STATUS_STYLES = {
  'Pending':     { pill: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',       dot: 'bg-amber-400' },
  'To Do':       { pill: 'bg-slate-500/15 text-slate-300 border border-slate-500/25',       dot: 'bg-slate-400' },
  'In Progress': { pill: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',          dot: 'bg-blue-400' },
  'Review':      { pill: 'bg-violet-500/15 text-violet-300 border border-violet-500/30',    dot: 'bg-violet-400' },
  'Testing':     { pill: 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30', dot: 'bg-fuchsia-400' },
  'Completed':   { pill: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30', dot: 'bg-emerald-400' },
  'On Hold':     { pill: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',    dot: 'bg-orange-400' },
  'Cancelled':   { pill: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',          dot: 'bg-rose-400' },
};

const PRIORITY_STYLES = {
  High:   { text: 'text-rose-300',    bg: 'bg-rose-500/10 border border-rose-500/20' },
  Medium: { text: 'text-amber-300',   bg: 'bg-amber-500/10 border border-amber-500/20' },
  Low:    { text: 'text-emerald-300', bg: 'bg-emerald-500/10 border border-emerald-500/20' },
};

const STATUS_OPTIONS = ['Pending', 'Accepted', 'To Do', 'In Progress', 'Review', 'Testing', 'Completed', 'On Hold', 'Cancelled'];

const normalizeStatus = (status) => {
  if (!status) return 'Pending';
  const value = status.toString().trim();
  if (['Accepted'].includes(value)) return 'Accepted';
  if (['Pending', 'To Do'].includes(value)) return 'Pending';
  if (['In Progress', 'Progress'].includes(value)) return 'In Progress';
  if (['Completed', 'Done'].includes(value)) return 'Completed';
  return value;
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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload  = () => resolve(reader.result?.split(',')[1] || '');
  reader.onerror = () => reject(new Error('Unable to read file'));
  reader.readAsDataURL(file);
});

/* ═══════════════════════════════════════════════════════════════ */
export default function EmployeeTaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: 'success' });
  const [detailStatus, setDetailStatus] = useState('Pending');
  const [saving, setSaving] = useState(false);

  const loadTask = async () => {
    try {
      setLoading(true); setError('');
      const { data } = await api.get(`/tasks/${id}`);
      const loaded = {
        ...data?.data,
        status:      normalizeStatus(data?.data?.status),
        attachments: parseAttachments(data?.data?.attachments),
      };
      setTask(loaded);
      setDetailStatus(loaded.status || 'Pending');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load task details.');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (id) loadTask(); }, [id]);

  const attachments = useMemo(() => task?.attachments || [], [task]);

  const showToast = (text, type = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage({ text: '', type: 'success' }), 3500);
  };

  const updateTaskStatus = async (nextStatus = detailStatus, zipFile = null) => {
    if (!task) return;
    try {
      setSaving(true);
      const payload = {
        status: nextStatus,
        completion_date: nextStatus === 'Completed' ? new Date().toISOString() : task.completion_date,
      };
      if (zipFile) {
        const base64 = await readFileAsBase64(zipFile);
        payload.attachmentBase64 = base64;
        payload.attachmentName   = zipFile.name;
        payload.attachmentType   = zipFile.type || 'application/zip';
      }
      await api.put(`/tasks/${task.uuid}`, payload);
      showToast(`Task marked as ${nextStatus}.`);
      await loadTask();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Unable to update task status.', 'error');
    } finally { setSaving(false); }
  };

  const handleDownload = (attachment) => {
    if (!attachment?.path) return;
    window.open(`${api.defaults.baseURL}/${attachment.path.replace(/\\/g, '/')}`, '_blank', 'noopener,noreferrer');
  };

  const pStyle = task ? (STATUS_STYLES[task.status] || STATUS_STYLES.Pending) : STATUS_STYLES.Pending;
  const prStyle = task ? (PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium) : PRIORITY_STYLES.Medium;

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <div className="space-y-6 text-white">

      {/* header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <ClipboardList size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Task Details</h1>
            <p className="text-xs text-white/35 mt-0.5">Assigned task overview</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/employee/tasks')}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/8 transition-all self-start sm:self-auto"
        >
          <ArrowLeft size={15} /> Back to Tasks
        </button>
      </div>

      {/* toast */}
      {statusMessage.text && (
        <div className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
          statusMessage.type === 'error'
            ? 'border border-rose-500/25 bg-rose-500/10 text-rose-300'
            : 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
        }`}>
          {statusMessage.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
          {statusMessage.text}
        </div>
      )}

      {/* body */}
      {loading ? (
        <div className="flex min-h-[55vh] items-center justify-center rounded-2xl border border-white/8 bg-[#111318]">
          <div className="flex flex-col items-center gap-3 text-white/40">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm">Loading task details…</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-5 text-sm text-rose-300 flex items-center gap-2">
          <AlertCircle size={15} /> {error}
        </div>
      ) : !task ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111318] px-4 py-14 text-center text-sm text-white/40">
          No task details available.
        </div>
      ) : (
        <div className="space-y-4">

          {/* ── hero card ── */}
          <div className="rounded-2xl border border-white/8 bg-[#111318] p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-white/30">Task</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{task.task_name || 'Untitled Task'}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {/* status pill */}
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${pStyle.pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${pStyle.dot}`} />
                    {task.status}
                  </span>
                  {/* priority badge */}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${prStyle.bg} ${prStyle.text}`}>
                    <Tag size={9} /> {task.priority || 'Medium'} Priority
                  </span>
                </div>
              </div>

              {/* date chips */}
              <div className="flex flex-col gap-2 self-start">
                <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm">
                  <CalendarDays size={15} className="text-sky-400/80" />
                  <div>
                    <p className="text-[10px] text-white/35 uppercase tracking-wider">Start Date</p>
                    <p className="text-white font-semibold mt-0.5">{formatDate(task.start_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm">
                  <CalendarDays size={15} className="text-orange-400/80" />
                  <div>
                    <p className="text-[10px] text-white/35 uppercase tracking-wider">End Date</p>
                    <p className="text-white font-semibold mt-0.5">{formatDate(task.due_date)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── main grid ── */}
          <div className="grid gap-4 lg:grid-cols-2">

            {/* left – info */}
            <div className="rounded-2xl border border-white/8 bg-[#111318] p-5 space-y-4">
              {/* project */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Project</p>
                <div className="flex items-center gap-2 text-white">
                  <FolderKanban size={15} className="text-emerald-400/70 shrink-0" />
                  <span className="text-[13px]">{task.project_name || '—'}</span>
                </div>
              </div>

              <hr className="border-white/6" />

              {/* module */}
              {task.module_name && (
                <>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Module</p>
                    <div className="flex items-center gap-2 text-white/70">
                      <ClipboardList size={14} className="text-blue-400/70 shrink-0" />
                      <span className="text-[13px]">{task.module_name}</span>
                    </div>
                  </div>
                  <hr className="border-white/6" />
                </>
              )}

              {/* description */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Description</p>
                <div className="rounded-xl border border-white/6 bg-white/[0.025] p-4">
                  <p className="text-[13px] leading-6 text-white/70">
                    {task.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* dates row */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Assigned', value: formatDate(task.assignment_date), icon: <CalendarDays size={13} className="text-blue-400/70" /> },
                  { label: 'Start', value: formatDate(task.start_date), icon: <CalendarDays size={13} className="text-sky-400/70" /> },
                  { label: 'End', value: formatDate(task.due_date), icon: <CalendarDays size={13} className="text-orange-400/70" /> },
                  { label: 'Completed', value: formatDate(task.completion_date), icon: <CheckCircle2 size={13} className="text-emerald-400/70" /> },
                ].map(item => (
                  <div key={item.label} className="rounded-xl border border-white/6 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-white/30">{item.label}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-white/60">
                      {item.icon} {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* right – status update */}
            <div className="rounded-2xl border border-white/8 bg-[#111318] p-5 space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-white/30">Update Status</p>

              {/* custom styled select */}
              <div>
                <div className="relative">
                  <select
                    value={detailStatus}
                    onChange={(e) => setDetailStatus(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-[#0b1020] pl-10 pr-10 py-3 text-sm text-white outline-none cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((v) => (
                      <option key={v} value={v} className="bg-[#0b1020] text-white">{v}</option>
                    ))}
                  </select>
                  {/* dot */}
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${
                    (STATUS_STYLES[detailStatus] || STATUS_STYLES.Pending).dot
                  }`} />
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>
              </div>

              {/* action buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => updateTaskStatus(detailStatus)}
                  disabled={saving}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/22 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                  {saving ? 'Saving…' : 'Save Status'}
                </button>

                <label className="flex-1 min-w-[120px] flex items-center justify-center gap-2 rounded-xl bg-blue-500/15 border border-blue-500/25 px-4 py-2.5 text-xs font-bold text-blue-300 hover:bg-blue-500/22 transition-all cursor-pointer">
                  <UploadCloud size={13} /> Upload ZIP
                  <input
                    type="file"
                    accept=".zip,.rar,.7z,application/zip"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      await updateTaskStatus(detailStatus, file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              <hr className="border-white/6" />

              {/* summary mini cards */}
              <p className="text-[10px] uppercase tracking-widest text-white/30">Task Summary</p>
              <div className="space-y-2">
                {[
                  {
                    icon: <CalendarDays size={13} className="text-sky-400/80" />,
                    label: 'Start',
                    value: formatDate(task.start_date),
                  },
                  {
                    icon: <Clock size={13} className="text-orange-400/80" />,
                    label: 'End',
                    value: formatDate(task.due_date),
                  },
                  {
                    icon: <ClipboardList size={13} className="text-blue-400/80" />,
                    label: 'Module',
                    value: task.module_name || 'Not set',
                  },
                  {
                    icon: <User2 size={13} className="text-violet-400/80" />,
                    label: 'Assigned by',
                    value: task.assigned_by_name || task.created_by || '—',
                  },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2.5">
                    {item.icon}
                    <span className="text-[11px] text-white/40 w-20 shrink-0">{item.label}</span>
                    <span className="text-[12px] text-white/75 truncate">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── attachments ── */}
          <div className="rounded-2xl border border-white/8 bg-[#111318] p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={14} className="text-white/35" />
              <p className="text-[10px] uppercase tracking-widest text-white/30">Attachments</p>
              {attachments.length > 0 && (
                <span className="ml-auto text-[10px] text-white/35 bg-white/5 px-2 py-0.5 rounded-full">
                  {attachments.length} file{attachments.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {attachments.length > 0 ? (
              <div className="space-y-2">
                {attachments.map((att, idx) => (
                  <button
                    key={`${att.path || att.filename || idx}-${idx}`}
                    type="button"
                    onClick={() => handleDownload(att)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3 text-left hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <FileText size={13} className="text-blue-400" />
                      </div>
                      <span className="text-sm text-white/70 truncate group-hover:text-white transition-colors">
                        {att.original_name || att.filename || 'Document'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Download size={14} className="text-blue-400/60 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/8 px-4 py-8 text-center">
                <UploadCloud size={24} className="mx-auto text-white/20 mb-2" />
                <p className="text-sm text-white/35">No documents uploaded yet.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
