import React, { useState, useEffect } from 'react';
import { CalendarDays, MapPin, Loader2, UserRoundCheck, AlertCircle, Eye, Search } from 'lucide-react';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';
import { Link } from 'react-router-dom';

const EmployeeAttendanceSummary = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMyAttendance();
  }, [selectedMonth, selectedYear, user]);

  const fetchMyAttendance = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const possibleIds = [user?.employee_id, user?.uuid, user?.id, user?._id, user?.userId, user?.user_id].filter(Boolean).map(String);
      if (possibleIds.length === 0) {
        setError("Could not identify employee profile.");
        setLoading(false);
        return;
      }

      const targetId = possibleIds.find(id => id.length > 20) || possibleIds[0];
      const res = await api.get(`/attendance/${targetId}?month=${selectedMonth}&year=${selectedYear}`);
      if (res.data && res.data.data) {
        // the backend already filters for this employee
        const myData = res.data.data;
        // sort by date descending
        myData.sort((a, b) => new Date(b.date || b.attendance_date) - new Date(a.date || a.attendance_date));
        setHistory(myData);
      }
    } catch (err) {
      console.error("Failed to load attendance", err);
      setError("Unable to load your attendance history.");
    } finally {
      setLoading(false);
    }
  };

  const presentDays = history.filter(h => h.attendance_status === 'Present').length;
  const absentDays = history.filter(h => h.attendance_status === 'Absent').length;

  return (
    <div className="space-y-6 text-white pb-10">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5 shadow-2xl shadow-black/20 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-orange-400">Monthly Report</p>
          <h2 className="text-2xl font-semibold">Attendance Summary</h2>
          <p className="mt-2 text-sm text-white/60">Review your past attendance records and metrics.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm">
            <CalendarDays size={16} className="text-orange-400" />
            <select value={selectedMonth} onChange={(event) => setSelectedMonth(Number(event.target.value))} className="bg-transparent outline-none">
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1} className="bg-slate-900">{new Date(2024, index).toLocaleString("en", { month: "long" })}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm">
            <CalendarDays size={16} className="text-orange-400" />
            <select value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))} className="bg-transparent outline-none">
              {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
                <option key={year} value={year} className="bg-slate-900">{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-[#0f172a]/70 p-10">
          <Loader2 className="mr-3 animate-spin text-orange-400" /> Loading your summary...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-900/20 p-4 text-rose-200 flex items-center gap-2">
          <AlertCircle size={18} /> {error}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-white/50 mb-1">Total Records</p>
              <h3 className="text-2xl font-bold">{history.length}</h3>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-white/50 mb-1">Present Days</p>
              <h3 className="text-2xl font-bold text-emerald-400">{presentDays}</h3>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-white/50 mb-1">Absent Days</p>
              <h3 className="text-2xl font-bold text-rose-400">{absentDays}</h3>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 shadow-lg shadow-black/20 overflow-hidden">
            {history.length === 0 ? (
              <div className="p-10 text-center text-white/50">
                <CalendarDays size={48} className="mx-auto mb-3 opacity-20" />
                <p>No attendance records found for this month.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white/70">
                  <thead className="bg-white/5 text-white/50">
                    <tr>
                      <th className="px-5 py-4 font-medium">Date</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 font-medium">Check-In</th>
                      <th className="px-5 py-4 font-medium">Check-Out</th>
                      <th className="px-5 py-4 font-medium">Working Hrs</th>
                      <th className="px-5 py-4 font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.map((record, i) => (
                      <tr key={record.id || i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-4 font-medium text-white">
                          {new Date(record.date || record.attendance_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${record.attendance_status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {record.attendance_status}
                          </span>
                        </td>
                        <td className="px-5 py-4">{record.check_in_time || '--'}</td>
                        <td className="px-5 py-4">{record.check_out_time || '--'}</td>
                        <td className="px-5 py-4">{record.working_hours || '--'}</td>
                        <td className="px-5 py-4">
                          {record.location ? (
                            <div className="flex items-center gap-1 text-xs text-white/50 max-w-[150px] truncate" title={record.location}>
                              <MapPin size={12} className="shrink-0" />
                              <span className="truncate">{record.location.replace(/\n/g, ' ')}</span>
                            </div>
                          ) : (
                            '--'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendanceSummary;
