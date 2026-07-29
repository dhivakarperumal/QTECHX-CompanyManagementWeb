import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Toaster, toast } from 'react-hot-toast';

const TraineeTaskAssign = () => {
  const [assignments, setAssignments] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [trainees, setTrainees] = useState([]);

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
      const [assignmentsRes, tasksRes, traineesRes] = await Promise.all([
        api.get('/trainee-task-assignments'),
        api.get('/trainee-tasks'),
        api.get('/trainee-intern') // assuming this endpoint gets trainees/interns
      ]);
      setAssignments(assignmentsRes.data);
      setTasks(tasksRes.data);
      setTrainees(traineesRes.data.data || traineesRes.data); // depending on how /trainee-intern is formatted
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
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
      
      // Reset form
      setSelectedTask('');
      setSelectedTrainee('');
      setAssignedDate('');
      setAssignedTime('');
      setDueDate('');
      
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Assign Tasks to Trainees/Interns</h2>

      {/* Assign Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">New Task Assignment</h3>
        <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Task *</label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">-- Select Task --</option>
              {tasks.map(t => (
                <option key={t.uuid} value={t.uuid}>{t.task_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Select Trainee/Intern *</label>
            <select
              value={selectedTrainee}
              onChange={(e) => setSelectedTrainee(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">-- Select Trainee --</option>
              {trainees.map(t => (
                <option key={t.uuid} value={t.uuid}>{t.full_name} ({t.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned Date *</label>
            <input
              type="date"
              value={assignedDate}
              onChange={(e) => setAssignedDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned Time</label>
            <input
              type="time"
              value={assignedTime}
              onChange={(e) => setAssignedTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Assign Task
            </button>
          </div>
        </form>
      </div>

      {/* Assignments Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Assigned Tasks Overview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trainee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Task</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daily Report</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.length > 0 ? (
                assignments.map((assignment) => {
                  const isEditing = editingAssignmentUuid === assignment.uuid;
                  return (
                    <tr key={assignment.uuid} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {assignment.trainee_name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <strong>{assignment.task_name}</strong>
                        <br/>
                        <span className="text-xs text-gray-400">Assigned: {assignment.assigned_date?.substring(0, 10)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {assignment.due_date?.substring(0, 10)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isEditing ? (
                          <select 
                            value={editStatus} 
                            onChange={(e) => setEditStatus(e.target.value)}
                            className="border p-1 rounded"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${assignment.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                              assignment.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {assignment.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input 
                              type="number" 
                              min="0" max="100" 
                              value={editProgress} 
                              onChange={(e) => setEditProgress(e.target.value)}
                              className="w-16 border p-1 rounded"
                            /> %
                          </div>
                        ) : (
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${assignment.progress}%` }}></div>
                            <span className="text-xs mt-1 inline-block">{assignment.progress}%</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {isEditing ? (
                          <textarea 
                            value={editDailyReport} 
                            onChange={(e) => setEditDailyReport(e.target.value)}
                            className="w-full border p-1 rounded text-sm"
                            rows="2"
                          />
                        ) : (
                          assignment.daily_report || '-'
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleUpdate(assignment.uuid)} className="text-green-600 hover:text-green-900 mr-3">Save</button>
                            <button onClick={() => setEditingAssignmentUuid(null)} className="text-gray-600 hover:text-gray-900">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditClick(assignment)} className="text-indigo-600 hover:text-indigo-900 mr-3">Update</button>
                            <button onClick={() => handleDelete(assignment.uuid)} className="text-red-600 hover:text-red-900">Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-4 text-center text-sm text-gray-500">No task assignments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TraineeTaskAssign;
