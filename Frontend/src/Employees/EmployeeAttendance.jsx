import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock3, MapPin, PlusCircle, X, Loader2, ClipboardCheck, AlertCircle } from 'lucide-react';
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

const EmployeeAttendance = () => {
  const { user } = useAuth();
  const todayDate = new Date().toISOString().slice(0, 10);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [hasMarkedToday, setHasMarkedToday] = useState(false);
  
  const [form, setForm] = useState({
    date: todayDate,
    check_in_time: '09:30',
    check_out_time: '18:00',
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

  useEffect(() => {
    checkTodayAttendance();
  }, [user]);

  const checkTodayAttendance = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const possibleIds = [user?.employee_id, user?.uuid, user?.id, user?._id, user?.userId, user?.user_id].filter(Boolean).map(String);
      if (possibleIds.length === 0) return;
      const targetId = possibleIds.find(id => id.length > 20) || possibleIds[0];

      const d = new Date();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const dateStr = d.toISOString().slice(0, 10);

      const res = await api.get(`/attendance/${targetId}?month=${month}&year=${year}`);
      if (res.data && res.data.data) {
        const todayRecord = res.data.data.find(r => (r.date === dateStr) || (r.attendance_date && String(r.attendance_date).startsWith(dateStr)));
        if (todayRecord) {
          setHasMarkedToday(true);
        }
      }
    } catch (err) {
      console.warn("Could not fetch attendance summary", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (name === "check_in_time" || name === "check_out_time") {
      const computed = calculateMetrics(nextForm.check_in_time, nextForm.check_out_time);
      setMetrics(computed);
    }
  };

  const calculateMetrics = (checkIn, checkOut) => {
    const parseTime = (value) => {
      if (!value) return null;
      const [time, modifier] = String(value).split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let total = hours * 60 + minutes;
      if (modifier === "PM" && hours !== 12) total += 12 * 60;
      if (modifier === "AM" && hours === 12) total -= 12 * 60;
      return total;
    };

    const officeCheckIn = parseTime("9:30 AM");
    const officeCheckOut = parseTime("6:00 PM");
    const checkInMinutes = parseTime(checkIn);
    const checkOutMinutes = parseTime(checkOut);

    let workingHours = "0h 0m";
    let lateEntry = "No";
    let earlyExit = "No";
    let overtime = "No";

    if (checkInMinutes !== null) {
      const lateBy = checkInMinutes - officeCheckIn;
      if (lateBy > 0) {
        lateEntry = `${Math.floor(lateBy / 60)}h ${lateBy % 60}m`;
      }
    }

    if (checkOutMinutes !== null) {
      const exitBefore = officeCheckOut - checkOutMinutes;
      if (exitBefore > 0) {
        earlyExit = `${Math.floor(exitBefore / 60)}h ${exitBefore % 60}m`;
      }
    }

    if (checkInMinutes !== null && checkOutMinutes !== null) {
      const durationMinutes = Math.max(0, checkOutMinutes - checkInMinutes);
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      workingHours = `${hours}h ${minutes}m`;

      const overtimeMinutes = Math.max(0, checkOutMinutes - officeCheckOut);
      if (overtimeMinutes > 0) {
        overtime = `${Math.floor(overtimeMinutes / 60)}h ${overtimeMinutes % 60}m`;
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
      // Prioritize UUID for DB insertion to prevent integer/string mismatch
      const possibleIds = [user?.employee_id, user?.uuid, user?.id, user?._id, user?.userId, user?.user_id].filter(Boolean).map(String);
      const employee_id = possibleIds.find(id => id.length > 20) || possibleIds[0];

      await api.post("/attendance", {
        employee_id: employee_id,
        date: form.date, // always today
        check_in_time: form.check_in_time,
        check_out_time: form.check_out_time,
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
      setHasMarkedToday(true);
    } catch (err) {
      console.error("Failed to add attendance", err);
      alert(err?.response?.data?.message || "Could not save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-white pb-10">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5 shadow-2xl shadow-black/20 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-orange-400">My Attendance</p>
          <h2 className="text-2xl font-semibold">Daily Attendance</h2>
          <p className="mt-2 text-sm text-white/60">Mark your daily check-in/out while present at the office.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              if (hasMarkedToday) {
                alert("You have already marked your attendance for today.");
                return;
              }
              setMetrics(calculateMetrics(form.check_in_time, form.check_out_time));
              setIsModalOpen(true);
            }} 
            disabled={hasMarkedToday}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-medium text-white transition ${hasMarkedToday ? 'bg-orange-500/50 cursor-not-allowed opacity-70' : 'bg-orange-500 hover:bg-orange-600'}`}
          >
            <PlusCircle size={16} /> Mark Attendance Today
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-900/20 p-4 text-emerald-200">
          {successMsg}
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-10 text-center text-white/60 shadow-lg shadow-black/20 flex flex-col items-center">
        <ClipboardCheck size={48} className="text-orange-400 mb-4 opacity-30" />
        <h3 className="text-xl text-white font-semibold mb-2">
          {hasMarkedToday ? "You have already marked your attendance today." : "You have not marked attendance for today."}
        </h3>
        <p className="max-w-md">Use the &quot;Mark Attendance Today&quot; button to record your presence. Ensure you are at the office premises before fetching your location.</p>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-orange-400">Daily Record</p>
                <h3 className="text-xl font-semibold">Mark My Attendance</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full border border-white/10 p-2 text-white/70 hover:bg-white/10">
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-500/40 bg-rose-900/20 p-4 text-sm text-rose-200">
                <AlertCircle size={16} className="shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
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
                <input type="time" name="check_in_time" value={form.check_in_time} onChange={handleFormChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70">Check-out Time</label>
                <input type="time" name="check_out_time" value={form.check_out_time} onChange={handleFormChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" />
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

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-white/10 px-4 py-3 text-white/70 hover:bg-white/10">Cancel</button>
                <button 
                  type="submit" 
                  disabled={submitting || !isWithinRadius} 
                  className={`rounded-2xl px-4 py-3 font-medium text-white transition ${isWithinRadius ? 'bg-orange-500 hover:bg-orange-600' : 'bg-orange-500/50 cursor-not-allowed opacity-50'}`}
                >
                  {submitting ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendance;
