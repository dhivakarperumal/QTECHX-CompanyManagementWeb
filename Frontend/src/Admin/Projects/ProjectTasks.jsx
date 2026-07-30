import React, { useEffect, useState } from 'react';
import { Loader2, X, User, Phone, Mail, Calendar, Briefcase, FileText } from 'lucide-react';
import api from '../../api';

export default function ProjectTasks({ projectUuid, assignedEmployees = [] }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/tasks?project_id=${projectUuid}`);
        if (data.success) {
          setTasks(data.data || []);
        } else {
          setError(data.message || 'Failed to load tasks');
        }
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Error fetching tasks');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectUuid]);

  const handleEmployeeClick = async (task) => {
    if (!task.assigned_to) return;
    
    setSelectedTask(task);
    setEmployeeDetails(null);
    setModalLoading(true);
    
    try {
      const { data } = await api.get(`/employees/${task.assigned_to}`);
      if (data.success) {
        setEmployeeDetails(data.data);
      }
    } catch (err) {
      console.error('Error fetching employee details', err);
    } finally {
      setModalLoading(false);
    }
  };

  const getEmployeeName = (task) => {
    if (task.assigned_to_name) return task.assigned_to_name;
    if (task.assigned_to) {
      const emp = assignedEmployees.find(e => e.employee_id === task.assigned_to || e.employee_code === task.assigned_to);
      if (emp) {
        return emp.full_name || emp.employee_name || [emp.first_name, emp.last_name].filter(Boolean).join(' ') || task.assigned_to;
      }
      return task.assigned_to;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 size={30} className="animate-spin text-orange-500/70" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-5 text-sm text-rose-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/50">
          No tasks found for this project.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="bg-white/5 text-white">
                <tr>
                  <th className="p-4 font-semibold w-16">S.No</th>
                  <th className="p-4 font-semibold">Task Name</th>
                  <th className="p-4 font-semibold">Module</th>
                  <th className="p-4 font-semibold">Assigned To</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Due Date</th>
                  <th className="p-4 font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tasks.map((task, index) => (
                  <tr key={task.uuid} className="hover:bg-white/5 transition">
                    <td className="p-4 text-white/50">{index + 1}</td>
                    <td className="p-4">{task.task_name}</td>
                    <td className="p-4">{task.module_name || '—'}</td>
                    <td className="p-4">
                      {getEmployeeName(task) ? (
                        <button
                          onClick={() => handleEmployeeClick(task)}
                          className="text-orange-400 hover:text-orange-300 underline underline-offset-2"
                        >
                          {getEmployeeName(task)}
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs">
                        {task.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4">{task.priority || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f11] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 p-5 bg-white/5">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText size={18} className="text-orange-400" />
                Task & Employee Details
              </h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-white/40 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-5 space-y-6">
              {/* Task Details Section */}
              <div>
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">Task Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-xs text-white/40 mb-1">Task Name</p>
                    <p className="text-sm text-white font-medium">{selectedTask.task_name}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-xs text-white/40 mb-1">Module / Category</p>
                    <p className="text-sm text-white font-medium">{selectedTask.module_name || '—'} / {selectedTask.category || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-xs text-white/40 mb-1">Status / Priority</p>
                    <p className="text-sm text-white font-medium">{selectedTask.status || '—'} / {selectedTask.priority || '—'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-xs text-white/40 mb-1">Due Date</p>
                    <p className="text-sm text-white font-medium">{selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : '—'}</p>
                  </div>
                  {selectedTask.description && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 md:col-span-2">
                      <p className="text-xs text-white/40 mb-1">Description</p>
                      <p className="text-sm text-white/80">{selectedTask.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Employee Details Section */}
              <div>
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">Assigned Employee</h3>
                {modalLoading ? (
                  <div className="flex justify-center p-6 border border-white/10 rounded-xl bg-white/[0.02]">
                    <Loader2 size={24} className="animate-spin text-orange-500/70" />
                  </div>
                ) : employeeDetails ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <User size={18} className="text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Name</p>
                        <p className="text-sm text-white font-medium">{employeeDetails.first_name} {employeeDetails.last_name}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Briefcase size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Designation / Role</p>
                        <p className="text-sm text-white font-medium">{employeeDetails.designation || '—'} / {employeeDetails.role || '—'}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Mail size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Email</p>
                        <p className="text-sm text-white font-medium">{employeeDetails.email || '—'}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Phone size={18} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Phone</p>
                        <p className="text-sm text-white font-medium">{employeeDetails.phone_number || '—'}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex items-center gap-3 md:col-span-2">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <Calendar size={18} className="text-rose-400" />
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Joining Date</p>
                        <p className="text-sm text-white font-medium">{employeeDetails.date_of_joining ? new Date(employeeDetails.date_of_joining).toLocaleDateString() : '—'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center text-white/50 text-sm">
                    Employee details could not be loaded.
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-white/10 p-4 bg-white/5 flex justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
