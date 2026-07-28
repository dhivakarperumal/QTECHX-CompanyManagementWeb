import { useMemo, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Eye, Edit3, Trash2 } from 'lucide-react';
import api from '../../api';

const tabs = [
  { key: "overview", label: "All Tasks" },
  { key: "add", label: "Add Task" },
  { key: "assign", label: "Assign Task" },
  { key: "update", label: "Update Task" },
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
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskActionMessage, setTaskActionMessage] = useState('');
  const [taskForm, setTaskForm] = useState({
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
  });
  const [savingTask, setSavingTask] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [taskSuccess, setTaskSuccess] = useState('');
  const [assignForm, setAssignForm] = useState({
    project_id: '',
    task_uuid: '',
    assigned_to: '',
    team: '',
    assignment_date: '',
    status: '',
  });
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [projectEmployeesLoading, setProjectEmployeesLoading] = useState(false);
  const [assigningTask, setAssigningTask] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

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

  const fetchTasks = async (projectUuid = selectedProject) => {
    setTasksLoading(true);
    try {
      const params = { limit: 100, page: 1 };
      if (projectUuid) params.project_id = projectUuid;
      const { data } = await api.get('/tasks', { params });
      const list = (data.data || []).map(mapTaskToViewModel);
      setTasksList(list);
      if (pageKey === 'assign' && projectUuid && list.length) {
        setAssignForm((prev) => ({
          ...prev,
          task_uuid: prev.project_id === projectUuid && prev.task_uuid ? prev.task_uuid : list[0].uuid,
        }));
      }
    } catch (err) {
      console.error('Failed to load task options', err);
      setTasksList([]);
    } finally {
      setTasksLoading(false);
    }
  };

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
        const { data } = await api.get('/projects?limit=100&page=1');
        const list = data.data || [];
        setProjects(list);
      } catch (err) {
        console.error('Failed to load project options', err);
      }
    };

    fetchProjects();
    if (['overview', 'board', 'completed'].includes(pageKey)) {
      fetchTasks(selectedProject);
    }
  }, [pageKey, selectedProject, location.search]);

  useEffect(() => {
    if (pageKey !== 'update') {
      setSelectedTaskDetails(null);
      return;
    }

    if (!currentTaskUuid) {
      setSelectedTaskDetails(null);
      setTaskForm({
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
      });
      return;
    }

    setSelectedTaskDetails(null);
    const loadTask = async () => {
      const task = await fetchTaskById(currentTaskUuid);
      if (task) {
        setSelectedTaskDetails(task);
        setTaskForm({
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

  useEffect(() => {
    if (pageKey !== 'assign') return;
    if (!projects.length) return;

    if (!assignForm.project_id) {
      setAssignForm((prev) => ({ ...prev, project_id: projects[0].uuid, task_uuid: '', assigned_to: '' }));
      return;
    }

    const loadProjectEmployees = async (projectUuid) => {
      if (!projectUuid) {
        setAssignedEmployees([]);
        return;
      }
      setProjectEmployeesLoading(true);
      try {
        const { data } = await api.get(`/projects/${projectUuid}/assignments`);
        setAssignedEmployees(data.data || []);
      } catch (err) {
        console.error('Failed to load employees for project', err);
        setAssignedEmployees([]);
      } finally {
        setProjectEmployeesLoading(false);
      }
    };

    loadProjectEmployees(assignForm.project_id);
  }, [pageKey, assignForm.project_id, projects]);

  const handleChange = (field, value) => {
    setTaskForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProjectChange = (projectUuid) => {
    setSelectedProject(projectUuid);
    if (['overview', 'board', 'completed'].includes(pageKey)) {
      const nextPath = `/admin/tasks${projectUuid ? `?project=${encodeURIComponent(projectUuid)}` : ''}`;
      navigate(nextPath, { replace: true });
    }
  };

  const handleSaveTask = async () => {
    setTaskError('');
    setTaskSuccess('');
    if (!taskForm.project_id) return setTaskError('Please select a project.');
    if (!taskForm.task_name) return setTaskError('Task name is required.');

    try {
      setSavingTask(true);
      const payload = {
        project_id: taskForm.project_id,
        module_name: taskForm.module_name,
        task_name: taskForm.task_name,
        description: taskForm.description,
        assigned_to: taskForm.assigned_to,
        assigned_by: taskForm.assigned_by,
        start_date: taskForm.start_date,
        due_date: taskForm.due_date,
        estimated_hours: taskForm.estimated_hours,
        priority: taskForm.priority,
      };
      const isUpdate = pageKey === 'update' && currentTaskUuid;
      const response = isUpdate
        ? await api.put(`/tasks/${currentTaskUuid}`, payload)
        : await api.post('/tasks', payload);
      const { data } = response;
      if (data.success === false) {
        setTaskError(data.message || `Failed to ${isUpdate ? 'update' : 'save'} task.`);
      } else {
        setTaskSuccess(data.message || `Task ${isUpdate ? 'updated' : 'saved'} successfully.`);
        if (isUpdate) {
          const updated = mapTaskToViewModel(data.data);
          setSelectedTaskDetails(updated);
        } else {
          setTaskForm({
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
          });
        }
        await fetchTasks(selectedProject || '');
      }
    } catch (err) {
      setTaskError(err?.response?.data?.message || err.message || `Failed to ${pageKey === 'update' ? 'update' : 'save'} task.`);
    } finally {
      setSavingTask(false);
    }
  };

  const visibleTasks = useMemo(() => {
    const baseTasks = selectedProject
      ? tasksList.filter((task) => task.project_uuid === selectedProject)
      : tasksList;

    if (pageKey === "completed") return baseTasks.filter((task) => task.status === "Completed");
    if (pageKey === "overview") return baseTasks;
    if (pageKey === "board") return baseTasks;
    return baseTasks;
  }, [pageKey, selectedProject, tasksList]);

  const availableTaskProjects = useMemo(() => {
    const projectMap = new Map();
    tasksList.forEach((task) => {
      if (task.project_uuid) {
        projectMap.set(task.project_uuid, task.project || task.project_id || task.project_uuid);
      }
    });
    return Array.from(projectMap.entries()).map(([uuid, name]) => ({ uuid, name }));
  }, [tasksList]);

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

  const handleAssignTask = async () => {
    setAssignError('');
    setAssignSuccess('');

    if (!assignForm.project_id) return setAssignError('Please select a project.');
    if (!assignForm.task_uuid) return setAssignError('Please select a task.');

    try {
      setAssigningTask(true);
      const payload = {
        project_id: assignForm.project_id,
        assigned_to: assignForm.assigned_to,
        team: assignForm.team,
        assignment_date: assignForm.assignment_date,
        status: assignForm.status,
      };
      const { data } = await api.put(`/tasks/${assignForm.task_uuid}`, payload);
      if (data.success === false) {
        setAssignError(data.message || 'Failed to assign task.');
      } else {
        setAssignSuccess(data.message || 'Task assigned successfully.');
        await fetchTasks(assignForm.project_id || '');
      }
    } catch (err) {
      setAssignError(err?.response?.data?.message || err.message || 'Failed to assign task.');
    } finally {
      setAssigningTask(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/40">Task Management</p>
          <h1 className="text-3xl font-bold">{tabs.find((tab) => tab.key === pageKey)?.label || "Tasks"}</h1>
          <p className="mt-1 text-sm text-slate-400">Manage tasks, assignments, progress and timesheet workflows from one place.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm text-slate-400">Total Tasks</p>
          <p className="mt-3 text-3xl font-semibold">{visibleTasks.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm text-slate-400">Completed</p>
          <p className="mt-3 text-3xl font-semibold">{visibleTasks.filter((task) => task.status === "Completed").length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm text-slate-400">Pending</p>
          <p className="mt-3 text-3xl font-semibold">{visibleTasks.filter((task) => task.status === "Pending").length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm text-slate-400">In Progress</p>
          <p className="mt-3 text-3xl font-semibold">{visibleTasks.filter((task) => task.status === "In Progress").length}</p>
        </div>
      </div>

      {taskActionMessage && (
        <div className="rounded-3xl border border-white/10 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {taskActionMessage}
        </div>
      )}

      {isTaskModalOpen && selectedTaskDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Task Details</h2>
                <p className="mt-1 text-sm text-slate-400">Review task information and use the action buttons below.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="rounded-full border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:border-white/20"
              >
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Name</p>
                  <p className="mt-1 text-base font-semibold text-white">{selectedTaskDetails.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Project</p>
                  <p className="mt-1 text-base text-slate-200">{selectedTaskDetails.project}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
                  <p className="mt-1 text-base text-slate-200">{selectedTaskDetails.status}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Due Date</p>
                  <p className="mt-1 text-base text-slate-200">{selectedTaskDetails.dueDate}</p>
                </div>
              </div>
              <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Assigned To</p>
                  <p className="mt-1 text-base text-slate-200">{selectedTaskDetails.assignedTo}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Assigned By</p>
                  <p className="mt-1 text-base text-slate-200">{selectedTaskDetails.assignedBy}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Priority</p>
                  <p className="mt-1 text-base text-slate-200">{selectedTaskDetails.priority}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Progress</p>
                  <p className="mt-1 text-base text-slate-200">{selectedTaskDetails.progress}%</p>
                </div>
              </div>
              <div className="sm:col-span-2 rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Description</p>
                <p className="mt-2 text-sm text-slate-200 whitespace-pre-line">{selectedTaskDetails.description || 'No description provided.'}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsTaskModalOpen(false);
                  handleEditTask(selectedTaskDetails.uuid);
                }}
                className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Edit Task
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDeleteTask(selectedTaskDetails.uuid);
                  setIsTaskModalOpen(false);
                }}
                className="rounded-2xl border border-rose-500 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-200 hover:bg-rose-500/20"
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

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
                <option key={project.uuid} value={project.uuid}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {pageKey === "add" && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold">Create New Task</h2>
          <p className="mt-2 text-sm text-slate-400">Fill in task details, assign it to an employee, and schedule deadlines.</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Project</label>
              <select
                value={taskForm.project_id}
                onChange={(e) => handleChange('project_id', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
              >
                <option value="" disabled>Select project</option>
                {projects.map((project) => (
                  <option key={project.uuid} value={project.uuid}>{project.project_name || project.short_name || project.project_code}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Module</label>
              <input
                value={taskForm.module_name}
                onChange={(e) => handleChange('module_name', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                placeholder="Enter Module"
              />
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Task Name</label>
              <input
                value={taskForm.task_name}
                onChange={(e) => handleChange('task_name', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                placeholder="Enter Task Name"
              />
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary resize-none"
                placeholder="Enter task description"
              />
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Assigned To</label>
              <input
                value={taskForm.assigned_to}
                onChange={(e) => handleChange('assigned_to', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                placeholder="Enter Assigned To"
              />
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Assigned By</label>
              <input
                value={taskForm.assigned_by}
                onChange={(e) => handleChange('assigned_by', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                placeholder="Enter Assigned By"
              />
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Start Date</label>
              <input
                type="date"
                value={taskForm.start_date}
                onChange={(e) => handleChange('start_date', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
              />
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Due Date</label>
              <input
                type="date"
                value={taskForm.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
              />
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Estimated Hours</label>
              <input
                type="number"
                value={taskForm.estimated_hours}
                onChange={(e) => handleChange('estimated_hours', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                placeholder="Enter Estimated Hours"
              />
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
              >
                <option value="" disabled>Select priority</option>
                {['Low','Medium','High','Critical'].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSaveTask}
              disabled={savingTask}
              className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingTask ? 'Saving...' : 'Save Task'}
            </button>
            <p className="text-sm text-slate-400">Task form is ready for backend integration.</p>
          </div>
          {taskError && <p className="mt-3 text-sm text-rose-400">{taskError}</p>}
          {taskSuccess && <p className="mt-3 text-sm text-emerald-400">{taskSuccess}</p>}
        </div>
      )}

      {pageKey === "update" && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold">Update Task</h2>
          <p className="mt-2 text-sm text-slate-400">Modify task details and save your updates.</p>
          {!currentTaskUuid ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-slate-900/80 p-6 text-slate-300">
              No task selected for editing. Choose a task from the list and click Edit.
            </div>
          ) : !selectedTaskDetails ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-slate-900/80 p-6 text-slate-300">
              Loading task details...
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-slate-900/80 p-4">
                  <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Project</label>
                  <select
                    value={taskForm.project_id}
                    onChange={(e) => handleChange('project_id', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                  >
                    <option value="" disabled>Select project</option>
                    {projects.map((project) => (
                      <option key={project.uuid} value={project.uuid}>{project.project_name || project.short_name || project.project_code}</option>
                    ))}
                  </select>
                </div>

                <div className="rounded-2xl bg-slate-900/80 p-4">
                  <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Module</label>
                  <input
                    value={taskForm.module_name}
                    onChange={(e) => handleChange('module_name', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                    placeholder="Enter Module"
                  />
                </div>

                <div className="rounded-2xl bg-slate-900/80 p-4">
                  <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Task Name</label>
                  <input
                    value={taskForm.task_name}
                    onChange={(e) => handleChange('task_name', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                    placeholder="Enter Task Name"
                  />
                </div>

                <div className="rounded-2xl bg-slate-900/80 p-4">
                  <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Description</label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={4}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary resize-none"
                    placeholder="Enter task description"
                  />
                </div>

                <div className="rounded-2xl bg-slate-900/80 p-4">
                  <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Assigned To</label>
                  <input
                    value={taskForm.assigned_to}
                    onChange={(e) => handleChange('assigned_to', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                    placeholder="Enter Assigned To"
                  />
                </div>

                <div className="rounded-2xl bg-slate-900/80 p-4">
                  <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Assigned By</label>
                  <input
                    value={taskForm.assigned_by}
                    onChange={(e) => handleChange('assigned_by', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                    placeholder="Enter Assigned By"
                  />
                </div>

                <div className="rounded-2xl bg-slate-900/80 p-4">
                  <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Start Date</label>
                  <input
                    type="date"
                    value={taskForm.start_date}
                    onChange={(e) => handleChange('start_date', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                  />
                </div>

                <div className="rounded-2xl bg-slate-900/80 p-4">
                  <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => handleChange('due_date', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                  />
                </div>

                <div className="rounded-2xl bg-slate-900/80 p-4">
                  <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Estimated Hours</label>
                  <input
                    type="number"
                    value={taskForm.estimated_hours}
                    onChange={(e) => handleChange('estimated_hours', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                    placeholder="Enter Estimated Hours"
                  />
                </div>

                <div className="rounded-2xl bg-slate-900/80 p-4">
                  <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                  >
                    <option value="" disabled>Select priority</option>
                    {['Low','Medium','High','Critical'].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleSaveTask}
                  disabled={savingTask}
                  className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingTask ? 'Updating...' : 'Update Task'}
                </button>
                <p className="text-sm text-slate-400">Edit the selected task and save your updates.</p>
              </div>
              {taskError && <p className="mt-3 text-sm text-rose-400">{taskError}</p>}
              {taskSuccess && <p className="mt-3 text-sm text-emerald-400">{taskSuccess}</p>}
            </>
          )}
        </div>
      )}

      {pageKey === "assign" && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold">Assign Task to Employee</h2>
          <p className="mt-2 text-sm text-slate-400">Select a project and assign a task to the appropriate team member for tracking.</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Project</label>
              <select
                value={assignForm.project_id}
                onChange={(e) => setAssignForm((prev) => ({ ...prev, project_id: e.target.value, task_uuid: '', assigned_to: '' }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
              >
                <option value="" disabled>Select project</option>
                {projects.map((project) => (
                  <option key={project.uuid} value={project.uuid}>
                    {project.project_name || project.short_name || project.project_code}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Task</label>
              <select
                value={assignForm.task_uuid}
                onChange={(e) => setAssignForm((prev) => ({ ...prev, task_uuid: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
              >
                <option value="" disabled>Select task</option>
                {tasksList.map((task) => (
                  <option key={task.uuid} value={task.uuid}>{task.name || task.module || task.uuid}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Assigned To</label>
              <select
                value={assignForm.assigned_to}
                onChange={(e) => setAssignForm((prev) => ({ ...prev, assigned_to: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
              >
                <option value="" disabled>{projectEmployeesLoading ? 'Loading employees…' : 'Select employee'}</option>
                {assignedEmployees.length > 0 ? (
                  assignedEmployees.map((employee) => (
                    <option key={employee.employee_id} value={employee.employee_id}>
                      {`${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.employee_id} {employee.employee_code ? `(${employee.employee_code})` : ''}
                    </option>
                  ))
                ) : (
                  !projectEmployeesLoading && <option value="" disabled>No employees assigned to this project</option>
                )}
              </select>
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Team / Department</label>
              <input
                value={assignForm.team}
                onChange={(e) => setAssignForm((prev) => ({ ...prev, team: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                placeholder="Enter Team or Department"
              />
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Assignment Date</label>
              <input
                type="date"
                value={assignForm.assignment_date}
                onChange={(e) => setAssignForm((prev) => ({ ...prev, assignment_date: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
              />
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Status</label>
              <select
                value={assignForm.status}
                onChange={(e) => setAssignForm((prev) => ({ ...prev, status: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
              >
                <option value="" disabled>Select status</option>
                {['Pending','To Do','In Progress','Review','Testing','Completed','On Hold','Cancelled'].map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleAssignTask}
              disabled={assigningTask}
              className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {assigningTask ? 'Assigning...' : 'Assign Task'}
            </button>
            <p className="text-sm text-slate-400">Select an existing task and assign it to an employee.</p>
          </div>
          {assignError && <p className="mt-3 text-sm text-rose-400">{assignError}</p>}
          {assignSuccess && <p className="mt-3 text-sm text-emerald-400">{assignSuccess}</p>}
        </div>
      )}

      {pageKey === "board" && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold">Task Board</h2>
          <p className="mt-2 text-sm text-slate-400">A Kanban style board for tracking task status across your team.</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {["To Do", "In Progress", "Completed"].map((status) => (
              <div key={status} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
                <h3 className="font-semibold text-white">{status}</h3>
                <div className="mt-4 space-y-4">
                  {visibleTasks.filter((task) => status === "To Do" ? task.status === "Pending" : status === "In Progress" ? task.status === "In Progress" : task.status === "Completed").map((task) => (
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

      {pageKey !== "add" && pageKey !== "assign" && pageKey !== "board" && (
        <>
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
                {visibleTasks.map((task) => (
                  <tr key={task.id} className="border-t border-white/5">
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
                    <td className="px-4 py-4">
                      <div className="h-2 rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${task.progress}%` }} />
                      </div>
                      <div className="mt-1 text-xs text-slate-400">{task.progress}%</div>
                    </td>
                    <td className="px-4 py-4">{task.dueDate}</td>
                    <td className="px-4 py-4">{task.priority}</td>
                    <td className="flex flex-wrap gap-2 px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleViewTask(task.uuid)}
                        title="View task"
                        aria-label="View task"
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 hover:border-white/20"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditTask(task.uuid)}
                        title="Edit task"
                        aria-label="Edit task"
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 text-slate-200 hover:border-white/20"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.uuid)}
                        title="Delete task"
                        aria-label="Delete task"
                        className="inline-flex items-center justify-center rounded-full border border-rose-500 bg-rose-500/10 p-2 text-rose-200 hover:bg-rose-500/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
      )}
    </div>
  );
}
