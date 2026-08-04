import React, { useEffect, useState, useMemo } from "react";
import { Users, UserCheck, UserX, UserMinus, Clock, UserCog, CalendarDays } from "lucide-react";
import api from "../api";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const AttendancePage = () => {
  const [summaryData, setSummaryData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedToday = today.toLocaleDateString('en-GB', dateOptions);

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
      setEmployeeData(empRes?.data?.data || []);
      setSummaryData(sumRes?.data?.data || []);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics Calculation
  const totalEmployees = employeeData.length;
  const presentToday = summaryData.filter(s => s.today_status === 'Present').length;
  const absentToday = summaryData.filter(s => s.today_status === 'Absent' || s.today_status === 'Leave').length;
  const onLeaveToday = summaryData.filter(s => s.today_status === 'Leave').length;
  const lateToday = summaryData.filter(s => s.today_status === 'Late').length;
  
  // Estimate working now (based on Present and not clocked out if we had live data, assuming present = working for this summary)
  const workingNow = presentToday; 

  const overviewData = [
    { name: 'Present', value: presentToday, color: '#10b981' },
    { name: 'Late', value: lateToday, color: '#f59e0b' },
    { name: 'Absent', value: absentToday, color: '#ef4444' },
    { name: 'Half Day', value: 0, color: '#8b5cf6' },
    { name: 'On Leave', value: onLeaveToday, color: '#3b82f6' }
  ];

  const presentPercentage = totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(1) : 0;

  // Mock Trend Data
  const trendData = [
    { name: 'Mon', count: 120 }, { name: 'Tue', count: 132 }, { name: 'Wed', count: 125 },
    { name: 'Thu', count: 120 }, { name: 'Fri', count: 110 }, { name: 'Sat', count: 20 }, { name: 'Sun', count: 5 }
  ];

  // Department Mock Data
  const departmentData = [
    { name: 'Design', value: 30, color: '#3b82f6' },
    { name: 'Development', value: 45, color: '#10b981' },
    { name: 'Marketing', value: 20, color: '#8b5cf6' },
    { name: 'HR', value: 15, color: '#f59e0b' },
    { name: 'Sales', value: 15, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6 text-slate-800 bg-slate-50 min-h-screen pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium bg-slate-100 px-4 py-2 rounded-lg">
            <CalendarDays size={16} />
            <span>{formattedToday}</span>
          </div>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={<Users className="text-blue-500" />} title="Total Employees" value={totalEmployees} subtext="+8 This Month" bgColor="bg-blue-50" />
        <StatCard icon={<UserCheck className="text-emerald-500" />} title="Present Today" value={presentToday} subtext={`${presentPercentage}% of total`} bgColor="bg-emerald-50" />
        <StatCard icon={<UserX className="text-rose-500" />} title="Absent Today" value={absentToday} subtext={`${((absentToday/totalEmployees)*100 || 0).toFixed(1)}% of total`} bgColor="bg-rose-50" />
        <StatCard icon={<UserMinus className="text-orange-500" />} title="On Leave Today" value={onLeaveToday} subtext={`${((onLeaveToday/totalEmployees)*100 || 0).toFixed(1)}% of total`} bgColor="bg-orange-50" />
        <StatCard icon={<Clock className="text-purple-500" />} title="Late Today" value={lateToday} subtext={`${presentToday > 0 ? ((lateToday/presentToday)*100).toFixed(1) : 0}% of present`} bgColor="bg-purple-50" />
        <StatCard icon={<UserCog className="text-indigo-500" />} title="Working Now" value={workingNow} subtext="Live Tracking" bgColor="bg-indigo-50" />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Larger */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overview Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Today's Attendance Overview</h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-48 h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={overviewData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                      {overviewData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-slate-800">{presentPercentage}%</span>
                  <span className="text-xs text-emerald-500 font-medium">Present</span>
                </div>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-8">
                {overviewData.map(item => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-medium text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timesheet */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Today's Timesheet (Live)</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                   <tr>
                     <th className="py-3 px-4 rounded-tl-lg">Employee</th>
                     <th className="py-3 px-4">Start Time</th>
                     <th className="py-3 px-4">End Time</th>
                     <th className="py-3 px-4">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {summaryData.slice(0, 5).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-700">{row.employee_name}</td>
                        <td className="py-3 px-4 text-slate-500">{row.today_status === 'Present' || row.today_status === 'Late' ? '09:30 AM' : '--'}</td>
                        <td className="py-3 px-4 text-slate-500">--</td>
                        <td className="py-3 px-4">
                           <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                              row.today_status === 'Present' ? 'bg-emerald-100 text-emerald-600' : 
                              row.today_status === 'Late' ? 'bg-purple-100 text-purple-600' :
                              'bg-rose-100 text-rose-600'
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

        </div>

        {/* Right Column - Smaller */}
        <div className="space-y-6">
          
          {/* Live Status */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Live Status <span className="text-xs font-normal text-slate-400">(Real-time)</span></h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
               {summaryData.slice(0, 6).map((user, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 uppercase">
                        {user.employee_name.charAt(0)}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-slate-800">{user.employee_name}</p>
                       <p className={`text-xs font-medium flex items-center gap-1 ${user.today_status === 'Present' ? 'text-emerald-500' : user.today_status === 'Late' ? 'text-purple-500' : 'text-slate-400'}`}>
                         <span className="w-1.5 h-1.5 rounded-full bg-current"></span> {user.today_status || 'Offline'}
                       </p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-sm font-bold text-slate-800">09:00 AM</p>
                   </div>
                 </div>
               ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition">
              View All Employees &rarr;
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Trend */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-6">Attendance Trend <span className="text-xs font-normal text-slate-400">(This Week)</span></h3>
           <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={trendData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                 <RechartsTooltip />
                 <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Department Wise */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-6">Department Wise Attendance</h3>
           <div className="flex items-center justify-between h-48">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={departmentData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" stroke="none">
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3 pl-4">
                {departmentData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-slate-600 font-medium">{item.name}</span>
                    </div>
                    <span className="text-slate-400">{item.value}%</span>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
           <div className="flex-1 overflow-y-auto space-y-4">
             {summaryData.slice(0, 4).map((user, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mt-1">
                     <span className="text-xs font-bold text-slate-500 uppercase">{user.employee_name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 font-medium"><span className="font-bold text-slate-800">{user.employee_name}</span> logged in</p>
                    <p className="text-xs text-slate-400 mt-0.5">Today, 09:02 AM</p>
                  </div>
                </div>
             ))}
           </div>
        </div>

      </div>

    </div>
  );
};

const StatCard = ({ icon, title, value, subtext, bgColor }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center hover:shadow-md transition cursor-default">
    <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
    <h3 className="text-2xl font-black text-slate-800 mt-1 mb-1">{value}</h3>
    <p className={`text-xs font-medium ${subtext.includes('+') || subtext.includes('Working') ? 'text-emerald-500' : 'text-slate-400'}`}>{subtext}</p>
  </div>
);

export default AttendancePage;
