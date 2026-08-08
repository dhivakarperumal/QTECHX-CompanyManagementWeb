import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';
import { Toaster, toast } from 'react-hot-toast';
import { ChevronLeft, Loader2, Calendar, FileText } from 'lucide-react';

const TraineeTaskDetails = () => {
  const { uuid } = useParams();
  const [trainee, setTrainee] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'week', 'month'

  useEffect(() => {
    fetchData();
  }, [uuid]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch specific trainee
      const traineeRes = await api.get(`/trainee-intern/${uuid}`);
      // traineeRes.data could be wrapped in .data depending on controller
      const traineeData = traineeRes.data.data || traineeRes.data;
      setTrainee(traineeData);

      // Fetch tasks for this trainee
      const assignRes = await api.get(`/trainee-task-assignments?trainee_id=${uuid}`);
      setAssignments(assignRes.data);
    } catch (error) {
      console.error('Error fetching trainee tasks details:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAssignments = () => {
    if (filter === 'all') return assignments;

    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // Sunday
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return assignments.filter(assignment => {
      const assignedDate = new Date(assignment.assigned_date);
      if (filter === 'week') {
        return assignedDate >= currentWeekStart;
      }
      if (filter === 'month') {
        return assignedDate >= currentMonthStart;
      }
      return true;
    });
  };

  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/trainees/tasks/assign" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <ChevronLeft size={18} />
          </Link>
          
          <div className="flex items-center gap-3">
            {trainee?.profile_photo ? (
              <img 
                src={`http://localhost:5000/${trainee.profile_photo.replace(/\\/g, '/')}`} 
                alt={trainee.full_name} 
                className="w-11 h-11 rounded-2xl object-cover border border-white/10" 
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-lg font-bold text-orange-400">
                {trainee?.full_name?.substring(0, 2).toUpperCase() || <FileText size={20} />}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {loading ? 'Loading...' : `${trainee?.full_name}'s Tasks`}
              </h1>
              <p className="text-white/40 text-xs mt-0.5">
                {trainee?.type || 'Trainee / Intern'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#111318] px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50"
          >
            <option value="all" className="text-black">All Time</option>
            <option value="month" className="text-black">This Month</option>
            <option value="week" className="text-black">This Week</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="rounded-2xl border border-white/10 bg-[#111318] p-4">
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/4 text-white/60">
              <tr>
                <th className="px-4 py-4 text-left font-medium">Assigned Task</th>
                <th className="px-4 py-4 text-left font-medium">Assigned Date</th>
                <th className="px-4 py-4 text-left font-medium">Due Date</th>
                <th className="px-4 py-4 text-left font-medium">Status</th>
                <th className="px-4 py-4 text-left font-medium">Progress</th>
                <th className="px-4 py-4 text-left font-medium">Daily Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-white/40">
                    <Loader2 size={24} className="mx-auto animate-spin mb-2" />
                    Loading tasks...
                  </td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-white/40">
                    <div className="flex flex-col items-center justify-center opacity-60">
                      <Calendar size={40} className="mb-3 opacity-50" />
                      <p>No task assignments found for this period.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.uuid} className="hover:bg-white/2 transition-colors">
                    <td className="px-4 py-4 text-white/70">
                      <div className="font-semibold text-white">{assignment.task_name}</div>
                      <div className="text-xs text-white/40 mt-0.5 line-clamp-1">{assignment.description || 'No description'}</div>
                    </td>
                    <td className="px-4 py-4 text-white/70">
                      {assignment.assigned_date?.substring(0, 10)}
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
                    <td className="px-4 py-4 min-w-[120px]">
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-white/50 font-medium">{assignment.progress}%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${assignment.progress}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-white/70 max-w-[250px]">
                      <div className="text-sm text-white/80" title={assignment.daily_report}>
                        {assignment.daily_report || '—'}
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

export default TraineeTaskDetails;
