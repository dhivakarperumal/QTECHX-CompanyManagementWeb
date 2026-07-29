import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Toaster, toast } from 'react-hot-toast';
import { UserCheck, Edit2, Trash2, Loader2, Save, X, Plus } from 'lucide-react';

const TraineeTaskAssign = () => {
  const [assignments, setAssignments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState('');
  const [assignedDate, setAssignedDate] = useState('');
  const [assignedTime, setAssignedTime] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Update State (for inline editing)
  const [editingAssignmentUuid, setEditingAssignmentUuid] = useState(null);
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState('Pending');
  const [editDailyReport, setEditDailyReport] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, tasksRes, traineesRes] = await Promise.all([
        api.get('/trainee-task-assignments'),
        api.get('/trainee-tasks'),
        api.get('/trainee-intern') // assuming this endpoint gets trainees/interns
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

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedTask || !selectedTrainee || !assignedDate) {
      toast.error('Task, Trainee, and Assigned Date are required');
      return;
    }

    try {
      await api.post('/trainee-task-assignments', {
        trainee_task_uuid: selectedTask,
        trainee_intern_uuid: selectedTrainee,
        assigned_date: assignedDate,
        assigned_time: assignedTime,
        due_date: dueDate
      });
      toast.success('Task assigned successfully');
      
      resetForm();
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task');
    }
  };

  const handleEditClick = (assignment) => {
    setEditingAssignmentUuid(assignment.uuid);
    setEditProgress(assignment.progress);
    setEditStatus(assignment.status);
    setEditDailyReport(assignment.daily_report || '');
  };

  const handleUpdate = async (uuid) => {
    try {
      await api.put(`/trainee-task-assignments/${uuid}`, {
        progress: editProgress,
        status: editStatus,
        daily_report: editDailyReport
      });
      toast.success('Assignment updated successfully');
      setEditingAssignmentUuid(null);
      fetchData();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    }
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
    setShowForm(false);
  };

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
              onClick={() => setShowForm(true)} 
              className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:opacity-90" 
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
            >
              <Plus size={15} /> New Assignment
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-[#111318] p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">New Task Assignment</h3>
            <button onClick={resetForm} className="text-white/40 hover:text-white transition">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleAssign} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Select Task *</label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                >
                  <option value="" className="text-black">-- Select Task --</option>
                  {tasks.map(t => (
                    <option key={t.uuid} value={t.uuid} className="text-black">{t.task_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Select Trainee/Intern *</label>
                <select
                  value={selectedTrainee}
                  onChange={(e) => setSelectedTrainee(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
                >
                  <option value="" className="text-black">-- Select Trainee --</option>
                  {trainees.map(t => (
                    <option key={t.uuid} value={t.uuid} className="text-black">{t.full_name} ({t.type})</option>
                  ))}
                </select>
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
                <Save size={15} /> Assign Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments Table */}
      <div className="rounded-2xl border border-white/10 bg-[#111318] p-4">
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/4 text-white/60">
              <tr>
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
                  <td colSpan="7" className="px-4 py-8 text-center text-white/40">
                    <Loader2 size={18} className="mx-auto animate-spin" />
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-white/40">No task assignments found.</td>
                </tr>
              ) : (
                assignments.map((assignment) => {
                  const isEditing = editingAssignmentUuid === assignment.uuid;
                  return (
                    <tr key={assignment.uuid} className="hover:bg-white/2 transition-colors">
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
                        {isEditing ? (
                          <select 
                            value={editStatus} 
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="rounded-lg border border-white/10 bg-white/4 px-2 py-1 text-sm text-white outline-none focus:border-orange-500/50"
                          >
                            <option value="Pending" className="text-black">Pending</option>
                            <option value="In Progress" className="text-black">In Progress</option>
                            <option value="Review" className="text-black">Review</option>
                            <option value="On Hold" className="text-black">On Hold</option>
                            <option value="Completed" className="text-black">Completed</option>
                            <option value="Cancelled" className="text-black">Cancelled</option>
                          </select>
                        ) : (
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase 
                            ${assignment.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' : 
                              assignment.status === 'In Progress' ? 'bg-blue-500/15 text-blue-400 border-blue-500/25' : 
                              'bg-orange-500/15 text-orange-400 border-orange-500/25'}`}>
                            {assignment.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 min-w-[120px]">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              min="0" max="100" 
                              value={editProgress} 
                              onChange={(e) => setEditProgress(e.target.value)}
                              className="w-16 rounded-lg border border-white/10 bg-white/4 px-2 py-1 text-sm text-white outline-none focus:border-orange-500/50"
                            />
                            <span className="text-white/50 text-xs">%</span>
                          </div>
                        ) : (
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-white/50">{assignment.progress}%</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${assignment.progress}%` }}></div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-white/70 max-w-[200px]">
                        {isEditing ? (
                          <textarea 
                            value={editDailyReport} 
                            onChange={(e) => setEditDailyReport(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-sm text-white outline-none focus:border-orange-500/50"
                            rows="2"
                            placeholder="Enter daily report..."
                          />
                        ) : (
                          <div className="truncate" title={assignment.daily_report}>{assignment.daily_report || '—'}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleUpdate(assignment.uuid)} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition">
                              <Save size={14} />
                            </button>
                            <button onClick={() => setEditingAssignmentUuid(null)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10 transition">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditClick(assignment)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10 transition">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(assignment.uuid)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TraineeTaskAssign;
