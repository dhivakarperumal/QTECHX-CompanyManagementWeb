import { useMemo, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import api from '../../api';

const TASKS = [
  {
    id: "TSK-001",
    project: "Client Portal",
    milestone: "Sprint 8",
    module: "Auth",
    name: "Implement login retry logic",
    type: "Bug",
    assignedTo: "Amina Khan",
    assignedBy: "Ravi Sharma",
    startDate: "2026-07-21",
    dueDate: "2026-07-30",
    estimatedHours: 12,
    actualHours: 6,
    progress: 50,
    status: "In Progress",
    priority: "High",
  },
  {
    id: "TSK-002",
    project: "Mobile App",
    milestone: "Sprint 9",
    module: "Payments",
    name: "Add refund support",
    type: "Feature",
    assignedTo: "Neha Patel",
    assignedBy: "Priya Verma",
    startDate: "2026-07-18",
    dueDate: "2026-08-05",
    estimatedHours: 18,
    actualHours: 4,
    progress: 22,
    status: "Pending",
    priority: "Medium",
  },
  {
    id: "TSK-003",
    project: "Admin Panel",
    milestone: "Sprint 7",
    module: "Dashboard",
    name: "Create task progress chart",
    type: "Enhancement",
    assignedTo: "Rahul Singh",
    assignedBy: "Ravi Sharma",
    startDate: "2026-07-15",
    dueDate: "2026-07-28",
    estimatedHours: 10,
    actualHours: 10,
    progress: 100,
    status: "Completed",
    priority: "Low",
  },
];

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

export default function TasksPage() {
  const location = useLocation();
  const pageKey = getPageKey(location.pathname);
  const [projects, setProjects] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [taskForm, setTaskForm] = useState({
    project_id: '',
    milestone: '',
    module_name: '',
    task_name: '',
    task_type: '',
    category: '',
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get('/projects?limit=100&page=1');
        const list = data.data || [];
        setProjects(list);
        if (pageKey === 'assign' && list.length && !assignForm.project_id) {
          setAssignForm((prev) => ({ ...prev, project_id: list[0].uuid }));
        }
      } catch (err) {
        console.error('Failed to load project options', err);
      }
    };

    const fetchTasks = async () => {
      try {
        const { data } = await api.get('/tasks?limit=100&page=1');
        const list = data.data || [];
        setTasksList(list);
        if (pageKey === 'assign' && list.length && !assignForm.task_uuid) {
          setAssignForm((prev) => ({ ...prev, task_uuid: list[0].uuid }));
        }
      } catch (err) {
        console.error('Failed to load task options', err);
      }
    };

    if (['add', 'assign'].includes(pageKey)) {
      fetchProjects();
    }
    if (pageKey === 'assign') {
      fetchTasks();
    }
  }, [pageKey, assignForm.project_id, assignForm.task_uuid]);

  useEffect(() => {
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

    if (pageKey === 'assign') {
      loadProjectEmployees(assignForm.project_id);
    }
  }, [pageKey, assignForm.project_id]);

  const handleChange = (field, value) => {
    setTaskForm((prev) => ({ ...prev, [field]: value }));
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
        milestone: taskForm.milestone,
        module_name: taskForm.module_name,
        task_name: taskForm.task_name,
        task_type: taskForm.task_type,
        category: taskForm.category,
        assigned_to: taskForm.assigned_to,
        assigned_by: taskForm.assigned_by,
        start_date: taskForm.start_date,
        due_date: taskForm.due_date,
        estimated_hours: taskForm.estimated_hours,
        priority: taskForm.priority,
      };
      const { data } = await api.post('/tasks', payload);
      if (data.success === false) {
        setTaskError(data.message || 'Failed to save task.');
      } else {
        setTaskSuccess(data.message || 'Task saved successfully.');
        setTaskForm({
          project_id: '',
          milestone: '',
          module_name: '',
          task_name: '',
          task_type: '',
          category: '',
          assigned_to: '',
          assigned_by: '',
          start_date: '',
          due_date: '',
          estimated_hours: '',
          priority: '',
        });
      }
    } catch (err) {
      setTaskError(err?.response?.data?.message || err.message || 'Failed to save task.');
    } finally {
      setSavingTask(false);
    }
  };

  const filteredTasks = useMemo(() => {
    if (pageKey === "completed") return TASKS.filter((task) => task.status === "Completed");
    if (pageKey === "overview") return TASKS;
    if (pageKey === "board") return TASKS;
    return TASKS;
  }, [pageKey]);

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
          <p className="mt-3 text-3xl font-semibold">{TASKS.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm text-slate-400">Completed</p>
          <p className="mt-3 text-3xl font-semibold">{TASKS.filter((task) => task.status === "Completed").length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm text-slate-400">Pending</p>
          <p className="mt-3 text-3xl font-semibold">{TASKS.filter((task) => task.status === "Pending").length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <p className="text-sm text-slate-400">In Progress</p>
          <p className="mt-3 text-3xl font-semibold">{TASKS.filter((task) => task.status === "In Progress").length}</p>
        </div>
      </div>

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
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Milestone / Sprint</label>
              <input
                value={taskForm.milestone}
                onChange={(e) => handleChange('milestone', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                placeholder="Enter Milestone / Sprint"
              />
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
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Task Type</label>
              <input
                value={taskForm.task_type}
                onChange={(e) => handleChange('task_type', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                placeholder="Enter Task Type"
              />
            </div>

            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Category</label>
              <input
                value={taskForm.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-primary"
                placeholder="Enter Category"
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

      {pageKey === "assign" && (
        <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
          <h2 className="text-xl font-semibold">Assign Task to Employee</h2>
          <p className="mt-2 text-sm text-slate-400">Select a project and assign a task to the appropriate team member for tracking.</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-slate-900/80 p-4">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Project</label>
              <select
                value={assignForm.project_id}
                onChange={(e) => setAssignForm((prev) => ({ ...prev, project_id: e.target.value }))}
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
                  <option key={task.uuid} value={task.uuid}>{task.task_name || task.module_name || task.uuid}</option>
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
                  {TASKS.filter((task) => status === "To Do" ? task.status === "Pending" : status === "In Progress" ? task.status === "In Progress" : task.status === "Completed").map((task) => (
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
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70">
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  {['Task', 'Project', 'Assigned To', 'Status', 'Progress', 'Due Date', 'Priority'].map((heading) => (
                    <th key={heading} className="px-4 py-4 font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="border-t border-white/5">
                    <td className="px-4 py-4">
                      <div className="font-semibold">{task.name}</div>
                      <div className="mt-1 text-xs text-slate-400">{task.module} · {task.type}</div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
