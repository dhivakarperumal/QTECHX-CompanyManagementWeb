import { useEffect, useMemo, useState } from 'react';
import { Clock3, CalendarDays, FolderKanban, Search, Loader2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';

const STATUS_STYLES = {
  Pending: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  'In Progress': 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
  Completed: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  Cancelled: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
};

const normalizeStatus = (status) => {
  if (!status) return 'Pending';
  const value = status.toString().trim();
  if (['Pending', 'To Do'].includes(value)) return 'Pending';
  if (['In Progress', 'Progress'].includes(value)) return 'In Progress';
  if (['Completed', 'Done'].includes(value)) return 'Completed';
  return value;
};

export default function EmployeeTimesheetPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const employeeId = user?.employee_id || user?.employeeId || user?.id || user?.user_id;

  useEffect(() => {
    const loadTimesheet = async () => {
      if (!employeeId) {
        setLoading(false);
        setError('Unable to resolve your employee profile.');
        return;
      }

      try {
        setLoading(true);
        setError('');
        const { data } = await api.get('/tasks', {
          params: {
            page: 1,
            limit: 100,
            assigned_to: employeeId,
          },
        });

        const list = (data?.data || []).map((task) => ({
          ...task,
          status: normalizeStatus(task.status),
          hours: Number(task.estimated_hours || task.actual_hours || 0),
        }));

        setTasks(list);
      } catch (err) {
        console.error('Failed to load timesheet data', err);
        setError(err?.response?.data?.message || 'Unable to load your timesheet.');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTimesheet();
  }, [employeeId]);

  const visibleTasks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return tasks;
    return tasks.filter((task) => {
      const haystack = `${task.task_name || ''} ${task.project_name || ''} ${task.module_name || ''} ${task.description || ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [tasks, search]);

  const totalHours = visibleTasks.reduce((sum, task) => sum + Number(task.hours || 0), 0);

  return (
    <div className="space-y-5 text-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Timesheet</h1>
          <p className="text-sm text-white/45">Track your assigned work and logged effort in one place.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
          <Clock3 size={16} className="text-primary" />
          <span>{totalHours} hours</span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
              <CalendarDays size={18} className="text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-white/40 uppercase tracking-[0.24em]">Assigned Tasks</div>
              <div className="text-xl font-bold text-white">{tasks.length}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
              <Clock3 size={18} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-xs text-white/40 uppercase tracking-[0.24em]">Hours</div>
              <div className="text-xl font-bold text-white">{totalHours}</div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
              <FolderKanban size={18} className="text-orange-400" />
            </div>
            <div>
              <div className="text-xs text-white/40 uppercase tracking-[0.24em]">Projects</div>
              <div className="text-xl font-bold text-white">{new Set(tasks.map((task) => task.project_name).filter(Boolean)).size}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0d0d12] p-4">
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Search size={15} className="text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search task or project"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          />
        </div>

        {error && <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-white/50">
            <Loader2 size={16} className="animate-spin text-primary" />
            Loading timesheet...
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-white/40">
            No timesheet entries found for your account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-white/45">
                  <th className="px-3 py-3 text-left">Task</th>
                  <th className="px-3 py-3 text-left">Project</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Hours</th>
                  <th className="px-3 py-3 text-left">Due</th>
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((task) => (
                  <tr key={task.uuid} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-3 py-3 font-semibold text-white">{task.task_name || task.module_name || task.uuid}</td>
                    <td className="px-3 py-3 text-white/65">{task.project_name || '—'}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[task.status] || 'bg-slate-500/15 text-slate-300 border border-slate-500/25'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-white/70">{Number(task.hours || 0)} hrs</td>
                    <td className="px-3 py-3 text-white/70">{task.due_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
