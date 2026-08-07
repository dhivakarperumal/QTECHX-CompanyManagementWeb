import { useMemo, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Eye, Edit3, Trash2, Plus, UserPlus, X, CheckCircle, AlertCircle, Loader2, ClipboardList, Paperclip, Download, User, Play, Search, LayoutGrid, List, Calendar, Flag, Layers, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import api from '../../api';
import Select from 'react-select';

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#1a1d24',
    border: `1px solid ${state.isFocused
        ? '#f97316'
        : 'rgba(255,255,255,0.1)'
      }`,
    boxShadow: 'none',
    outline: 'none',
    minHeight: '42px',
    height: '42px',
    borderRadius: '12px',

    '&:hover': {
      border: '1px solid #f97316',
    },
  }),

  valueContainer: (provided) => ({
    ...provided,
    padding: '0 12px',
    fontSize: '13px',
  }),

  singleValue: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
  }),

  placeholder: (provided) => ({
    ...provided,
    color: 'rgba(255,255,255,.35)',
    fontSize: '13px',
  }),

  input: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
    margin: 0,
    padding: 0,
  }),

  menu: (provided) => ({
    ...provided,
    background: '#1a1d24',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  }),

  menuList: (provided) => ({
    ...provided,
    padding: 0,
    fontSize: '13px',
  }),

  option: (provided, state) => ({
    ...provided,
    fontSize: '13px',      // dropdown font size
    padding: '8px 14px',   // reduce option height
    backgroundColor: state.isSelected
      ? '#f97316'
      : state.isFocused
        ? 'rgba(249,115,22,.15)'
        : '#1a1d24',
    color: '#fff',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#ea580c',
    },
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),

  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#888',
    padding: '6px',
  }),
};

const tabs = [
  { key: "overview", label: "All Tasks" },
  { key: "today", label: "Today Tasks" },
  { key: "new", label: "New Tasks" },
  { key: "pending", label: "Pending Tasks" },
  { key: "completed", label: "Completed Tasks" },
  { key: "cancelled", label: "Cancelled Tasks" },

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

const isSameDay = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
};

const normalizeTaskStatus = (status) => {
  if (!status) return "Pending";
  const value = status.toString().trim();
  if (["Pending", "To Do"].includes(value)) return "Pending";
  if (["In Progress", "Progress"].includes(value)) return "In Progress";
  if (["Completed", "Done"].includes(value)) return "Completed";
  return value;
};

// Returns effective progress: uses stored value if > 0, else derives from status
const STATUS_PROGRESS_MAP = {
  'Pending':     0,
  'Accepted':    10,
  'To Do':       5,
  'In Progress': 50,
  'Review':      75,
  'Testing':     85,
  'Completed':   100,
  'On Hold':     30,
  'Cancelled':   0,
  'Issue':       40,
};

const getEffectiveProgress = (task) => {
  if (task.progress && Number(task.progress) > 0) return Number(task.progress);
  return STATUS_PROGRESS_MAP[task.status] ?? 0;
};

const getProgressColor = (status, progress) => {
  if (status === 'Completed') return 'bg-emerald-500';
  if (status === 'Cancelled') return 'bg-red-500';
  if (status === 'Review') return 'bg-violet-500';
  if (status === 'Testing') return 'bg-blue-500';
  if (status === 'In Progress') return 'bg-sky-500';
  if (status === 'On Hold') return 'bg-yellow-500';
  if (progress === 100) return 'bg-emerald-500';
  return 'bg-orange-500';
};

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

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

const mapTaskToViewModel = (task) => ({
  id: task.uuid,
  uuid: task.uuid,
  name: task.task_name || task.module_name || task.uuid,
  module: task.module_name || "—",
  project: task.project_name || task.project_id || "—",
  assignedTo: task.assigned_to_name || "Unassigned",
  assignedBy: task.assigned_by_name || "—",
  // Raw IDs for form editing
  assigned_to_raw: task.assigned_to || "",
  assigned_by_raw: task.assigned_by || "",
  status: normalizeTaskStatus(task.status),
  progress: Number(task.progress || 0),
  startDate: formatDateForInput(task.start_date),
  dueDate: task.due_date !== undefined && task.due_date !== null ? formatDateForInput(task.due_date) : "—",
  createdAt: task.created_at || task.assignment_date || task.createdAt || null,
  priority: task.priority || "Medium",
  description: task.description || "",
  estimatedHours: task.estimated_hours || "",
  project_id: task.project_id,
  project_uuid: task.project_uuid,
  comments: task.comments || "",
  issueReason: getIssueReason(task.comments),
  cancelReason: getCancelReason(task.comments),
  attachments: (() => { try { return JSON.parse(task.attachments || '[]'); } catch { return []; } })(),
});

const EMPTY_TASK_FORM = {
  project_id: '',
  module_name: '',
  task_name: '',
  description: '',
  status: '',
  start_date: '',
  due_date: '',
  estimated_hours: '',
  progress: 0,
  priority: '',
  attachments: [],
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

export default function TasksPage({ initialPageKey = null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pageKey = initialPageKey || getPageKey(location.pathname);

  const [projects, setProjects] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('project') || params.get('project_id') || '';
  });
  const [selectedTaskDetails, setSelectedTaskDetails] = useState(null);
  const [taskActionMessage, setTaskActionMessage] = useState('');

  /* ── Toolbar ── */
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('table');

  /* ── Add Task Modal ── */
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskForm, setTaskForm] = useState(EMPTY_TASK_FORM);
  const [taskFile, setTaskFile] = useState(null);
  const [savingTask, setSavingTask] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [taskSuccess, setTaskSuccess] = useState('');

  /* ── Assign Task Modal ── */
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState(EMPTY_ASSIGN_FORM);
  const [assignFile, setAssignFile] = useState(null);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [projectEmployeesLoading, setProjectEmployeesLoading] = useState(false);
  const [assigningTask, setAssigningTask] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  /* ── View Task Modal ── */
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  /* ── Edit Task Modal ── */
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTaskUuid, setEditingTaskUuid] = useState('');
  const [taskUpdateForm, setTaskUpdateForm] = useState(EMPTY_TASK_FORM);
  const [loadingEditTask, setLoadingEditTask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateTaskFile, setUpdateTaskFile] = useState(null);

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
    setSelectedProject(projectFromUrl);
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
    fetchTasks(selectedProject);
  }, [pageKey, selectedProject, location.search, fetchTasks]);

  /* Load employees when edit modal project changes */
  useEffect(() => {
    if (!showEditModal || !editingTaskUuid) return;
    setLoadingEditTask(true);
    const loadTask = async () => {
      const task = await fetchTaskById(editingTaskUuid);
      if (task) {
        setTaskUpdateForm({
          project_id: task.project_uuid || '',
          module_name: task.module !== '—' ? task.module : '',
          task_name: task.name,
          description: task.description,
          status: task.status || '',
          start_date: task.startDate || '',
          due_date: task.dueDate !== '—' ? (task.dueDate || '') : '',
          estimated_hours: task.estimatedHours || '',
          progress: task.progress || 0,
          priority: task.priority || '',
          attachments: task.attachments || [],
        });
      }
      setLoadingEditTask(false);
    };
    loadTask();
  }, [showEditModal, editingTaskUuid]);

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
    if (['overview', 'board', 'completed', 'pending', 'cancelled', 'today', 'new'].includes(pageKey)) {
      const routeBase = pageKey === 'overview' ? '/admin/tasks' : `/admin/tasks/${pageKey}`;
      const nextPath = `${routeBase}${projectUuid ? `?project=${encodeURIComponent(projectUuid)}` : ''}`;
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
    setUpdateError('');
    setUpdateSuccess('');
    setUpdateTaskFile(null);
    setTaskUpdateForm(EMPTY_TASK_FORM);
    setEditingTaskUuid(taskUuid);
    setShowEditModal(true);
    // close view modal if open
    setIsTaskModalOpen(false);
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

      let payload = { ...taskForm };

      // Convert file to base64 and attach as JSON fields
      if (taskFile) {
        const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
        if (taskFile.size > MAX_SIZE) {
          setSavingTask(false);
          return setTaskError('File too large. Maximum allowed size is 50 MB.');
        }
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(taskFile);
        });
        payload.attachmentBase64 = base64;
        payload.attachmentName = taskFile.name;
        payload.attachmentType = taskFile.type;
      }

      const { data } = await api.post('/tasks', payload);
      if (data.success === false) {
        setTaskError(data.message || 'Failed to save task.');
      } else {
        setTaskSuccess(data.message || 'Task created successfully!');
        setTaskForm(EMPTY_TASK_FORM);
        setTaskFile(null);
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

  const handleUpdateTask = async () => {
    setUpdateError('');
    setUpdateSuccess('');
    if (!taskUpdateForm.project_id) return setUpdateError('Please select a project.');
    if (!taskUpdateForm.task_name.trim()) return setUpdateError('Task name is required.');

    try {
      setUpdatingTask(true);
      let payload = { ...taskUpdateForm };

      // Convert file to base64 and attach as JSON fields
      if (updateTaskFile) {
        const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
        if (updateTaskFile.size > MAX_SIZE) {
          setUpdatingTask(false);
          return setUpdateError('File too large. Maximum allowed size is 50 MB.');
        }
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(updateTaskFile);
        });
        payload.attachmentBase64 = base64;
        payload.attachmentName = updateTaskFile.name;
        payload.attachmentType = updateTaskFile.type;
      }

      const { data } = await api.put(`/tasks/${editingTaskUuid}`, payload);
      if (data.success === false) {
        setUpdateError(data.message || 'Failed to update task.');
      } else {
        setUpdateSuccess(data.message || 'Task updated successfully!');
        await fetchTasks(selectedProject || '');
        // Close modal after brief success flash
        setTimeout(() => {
          setShowEditModal(false);
          setUpdateSuccess('');
          setEditingTaskUuid('');
          setUpdateTaskFile(null);
        }, 1500);
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

      // Attach document as base64 if provided
      if (assignFile) {
        const MAX_SIZE = 50 * 1024 * 1024;
        if (assignFile.size > MAX_SIZE) {
          setAssigningTask(false);
          return setAssignError('File too large. Maximum 50 MB allowed.');
        }
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(assignFile);
        });
        payload.attachmentBase64 = base64;
        payload.attachmentName = assignFile.name;
        payload.attachmentType = assignFile.type;
      }

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
          setAssignFile(null);
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
    let baseTasks = selectedProject
      ? tasksList.filter((task) => task.project_uuid === selectedProject)
      : tasksList;

    if (pageKey === "completed") baseTasks = baseTasks.filter((task) => task.status === "Completed");
    else if (pageKey === "pending") baseTasks = baseTasks.filter((task) => !['Completed', 'Cancelled'].includes(task.status));
    else if (pageKey === "cancelled") baseTasks = baseTasks.filter((task) => task.status === "Cancelled");
    else if (pageKey === "today") baseTasks = baseTasks.filter((task) => isSameDay(task.dueDate) || isSameDay(task.startDate));
    else if (pageKey === "new") baseTasks = baseTasks.filter((task) => isSameDay(task.createdAt));

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      baseTasks = baseTasks.filter((t) =>
        (t.name || '').toLowerCase().includes(q) ||
        (t.project || '').toLowerCase().includes(q) ||
        (t.assignedTo || '').toLowerCase().includes(q) ||
        (t.module || '').toLowerCase().includes(q)
      );
    }

    // Apply status filter
    if (statusFilter) {
      baseTasks = baseTasks.filter((t) => t.status === statusFilter);
    }

    return baseTasks;
  }, [pageKey, selectedProject, tasksList, search, statusFilter]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <ClipboardList size={22} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{tabs.find((tab) => tab.key === pageKey)?.label || "Tasks"}</h1>
            <p className="text-white/40 text-xs mt-0.5">{tasksLoading ? 'Loading…' : `${visibleTasks.length} task${visibleTasks.length !== 1 ? 's' : ''} total`}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pageKey !== 'completed' && pageKey !== 'cancelled' && (
            <button
              type="button"
              id="btn-assign-task"
              onClick={() => navigate('/admin/tasks/assign')}
               className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
            >
              <UserPlus size={15} /> Task Assign
            </button>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: visibleTasks.length, icon: ClipboardList, bg: 'bg-blue-500/10 border border-blue-500/20', cls: 'text-blue-500' },
          { label: 'In Progress', value: visibleTasks.filter((t) => t.status === "In Progress").length, icon: Edit3, bg: 'bg-emerald-500/10 border border-emerald-500/20', cls: 'text-emerald-500' },
          { label: 'Completed', value: visibleTasks.filter((t) => t.status === "Completed").length, icon: CheckCircle, bg: 'bg-purple-500/10 border border-purple-500/20', cls: 'text-purple-500' },
          { label: 'Pending', value: visibleTasks.filter((t) => t.status === "Pending").length, icon: AlertCircle, bg: 'bg-orange-500/10 border border-orange-500/20', cls: 'text-orange-500' }
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#111318] border border-white/10 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.02] transition">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={18} className={s.cls} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-white/50 text-xs">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Action message banner ── */}
      {taskActionMessage && (
        <div className="rounded-3xl border border-white/10 bg-emerald-500/10 p-4 text-sm text-emerald-200 flex items-center gap-2">
          <CheckCircle size={16} />
          {taskActionMessage}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Left: Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search tasks, projects, assignees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111318] border border-white/10 text-white text-sm rounded-xl pl-10 pr-9 py-2.5 outline-none focus:border-orange-500/50 transition placeholder:text-white/20"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right: Status filter + Project filter + View toggle */}
        <div className="flex items-center gap-2">
          <div className="min-w-[150px]">
            <Select
              value={statusFilter ? { value: statusFilter, label: statusFilter } : null}
              onChange={option => setStatusFilter(option ? option.value : '')}
              options={['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'].map(s => ({ value: s, label: s }))}
              placeholder="All Statuses"
              styles={customSelectStyles}
              isSearchable={false}
              isClearable
            />
          </div>

          {['overview', 'board', 'completed'].includes(pageKey) && (
            <div className="min-w-[160px]">
              <Select
                value={selectedProject ? { value: selectedProject, label: availableTaskProjects.find(p => p.uuid === selectedProject)?.name || selectedProject } : null}
                onChange={option => handleProjectChange(option ? option.value : '')}
                options={availableTaskProjects.map(p => ({ value: p.uuid, label: p.name }))}
                placeholder="All Projects"
                styles={customSelectStyles}
                isSearchable={false}
                isClearable
              />
            </div>
          )}

          {/* View mode toggle */}
          <div className="flex bg-[#111318] border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'}`}
              title="Table view"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'}`}
              title="Card view"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Task Modal placeholder (rendered via portal below) ── */}

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

      {/* ── Tasks Table View ── */}
      {pageKey !== "board" && pageKey !== "update" && viewMode === 'table' && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Task</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Project</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Assigned To</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Status</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Progress</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Due Date</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasksLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-white/40">
                      <div className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin text-orange-500/70" /> Loading tasks...</div>
                    </td>
                  </tr>
                ) : visibleTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-white/30">
                      <div className="flex flex-col items-center gap-3">
                        <ClipboardList size={30} className="opacity-40" />
                        <p className="text-base font-semibold text-white/40">No tasks found</p>
                        {(search || statusFilter) && <p className="text-xs text-white/25">Try adjusting your filters</p>}
                      </div>
                    </td>
                  </tr>
                ) : visibleTasks.map((task, index) => (
                  <tr key={task.id} className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0 bg-white/5 text-white/40 border border-white/10">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm leading-tight">{task.name}</div>
                          {task.module && task.module !== "—" && (
                            <p className="text-white/35 text-xs mt-0.5">{task.module}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-white/60 text-xs">{task.project}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-white/50 text-xs flex items-center gap-1.5"><User size={10} className="text-white/25 shrink-0" /> {task.assignedTo}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[task.status] || 'bg-slate-600 text-slate-100'}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getProgressColor(task.status, getEffectiveProgress(task))}`}
                            style={{ width: `${getEffectiveProgress(task)}%` }}
                          />
                        </div>
                        <span className="text-white/50 text-xs">{getEffectiveProgress(task)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-white/35 text-xs">{task.dueDate}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button type="button" onClick={() => handleViewTask(task.uuid)} title="View task" aria-label="View task"
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition">
                          <Eye size={13} />
                        </button>
                        {pageKey === 'today' && (
                          <button type="button" onClick={() => handleEditTask(task.uuid)} title="Edit task" aria-label="Edit task"
                            className="w-7 h-7 rounded-lg bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 border border-transparent hover:border-orange-500/30 flex items-center justify-center transition">
                            <Edit3 size={13} />
                          </button>
                        )}
                        <button type="button" onClick={() => handleDeleteTask(task.uuid)} title="Delete task" aria-label="Delete task"
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition">
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
      )}

      {/* ── Tasks Card (Grid) View ── */}
      {pageKey !== "board" && pageKey !== "update" && viewMode === 'grid' && (
        <>
          {tasksLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={30} className="animate-spin text-orange-500/70" />
                <p className="text-sm text-white/40">Loading tasks…</p>
              </div>
            </div>
          ) : visibleTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/30">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <ClipboardList size={30} className="opacity-40" />
              </div>
              <p className="text-base font-semibold text-white/40">No tasks found</p>
              {(search || statusFilter) && <p className="text-xs mt-1 text-white/25">Try adjusting your filters</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {visibleTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-[10px] font-bold bg-orange-500/10 border border-orange-500/20 text-orange-400">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm leading-tight truncate">{task.name}</p>
                        {task.module && task.module !== "—" && (
                          <p className="text-white/35 text-xs mt-0.5 truncate">{task.module}</p>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[task.status] || 'bg-slate-600 text-slate-100'}`}>
                      {task.status}
                    </span>
                  </div>

                  {/* Project & Assigned To */}
                  <div className="space-y-1.5">
                    <p className="text-white/40 text-xs truncate">📁 {task.project}</p>
                    <p className="text-white/40 text-xs flex items-center gap-1.5"><User size={10} className="shrink-0" /> {task.assignedTo}</p>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs text-white/40 mb-1.5">
                      <span>Progress</span><span>{getEffectiveProgress(task)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(task.status, getEffectiveProgress(task))}`}
                        style={{ width: `${getEffectiveProgress(task)}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
                    <span className="text-white/35 text-xs">{task.dueDate !== '—' ? `Due: ${task.dueDate}` : 'No due date'}</span>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleViewTask(task.uuid)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 flex items-center justify-center transition">
                        <Eye size={13} />
                      </button>
                      {pageKey === 'today' && (
                        <button onClick={() => handleEditTask(task.uuid)}
                          className="w-7 h-7 rounded-lg bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 flex items-center justify-center transition">
                          <Edit3 size={13} />
                        </button>
                      )}
                      <button onClick={() => handleDeleteTask(task.uuid)}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 flex items-center justify-center transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
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
          <div className="flex flex-col gap-5">
            {/* Header Section */}
            <div className="flex flex-col gap-2 p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/90 border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
              
              <div className="flex justify-between items-start z-10">
                <div className="space-y-1 pr-4">
                  <p className="text-xs uppercase tracking-widest text-primary/80 font-semibold">{selectedTaskDetails.project}</p>
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">{selectedTaskDetails.name}</h3>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold border ${
                  selectedTaskDetails.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  selectedTaskDetails.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  selectedTaskDetails.status === 'Issue' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  'bg-orange-500/10 text-orange-400 border-orange-500/20'
                }`}>
                  {selectedTaskDetails.status}
                </span>
              </div>
            </div>

            {/* Grid details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Assigned To</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-200">{selectedTaskDetails.assignedTo}</p>
                  <p className="text-xs text-slate-500 mt-1">By: {selectedTaskDetails.assignedBy}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Due Date</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-200">{selectedTaskDetails.dueDate || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-colors">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Flag size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Priority</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-200">{selectedTaskDetails.priority}</p>
                </div>
              </div>

              <div className="flex flex-col justify-center p-4 rounded-2xl bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-colors">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Progress</p>
                  <span className="text-xs font-bold text-emerald-400">{selectedTaskDetails.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 relative"
                    style={{ width: `${selectedTaskDetails.progress}%` }}
                  >
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-5 rounded-2xl bg-slate-800/40 border border-white/5 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <FileText size={16} />
                <p className="text-xs uppercase tracking-widest font-semibold">Description</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedTaskDetails.description || 'No description provided.'}
              </p>
            </div>

            {/* Cancel/Issue Reasons */}
            {selectedTaskDetails.cancelReason && (
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-rose-400 mb-1">
                  <AlertCircle size={16} />
                  <p className="text-xs uppercase tracking-widest font-semibold">Cancellation Reason</p>
                </div>
                <p className="text-sm text-rose-200 leading-relaxed whitespace-pre-wrap">
                  {selectedTaskDetails.cancelReason}
                </p>
              </div>
            )}
            
            {selectedTaskDetails.issueReason && (
              <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-400 mb-1">
                  <AlertTriangle size={16} />
                  <p className="text-xs uppercase tracking-widest font-semibold">Issue Details</p>
                </div>
                <p className="text-sm text-red-200 leading-relaxed whitespace-pre-wrap">
                  {selectedTaskDetails.issueReason}
                </p>
                {selectedTaskDetails.attachments?.filter(a => a.original_name?.startsWith('IssueDoc_')).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-red-500/20">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-red-400/70 mb-2">Issue Documents</p>
                    <div className="flex flex-col gap-2">
                      {selectedTaskDetails.attachments.filter(a => a.original_name?.startsWith('IssueDoc_')).map((att, i) => (
                        <a
                          key={i}
                          href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${att.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-xs hover:bg-red-500/10 transition-colors"
                        >
                          <Paperclip size={14} className="flex-shrink-0" />
                          <span className="truncate">{att.original_name.replace('IssueDoc_', '')}</span>
                          <Download size={14} className="ml-auto flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* General Attachments */}
            {selectedTaskDetails.attachments && selectedTaskDetails.attachments.filter(a => !a.original_name?.startsWith('IssueDoc_')).length > 0 && (
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-white/5 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-slate-400 mb-1">
                  <Paperclip size={16} />
                  <p className="text-xs uppercase tracking-widest font-semibold">Attachments</p>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  {selectedTaskDetails.attachments.filter(a => !a.original_name?.startsWith('IssueDoc_')).map((att, i) => (
                    <a
                      key={i}
                      href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${att.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 text-slate-300 text-sm hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary text-slate-400">
                        <Paperclip size={14} />
                      </div>
                      <span className="flex-1 truncate">{att.original_name}</span>
                      <Download size={16} className="text-slate-500 group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ════════════════════════════════════════════════
          MODAL: Edit Task
      ════════════════════════════════════════════════ */}
      <Modal
        open={showEditModal}
        onClose={() => { setShowEditModal(false); setUpdateError(''); setUpdateSuccess(''); setEditingTaskUuid(''); setUpdateTaskFile(null); }}
        title="Edit Task"
        subtitle="Update task details and save your changes."
        icon={Edit3}
        iconColor="text-blue-400"
        footer={
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleUpdateTask} disabled={updatingTask || loadingEditTask}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60">
              {updatingTask ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : <><CheckCircle size={14} /> Update Task</>}
            </button>
            <button type="button" onClick={() => { setShowEditModal(false); setUpdateError(''); setUpdateSuccess(''); setUpdateTaskFile(null); }}
              className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-2.5 text-sm text-slate-300 hover:border-white/20 transition">
              Cancel
            </button>
            {updateError && (
              <span className="flex items-center gap-1.5 text-sm text-rose-400 ml-1">
                <AlertCircle size={14} />{updateError}
              </span>
            )}
            {updateSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-400 ml-1">
                <CheckCircle size={14} />{updateSuccess}
              </span>
            )}
          </div>
        }
      >
        {loadingEditTask ? (
          <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
            <Loader2 size={20} className="animate-spin" /> Loading task details...
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldBox label="Project *">
              <Select
                value={taskUpdateForm.project_id ? { value: taskUpdateForm.project_id, label: projects.find(p => p.uuid === taskUpdateForm.project_id)?.project_name || taskUpdateForm.project_id } : null}
                onChange={option => setTaskUpdateForm(p => ({ ...p, project_id: option ? option.value : '' }))}
                options={projects.map(p => ({ value: p.uuid, label: p.project_name || p.short_name || p.project_code }))}
                placeholder="Select project"
                styles={customSelectStyles}
                isSearchable={false}
              />
            </FieldBox>
            <FieldBox label="Module">
              <input value={taskUpdateForm.module_name} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, module_name: e.target.value }))} className={inputCls} placeholder="e.g. Authentication" />
            </FieldBox>
            <FieldBox label="Task Name *">
              <input value={taskUpdateForm.task_name} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, task_name: e.target.value }))} className={inputCls} placeholder="Enter task name" />
            </FieldBox>
            <FieldBox label="Priority">
              <Select
                value={taskUpdateForm.priority ? { value: taskUpdateForm.priority, label: taskUpdateForm.priority } : null}
                onChange={option => setTaskUpdateForm(p => ({ ...p, priority: option ? option.value : '' }))}
                options={['Low', 'Medium', 'High', 'Critical'].map(v => ({ value: v, label: v }))}
                placeholder="Select priority"
                styles={customSelectStyles}
                isSearchable={false}
              />
            </FieldBox>
            <FieldBox label="Status">
              <Select
                value={taskUpdateForm.status ? { value: taskUpdateForm.status, label: taskUpdateForm.status } : null}
                onChange={option => setTaskUpdateForm(p => ({ ...p, status: option ? option.value : '' }))}
                options={['Pending', 'To Do', 'In Progress', 'Review', 'Testing', 'Completed', 'On Hold', 'Cancelled'].map(v => ({ value: v, label: v }))}
                placeholder="Select status"
                styles={customSelectStyles}
                isSearchable={false}
              />
            </FieldBox>
            <FieldBox label="Progress (%)">
              <input type="number" min="0" max="100" value={taskUpdateForm.progress} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, progress: e.target.value }))} className={inputCls} placeholder="e.g. 50" />
            </FieldBox>
            <FieldBox label="Start Date">
              <input type="date" value={taskUpdateForm.start_date} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, start_date: e.target.value }))} className={inputCls} />
            </FieldBox>
            <FieldBox label="Due Date">
              <input type="date" value={taskUpdateForm.due_date} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, due_date: e.target.value }))} className={inputCls} />
            </FieldBox>
            <FieldBox label="Estimated Hours">
              <input type="number" min="0" value={taskUpdateForm.estimated_hours} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, estimated_hours: e.target.value }))} className={inputCls} placeholder="e.g. 8" />
            </FieldBox>
            <div className="sm:col-span-2">
              <FieldBox label="Description">
                <textarea value={taskUpdateForm.description} onChange={(e) => setTaskUpdateForm((p) => ({ ...p, description: e.target.value }))} rows={4} className={inputCls + ' resize-none'} placeholder="Enter task description..." />
              </FieldBox>
            </div>
            <div className="sm:col-span-2">
              <FieldBox label="Attachments">
                {taskUpdateForm.attachments && taskUpdateForm.attachments.length > 0 && (
                  <div className="mb-4 flex flex-col gap-2">
                    {taskUpdateForm.attachments.map((att, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 14px', borderRadius: '10px',
                          border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.04)',
                          color: '#94a3b8', fontSize: '13px',
                        }}
                      >
                        <Paperclip size={14} style={{ color: '#f97316', flexShrink: 0 }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{att.original_name}</span>
                        <button
                          type="button"
                          title="Remove attachment"
                          onClick={() => {
                            const newAtts = [...taskUpdateForm.attachments];
                            newAtts.splice(i, 1);
                            setTaskUpdateForm((p) => ({ ...p, attachments: newAtts }));
                          }}
                          style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244,63,94,0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <label
                  htmlFor="edit-task-file-upload"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                    border: '2px dashed rgba(255,255,255,0.12)', borderRadius: '12px',
                    padding: '14px 16px', transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(251,146,60,0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                >
                  <Paperclip size={18} style={{ color: '#f97316', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: updateTaskFile ? '#e2e8f0' : '#64748b' }}>
                    {updateTaskFile ? updateTaskFile.name : 'Click to choose a file...'}
                  </span>
                  {updateTaskFile && (
                    <button type="button" onClick={(e) => { e.preventDefault(); setUpdateTaskFile(null); }}
                      style={{ marginLeft: 'auto', color: '#f43f5e', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Remove
                    </button>
                  )}
                </label>
                <input
                  id="edit-task-file-upload"
                  type="file"
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg"
                  onChange={(e) => setUpdateTaskFile(e.target.files[0] || null)}
                />
              </FieldBox>
            </div>
          </div>
        )}
      </Modal>

      {/* ════════════════════════════════════════════════
          MODAL: Add New Task
      ════════════════════════════════════════════════ */}
      <Modal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setTaskError(''); setTaskSuccess(''); setTaskFile(null); }}
        title="Create New Task"
        subtitle="Fill in the details below to create a new task."
        icon={Plus}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
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
            <Select
              value={taskForm.project_id ? { value: taskForm.project_id, label: projects.find(p => p.uuid === taskForm.project_id)?.project_name || taskForm.project_id } : null}
              onChange={option => setTaskForm(p => ({ ...p, project_id: option ? option.value : '' }))}
              options={projects.map(p => ({ value: p.uuid, label: p.project_name || p.short_name || p.project_code }))}
              placeholder="Select project"
              styles={customSelectStyles}
              isSearchable={false}
            />
          </FieldBox>
          <FieldBox label="Module">
            <input value={taskForm.module_name} onChange={(e) => setTaskForm((p) => ({ ...p, module_name: e.target.value }))} className={inputCls} placeholder="e.g. Authentication" />
          </FieldBox>
          <FieldBox label="Task Name *">
            <input value={taskForm.task_name} onChange={(e) => setTaskForm((p) => ({ ...p, task_name: e.target.value }))} className={inputCls} placeholder="Enter task name" />
          </FieldBox>
          <FieldBox label="Priority">
            <Select
              value={taskForm.priority ? { value: taskForm.priority, label: taskForm.priority } : null}
              onChange={option => setTaskForm(p => ({ ...p, priority: option ? option.value : '' }))}
              options={['Low', 'Medium', 'High', 'Critical'].map(v => ({ value: v, label: v }))}
              placeholder="Select priority"
              styles={customSelectStyles}
              isSearchable={false}
            />
          </FieldBox>
          <FieldBox label="Status">
            <Select
              value={taskForm.status ? { value: taskForm.status, label: taskForm.status } : null}
              onChange={option => setTaskForm(p => ({ ...p, status: option ? option.value : '' }))}
              options={['Pending', 'To Do', 'In Progress', 'Review', 'Testing', 'Completed', 'On Hold', 'Cancelled'].map(v => ({ value: v, label: v }))}
              placeholder="Select status"
              styles={customSelectStyles}
              isSearchable={false}
            />
          </FieldBox>
          <FieldBox label="Progress (%)">
            <input type="number" min="0" max="100" value={taskForm.progress} onChange={(e) => setTaskForm((p) => ({ ...p, progress: e.target.value }))} className={inputCls} placeholder="e.g. 50" />
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
          <div className="sm:col-span-2">
            <FieldBox label="Description">
              <textarea value={taskForm.description} onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={inputCls + ' resize-none'} placeholder="Brief description of the task..." />
            </FieldBox>
          </div>
          <div className="sm:col-span-2">
            <FieldBox label="Attachment (PDF, Word, Excel, etc.)">
              <label
                htmlFor="task-file-upload"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                  border: '2px dashed rgba(255,255,255,0.12)', borderRadius: '12px',
                  padding: '14px 16px', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(251,146,60,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
              >
                <Paperclip size={18} style={{ color: '#f97316', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: taskFile ? '#e2e8f0' : '#64748b' }}>
                  {taskFile ? taskFile.name : 'Click to choose a file...'}
                </span>
                {taskFile && (
                  <button type="button" onClick={(e) => { e.preventDefault(); setTaskFile(null); }}
                    style={{ marginLeft: 'auto', color: '#f43f5e', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Remove
                  </button>
                )}
              </label>
              <input
                id="task-file-upload"
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg"
                onChange={(e) => setTaskFile(e.target.files[0] || null)}
              />
            </FieldBox>
          </div>
        </div>
      </Modal>

      {/* ════════════════════════════════════════════════
          MODAL: Assign Task
      ════════════════════════════════════════════════ */}
      <Modal
        open={showAssignModal}
        onClose={() => { setShowAssignModal(false); setAssignError(''); setAssignSuccess(''); setAssignFile(null); }}
        title="Assign Task to Employee"
        subtitle="Select a project, pick a task and assign it to an employee."
        icon={UserPlus}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-3">
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
            <Select
              value={assignForm.project_id ? { value: assignForm.project_id, label: projects.find(p => p.uuid === assignForm.project_id)?.project_name || assignForm.project_id } : null}
              onChange={option => setAssignForm(p => ({ ...p, project_id: option ? option.value : '', task_uuid: '', assigned_to: '' }))}
              options={projects.map(p => ({ value: p.uuid, label: p.project_name || p.short_name || p.project_code }))}
              placeholder="Select project"
              styles={customSelectStyles}
              isSearchable={false}
            />
          </FieldBox>

          <FieldBox label="Task *">
            <Select
              value={assignForm.task_uuid ? { value: assignForm.task_uuid, label: tasksList.find(t => t.uuid === assignForm.task_uuid)?.name || assignForm.task_uuid } : null}
              onChange={option => setAssignForm(p => ({ ...p, task_uuid: option ? option.value : '' }))}
              options={tasksList
                .filter((task) => (task.assignedTo === 'Unassigned' || !task.assigned_to_raw) && task.status === 'Pending')
                .map((task) => ({ value: task.uuid, label: task.name || task.module || task.uuid }))}
              placeholder={assignForm.project_id ? 'Select task' : 'Select a project first'}
              isDisabled={!assignForm.project_id}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </FieldBox>

          <FieldBox label="Assign To Employee *">
            <Select
              value={assignForm.assigned_to ? {
                value: assignForm.assigned_to,
                label: assignedEmployees.find(e => e.employee_id === assignForm.assigned_to)
                  ? `${assignedEmployees.find(e => e.employee_id === assignForm.assigned_to).first_name || ''} ${assignedEmployees.find(e => e.employee_id === assignForm.assigned_to).last_name || ''}`.trim() || assignForm.assigned_to
                  : assignForm.assigned_to
              } : null}
              onChange={option => setAssignForm(p => ({ ...p, assigned_to: option ? option.value : '' }))}
              options={assignedEmployees.map((employee) => ({
                value: employee.employee_id,
                label: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.employee_id
              }))}
              placeholder={projectEmployeesLoading ? 'Loading employees…' : assignForm.project_id ? 'Select employee' : 'Select a project first'}
              isDisabled={!assignForm.project_id || projectEmployeesLoading}
              styles={customSelectStyles}
              isSearchable={false}
            />
          </FieldBox>

          <FieldBox label="Team / Department">
            <input value={assignForm.team} onChange={(e) => setAssignForm((p) => ({ ...p, team: e.target.value }))} className={inputCls} placeholder="e.g. Frontend, Backend" />
          </FieldBox>

          <FieldBox label="Assignment Date">
            <input type="date" value={assignForm.assignment_date} onChange={(e) => setAssignForm((p) => ({ ...p, assignment_date: e.target.value }))} className={inputCls} />
          </FieldBox>

          <FieldBox label="Status">
            <Select
              value={assignForm.status ? { value: assignForm.status, label: assignForm.status } : null}
              onChange={option => setAssignForm(p => ({ ...p, status: option ? option.value : '' }))}
              options={['Pending', 'To Do', 'In Progress', 'Review', 'Testing', 'Completed', 'On Hold', 'Cancelled'].map(v => ({ value: v, label: v }))}
              placeholder="Select status"
              styles={customSelectStyles}
              isSearchable={false}
            />
          </FieldBox>

          <div className="sm:col-span-2">
            <FieldBox label="Attachment (PDF, Word, Excel, etc.)">
              <label
                htmlFor="assign-file-upload"
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                  border: '2px dashed rgba(255,255,255,0.12)', borderRadius: '12px',
                  padding: '14px 16px', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(251,146,60,0.5)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
              >
                <Paperclip size={18} style={{ color: '#f97316', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: assignFile ? '#e2e8f0' : '#64748b' }}>
                  {assignFile ? assignFile.name : 'Click to attach a document...'}
                </span>
                {assignFile && (
                  <button type="button" onClick={(e) => { e.preventDefault(); setAssignFile(null); }}
                    style={{ marginLeft: 'auto', color: '#f43f5e', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Remove
                  </button>
                )}
              </label>
              <input
                id="assign-file-upload"
                type="file"
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg"
                onChange={(e) => setAssignFile(e.target.files[0] || null)}
              />
            </FieldBox>
          </div>
        </div>
      </Modal>
    </div>
  );
}
