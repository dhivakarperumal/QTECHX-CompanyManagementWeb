import { useState, useEffect } from 'react';
import { Clock3, MapPin, PlusCircle, X, ClipboardCheck, AlertCircle } from 'lucide-react';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';
import ModalPortal from '../Componets/CommonComponents/ModalPortal';

const OFFICE_LAT = 12.479818640954804;
const OFFICE_LNG = 78.57369573005468;
const ALLOWED_RADIUS_METERS = 500;

const getEmployeeReference = (user) => {
  if (!user) return null;
  return String(
    user.employee_id ||
    user.employeeId ||
    user.user_id ||
    user.id ||
    user.uuid ||
    user._id ||
    ""
  ).trim() || null;
};

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [isWithinRadius, setIsWithinRadius] = useState(false);

  useEffect(() => {
    checkTodayAttendance();
  }, [user]);

  const checkTodayAttendance = async () => {
    if (!user) return;

    const fetchTodayAttendance = async () => {
      try {
        const targetId = getEmployeeReference(user);
        if (!targetId) return;

        const d = new Date();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const dateStr = d.toISOString().slice(0, 10);

        const res = await api.get(`/attendance/${targetId}?month=${month}&year=${year}`);
        if (res.data && res.data.data) {
          const todayRecord = res.data.data.find(r => (r.date === dateStr) || (r.attendance_date && String(r.attendance_date).startsWith(dateStr)));
          if (todayRecord) {
            setAttendanceRecord(todayRecord);
          }
        }
      } catch (err) {
        console.warn("Could not fetch attendance summary", err);
      } finally {
        setLoading(false);
      }
    };

    const handleLocation = () => {
      if (!navigator.geolocation) {
        setError("Geolocation not supported");
        return;
      }
      setError(null);
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

            setLocationStr(`Latitude: ${latitude}\nLongitude: ${longitude}\n\nAddress: ${fullAddress}`);

            if (distance > ALLOWED_RADIUS_METERS) {
              setError(`You are ${Math.round(distance)}m away from the office. You must be within ${ALLOWED_RADIUS_METERS}m to mark attendance.`);
            } else {
              setError(null);
            }
          } catch (err) {
            console.error(err);
            setLocationStr(`Latitude: ${position.coords.latitude}\nLongitude: ${position.coords.longitude}`);
          }
        },
        (error) => {
          console.error(error);
          setError("Unable to fetch location. Please ensure location services are enabled.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    const executeAction = async (endpoint, payload = {}) => {
      if (endpoint === '/attendance/clock-in' && !isWithinRadius) {
        setError(`You must be within ${ALLOWED_RADIUS_METERS} meters of the office to clock in.`);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const possibleIds = [user?.employee_id, user?.uuid, user?.id, user?._id, user?.userId, user?.user_id].filter(Boolean).map(String);
        const employee_id = possibleIds.find(id => id.length > 20) || possibleIds[0];

        const res = await api({
          method: endpoint === '/attendance/clock-in' ? 'post' : 'put',
          url: endpoint,
          data: { employee_id, location: locationStr, ...payload }
        });
        setSuccessMsg(res.data.message);
        setTimeout(() => setSuccessMsg(''), 4000);
        await checkTodayAttendance();
      } catch (err) {
        console.error(`Failed to ${endpoint}`, err);
        setError(err?.response?.data?.message || `Could not complete action`);
      } finally {
        setLoading(false);
      }
    };

    const getWorkingDuration = () => {
      if (!attendanceRecord?.check_in_time) return "0h 0m 0s";
      const [h, m] = attendanceRecord.check_in_time.split(':').map(Number);
      const start = new Date();
      start.setHours(h, m, 0, 0);

      let end = currentTime;
      if (attendanceRecord.check_out_time) {
        const [endH, endM] = attendanceRecord.check_out_time.split(':').map(Number);
        end = new Date();
        end.setHours(endH, endM, 0, 0);
      }

      let diff = Math.floor((end - start) / 1000);
      if (diff < 0) diff = 0;

      let breakSecs = 0;
      if (attendanceRecord.break_start_time) {
        const [bsh, bsm] = attendanceRecord.break_start_time.split(':').map(Number);
        const bs = new Date();
        bs.setHours(bsh, bsm, 0, 0);

        let be = end;
        if (attendanceRecord.break_end_time) {
          const [beh, bem] = attendanceRecord.break_end_time.split(':').map(Number);
          be = new Date();
          be.setHours(beh, bem, 0, 0);
        }
        breakSecs = Math.max(0, Math.floor((be - bs) / 1000));
      }

      diff = Math.max(0, diff - breakSecs);

      const hrs = Math.floor(diff / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      const secs = diff % 60;
      return `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    };

    const getStatusText = () => {
      if (!attendanceRecord) return "Offline";
      if (attendanceRecord.check_out_time) return attendanceRecord.attendance_status; // "Present" or "Half Day"
      if (attendanceRecord.break_start_time && !attendanceRecord.break_end_time) return "On Break";
      return "Working";
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
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm">
              <CalendarDays size={16} className="text-orange-400" />
              <span>{todayDate}</span>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-900/20 p-4 text-emerald-200">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-900/20 p-4 text-rose-200 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-6 shadow-lg shadow-black/20 flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="text-xl font-semibold mb-2">Live Status</h3>
            <p className={`text-sm mb-6 ${getStatusText() === 'Working' ? 'text-emerald-400' : getStatusText() === 'On Break' ? 'text-orange-400' : 'text-slate-400'}`}>
              ● {getStatusText()}
            </p>

            <div className="text-5xl font-mono tracking-wider mb-8 text-white/90">
              {getWorkingDuration()}
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              {!attendanceRecord?.check_in_time ? (
                <button
                  onClick={() => executeAction('/attendance/clock-in')}
                  disabled={loading || !isWithinRadius}
                  className="col-span-2 rounded-2xl bg-emerald-500 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin inline mr-2" size={16} /> : null}
                  Clock In
                </button>
              ) : !attendanceRecord.check_out_time ? (
                <>
                  {!attendanceRecord.break_start_time ? (
                    <button
                      onClick={() => executeAction('/attendance/break-start')}
                      disabled={loading}
                      className="rounded-2xl bg-orange-500 py-3 font-medium text-white transition hover:bg-orange-600 disabled:opacity-50"
                    >
                      Start Break
                    </button>
                  ) : !attendanceRecord.break_end_time ? (
                    <button
                      onClick={() => executeAction('/attendance/break-end')}
                      disabled={loading}
                      className="rounded-2xl bg-emerald-500 py-3 font-medium text-white transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                      End Break
                    </button>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/5 py-3 text-center text-white/40">Break Finished</div>
                  )}

                  <button
                    onClick={() => executeAction('/attendance/clock-out')}
                    disabled={loading || (attendanceRecord.break_start_time && !attendanceRecord.break_end_time)}
                    className="rounded-2xl bg-rose-500 py-3 font-medium text-white transition hover:bg-rose-600 disabled:opacity-50"
                  >
                    Clock Out
                  </button>
                </>
              ) : (
                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-center text-white/40">
                  Shift Completed
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-6 shadow-lg shadow-black/20 flex flex-col">
            <h3 className="text-xl font-semibold mb-4">Location Verification</h3>

            {!attendanceRecord?.check_in_time && (
              <p className="text-sm text-white/60 mb-6">
                You must be at the office to clock in. Office is located at {OFFICE_LAT}, {OFFICE_LNG}. Please fetch your location to verify.
              </p>
            )}

            <textarea
              readOnly
              rows={4}
              value={locationStr || (attendanceRecord?.location) || ''}
              placeholder="Location details will appear here..."
              className="w-full flex-1 rounded-2xl border border-white/5 bg-black/20 p-4 outline-none text-white/60 resize-none mb-4"
            />

            {!attendanceRecord?.check_in_time && (
              <button
                onClick={handleLocation}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-400/40 px-4 py-3 text-orange-300 transition hover:bg-orange-400/10"
              >
                <MapPin size={16} /> Fetch Location
              </button>
            )}
          </div>
        </div>

      </div>
    );
  };
}
export default EmployeeAttendance;
