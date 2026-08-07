import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3, Eye, Loader2, MapPin, UserRoundCheck, UserRoundX } from "lucide-react";
import api from "../api";

const today = new Date();
const defaultMonth = today.getMonth() + 1;
const defaultYear = today.getFullYear();

const AttendanceView = () => {
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateFilter, setDateFilter] = useState('This Month');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const today = new Date();
    let start, end;
    if (dateFilter === 'Today') {
      start = today;
      end = today;
    } else if (dateFilter === 'Yesterday') {
      start = new Date(today);
      start.setDate(today.getDate() - 1);
      end = new Date(start);
    } else if (dateFilter === 'This Week') {
      start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (dateFilter === 'This Month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (dateFilter === 'Custom Date') {
      start = new Date(customDate);
      end = new Date(customDate);
    }
    
    if (start && end) {
      const offsetStart = new Date(start.getTime() - (start.getTimezoneOffset() * 60000));
      const offsetEnd = new Date(end.getTime() - (end.getTimezoneOffset() * 60000));
      setStartDate(offsetStart.toISOString().slice(0, 10));
      setEndDate(offsetEnd.toISOString().slice(0, 10));
    }
  }, [dateFilter, customDate]);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!startDate || !endDate) return;
      setLoading(true);
      setError(null);
      try {
        const [employeeRes, attendanceRes] = await Promise.all([
          api.get(`/employees/${id}`),
          api.get(`/attendance/${id}?startDate=${startDate}&endDate=${endDate}`),
        ]);

        setEmployee(employeeRes?.data?.employee || null);
        setAttendance(attendanceRes?.data?.data || []);
      } catch (err) {
        console.error("Failed to load attendance detail", err);
        setError(err?.response?.data?.message || "Could not load attendance details.");
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate) {
      loadAttendance();
    }
  }, [id, startDate, endDate]);

  const renderMetricCard = (label, value, highlight) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
      <p className="text-white/40">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${highlight ? "text-emerald-400" : "text-white"}`}>{value}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#161C24] p-6 text-white">
        <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-10 text-center">
          <Loader2 className="mx-auto mb-4 animate-spin" size={32} />
          <p>Loading attendance details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#161C24] p-6 text-white">
        <div className="rounded-3xl border border-red-500/40 bg-red-900/20 p-10 text-center text-red-200">
          <p>{error}</p>
          <Link to="/admin/attendance" className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
            Back to Attendance
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161C24] text-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5 shadow-2xl shadow-black/20 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-orange-400">Employee attendance</p>
            <h2 className="text-2xl font-semibold">Attendance details</h2>
            <p className="mt-2 text-sm text-white/60">Viewing attendance for {employee?.first_name} {employee?.last_name}.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white/5 border border-white/10 text-white text-sm rounded-full px-4 py-2 outline-none focus:border-orange-500/50 transition appearance-none"
              >
                <option value="Today" className="bg-[#0f172a]">Today</option>
                <option value="Yesterday" className="bg-[#0f172a]">Yesterday</option>
                <option value="This Week" className="bg-[#0f172a]">This Week</option>
                <option value="This Month" className="bg-[#0f172a]">This Month</option>
                <option value="Custom Date" className="bg-[#0f172a]">Custom Date</option>
              </select>
              {dateFilter === 'Custom Date' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white text-sm rounded-full px-4 py-2 outline-none focus:border-orange-500/50 transition scheme-dark"
                />
              )}
            </div>
            <Link to="/admin/attendance" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10">
              <ArrowLeft size={16} /> Back
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg shadow-black/20">
            <div className="grid gap-4 md:grid-cols-3">
              {renderMetricCard("Filter", dateFilter, true)}
              {renderMetricCard("Period", dateFilter === 'Custom Date' ? customDate : (startDate === endDate ? startDate : `${startDate} to ${endDate}`), false)}
              {renderMetricCard("Records", attendance.length, true)}
            </div>

            <div className="mt-6 space-y-4">
              {attendance.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/60">No attendance records found for this period.</div>
              ) : (
                attendance.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold">
                          {new Date(item.attendance_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-white/60">Status: {item.attendance_status}</p>
                      </div>
                      <div className="grid gap-3 text-sm md:grid-cols-6">
                        <div>
                          <p className="text-white/40">Check In</p>
                          <p>{item.check_in_time || "—"}</p>
                        </div>
                        <div>
                          <p className="text-white/40">Check Out</p>
                          <p>{item.check_out_time || "—"}</p>
                        </div>
                        <div>
                          <p className="text-white/40">Break Start</p>
                          <p>{item.break_start_time || "—"}</p>
                        </div>
                        <div>
                          <p className="text-white/40">Break End</p>
                          <p>{item.break_end_time || "—"}</p>
                        </div>
                        <div>
                          <p className="text-white/40">Working Hours</p>
                          <p>{item.working_hours || "—"}</p>
                        </div>
                        <div>
                          <p className="text-white/40">Location</p>
                          <p>{item.location || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;
