import { useState, useEffect } from 'react';
import { CalendarDays, MapPin, Loader2, AlertCircle, Clock3, PlusCircle, X, LayoutGrid, List } from 'lucide-react';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';

const OFFICE_LAT = 12.479818640954804;
const OFFICE_LNG = 78.57369573005468;
const ALLOWED_RADIUS_METERS = 500;

// Haversine formula
const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const EmployeeAttendanceSummary = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState('table');

  const todayDate = new Date().toISOString().slice(0, 10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [hasMarkedToday, setHasMarkedToday] = useState(false);
  const [approvedLeaveToday, setApprovedLeaveToday] = useState(false);
  const [todayHoliday, setTodayHoliday] = useState(false);

  const [form, setForm] = useState({
    date: todayDate,
    check_in_time: '',
    check_out_time: '',
    break_start_time: '',
    break_end_time: '',
    attendance_status: 'Present',
    location: '',
  });

  const [metrics, setMetrics] = useState({
    working_hours: '8h 30m',
    late_entry: 'No',
    early_exit: 'No',
    overtime: 'No',
  });

  const [isWithinRadius, setIsWithinRadius] = useState(false);

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
      const [attendanceRes, leaveRes, eventsRes] = await Promise.all([
        api.get(`/attendance/${targetId}?month=${selectedMonth}&year=${selectedYear}`),
        api.get('/employee-leaves/my-leaves'),
        api.get('/events')
      ]);

      const dateStr = new Date().toISOString().slice(0, 10);

      if (attendanceRes.data && attendanceRes.data.data) {
        // the backend already filters for this employee
        const myData = attendanceRes.data.data;
        // sort by date descending
        myData.sort((a, b) => new Date(b.date || b.attendance_date) - new Date(a.date || a.attendance_date));
        setHistory(myData);

        // Check if marked today
        const todayRecord = myData.find(r => (r.date === dateStr) || (r.attendance_date && String(r.attendance_date).startsWith(dateStr)));
        setHasMarkedToday(Boolean(todayRecord));
      } else {
        setHasMarkedToday(false);
      }

      const approved = Array.isArray(leaveRes.data?.data)
        ? leaveRes.data.data.some((leave) => leave.status === 'Approved' && leave.from_date <= dateStr && leave.to_date >= dateStr)
        : false;
      setApprovedLeaveToday(approved);

      const holiday = Array.isArray(eventsRes.data)
        ? eventsRes.data.some((event) => String(event.eventType).toLowerCase() === 'holiday' && new Date(event.startDate) <= new Date(dateStr) && new Date(event.endDate || event.startDate) >= new Date(dateStr))
        : false;
      setTodayHoliday(holiday);
    } catch (err) {
      console.error("Failed to load attendance", err);
      setError("Unable to load your attendance history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, [selectedMonth, selectedYear, user]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (name === "check_in_time" || name === "check_out_time" || name === "break_start_time" || name === "break_end_time") {
      const computed = calculateMetrics(
        name === "check_in_time" ? value : nextForm.check_in_time,
        name === "check_out_time" ? value : nextForm.check_out_time,
        name === "break_start_time" ? value : nextForm.break_start_time,
        name === "break_end_time" ? value : nextForm.break_end_time
      );
      setMetrics(computed);
    }
  };

  const fillCurrentTime = (field) => {
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);
    const nextForm = { ...form, [field]: timeStr };
    setForm(nextForm);
    
    const computed = calculateMetrics(
      nextForm.check_in_time,
      nextForm.check_out_time,
      nextForm.break_start_time,
      nextForm.break_end_time
    );
    setMetrics(computed);
  };

  const calculateMetrics = (checkIn, checkOut, breakStart, breakEnd) => {
    const parseTime = (value) => {
      if (!value) return null;
      const [time, modifier] = String(value).split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let total = hours * 60 + minutes;
      if (modifier === "PM" && hours !== 12) total += 12 * 60;
      if (modifier === "AM" && hours === 12) total -= 12 * 60;
      return total;
    };

    const formatMinutesToTime = (totalMinutes) => {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${h}h ${m}m`;
    };

    const officeCheckIn = parseTime("09:30");
    const officeCheckOut = parseTime("18:00");
    const autoBreakStart = parseTime("14:00");
    const autoBreakEnd = parseTime("15:00");

    const checkInMinutes = parseTime(checkIn);
    const checkOutMinutes = parseTime(checkOut);
    const breakStartMinutes = parseTime(breakStart);
    const breakEndMinutes = parseTime(breakEnd);

    let workingHours = "0h 0m";
    let lateEntry = "No";
    let earlyExit = "No";
    let overtime = "No";

    if (checkInMinutes !== null) {
      const lateBy = checkInMinutes - officeCheckIn;
      if (lateBy > 0) {
        lateEntry = formatMinutesToTime(lateBy);
      }
    }

    if (checkInMinutes !== null && checkOutMinutes !== null) {
      const exitBefore = officeCheckOut - checkOutMinutes;
      if (exitBefore > 0) {
        earlyExit = formatMinutesToTime(exitBefore);
      }

      let durationMinutes = Math.max(0, checkOutMinutes - checkInMinutes);

      let breakDuration = 0;
      if (breakStartMinutes !== null && breakEndMinutes !== null) {
        breakDuration = Math.max(0, breakEndMinutes - breakStartMinutes);
      } else if (breakStartMinutes !== null && breakEndMinutes === null) {
        breakDuration = Math.max(0, checkOutMinutes - breakStartMinutes);
      } else if (checkInMinutes <= autoBreakStart && checkOutMinutes >= autoBreakEnd) {
        breakDuration = 60;
      }

      durationMinutes = Math.max(0, durationMinutes - breakDuration);
      workingHours = formatMinutesToTime(durationMinutes);

      const overtimeMinutes = Math.max(0, checkOutMinutes - officeCheckOut);
      if (overtimeMinutes > 0) {
        overtime = formatMinutesToTime(overtimeMinutes);
      }
    } else if (checkOutMinutes !== null) {
       const exitBefore = officeCheckOut - checkOutMinutes;
       if (exitBefore > 0) {
         earlyExit = formatMinutesToTime(exitBefore);
       }
    }

    return { working_hours: workingHours, late_entry: lateEntry, early_exit: earlyExit, overtime };
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setForm((prev) => ({
        ...prev,
        location: "Geolocation not supported",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const distance = getDistanceInMeters(latitude, longitude, OFFICE_LAT, OFFICE_LNG);
          setIsWithinRadius(distance <= ALLOWED_RADIUS_METERS);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const address = data.address || {};
          const fullAddress = [
            address.house_number, address.road, address.neighbourhood, address.suburb,
            address.village, address.town, address.city, address.county, address.state,
            address.postcode, address.country,
          ].filter(Boolean).join(", ");

          setForm((prev) => ({
            ...prev,
            location: `Latitude: ${latitude}\nLongitude: ${longitude}\n\nAddress: ${fullAddress}`,
          }));

          if (distance > ALLOWED_RADIUS_METERS) {
            setError(`You are ${Math.round(distance)}m away from the office. You must be within ${ALLOWED_RADIUS_METERS}m to mark attendance.`);
          } else {
            setError(null);
          }

        } catch (err) {
          console.error(err);
          setForm((prev) => ({
            ...prev,
            location: `Latitude: ${position.coords.latitude}\nLongitude: ${position.coords.longitude}`,
          }));
        }
      },
      (error) => {
        console.error(error);
        alert("Unable to fetch location");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isWithinRadius) {
      alert(`You must be within ${ALLOWED_RADIUS_METERS} meters of the office to mark attendance. Please fetch your location.`);
      return;
    }

    setSubmitting(true);
    try {
      const possibleIds = [user?.employee_id, user?.uuid, user?.id, user?._id, user?.userId, user?.user_id].filter(Boolean).map(String);
      const employee_id = possibleIds.find(id => id.length > 20) || possibleIds[0];

      await api.post("/attendance", {
        employee_id: employee_id,
        date: form.date, // always today
        check_in_time: form.check_in_time,
        check_out_time: form.check_out_time,
        break_start_time: form.break_start_time,
        break_end_time: form.break_end_time,
        working_hours: metrics.working_hours,
        late_entry: metrics.late_entry,
        early_exit: metrics.early_exit,
        overtime: metrics.overtime,
        attendance_status: form.attendance_status,
        location: form.location,
      });
      setIsModalOpen(false);
      setSuccessMsg("Attendance marked successfully for today!");
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchMyAttendance();
    } catch (err) {
      console.error("Failed to add attendance", err);
      alert(err?.response?.data?.message || "Could not save attendance");
    } finally {
      setSubmitting(false);
    }
  };


  const getLiveDuration = (checkInTime) => {
    if (!checkInTime) return '0h 0m';
    const [h, m] = checkInTime.split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    const diff = Math.max(0, Math.floor((new Date() - start) / 1000));
    const hrs = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const presentDays = history.filter(h => h.attendance_status === 'Present').length;
  const absentDays = history.filter(h => h.attendance_status === 'Absent').length;

  // Real-time update for live duration
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const formatDateSafe = (val, opts = { weekday: 'short', month: 'short', day: 'numeric' }) => {
    if (!val) return '—';
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return '—';
    try {
      return d.toLocaleDateString('en-US', opts);
    } catch (e) {
      return '—';
    }
  };

  return (
    <div className="space-y-6 text-white pb-10">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5 shadow-2xl shadow-black/20 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-orange-400">Monthly Report</p>
          <h2 className="text-2xl font-semibold">Attendance Summary</h2>
          <p className="mt-2 text-sm text-white/60">Review your past attendance records and metrics.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              if (hasMarkedToday) {
                alert("You have already marked your attendance for today.");
                return;
              }
              if (todayHoliday) {
                alert("Attendance cannot be marked today because today is a holiday.");
                return;
              }
              if (approvedLeaveToday) {
                alert("Attendance cannot be marked today because approved leave exists for this date.");
                return;
              }
              setMetrics(calculateMetrics(form.check_in_time, form.check_out_time));
              setIsModalOpen(true);
            }}
            disabled={hasMarkedToday || todayHoliday || approvedLeaveToday}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition ${hasMarkedToday || todayHoliday || approvedLeaveToday ? 'bg-orange-500/50 cursor-not-allowed opacity-70' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            <PlusCircle size={16} /> Mark Attendance Today
          </button>
          
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            {todayHoliday && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-900/20 px-4 py-3 text-sm text-amber-100">
                Today is a holiday. Attendance is blocked.
              </div>
            )}
            {approvedLeaveToday && (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-900/20 px-4 py-3 text-sm text-rose-100">
                Approved leave exists for today. Attendance is blocked.
              </div>
            )}
          </div>
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
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-full transition ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-full transition ${viewMode === 'card' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-900/20 p-4 text-emerald-200">
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-[#0f172a]/70 p-10">
          <Loader2 className="mr-3 animate-spin text-orange-400" /> Loading your summary...
        </div>
      ) : error && !isModalOpen ? (
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
            <div className="rounded-2xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg shadow-black/20">
              <p className="text-sm text-white/50 mb-1">On Time Percentage</p>
              <h3 className="text-2xl font-bold text-blue-400">
                {presentDays > 0 ? Math.round((history.filter(h => h.late_entry === 'No').length / presentDays) * 100) : 0}%
              </h3>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 shadow-lg shadow-black/20 overflow-hidden">
            {history.length === 0 ? (
              <div className="p-10 text-center text-white/50">
                <CalendarDays size={48} className="mx-auto mb-3 opacity-20" />
                <p>No attendance records found for this month.</p>
              </div>
            ) : viewMode === 'table' ? (
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
                          {formatDateSafe(record.date || record.attendance_date)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${record.attendance_status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {record.attendance_status}
                          </span>
                        </td>
                        <td className="px-5 py-4">{record.check_in_time || '--'}</td>
                        <td className="px-5 py-4">{record.check_out_time || '--'}</td>
                        <td className="px-5 py-4">
                          {record.check_out_time ? record.working_hours : (record.check_in_time && record.date === todayDate) ? getLiveDuration(record.check_in_time) : '--'}
                        </td>
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {history.map((record, i) => (
                  <div key={record.id || i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-white">
                        {formatDateSafe(record.date || record.attendance_date)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${record.attendance_status === 'Present' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {record.attendance_status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-white/70 mb-3 border-t border-white/5 pt-3">
                      <div className="flex justify-between">
                        <span>Check-In</span>
                        <span className="text-white">{record.check_in_time || '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Check-Out</span>
                        <span className="text-white">{record.check_out_time || '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Working Hrs</span>
                        <span className="text-white">
                          {record.check_out_time ? record.working_hours : (record.check_in_time && record.date === todayDate) ? getLiveDuration(record.check_in_time) : '--'}
                        </span>
                      </div>
                    </div>
                    {record.location && (
                      <div className="flex items-start gap-1 text-xs text-white/50 mt-3 pt-3 border-t border-white/10">
                        <MapPin size={12} className="shrink-0 mt-0.5" />
                        <span className="line-clamp-2" title={record.location}>{record.location.replace(/\n/g, ' ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mark Attendance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/70 p-4">
          <div className="flex min-h-full items-start justify-center py-8">
            <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0f172a] shadow-2xl shadow-black/40 max-h-[90vh] overflow-hidden flex flex-col">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f172a] px-6 py-5 shrink-0">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-orange-400">Daily Record</p>
                  <h3 className="text-xl font-semibold">Mark My Attendance</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="rounded-full border border-white/10 p-2 text-white/70 hover:bg-white/10">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-900/20 p-4 text-sm text-rose-200">
                    <AlertCircle size={16} className="shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Date (Today only)</label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      disabled
                      className="w-full rounded-2xl border border-white/5 bg-black/20 px-3 py-3 outline-none text-white/50 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Attendance Status</label>
                    <select name="attendance_status" value={form.attendance_status} onChange={handleFormChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none">
                      <option value="Present" className="bg-slate-900">Present</option>
                      <option value="Absent" className="bg-slate-900">Absent</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white/70">Check-in Time</label>
                    <div className="flex gap-2">
                      <input type="time" name="check_in_time" value={form.check_in_time} onChange={handleFormChange} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" />
                      <button type="button" onClick={() => fillCurrentTime('check_in_time')} className="rounded-2xl bg-white/10 px-4 text-sm font-medium hover:bg-white/20 transition">Check In</button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Check-out Time</label>
                    <div className="flex gap-2">
                      <input type="time" name="check_out_time" value={form.check_out_time} onChange={handleFormChange} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" />
                      <button type="button" onClick={() => fillCurrentTime('check_out_time')} className="rounded-2xl bg-white/10 px-4 text-sm font-medium hover:bg-white/20 transition">Check Out</button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white/70">Break Start Time</label>
                    <div className="flex gap-2">
                      <input type="time" name="break_start_time" value={form.break_start_time} onChange={handleFormChange} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" />
                      <button type="button" onClick={() => fillCurrentTime('break_start_time')} className="rounded-2xl bg-white/10 px-4 text-sm font-medium hover:bg-white/20 transition">Start Break</button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Break End Time</label>
                    <div className="flex gap-2">
                      <input type="time" name="break_end_time" value={form.break_end_time} onChange={handleFormChange} className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" />
                      <button type="button" onClick={() => fillCurrentTime('break_end_time')} className="rounded-2xl bg-white/10 px-4 text-sm font-medium hover:bg-white/20 transition">End Break</button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-white/70">Working Hours</label>
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm">
                      <Clock3 size={16} className="text-orange-400" />
                      <span>{metrics.working_hours}</span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Late Entry</label>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm">{metrics.late_entry}</div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Early Exit</label>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm">{metrics.early_exit}</div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-white/70">Overtime</label>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm">{metrics.overtime}</div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-white/70">Office Location Verification *</label>
                    <div className="flex flex-col gap-3 md:flex-row">
                      <textarea
                        name="location"
                        value={form.location}
                        readOnly
                        rows={3}
                        placeholder="Use the button to verify you are at the office"
                        className="flex-1 rounded-2xl border border-white/5 bg-black/20 px-3 py-3 outline-none text-white/60 resize-none cursor-not-allowed"
                      />
                      <button type="button" onClick={handleLocation} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-400/40 px-4 py-3 text-orange-300 transition hover:bg-orange-400/10">
                        <MapPin size={16} /> Fetch Location
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              <div className="sticky bottom-0 bg-[#0f172a] border-t border-white/10 px-6 py-4 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-white/10 px-4 py-3 text-white/70 hover:bg-white/10">Cancel</button>
                <button 
                  type="submit" 
                  onClick={handleSubmit} 
                  disabled={submitting || !isWithinRadius} 
                  className={`rounded-2xl px-6 py-3 font-medium text-white transition ${isWithinRadius ? 'bg-orange-500 hover:bg-orange-600' : 'bg-orange-500/50 cursor-not-allowed opacity-50'}`}
                >
                  {submitting ? 'Saving...' : 'Save / Update'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendanceSummary;