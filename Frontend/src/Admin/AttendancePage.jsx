import React, { useEffect, useState } from "react";
import { Users, UserCheck, UserX, UserMinus, Clock, UserCog, CalendarDays, PlusCircle, X, AlertCircle, Loader2 } from "lucide-react";
import api from "../api";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const AttendancePage = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedToday = today.toLocaleDateString('en-GB', dateOptions);
  const todayDateStr = today.toISOString().slice(0, 10);

  const [form, setForm] = useState({
    employee_id: "",
    date: todayDateStr,
    check_in_time: "",
    check_out_time: "",
    break_start_time: "",
    break_end_time: "",
    attendance_status: "Present",
    location: "",
    notes: ""
  });

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, sumRes] = await Promise.all([
        api.get("/employees?limit=200"),
        api.get(`/attendance/summary?month=${selectedMonth}&year=${selectedYear}`)
      ]);
      const responseData = sumRes?.data || {};
      setEmployeeData(empRes?.data?.data || []);
      setSummaryData(responseData.data || []);
      setTrendData(responseData.trendData || []);
      setDepartmentData(responseData.departmentData || []);
      setRecentActivity(responseData.recentActivity || []);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fillCurrentTime = (field) => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    setForm({ ...form, [field]: timeStr });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee_id) {
       setError("Please select an employee");
       return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/attendance", form);
      setSuccessMsg("Attendance marked successfully!");
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(""), 3000);
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to mark attendance");
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics Calculation
  const totalEmployees = employeeData.length;
  const presentToday = summaryData.filter(s => s.today_status === 'Present').length;
  const absentToday = summaryData.filter(s => s.today_status === 'Absent' || s.today_status === 'Leave').length;
  const onLeaveToday = summaryData.filter(s => s.today_status === 'Leave').length;
  const lateToday = summaryData.filter(s => s.today_status === 'Late').length;
  
  const workingNow = presentToday; 

  const overviewData = [
    { name: 'Present', value: presentToday, color: '#10b981' },
    { name: 'Late', value: lateToday, color: '#f59e0b' },
    { name: 'Absent', value: absentToday, color: '#ef4444' },
    { name: 'On Leave', value: onLeaveToday, color: '#3b82f6' }
  ];

  const presentPercentage = totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(1) : 0;

  const employeeLookup = new Map((employeeData || []).map((emp) => [emp.employee_id, emp]));
  const fallbackDepartmentData = Object.values(summaryData.reduce((acc, row) => {
    const employee = employeeLookup.get(row.employee_id);
    const departmentSource = [employee?.designation, employee?.role, employee?.team_lead].filter(Boolean).join(' ');
    const departmentName = departmentSource || 'General';
    const normalizedDepartment = departmentName.toLowerCase().includes('hr')
      ? 'HR'
      : departmentName.toLowerCase().includes('design')
        ? 'Design'
        : departmentName.toLowerCase().includes('market')
          ? 'Marketing'
          : departmentName.toLowerCase().includes('sale')
            ? 'Sales'
            : departmentName.toLowerCase().includes('developer') || departmentName.toLowerCase().includes('software') || departmentName.toLowerCase().includes('engineer')
              ? 'Development'
              : 'General';

    if (!acc[normalizedDepartment]) {
      acc[normalizedDepartment] = { name: normalizedDepartment, value: 0, color: '#3b82f6' };
    }

    acc[normalizedDepartment].value += 1;
    return acc;
  }, {}));

  const computedDepartmentData = departmentData.length > 0 ? departmentData : fallbackDepartmentData;
  const computedRecentActivity = recentActivity.length > 0 ? recentActivity : summaryData.slice(0, 4).map((user) => ({
    employee_name: user.employee_name,
    status: user.today_status || 'Present',
    check_in_time: user.check_in_time || null,
    updated_at: new Date().toISOString()
  }));

  return (
    <div className="space-y-6 text-white pb-10">
      
      {/* Header */}
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5 shadow-2xl shadow-black/20 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Attendance Dashboard</h2>
          <p className="mt-1 text-sm text-white/60">Overview of today's attendance and company metrics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white/70 font-medium bg-white/5 border border-white/10 px-4 py-2 rounded-full">
            <CalendarDays size={16} className="text-orange-400" />
            <span>{formattedToday}</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm font-medium text-white transition"
          >
            <PlusCircle size={16} /> Mark Attendance
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-900/20 p-4 text-emerald-200">
          {successMsg}
        </div>
      )}

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={<Users className="text-blue-400" />} title="Total Employees" value={totalEmployees} subtext="+8 This Month" bgColor="bg-blue-500/10" />
        <StatCard icon={<UserCheck className="text-emerald-400" />} title="Present Today" value={presentToday} subtext={`${presentPercentage}% of total`} bgColor="bg-emerald-500/10" />
        <StatCard icon={<UserX className="text-rose-400" />} title="Absent Today" value={absentToday} subtext={`${((absentToday/totalEmployees)*100 || 0).toFixed(1)}% of total`} bgColor="bg-rose-500/10" />
        <StatCard icon={<UserMinus className="text-orange-400" />} title="On Leave Today" value={onLeaveToday} subtext={`${((onLeaveToday/totalEmployees)*100 || 0).toFixed(1)}% of total`} bgColor="bg-orange-500/10" />
        <StatCard icon={<Clock className="text-purple-400" />} title="Late Today" value={lateToday} subtext={`${presentToday > 0 ? ((lateToday/presentToday)*100).toFixed(1) : 0}% of present`} bgColor="bg-purple-500/10" />
        <StatCard icon={<UserCog className="text-indigo-400" />} title="Working Now" value={workingNow} subtext="Live Tracking" bgColor="bg-indigo-500/10" />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="space-y-6">
          <div className="bg-[#0f172a]/70 p-6 rounded-3xl shadow-lg border border-white/10">
            <h3 className="text-lg font-bold text-white mb-6">Today's Attendance Overview</h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-48 h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={overviewData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {overviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff1a', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">{presentPercentage}%</span>
                  <span className="text-xs text-emerald-400 font-medium">Present</span>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-8">
                {overviewData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-medium text-white/70">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-6">
          <div className="bg-[#0f172a]/70 p-6 rounded-3xl shadow-lg border border-white/10 h-96 flex flex-col">
            <h3 className="text-lg font-bold text-white mb-4">Live Status <span className="text-xs font-normal text-white/40">(Real-time)</span></h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
               {summaryData.slice(0, 6).map((user, i) => (
                 <div key={i} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-3">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/70 uppercase">
                        {(user.employee_name || 'U').charAt(0)}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-white">{user.employee_name || 'Unknown Employee'}</p>
                       <p className={`text-xs font-medium flex items-center gap-1 ${user.today_status === 'Present' ? 'text-emerald-400' : user.today_status === 'Late' ? 'text-purple-400' : user.today_status === 'Leave' ? 'text-rose-400' : 'text-white/40'}`}>
                         <span className="w-1.5 h-1.5 rounded-full bg-current"></span> {user.today_status || 'Offline'}
                       </p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-bold text-white/80">{user.check_in_time || '--'}</p>
                   </div>
                 </div>
               ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-bold text-orange-400 hover:text-orange-300 transition">
              View All Employees &rarr;
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a]/70 p-6 rounded-3xl shadow-lg border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white">Today's Timesheet (Live)</h3>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/50">Full width</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-white/5 text-white/50 font-medium border-b border-white/10">
              <tr>
                <th className="py-3 px-4 rounded-tl-lg whitespace-nowrap">Employee</th>
                <th className="py-3 px-4 whitespace-nowrap">Start Time</th>
                <th className="py-3 px-4 whitespace-nowrap">End Time</th>
                <th className="py-3 px-4 whitespace-nowrap">Break Start</th>
                <th className="py-3 px-4 whitespace-nowrap">Break End</th>
                <th className="py-3 px-4 whitespace-nowrap">Working Hrs</th>
                <th className="py-3 px-4 whitespace-nowrap">Late Entry</th>
                <th className="py-3 px-4 whitespace-nowrap">Early Exit</th>
                <th className="py-3 px-4 whitespace-nowrap">Overtime</th>
                <th className="py-3 px-4 whitespace-nowrap rounded-tr-lg">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {summaryData.map((row, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                    {row.employee_name} <span className="text-white/40 ml-1 text-xs">({row.employee_code || '—'})</span>
                  </td>
                  <td className="py-3 px-4 text-white/60 whitespace-nowrap">{row.check_in_time || '--'}</td>
                  <td className="py-3 px-4 text-white/60 whitespace-nowrap">{row.check_out_time || '--'}</td>
                  <td className="py-3 px-4 text-white/60 whitespace-nowrap">{row.break_start_time || '--'}</td>
                  <td className="py-3 px-4 text-white/60 whitespace-nowrap">{row.break_end_time || '--'}</td>
                  <td className="py-3 px-4 text-white/60 whitespace-nowrap">{row.working_hours || '--'}</td>
                  <td className="py-3 px-4 text-white/60 whitespace-nowrap">{row.late_entry || '--'}</td>
                  <td className="py-3 px-4 text-white/60 whitespace-nowrap">{row.early_exit || '--'}</td>
                  <td className="py-3 px-4 text-white/60 whitespace-nowrap">{row.overtime || '--'}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      row.today_status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' :
                      row.today_status === 'Late' ? 'bg-purple-500/10 text-purple-400' :
                      row.today_status === 'Leave' ? 'bg-rose-500/10 text-rose-400' :
                      'bg-slate-500/10 text-slate-300'
                    }`}>
                      {row.today_status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Trend */}
        <div className="bg-[#0f172a]/70 p-6 rounded-3xl shadow-lg border border-white/10">
           <h3 className="text-lg font-bold text-white mb-6">Attendance Trend <span className="text-xs font-normal text-white/40">(This Week)</span></h3>
           <div className="h-48 w-full">
             {trendData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={trendData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff1a" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                   <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff1a', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                   <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6 }} />
                 </LineChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/50">No trend data available yet.</div>
             )}
           </div>
        </div>

        {/* Department Wise */}
        <div className="bg-[#0f172a]/70 p-6 rounded-3xl shadow-lg border border-white/10">
           <h3 className="text-lg font-bold text-white mb-6">Department Wise Attendance</h3>
           <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between min-h-48">
              <div className="h-48 w-full md:w-1/2">
                {computedDepartmentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={computedDepartmentData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                        {computedDepartmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff1a', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/50">No department data available.</div>
                )}
              </div>
              <div className="w-full md:w-1/2 space-y-3 pl-0 md:pl-4">
                {computedDepartmentData.map(item => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color || '#3b82f6' }}></div>
                      <span className="text-white/70 font-medium">{item.name}</span>
                    </div>
                    <span className="text-white/40">{item.value}%</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#0f172a]/70 p-6 rounded-3xl shadow-lg border border-white/10 overflow-hidden flex flex-col">
           <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
           <div className="flex-1 overflow-y-auto space-y-4">
             {computedRecentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mt-1">
                     <span className="text-xs font-bold text-white/50 uppercase">{(activity.employee_name || 'U').charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white/70 font-medium"><span className="font-bold text-white">{activity.employee_name || 'Employee'}</span> {activity.status === 'Present' ? 'logged in' : activity.status === 'Late' ? 'clocked in late' : activity.status === 'Leave' ? 'marked leave' : 'updated attendance'}</p>
                    <p className="text-xs text-white/40 mt-0.5">{activity.check_in_time ? `Check-in ${activity.check_in_time}` : 'Today'}</p>
                  </div>
                </div>
             ))}
           </div>
        </div>

      </div>

      {/* Mark Attendance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-9999 overflow-y-auto bg-black/70 p-4">
          <div className="flex min-h-full items-start justify-center py-8">
            <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0f172a] shadow-2xl shadow-black/40 overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-orange-400">Admin Action</p>
                  <h3 className="text-xl font-semibold text-white">Mark Attendance</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full border border-white/10 p-2 text-white/70 hover:bg-white/10">
                  <X size={16} />
                </button>
              </div>

              <div className="px-6 py-5">
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-900/20 p-4 text-sm text-rose-200">
                    <AlertCircle size={16} className="shrink-0" /> {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-white/70">Select Employee</label>
                    <select
                      name="employee_id"
                      value={form.employee_id}
                      onChange={handleFormChange}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-white/80"
                    >
                      <option value="" className="bg-slate-900 text-white/50">-- Select Employee --</option>
                      {employeeData.map((emp) => (
                        <option key={emp.employee_id} value={emp.employee_id} className="bg-slate-900 text-white">
                          {emp.first_name} {emp.last_name} ({emp.employee_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleFormChange}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-white/80"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Attendance Status</label>
                    <select
                      name="attendance_status"
                      value={form.attendance_status}
                      onChange={handleFormChange}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-white/80"
                    >
                      <option value="Present" className="bg-slate-900">Present</option>
                      <option value="Absent" className="bg-slate-900">Absent</option>
                      <option value="Half Day" className="bg-slate-900">Half Day</option>
                      <option value="Leave" className="bg-slate-900">Leave</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Check-in Time</label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        name="check_in_time"
                        value={form.check_in_time}
                        onChange={handleFormChange}
                        className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-white/80"
                      />
                      <button type="button" onClick={() => fillCurrentTime('check_in_time')} className="rounded-2xl bg-white/10 px-4 text-sm font-medium hover:bg-white/20 transition">Check In</button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Check-out Time</label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        name="check_out_time"
                        value={form.check_out_time}
                        onChange={handleFormChange}
                        className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-white/80"
                      />
                      <button type="button" onClick={() => fillCurrentTime('check_out_time')} className="rounded-2xl bg-white/10 px-4 text-sm font-medium hover:bg-white/20 transition">Check Out</button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Break Start Time</label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        name="break_start_time"
                        value={form.break_start_time}
                        onChange={handleFormChange}
                        className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-white/80"
                      />
                      <button type="button" onClick={() => fillCurrentTime('break_start_time')} className="rounded-2xl bg-white/10 px-4 text-sm font-medium hover:bg-white/20 transition">Start Break</button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Break End Time</label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        name="break_end_time"
                        value={form.break_end_time}
                        onChange={handleFormChange}
                        className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-white/80"
                      />
                      <button type="button" onClick={() => fillCurrentTime('break_end_time')} className="rounded-2xl bg-white/10 px-4 text-sm font-medium hover:bg-white/20 transition">End Break</button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 pt-4 flex justify-end gap-3 border-t border-white/10">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-white/10 px-6 py-3 text-white/70 hover:bg-white/10">Cancel</button>
                    <button type="submit" disabled={submitting} className="rounded-2xl bg-orange-500 px-6 py-3 font-medium text-white transition hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center min-w-30">
                      {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Save / Update"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ icon, title, value, subtext, bgColor }) => (
  <div className="bg-[#0f172a]/70 p-4 rounded-3xl shadow-lg border border-white/10 flex flex-col justify-center items-center text-center hover:bg-white/2 transition cursor-default">
    <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <p className="text-xs font-bold text-white/50 uppercase tracking-wider">{title}</p>
    <h3 className="text-2xl font-black text-white mt-1 mb-1">{value}</h3>
    <p className={`text-xs font-medium ${subtext.includes('+') || subtext.includes('Working') ? 'text-emerald-400' : 'text-white/40'}`}>{subtext}</p>
  </div>
);

export default AttendancePage;
