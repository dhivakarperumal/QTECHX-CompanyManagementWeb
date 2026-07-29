import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Toaster, toast } from 'react-hot-toast';
import { CheckSquare, Plus, Edit2, Trash2, Loader2, Save, X } from 'lucide-react';

const TraineeTaskMaster = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [editingUuid, setEditingUuid] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taskName) {
      toast.error('Task name is required');
      return;
    }

    try {
      if (editingUuid) {
        await api.put(`/trainee-tasks/${editingUuid}`, { task_name: taskName, description });
        toast.success('Task updated successfully');
      } else {
        await api.post('/trainee-tasks', { task_name: taskName, description });
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
    setShowForm(false);
  };

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
          {!showForm && (
            <button 
              onClick={() => setShowForm(true)} 
              className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:opacity-90" 
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
            >
              <Plus size={15} /> Add Task
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-white/10 bg-[#111318] p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">{editingUuid ? 'Edit Task' : 'Add New Task'}</h3>
            <button onClick={resetForm} className="text-white/40 hover:text-white transition">
              <X size={20} />
            </button>
          </div>
          
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
        </div>
      )}

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
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-white/40">No tasks found</td>
                </tr>
              ) : (
                tasks.map((task, index) => (
                  <tr key={task.uuid} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-4 text-white/70">{index + 1}</td>
                    <td className="px-4 py-4 font-semibold text-white">{task.task_name}</td>
                    <td className="px-4 py-4 text-white/50">{task.description || "—"}</td>
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
    </div>
  );
};

export default TraineeTaskMaster;
