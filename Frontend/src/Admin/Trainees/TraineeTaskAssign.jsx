import { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { Toaster, toast } from 'react-hot-toast';
import {
  UserCheck,
  Edit2,
  Trash2,
  Eye,
  Loader2,
  Save,
  X,
  Plus,
  Search,
  LayoutGrid,
  List
} from 'lucide-react';
import ModalPortal from '../../Componets/CommonComponents/ModalPortal';


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

const TraineeTaskAssign = () => {
  const [assignments, setAssignments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentTypeFilter, setAssignmentTypeFilter] = useState('All');
  const [assignmentViewMode, setAssignmentViewMode] = useState('table');
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState('');
  const [traineeTypeFilter, setTraineeTypeFilter] = useState('All');
  const [traineeViewMode, setTraineeViewMode] = useState('table');
  const [traineeSearchTerm, setTraineeSearchTerm] = useState('');

  // Form State
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState('');
  const [assignedDate, setAssignedDate] = useState('');
  const [assignedTime, setAssignedTime] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignmentDocument, setAssignmentDocument] = useState(null);

  // Update State (for inline editing)
  const [editingAssignmentUuid, setEditingAssignmentUuid] = useState(null);
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState('Pending');
  const [editDailyReport, setEditDailyReport] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, tasksRes, traineesRes] = await Promise.all([
        api.get('/trainee-task-assignments'),
        api.get('/trainee-tasks'),
        api.get('/trainee-intern')
      ]);
      setAssignments(assignmentsRes.data);
      setTasks(tasksRes.data);
      setTrainees(traineesRes.data.data || traineesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
  }, []);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();

    if (editingAssignmentUuid) {
      // Update existing assignment
      try {
        await api.put(`/trainee-task-assignments/${editingAssignmentUuid}`, {
          progress: editProgress,
          status: editStatus,
          daily_report: editDailyReport,
          due_date: dueDate
        });
        toast.success('Assignment updated successfully');
        resetForm();
        fetchData();
      } catch (error) {
        console.error('Error updating assignment:', error);
        toast.error('Failed to update assignment');
      }
    } else {
      // Create new assignment
      if (!selectedTask || !selectedTrainee || !assignedDate) {
        toast.error('Task, Trainee, and Assigned Date are required');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('trainee_task_uuid', selectedTask);
        formData.append('trainee_intern_uuid', selectedTrainee);
        formData.append('assigned_date', assignedDate);
        formData.append('assigned_time', assignedTime);
        formData.append('due_date', dueDate);
        if (assignmentDocument) {
          formData.append('assignment_document', assignmentDocument);
        }

        await api.post('/trainee-task-assignments', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Task assigned successfully');

        resetForm();
        fetchData(); // Refresh list
      } catch (error) {
        console.error('Error assigning task:', error);
        toast.error('Failed to assign task');
      }
    }
  };

  const handleEditClick = (assignment) => {
    setEditingAssignmentUuid(assignment.uuid);
    setEditProgress(assignment.progress || 0);
    setEditStatus(assignment.status || 'Pending');
    setEditDailyReport(assignment.daily_report || '');
    setDueDate(assignment.due_date ? assignment.due_date.substring(0, 10) : '');

    // For display purposes in the disabled fields
    setSelectedTask(assignment.task_name);
    setSelectedTrainee(assignment.trainee_name);
    setAssignedDate(assignment.assigned_date ? assignment.assigned_date.substring(0, 10) : '');
    setAssignedTime(assignment.assigned_time || '');

    setShowForm(true);
  };

  const handleDelete = async (uuid) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await api.delete(`/trainee-task-assignments/${uuid}`);
        toast.success('Assignment deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting assignment:', error);
        toast.error('Failed to delete assignment');
      }
    }
  };

  const resetForm = () => {
    setSelectedTask('');
    setSelectedTrainee('');
    setAssignedDate('');
    setAssignedTime('');
    setDueDate('');
    setAssignmentDocument(null);
    setEditingAssignmentUuid(null);
    setEditProgress(0);
    setEditStatus('Pending');
    setEditDailyReport('');
    setShowForm(false);
  };

  const openAssignmentDetails = (assignment) => {
    setSelectedAssignment(assignment);
    setDetailsOpen(true);
  };

  const closeAssignmentDetails = () => {
    setSelectedAssignment(null);
    setDetailsOpen(false);
  };

  const getTraineeUuid = (trainee) => trainee?.uuid || trainee?.id || trainee?.person_id || '';

  const filteredTrainees = useMemo(() => {
    const term = traineeSearchTerm.trim().toLowerCase();
    return trainees.filter((trainee) => {
      const matchesType = traineeTypeFilter === 'All' || trainee.type === traineeTypeFilter;
      if (!matchesType) return false;
      if (!term) return true;
      const haystack = `${trainee.full_name || ''} ${trainee.type || ''} ${trainee.person_id || ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [trainees, traineeSearchTerm, traineeTypeFilter]);

  const filteredAssignments = useMemo(() => {
    const term = assignmentSearchTerm.trim().toLowerCase();
    return assignments.filter((assignment) => {
      const matchesType = assignmentTypeFilter === 'All' || assignment.trainee_type === assignmentTypeFilter;
      if (!term) return matchesType;
      const haystack = `${assignment.trainee_name || ''} ${assignment.task_name || ''} ${assignment.status || ''} ${assignment.daily_report || ''}`.toLowerCase();
      return matchesType && haystack.includes(term);
    });
  }, [assignments, assignmentSearchTerm, assignmentTypeFilter]);

  const totalAssignments = assignments.length;
  const pendingAssignments = assignments.filter((assignment) => assignment.status === 'Pending').length;
  const inProgressAssignments = assignments.filter((assignment) => assignment.status === 'In Progress').length;
  const completedAssignments = assignments.filter((assignment) => assignment.status === 'Completed').length;

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">
      <Toaster position="top-right" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <UserCheck size={22} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Assign Tasks</h1>
            <p className="text-white/40 text-xs mt-0.5">Manage task assignments for trainees & interns</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!showForm && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
            >
              <Plus size={15} /> New Assignment
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-[#111318] p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-400">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-sm text-white/50">Total Assignments</p>
              <p className="text-3xl font-semibold text-white">{totalAssignments}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#111318] p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-orange-500/10 p-3 text-orange-400">
              <span className="text-xl font-bold">P</span>
            </div>
            <div>
              <p className="text-sm text-white/50">Pending</p>
              <p className="text-3xl font-semibold text-white">{pendingAssignments}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#111318] p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
              <span className="text-xl font-bold">IP</span>
            </div>
            <div>
              <p className="text-sm text-white/50">In Progress</p>
              <p className="text-3xl font-semibold text-white">{inProgressAssignments}</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-[#111318] p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400">
              <span className="text-xl font-bold">C</span>
            </div>
            <div>
              <p className="text-sm text-white/50">Completed</p>
              <p className="text-3xl font-semibold text-white">{completedAssignments}</p>
            </div>
          </div>
        </div>
      </div>


      <Modal open={showForm} onClose={resetForm} title={editingAssignmentUuid ? "Edit Task Assignment" : "New Task Assignment"}>
        <form onSubmit={handleAssignSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {editingAssignmentUuid ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Task</label>
                  <input type="text" value={selectedTask} disabled className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white/50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Trainee/Intern</label>
                  <input type="text" value={selectedTrainee} disabled className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white/50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Assigned Date</label>
                  <input type="date" value={assignedDate} disabled style={{ colorScheme: 'dark' }} className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white/50 cursor-not-allowed" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Select Task *</label>
                  <Select
                    options={[
                      ...tasks.map(t => ({ value: t.uuid, label: t.task_name }))
                    ]}
                    value={selectedTask ? { value: selectedTask, label: tasks.find(t => t.uuid === selectedTask)?.task_name } : null}
                    onChange={(option) => setSelectedTask(option ? option.value : '')}
                    styles={customSelectStyles}
                    isSearchable={true}
                    placeholder="-- Select Task --"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Select Trainee/Intern *</label>
                  <Select
                    options={[
                      ...trainees.map(t => ({ value: t.uuid, label: `${t.full_name} (${t.type})` }))
                    ]}
                    value={selectedTrainee ? { value: selectedTrainee, label: trainees.find(t => t.uuid === selectedTrainee) ? `${trainees.find(t => t.uuid === selectedTrainee).full_name} (${trainees.find(t => t.uuid === selectedTrainee).type})` : '' } : null}
                    onChange={(option) => setSelectedTrainee(option ? option.value : '')}
                    styles={customSelectStyles}
                    isSearchable={true}
                    placeholder="-- Select Trainee --"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Assigned Date *</label>
                  <input
                    type="date"
                    value={assignedDate}
                    onChange={(e) => setAssignedDate(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Assigned Time</label>
                  <input
                    type="time"
                    value={assignedTime}
                    onChange={(e) => setAssignedTime(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
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
              <Save size={15} /> {editingAssignmentUuid ? 'Update Assignment' : 'Assign Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assignments Table */}
      <div className="rounded-2xl border border-white/10 bg-[#111318] p-4">
        <div className="flex flex-col gap-3 mb-4 px-2 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold text-white">Assigned Tasks</h2>
          <div className="flex flex-wrap items-center gap-2">

            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                value={assignmentSearchTerm}
                onChange={(e) => setAssignmentSearchTerm(e.target.value)}
                placeholder="Search assignment"
                className="w-56 rounded-xl border border-white/10 bg-white/4 py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-orange-500/50"
              />
            </div>

            <Select
              options={[
                { value: 'All', label: 'All Types' },
                { value: 'Trainee', label: 'Trainee' },
                { value: 'Intern', label: 'Intern' }
              ]}
              value={{ value: assignmentTypeFilter, label: assignmentTypeFilter === 'All' ? 'All Types' : assignmentTypeFilter }}
              onChange={(option) => setAssignmentTypeFilter(option ? option.value : 'All')}
              styles={customSelectStyles}
              isSearchable={false}
              className="w-40"
            />
            {/* Card / Table Toggle */}
            <div className="flex items-center rounded-xl border border-white/10 bg-white/4 p-1">
              <button
                onClick={() => setAssignmentViewMode("table")}
                className={`rounded-lg p-2 transition ${assignmentViewMode === "table"
                  ? "bg-orange-500 text-white"
                  : "text-white/50 hover:text-white"
                  }`}
                title="Table View"
              >
                <List size={15} />
              </button>

              <button
                onClick={() => setAssignmentViewMode("card")}
                className={`rounded-lg p-2 transition ${assignmentViewMode === "card"
                  ? "bg-orange-500 text-white"
                  : "text-white/50 hover:text-white"
                  }`}
                title="Card View"
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {assignmentViewMode === 'table' ? (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/4 text-white/60">
                <tr>
                  <th className="px-4 py-4 text-left font-medium">S.No</th>
                  <th className="px-4 py-4 text-left font-medium">Trainee</th>
                  <th className="px-4 py-4 text-left font-medium">Assigned Task</th>
                  <th className="px-4 py-4 text-left font-medium">Due Date</th>
                  <th className="px-4 py-4 text-left font-medium">Status</th>
                  <th className="px-4 py-4 text-left font-medium">Progress</th>
                  <th className="px-4 py-4 text-left font-medium">Daily Report</th>
                  <th className="px-4 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-white/40">
                      <Loader2 size={18} className="mx-auto animate-spin" />
                    </td>
                  </tr>
                ) : filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-white/40">No task assignments found matching this filter.</td>
                  </tr>
                ) : (
                  filteredAssignments.map((assignment, index) => {
                    return (
                      <tr key={assignment.uuid} className="hover:bg-white/2 transition-colors">
                        <td className="px-4 py-4 text-white/70">{index + 1}</td>
                        <td className="px-4 py-4 font-semibold text-white">
                          {assignment.trainee_name}
                        </td>
                        <td className="px-4 py-4 text-white/70">
                          <div className="font-semibold text-white">{assignment.task_name}</div>
                          <div className="text-xs text-white/40">Assigned: {assignment.assigned_date?.substring(0, 10)}</div>
                        </td>
                        <td className="px-4 py-4 text-white/70">
                          {assignment.due_date ? assignment.due_date.substring(0, 10) : '—'}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase 
                              ${assignment.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' :
                              assignment.status === 'In Progress' ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' :
                                'bg-orange-500/15 text-orange-400 border-orange-500/25'}`}>
                            {assignment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 min-w-30">
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-white/50">{assignment.progress}%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${assignment.progress}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-white/70 max-w-50">
                          <div className="truncate" title={assignment.daily_report}>{assignment.daily_report || '—'}</div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* View */}
                            <button
                              type="button"
                              onClick={() => openAssignmentDetails(assignment)}
                              className="rounded-lg border border-white/10 bg-white/5 p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition"
                              title="View Assignment"
                            >
                              <Eye size={14} />
                            </button>
                            <button onClick={() => handleEditClick(assignment)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10 transition">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(assignment.uuid)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {loading ? (
              <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/40"><Loader2 size={18} className="mx-auto animate-spin" /></div>
            ) : filteredAssignments.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/40">No task assignments found matching this filter.</div>
            ) : filteredAssignments.map((assignment) => (
              <div key={assignment.uuid} className="rounded-2xl border border-white/10 bg-[#111318] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">{assignment.trainee_name}</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{assignment.task_name}</h3>
                    <p className="text-sm text-white/60">Due: {assignment.due_date ? assignment.due_date.substring(0, 10) : '—'}</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase ${assignment.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : assignment.status === 'In Progress' ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' : 'bg-orange-500/15 text-orange-400 border-orange-500/25'}`}>{assignment.status}</span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-white/70">
                  <p>Progress: {assignment.progress}%</p>
                  <p>{assignment.daily_report || '—'}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {/* View */}
                  <button
                    type="button"
                    onClick={() => openAssignmentDetails(assignment)}
                    className="rounded-lg border border-white/10 bg-white/5 p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition"
                    title="View Assignment"
                  >
                    <Eye size={14} />
                  </button>
                  <button onClick={() => handleEditClick(assignment)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(assignment.uuid)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={detailsOpen} onClose={closeAssignmentDetails} title="Task Assignment Details">
        {selectedAssignment ? (
          <div className="space-y-4 text-sm text-white/80">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-2">Trainee / Intern</p>
                <p className="text-white">{selectedAssignment.trainee_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-2">Task</p>
                <p className="text-white">{selectedAssignment.task_name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-2">Status</p>
                <p className="text-white">{selectedAssignment.status || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-2">Progress</p>
                <p className="text-white">{selectedAssignment.progress ?? 0}%</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-2">Assigned Date</p>
                <p className="text-white">{selectedAssignment.assigned_date ? selectedAssignment.assigned_date.substring(0, 10) : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-2">Due Date</p>
                <p className="text-white">{selectedAssignment.due_date ? selectedAssignment.due_date.substring(0, 10) : '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-[0.2em] mb-2">Assignment Notes</p>
              <p className="text-white/70 whitespace-pre-line">{selectedAssignment.daily_report || 'No report provided.'}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/70">Loading details...</p>
        )}
      </Modal>
    </div>
  );
};

export default TraineeTaskAssign;
