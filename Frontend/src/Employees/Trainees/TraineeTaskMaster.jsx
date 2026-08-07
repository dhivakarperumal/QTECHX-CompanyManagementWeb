import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { useAuth } from '../../PrivateRouter/AuthContext';

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
import api from '../../api';
import { Toaster, toast } from 'react-hot-toast';
import { CheckSquare, Plus, Edit2, Trash2, Loader2, Save, X, Search, UploadCloud, LayoutGrid, List } from 'lucide-react';
import ModalPortal from '../../Componets/CommonComponents/ModalPortal';

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-10000 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#111318] p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">{title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </ModalPortal>
  );
}

const TraineeTaskMaster = () => {
  const { user } = useAuth();
  const employeeId = user?.employee_id || user?.employeeId || user?.user_id || user?.id || user?.uuid || '';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [taskDocument, setTaskDocument] = useState(null);
  const [editingUuid, setEditingUuid] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('card');
  const [taskSearch, setTaskSearch] = useState('');
  const [taskViewMode, setTaskViewMode] = useState("table");

  const [trainees, setTrainees] = useState([]);

  const fetchTrainees = async () => {
    try {
      const params = new URLSearchParams();
      if (employeeId) params.append('employee_id', employeeId);
      const response = await api.get(`/trainee-intern${params.toString() ? `?${params.toString()}` : ''}`);
      setTrainees(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching trainees:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/trainee-tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching trainee tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchTrainees();
  }, [employeeId]);

  const getDocumentUrl = (documentPath) => {
    if (!documentPath) return null;
    if (documentPath.startsWith('http://') || documentPath.startsWith('https://')) return documentPath;
    const rawBase = import.meta.env.VITE_API_URL || '';
    const baseUrl = rawBase.startsWith('http') ? rawBase.replace(/\/api\/?$/, '') : 'http://localhost:5000';
    return `${baseUrl}${documentPath}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName) {
      toast.error('Task name is required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('task_name', taskName);
      formData.append('description', description || '');
      if (taskDocument) {
        formData.append('task_document', taskDocument);
      }

      if (editingUuid) {
        await api.put(`/trainee-tasks/${editingUuid}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Task updated successfully');
      } else {
        await api.post('/trainee-tasks', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Task created successfully');
      }
      resetForm();
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingUuid(task.uuid);
    setTaskName(task.task_name);
    setDescription(task.description || '');
    setShowForm(true);
  };

  const handleDelete = async (uuid) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/trainee-tasks/${uuid}`);
        toast.success('Task deleted successfully');
        fetchTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  const resetForm = () => {
    setEditingUuid(null);
    setTaskName('');
    setDescription('');
    setTaskDocument(null);
    setShowForm(false);
  };

  const filteredTrainees = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return trainees.filter((trainee) => {
      if (!term) return true;
      const haystack = `${trainee.full_name || ''} ${trainee.type || ''} ${trainee.person_id || ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [trainees, searchTerm]);

  const filteredTasks = useMemo(() => {
    const term = taskSearch.trim().toLowerCase();
    return tasks.filter((task) => {
      if (!term) return true;
      const haystack = `${task.task_name || ''} ${task.description || ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [tasks, taskSearch]);

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">
      <Toaster position="top-right" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <CheckSquare size={22} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Trainee Task Master</h1>
            <p className="text-white/40 text-xs mt-0.5">Manage predefined tasks for trainees & interns</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
        >
          <Plus size={15} /> Add Task
        </button>
      </div>
    </div>

      {/* Trainee Cards Section */}
      <div className="mb-8 mt-2">
        <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold text-white">Trainees & Interns</h2>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">

              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search trainee"
                  className="w-56 rounded-xl border border-white/10 bg-white/4 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-orange-500/50"
                />
              </div>



            </div>
            <Select
              options={[
                { value: 'All', label: 'All Types' },
                { value: 'Trainee', label: 'Trainee' },
                { value: 'Intern', label: 'Intern' }
              ]}
              value={{ value: typeFilter, label: typeFilter === 'All' ? 'All Types' : typeFilter }}
              onChange={(option) => setTypeFilter(option ? option.value : 'All')}
              styles={customSelectStyles}
              isSearchable={false}
              className="w-40"
            />
            <div className="flex items-center rounded-xl border border-white/10 bg-white/4 p-1">
              <button onClick={() => setViewMode('table')} className={`rounded-lg p-2 transition ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`} title="Table view"><List size={14} /></button>
              <button onClick={() => setViewMode('card')} className={`rounded-lg p-2 transition ${viewMode === 'card' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`} title="Card view"><LayoutGrid size={14} /></button>
            </div>
          </div>
        </div>

        {filteredTrainees.filter(t => typeFilter === 'All' || t.type === typeFilter).length === 0 ? (
          <div className="text-white/40 text-sm">No trainees found matching this filter.</div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/4 text-white/60">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Person ID</th>
                  <th className="px-4 py-3 text-left">Department</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrainees.filter(t => typeFilter === 'All' || t.type === typeFilter).map(trainee => (
                  <tr key={trainee.uuid} onClick={() =>
                    (window.location.hash = `/admin/trainees/tasks/view/${trainee.uuid}`)
                  } className="border-t border-white/10 hover:bg-white/2">
                    <td className="px-4 py-3 font-semibold text-white">{trainee.full_name}</td>
                    <td className="px-4 py-3 text-white/70">{trainee.type || 'Trainee'}</td>
                    <td className="px-4 py-3 text-white/70">{trainee.person_id || '—'}</td>
                    <td className="px-4 py-3 text-white/70">{trainee.department || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTrainees.filter(t => typeFilter === 'All' || t.type === typeFilter).map(trainee => (
              <a
                key={trainee.uuid}
                href={`#/admin/trainees/tasks/view/${trainee.uuid}`}
                className="group flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-[#111318] hover:bg-white/5 transition-all hover:border-orange-500/30 cursor-pointer"
              >
                {trainee.profile_photo ? (
                  <img
                    src={`http://localhost:5000/${trainee.profile_photo.replace(/\\/g, '/')}`}
                    alt={trainee.full_name}
                    className="w-12 h-12 rounded-full object-cover border border-white/10 group-hover:border-orange-500/50 transition-colors"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-sm font-semibold text-white/70 group-hover:border-orange-500/50 transition-colors">
                    {trainee.full_name?.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-white truncate group-hover:text-orange-400 transition-colors">{trainee.full_name}</h3>
                  <p className="text-xs text-white/50">{trainee.type || 'Trainee'}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-lg font-semibold text-white">Predefined Tasks</h2>
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)} placeholder="Search task" className="w-56 rounded-xl border border-white/10 bg-white/4 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-orange-500/50" />
        </div>
        <div className="flex items-center rounded-xl border border-white/10 bg-white/4 p-1">
          <button
            onClick={() => setTaskViewMode("table")}
            className={`rounded-lg p-2 transition ${taskViewMode === "table"
              ? "bg-orange-500 text-white"
              : "text-white/50 hover:text-white"
              }`}
          >
            <List size={15} />
          </button>

          <button
            onClick={() => setTaskViewMode("card")}
            className={`rounded-lg p-2 transition ${taskViewMode === "card"
              ? "bg-orange-500 text-white"
              : "text-white/50 hover:text-white"
              }`}
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      <Modal open={showForm} onClose={resetForm} title={editingUuid ? 'Edit Task' : 'Add New Task'}>
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Task Name *</label>
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                placeholder="Enter task name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                rows="4"
                placeholder="Enter task description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Upload Document</label>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-white/15 bg-white/4 px-4 py-3 text-sm text-white/70 transition hover:border-orange-500/50">
                <span className="truncate">{taskDocument ? taskDocument.name : 'Choose a PDF, DOC, image, or ZIP file'}</span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80">
                  <UploadCloud size={14} /> Browse
                </span>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.zip,.rar" onChange={(e) => setTaskDocument(e.target.files?.[0] || null)} />
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
              >
                <Save size={15} /> {editingUuid ? 'Update Task' : 'Save Task'}
              </button>
            </div>
          </form>
        </Modal>

      {taskViewMode === "table" ? (

        <div className="rounded-2xl border border-white/10 bg-[#111318] p-4">
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/4 text-white/60">
                <tr>
                  <th className="px-4 py-4 text-left font-medium">S.No</th>
                  <th className="px-4 py-4 text-left font-medium">Task Name</th>
                  <th className="px-4 py-4 text-left font-medium">Description</th>
                  <th className="px-4 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-white/40">
                      <Loader2 size={18} className="mx-auto animate-spin" />
                    </td>
                  </tr>
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-white/40">No tasks found</td>
                  </tr>
                ) : (
                  filteredTasks.map((task, index) => (
                    <tr key={task.uuid} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-4 text-white/70">{index + 1}</td>
                      <td className="px-4 py-4 font-semibold text-white">{task.task_name}</td>
                      <td className="px-4 py-4 text-white/50">
                        <div className="space-y-1">
                          <div>{task.description || "—"}</div>
                          {task.document_path ? (
                            <a
                              href={getDocumentUrl(task.document_path)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300"
                            >
                              <UploadCloud size={13} /> View Document
                            </a>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(task)}
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10 transition"
                            title="Edit Task"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(task.uuid)}
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                            title="Delete Task"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          {filteredTasks.map((task) => (

            <div
              key={task.uuid}
              className="rounded-2xl border border-white/10 bg-[#111318] p-5 hover:border-orange-500/40 transition"
            >

              <h3 className="text-lg font-semibold text-white">
                {task.task_name}
              </h3>

              <p className="text-white/50 text-sm mt-2 line-clamp-3">
                {task.description || "No description"}
              </p>

              <div className="mt-5 flex items-center justify-between">

                {task.document_path ? (
                  <a
                    href={getDocumentUrl(task.document_path)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm"
                  >
                    <UploadCloud size={14} />
                    View Document
                  </a>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(task.uuid)}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>

            </div>

          ))}

        </div>

      )}
    </div>
  );
};

export default TraineeTaskMaster;
