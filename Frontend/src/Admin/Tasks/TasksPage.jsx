import { useMemo, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Eye, Edit3, Trash2, Plus, UserPlus, X, CheckCircle, AlertCircle, Loader2, ClipboardList } from 'lucide-react';
import api from '../../api';

const tabs = [
  { key: "overview", label: "All Tasks" },
  { key: "board", label: "Task Board" },
  { key: "graph", label: "Task Graph" },
  { key: "completed", label: "Completed Tasks" },
];

const getPageKey = (pathname) => {
  const cleaned = pathname.replace(/.*\/admin\/tasks\/?/, "");
  if (!cleaned || cleaned === "tasks") return "overview";
  return cleaned.replace(/\/?$/, "");
};

const statusStyles = {
  "Pending": "bg-orange-100 text-orange-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "Completed": "bg-emerald-100 text-emerald-700",
  "On Hold": "bg-yellow-100 text-yellow-700",
  "Cancelled": "bg-red-100 text-red-700",
};

const normalizeTaskStatus = (status) => {
  if (!status) return "Pending";
  const value = status.toString().trim();
  if (["Pending", "To Do"].includes(value)) return "Pending";
  if (["In Progress", "Progress"].includes(value)) return "In Progress";
  if (["Completed", "Done"].includes(value)) return "Completed";
  return value;
};

const mapTaskToViewModel = (task) => ({
  id: task.uuid,
  uuid: task.uuid,
  name: task.task_name || task.module_name || task.uuid,
  module: task.module_name || "—",
  project: task.project_name || task.project_id || "—",
  assignedTo: task.assigned_to_name || "Unassigned",
  assignedBy: task.assigned_by_name || "—",
  status: normalizeTaskStatus(task.status),
  progress: Number(task.progress || 0),
  startDate: task.start_date || "",
  dueDate: task.due_date || "—",
  priority: task.priority || "Medium",
  description: task.description || "",
  estimatedHours: task.estimated_hours || "",
  project_id: task.project_id,
  project_uuid: task.project_uuid,
});

const EMPTY_TASK_FORM = {
  project_id: '',
  module_name: '',
  task_name: '',
  description: '',
  assigned_to: '',
  assigned_by: '',
  start_date: '',
  due_date: '',
  estimated_hours: '',
  priority: '',
};

const EMPTY_ASSIGN_FORM = {
  project_id: '',
  task_uuid: '',
  assigned_to: '',
  team: '',
  assignment_date: '',
  status: '',
};

/* ─── Small reusable field wrapper ─── */
function FieldBox({ label, children }) {
  return (
    <div className="rounded-2xl bg-slate-900/80 p-4">
      <label className="block text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-primary transition placeholder:text-slate-600";

/* ─── Modal wrapper — rendered via Portal so it covers the FULL viewport ─── */
function Modal({ open, onClose, title, subtitle, icon: Icon, iconColor = "text-primary", children, footer }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(2,6,23,0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#020617',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {Icon && (
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 ${iconColor}`}>
                <Icon size={20} />
              </div>
            )}
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>{title}</h2>
              {subtitle && <p style={{ marginTop: '4px', fontSize: '14px', color: '#94a3b8' }}>{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default function TasksPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageKey = getPageKey(location.pathname);

  const [projects, setProjects] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('project') || params.get('project_id') || '';
  });
  const [currentTaskUuid, setCurrentTaskUuid] = useState('');
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [taskActionMessage, setTaskActionMessage] = useState('');

  /* ── Add Task Modal ── */
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskForm, setTaskForm] = useState(EMPTY_TASK_FORM);
  const [savingTask, setSavingTask] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [taskSuccess, setTaskSuccess] = useState('');

  /* ── Assign Task Modal ── */
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState(EMPTY_ASSIGN_FORM);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [projectEmployeesLoading, setProjectEmployeesLoading] = useState(false);
  const [assigningTask, setAssigningTask] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  /* ── View Task Modal ── */
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  /* ── Update Task Modal (inline page) ── */
  const [taskUpdateForm, setTaskUpdateForm] = useState(EMPTY_TASK_FORM);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  /* ─────────────── Data fetching ─────────────── */

  const fetchTaskById = async (taskUuid) => {
    if (!taskUuid) return null;
    try {
      const { data } = await api.get(`/tasks/${taskUuid}`);
      return mapTaskToViewModel(data.data);
    } catch (err) {
      console.error('Failed to load task details', err);
      return null;
    }
  };

  const fetchTasks = useCallback(async (projectUuid = selectedProject) => {
    setTasksLoading(true);
    try {
      const params = { limit: 100, page: 1 };
      if (projectUuid) params.project_id = projectUuid;
      const { data } = await api.get('/tasks', { params });
      const list = (data.data || []).map(mapTaskToViewModel);
      setTasksList(list);
    } catch (err) {
      console.error('Failed to load task options', err);
      setTasksList([]);
    } finally {
      setTasksLoading(false);
    }
  }, [selectedProject]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectFromUrl = params.get('project') || params.get('project_id') || '';
    const taskFromUrl = params.get('task') || '';
    setSelectedProject(projectFromUrl);
    setCurrentTaskUuid(taskFromUrl);
  }, [location.search]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const [projectsResponse, assignmentsResponse] = await Promise.all([
          api.get('/projects?limit=100&page=1').catch(() => ({ data: { data: [] } })),
          api.get('/projects/assignments/all').catch(() => ({ data: { data: [] } })),
        ]);

        const projectsFromApi = (projectsResponse?.data?.data || []).map((project) => ({
          uuid: project.uuid,
          project_name: project.project_name || project.short_name || project.project_code || project.name || project.uuid,
        }));

        const projectsFromAssignments = (assignmentsResponse?.data?.data || [])
          .map((assignment) => {
            if (!assignment?.project_uuid) return null;
            return {
              uuid: assignment.project_uuid,
              project_name: assignment.project_name || assignment.project_uuid,
            };
          })
          .filter(Boolean);

        const uniqueAssignedProjects = Array.from(
          new Map(projectsFromAssignments.map((project) => [project.uuid, project])).values()
        );

        const mergedProjects = Array.from(
          new Map([...projectsFromAssignments, ...projectsFromApi].map((project) => [project.uuid, project])).values()
        );

        setProjects(uniqueAssignedProjects.length > 0 ? uniqueAssignedProjects : mergedProjects);
      } catch (err) {
        console.error('Failed to load project options', err);
        setProjects([]);
      }
    };

    fetchProjects();
    if (['overview', 'board', 'completed'].includes(pageKey)) {
      fetchTasks(selectedProject);
    }
  }, [pageKey, selectedProject, location.search]);

  /* Load task for update page */
  useEffect(() => {
    if (pageKey !== 'update') {
      setSelectedTaskDetails(null);
      return;
    }

    if (!currentTaskUuid) {
      setSelectedTaskDetails(null);
      setTaskUpdateForm(EMPTY_TASK_FORM);
      return;
    }

    setSelectedTaskDetails(null);
    const loadTask = async () => {
      const task = await fetchTaskById(currentTaskUuid);
      if (task) {
        setSelectedTaskDetails(task);
        setTaskUpdateForm({
          project_id: task.project_uuid || '',
          module_name: task.module,
          task_name: task.name,
          description: task.description,
          assigned_to: task.assignedTo,
          assigned_by: task.assignedBy,
          start_date: task.startDate || '',
          due_date: task.dueDate || '',
          estimated_hours: task.estimatedHours || '',
          priority: task.priority || '',
        });
      }
    };
    loadTask();
  }, [pageKey, currentTaskUuid]);

  /* Load employees when assign modal project changes */
  useEffect(() => {
    if (!showAssignModal) return;
    if (!assignForm.project_id) {
      setAssignedEmployees([]);
      return;
    }
    const loadEmployees = async () => {
      setProjectEmployeesLoading(true);
      try {
        const { data } = await api.get(`/projects/${assignForm.project_id}/assignments`);
        setAssignedEmployees(
          data.assignedEmployees || data.project?.assignedEmployees || data.project?.employees || data.data || []
        );
      } catch (err) {
        console.error('Failed to load employees for project', err);
        setAssignedEmployees([]);
      } finally {
        setProjectEmployeesLoading(false);
      }
    };
    const loadTasksForProject = async () => {
      try {
        const { data } = await api.get('/tasks', { params: { project_id: assignForm.project_id, limit: 100, page: 1 } });
        setTasksList((data.data || []).map(mapTaskToViewModel));
      } catch { /* ignore */ }
    };
    loadEmployees();
    loadTasksForProject();
  }, [showAssignModal, assignForm.project_id]);

  /* ─────────────── Handlers ─────────────── */

  const handleProjectChange = (projectUuid) => {
    setSelectedProject(projectUuid);
    if (['overview', 'board', 'completed'].includes(pageKey)) {
      const nextPath = `/admin/tasks${projectUuid ? `?project=${encodeURIComponent(projectUuid)}` : ''}`;
      navigate(nextPath, { replace: true });
    }
  };

  const handleViewTask = async (taskUuid) => {
    const task = await fetchTaskById(taskUuid);
    if (task) {
      setSelectedTaskDetails(task);
      setIsTaskModalOpen(true);
    }
  };

  const handleEditTask = (taskUuid) => {
    navigate(`/admin/tasks/update?task=${encodeURIComponent(taskUuid)}${selectedProject ? `&project=${encodeURIComponent(selectedProject)}` : ''}`);
  };

  const handleDeleteTask = async (taskUuid) => {
    if (!taskUuid) return;
    try {
      await api.delete(`/tasks/${taskUuid}`);
      setTaskActionMessage('Task deleted successfully.');
      fetchTasks(selectedProject || '');
    } catch (err) {
      setTaskActionMessage(err?.response?.data?.message || 'Failed to delete task.');
    }
  };

  /* Save new task */
  const handleSaveTask = async () => {
    setTaskError('');
    setTaskSuccess('');
    if (!taskForm.project_id) return setTaskError('Please select a project.');
    if (!taskForm.task_name.trim()) return setTaskError('Task name is required.');

    try {
      setSavingTask(true);
      const payload = { ...taskForm };
      const { data } = await api.post('/tasks', payload);
      if (data.success === false) {
        setTaskError(data.message || 'Failed to save task.');
      } else {
        setTaskSuccess(data.message || 'Task created successfully!');
        setTaskForm(EMPTY_TASK_FORM);
        await fetchTasks(selectedProject || '');
        setTimeout(() => {
          setShowAddModal(false);
          setTaskSuccess('');
        }, 1800);
      }
    } catch (err) {
      setTaskError(err?.response?.data?.message || err.message || 'Failed to save task.');
    } finally {
      setSavingTask(false);
    }
  };

  /* Update existing task */
  const handleUpdateTask = async () => {
    setUpdateError('');
    setUpdateSuccess('');
    if (!taskUpdateForm.project_id) return setUpdateError('Please select a project.');
    if (!taskUpdateForm.task_name.trim()) return setUpdateError('Task name is required.');

    try {
      setUpdatingTask(true);
      const { data } = await api.put(`/tasks/${currentTaskUuid}`, taskUpdateForm);
      if (data.success === false) {
        setUpdateError(data.message || 'Failed to update task.');
      } else {
        setUpdateSuccess(data.message || 'Task updated successfully!');
        const updated = mapTaskToViewModel(data.data);
        setSelectedTaskDetails(updated);
        await fetchTasks(selectedProject || '');
      }
    } catch (err) {
      setUpdateError(err?.response?.data?.message || err.message || 'Failed to update task.');
    } finally {
      setUpdatingTask(false);
    }
  };

  /* Assign task */
  const handleAssignTask = async () => {
    setAssignError('');
    setAssignSuccess('');
    if (!assignForm.project_id) return setAssignError('Please select a project.');
    if (!assignForm.task_uuid) return setAssignError('Please select a task.');
    if (!assignForm.assigned_to) return setAssignError('Please select an employee.');

    try {
      setAssigningTask(true);
      const payload = {
        project_id: assignForm.project_id,
        employee_id: assignForm.assigned_to,
        task_id: assignForm.task_uuid,
        assigned_date: assignForm.assignment_date,
        status: assignForm.status,
      };
      const { data } = await api.post('/tasks/assign', payload);
      if (data.success === false) {
        setAssignError(data.message || 'Failed to assign task.');
      } else {
        setAssignSuccess(data.message || 'Task assigned successfully!');
        await fetchTasks(assignForm.project_id || '');
        setTimeout(() => {
          setShowAssignModal(false);
          setAssignSuccess('');
          setAssignForm(EMPTY_ASSIGN_FORM);
        }, 1800);
      }
    } catch (err) {
      setAssignError(err?.response?.data?.message || err.message || 'Failed to assign task.');
    } finally {
      setAssigningTask(false);
    }
  };

  /* ─────────────── Derived data ─────────────── */

  const visibleTasks = useMemo(() => {
    const baseTasks = selectedProject
      ? tasksList.filter((task) => task.project_uuid === selectedProject)
      : tasksList;

    if (pageKey === "completed") return baseTasks.filter((task) => task.status === "Completed");
    return baseTasks;
  }, [pageKey, selectedProject, tasksList]);

  const availableTaskProjects = useMemo(() => {
    return projects.map((project) => ({
      uuid: project.uuid,
      name: project.project_name || project.short_name || project.project_code || project.uuid,
    }));
  }, [projects]);

  /* ─────────────── Render ─────────────── */

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/40">Task Management</p>
          <h1 className="text-3xl font-bold">{tabs.find((tab) => tab.key === pageKey)?.label || "Tasks"}</h1>
          <p className="mt-1 text-sm text-slate-400">Manage tasks, assignments, progress and timesheet workflows from one place.</p>
        </div>

        {/* ── Right-side quick action buttons ── */}
        <div className="flex flex-shrink-0 flex-wrap items-center gap-3">
          <button
            type="button"
            id="btn-add-new-task"
            onClick={() => {
              setTaskError('');
              setTaskSuccess('');
              setTaskForm(EMPTY_TASK_FORM);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-orange-600 hover:shadow-primary/30 active:scale-95"
          >
            <Plus size={16} />
            Add New Task
          </button>
          <button
            type="button"
            id="btn-assign-task"
            onClick={() => {
              setAssignError('');
              setAssignSuccess('');
              setAssignForm(projects.length > 0 ? { ...EMPTY_ASSIGN_FORM, project_id: projects[0].uuid } : EMPTY_ASSIGN_FORM);
              setShowAssignModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10 active:scale-95"
          >
            <UserPlus size={16} />
            Assign Task
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm text-slate-400">Total Tasks</p>
          <p className="mt-3 text-3xl font-semibold">{visibleTasks.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm text-slate-400">Completed</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-400">{visibleTasks.filter((task) => task.status === "Completed").length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm text-slate-400">Pending</p>
          <p className="mt-3 text-3xl font-semibold text-orange-400">{visibleTasks.filter((task) => task.status === "Pending").length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm text-slate-400">In Progress</p>
          <p className="mt-3 text-3xl font-semibold text-blue-400">{visibleTasks.filter((task) => task.status === "In Progress").length}</p>
        </div>
      </div>

      {/* ── Action message banner ── */}
      {taskActionMessage && (
        <div className="rounded-3xl border border-white/10 bg-emerald-500/10 p-4 text-sm text-emerald-200 flex items-center gap-2">
          <CheckCircle size={16} />
          {taskActionMessage}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/70">
        <div className="flex flex-wrap gap-2 p-4">
          {tabs.map((tab) => (
            <NavLink
              key={tab.key}
              to={tab.key === "overview" ? "/admin/tasks" : `/admin/tasks/${tab.key}`}
              className={({ isActive }) =>
                `rounded-full border px-4 py-2 text-sm transition ${isActive ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-slate-300 hover:border-white/20 hover:bg-white/5"}`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
        {['overview', 'board', 'completed'].includes(pageKey) && (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 px-4 pb-4 pt-2">
            <label className="text-sm font-medium text-slate-400">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-primary"
            >
              <option value="">All Projects</option>
              {availableTaskProjects.map((project) => (
                <option key={project.uuid} value={project.uuid}>{project.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Update Task page (route-based) ── */}
      {pageKey === "update" && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold">Update Task</h2>
          <p className="mt-2 text-sm text-slate-400">Modify task details and save your updates.</p>
          {!currentTaskUuid ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-slate-900/80 p-6 text-slate-300">
              No task selected for editing. Choose a task from the list and click Edit.
            </div>
          ) : !selectedTaskDetails ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-slate-900/80 p-6 text-slate-300">
              <Loader2 size={16} className="animate-spin" /> Loading task details...
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <FieldBox label="Project">
                  <select value={taskUpdateForm.project_id} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, project_id: e.target.value }))} className={inputCls}>
                    <option value="" disabled>Select project</option>
                    {projects.map((project) => (
                      <option key={project.uuid} value={project.uuid}>{project.project_name || project.short_name || project.project_code}</option>
                    ))}
                  </select>
                </FieldBox>
                <FieldBox label="Module">
                  <input value={taskUpdateForm.module_name} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, module_name: e.target.value }))} className={inputCls} placeholder="Enter Module" />
                </FieldBox>
                <FieldBox label="Task Name">
                  <input value={taskUpdateForm.task_name} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, task_name: e.target.value }))} className={inputCls} placeholder="Enter Task Name" />
                </FieldBox>
                <FieldBox label="Description">
                  <textarea value={taskUpdateForm.description} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={inputCls + ' resize-none'} placeholder="Enter task description" />
                </FieldBox>
                <FieldBox label="Assigned To">
                  <input value={taskUpdateForm.assigned_to} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, assigned_to: e.target.value }))} className={inputCls} placeholder="Enter Assigned To" />
                </FieldBox>
                <FieldBox label="Assigned By">
                  <input value={taskUpdateForm.assigned_by} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, assigned_by: e.target.value }))} className={inputCls} placeholder="Enter Assigned By" />
                </FieldBox>
                <FieldBox label="Start Date">
                  <input type="date" value={taskUpdateForm.start_date} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, start_date: e.target.value }))} className={inputCls} />
                </FieldBox>
                <FieldBox label="Due Date">
                  <input type="date" value={taskUpdateForm.due_date} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, due_date: e.target.value }))} className={inputCls} />
                </FieldBox>
                <FieldBox label="Estimated Hours">
                  <input type="number" value={taskUpdateForm.estimated_hours} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, estimated_hours: e.target.value }))} className={inputCls} placeholder="Enter Estimated Hours" />
                </FieldBox>
                <FieldBox label="Priority">
                  <select value={taskUpdateForm.priority} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, priority: e.target.value }))} className={inputCls}>
                    <option value="" disabled>Select priority</option>
                    {['Low', 'Medium', 'High', 'Critical'].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </FieldBox>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button type="button" onClick={handleUpdateTask} disabled={updatingTask}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
                  {updatingTask ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : 'Update Task'}
                </button>
              </div>
              {updateError && <p className="mt-3 flex items-center gap-2 text-sm text-rose-400"><AlertCircle size={14} />{updateError}</p>}
              {updateSuccess && <p className="mt-3 flex items-center gap-2 text-sm text-emerald-400"><CheckCircle size={14} />{updateSuccess}</p>}
            </>
          )}
        </div>
      )}

      {/* ── Kanban Board ── */}
      {pageKey === "board" && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold">Task Board</h2>
          <p className="mt-2 text-sm text-slate-400">A Kanban style board for tracking task status across your team.</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {["To Do", "In Progress", "Completed"].map((status) => (
              <div key={status} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                <h3 className="font-semibold text-white">{status}</h3>
                <div className="mt-4 space-y-4">
                  {visibleTasks.filter((task) =>
                    status === "To Do" ? task.status === "Pending" :
                    status === "In Progress" ? task.status === "In Progress" :
                    task.status === "Completed"
                  ).map((task) => (
                    <div key={task.id} className="rounded-3xl border border-white/10 bg-slate-950 p-4">
                      <p className="font-semibold">{task.name}</p>
                      <p className="mt-1 text-sm text-slate-400">{task.project} · {task.assignedTo}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tasks Table ── */}
      {pageKey !== "board" && pageKey !== "update" && (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  {['Task', 'Project', 'Assigned To', 'Status', 'Progress', 'Due Date', 'Priority', 'Actions'].map((heading) => (
                    <th key={heading} className="px-4 py-4 font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasksLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading tasks...</div>
                    </td>
                  </tr>
                ) : visibleTasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <ClipboardList size={32} className="text-slate-700" />
                        <p>No tasks found. Click <strong className="text-white">Add New Task</strong> to get started.</p>
                      </div>
                    </td>
                  </tr>
                ) : visibleTasks.map((task) => (
                  <tr key={task.id} className="border-t border-white/5 hover:bg-white/[0.02] transition">
                    <td className="px-4 py-4">
                      <div className="font-semibold">{task.name}</div>
                      <div className="mt-1 text-xs text-slate-400">{task.module}</div>
                    </td>
                    <td className="px-4 py-4">{task.project}</td>
                    <td className="px-4 py-4">{task.assignedTo}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[task.status] || 'bg-slate-600 text-slate-100'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 min-w-[100px]">
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${task.progress}%` }} />
                      </div>
                      <div className="mt-1 text-xs text-slate-400">{task.progress}%</div>
                    </td>
                    <td className="px-4 py-4">{task.dueDate}</td>
                    <td className="px-4 py-4">{task.priority}</td>
                    <td className="flex flex-wrap gap-2 px-4 py-4">
                      <button type="button" onClick={() => handleViewTask(task.uuid)} title="View task" aria-label="View task"
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 hover:border-white/20 hover:bg-white/10 transition">
                        <Eye size={14} />
                      </button>
                      <button type="button" onClick={() => handleEditTask(task.uuid)} title="Edit task" aria-label="Edit task"
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 hover:border-white/20 hover:bg-white/10 transition">
                        <Edit3 size={14} />
                      </button>
                      <button type="button" onClick={() => handleDeleteTask(task.uuid)} title="Delete task" aria-label="Delete task"
                        className="inline-flex items-center justify-center rounded-full border border-rose-500 bg-rose-500/10 p-2 text-rose-200 hover:bg-rose-500/20 transition">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          MODAL: View Task Details
      ════════════════════════════════════════════════ */}
      <Modal
        open={isTaskModalOpen && !!selectedTaskDetails}
        onClose={() => setIsTaskModalOpen(false)}
        title="Task Details"
        subtitle="Review task information and take actions."
        icon={ClipboardList}
        footer={
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => { setIsTaskModalOpen(false); handleEditTask(selectedTaskDetails?.uuid); }}
              className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition">
              Edit Task
            </button>
            <button type="button" onClick={() => { handleDeleteTask(selectedTaskDetails?.uuid); setIsTaskModalOpen(false); }}
              className="rounded-2xl border border-rose-500 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-200 hover:bg-rose-500/20 transition">
              Delete Task
            </button>
            <button type="button" onClick={() => setIsTaskModalOpen(false)}
              className="ml-auto rounded-2xl border border-white/10 bg-slate-900 px-5 py-2.5 text-sm text-slate-300 hover:border-white/20 transition">
              Close
            </button>
          </div>
        }
      >
        {selectedTaskDetails && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Name</p>
                <p className="mt-1 font-semibold text-white">{selectedTaskDetails.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Project</p>
                <p className="mt-1 text-slate-200">{selectedTaskDetails.project}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
                <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[selectedTaskDetails.status] || 'bg-slate-600 text-slate-100'}`}>
                  {selectedTaskDetails.status}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Due Date</p>
                <p className="mt-1 text-slate-200">{selectedTaskDetails.dueDate}</p>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Assigned To</p>
                <p className="mt-1 text-slate-200">{selectedTaskDetails.assignedTo}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Assigned By</p>
                <p className="mt-1 text-slate-200">{selectedTaskDetails.assignedBy}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Priority</p>
                <p className="mt-1 text-slate-200">{selectedTaskDetails.priority}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Progress</p>
                <div className="mt-2">
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${selectedTaskDetails.progress}%` }} />
                  </div>
                  <p className="mt-1 text-sm text-slate-200">{selectedTaskDetails.progress}%</p>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Description</p>
              <p className="mt-2 text-sm text-slate-200 whitespace-pre-line">{selectedTaskDetails.description || 'No description provided.'}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* ════════════════════════════════════════════════
          MODAL: Add New Task
      ════════════════════════════════════════════════ */}
      <Modal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setTaskError(''); setTaskSuccess(''); }}
        title="Create New Task"
        subtitle="Fill in the details below to create a new task."
        icon={Plus}
        footer={
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleSaveTask} disabled={savingTask}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
              {savingTask ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Plus size={14} /> Save Task</>}
            </button>
            <button type="button" onClick={() => { setShowAddModal(false); setTaskError(''); setTaskSuccess(''); }}
              className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-2.5 text-sm text-slate-300 hover:border-white/20 transition">
              Cancel
            </button>
            {taskError && (
              <span className="flex items-center gap-1.5 text-sm text-rose-400 ml-1">
                <AlertCircle size={14} />{taskError}
              </span>
            )}
            {taskSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400 ml-1">
                <CheckCircle size={14} />{taskSuccess}
              </span>
            )}
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldBox label="Project *">
            <select value={taskForm.project_id} onChange={(e) => setTaskForm((p) => ({ ...p, project_id: e.target.value }))} className={inputCls}>
              <option value="" disabled>Select project</option>
              {projects.map((project) => (
                <option key={project.uuid} value={project.uuid}>{project.project_name || project.short_name || project.project_code}</option>
              ))}
            </select>
          </FieldBox>
          <FieldBox label="Module">
            <input value={taskForm.module_name} onChange={(e) => setTaskForm((p) => ({ ...p, module_name: e.target.value }))} className={inputCls} placeholder="e.g. Authentication" />
          </FieldBox>
          <FieldBox label="Task Name *">
            <input value={taskForm.task_name} onChange={(e) => setTaskForm((p) => ({ ...p, task_name: e.target.value }))} className={inputCls} placeholder="Enter task name" />
          </FieldBox>
          <FieldBox label="Priority">
            <select value={taskForm.priority} onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))} className={inputCls}>
              <option value="" disabled>Select priority</option>
              {['Low', 'Medium', 'High', 'Critical'].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </FieldBox>
          <FieldBox label="Assigned To">
            <input value={taskForm.assigned_to} onChange={(e) => setTaskForm((p) => ({ ...p, assigned_to: e.target.value }))} className={inputCls} placeholder="Employee name or ID" />
          </FieldBox>
          <FieldBox label="Assigned By">
            <input value={taskForm.assigned_by} onChange={(e) => setTaskForm((p) => ({ ...p, assigned_by: e.target.value }))} className={inputCls} placeholder="Manager name or ID" />
          </FieldBox>
          <FieldBox label="Start Date">
            <input type="date" value={taskForm.start_date} onChange={(e) => setTaskForm((p) => ({ ...p, start_date: e.target.value }))} className={inputCls} />
          </FieldBox>
          <FieldBox label="Due Date">
            <input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm((p) => ({ ...p, due_date: e.target.value }))} className={inputCls} />
          </FieldBox>
          <FieldBox label="Estimated Hours">
            <input type="number" min="0" value={taskForm.estimated_hours} onChange={(e) => setTaskForm((p) => ({ ...p, estimated_hours: e.target.value }))} className={inputCls} placeholder="e.g. 8" />
          </FieldBox>
          <FieldBox label="Description">
            <textarea value={taskForm.description} onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={inputCls + ' resize-none'} placeholder="Brief description of the task..." />
          </FieldBox>
        </div>
      </Modal>

      {/* ════════════════════════════════════════════════
          MODAL: Assign Task
      ════════════════════════════════════════════════ */}
      <Modal
        open={showAssignModal}
        onClose={() => { setShowAssignModal(false); setAssignError(''); setAssignSuccess(''); }}
        title="Assign Task to Employee"
        subtitle="Select a project, pick a task and assign it to an employee."
        icon={UserPlus}
        footer={
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleAssignTask} disabled={assigningTask}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
              {assigningTask ? <><Loader2 size={14} className="animate-spin" /> Assigning...</> : <><UserPlus size={14} /> Assign Task</>}
            </button>
            <button type="button" onClick={() => { setShowAssignModal(false); setAssignError(''); setAssignSuccess(''); }}
              className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-2.5 text-sm text-slate-300 hover:border-white/20 transition">
              Cancel
            </button>
            {assignError && (
              <span className="flex items-center gap-1.5 text-sm text-rose-400 ml-1">
                <AlertCircle size={14} />{assignError}
              </span>
            )}
            {assignSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400 ml-1">
                <CheckCircle size={14} />{assignSuccess}
              </span>
            )}
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldBox label="Project *">
            <select
              value={assignForm.project_id}
              onChange={(e) => setAssignForm((p) => ({ ...p, project_id: e.target.value, task_uuid: '', assigned_to: '' }))}
              className={inputCls}
            >
              <option value="" disabled>Select project</option>
              {projects.map((project) => (
                <option key={project.uuid} value={project.uuid}>
                  {project.project_name || project.short_name || project.project_code}
                </option>
              ))}
            </select>
          </FieldBox>

          <FieldBox label="Task *">
            <select
              value={assignForm.task_uuid}
              onChange={(e) => setAssignForm((p) => ({ ...p, task_uuid: e.target.value }))}
              className={inputCls}
              disabled={!assignForm.project_id}
            >
              <option value="" disabled>{assignForm.project_id ? 'Select task' : 'Select a project first'}</option>
              {tasksList.map((task) => (
                <option key={task.uuid} value={task.uuid}>{task.name || task.module || task.uuid}</option>
              ))}
            </select>
          </FieldBox>

          <FieldBox label="Assign To Employee *">
            <select
              value={assignForm.assigned_to}
              onChange={(e) => setAssignForm((p) => ({ ...p, assigned_to: e.target.value }))}
              className={inputCls}
              disabled={!assignForm.project_id}
            >
              <option value="" disabled>
                {projectEmployeesLoading ? 'Loading employees…' : assignForm.project_id ? 'Select employee' : 'Select a project first'}
              </option>
              {assignedEmployees.length > 0 ? (
                assignedEmployees.map((employee) => (
                  <option key={employee.employee_id} value={employee.employee_id}>
                    {`${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.employee_id}
                    {employee.employee_code ? ` (${employee.employee_code})` : ''}
                  </option>
                ))
              ) : (
                !projectEmployeesLoading && assignForm.project_id && (
                  <option value="" disabled>No employees assigned to this project</option>
                )
              )}
            </select>
          </FieldBox>

          <FieldBox label="Team / Department">
            <input value={assignForm.team} onChange={(e) => setAssignForm((p) => ({ ...p, team: e.target.value }))} className={inputCls} placeholder="e.g. Frontend, Backend" />
          </FieldBox>

          <FieldBox label="Assignment Date">
            <input type="date" value={assignForm.assignment_date} onChange={(e) => setAssignForm((p) => ({ ...p, assignment_date: e.target.value }))} className={inputCls} />
          </FieldBox>

          <FieldBox label="Status">
            <select value={assignForm.status} onChange={(e) => setAssignForm((p) => ({ ...p, status: e.target.value }))} className={inputCls}>
              <option value="" disabled>Select status</option>
              {['Pending', 'To Do', 'In Progress', 'Review', 'Testing', 'Completed', 'On Hold', 'Cancelled'].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </FieldBox>
        </div>
      </Modal>
    </div>
  );
}
