import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock3, Eye, Loader2, MapPin, UserRoundCheck, UserRoundX } from "lucide-react";
import api from "../api";

const today = new Date();
const defaultMonth = today.getMonth() + 1;
const defaultYear = today.getFullYear();

const AttendanceView = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const month = Number(searchParams.get("month")) || defaultMonth;
  const year = Number(searchParams.get("year")) || defaultYear;

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const [employeeRes, attendanceRes] = await Promise.all([
          api.get(`/employees/${id}`),
          api.get(`/attendance/${id}?month=${month}&year=${year}`),
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

    loadAttendance();
  }, [id, month, year]);

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
            <p className="mt-2 text-sm text-white/60">Viewing attendance for {employee?.first_name} {employee?.last_name} in {new Date(year, month - 1).toLocaleString("en", { month: "long" })} {year}.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/attendance" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10">
              <ArrowLeft size={16} /> Back to Attendance
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg shadow-black/20">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-orange-500/10 p-3 text-orange-300">
                <UserRoundCheck size={28} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">Employee</p>
                <h3 className="mt-2 text-xl font-semibold">{employee?.first_name} {employee?.last_name}</h3>
                <p className="mt-1 text-sm text-white/60">{employee?.employee_code || employee?.employee_id}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-white/70">
              <div>
                <p className="text-white/40">Role</p>
                <p className="mt-1 font-medium text-white">{employee?.role || "N/A"}</p>
              </div>
              <div>
                <p className="text-white/40">Designation</p>
                <p className="mt-1 font-medium text-white">{employee?.designation || "N/A"}</p>
              </div>
              <div>
                <p className="text-white/40">Email</p>
                <p className="mt-1 font-medium text-white">{employee?.personal_email || "N/A"}</p>
              </div>
              <div>
                <p className="text-white/40">Phone</p>
                <p className="mt-1 font-medium text-white">{employee?.mobile_number || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg shadow-black/20">
            <div className="grid gap-4 md:grid-cols-3">
              {renderMetricCard("Month", new Date(year, month - 1).toLocaleString("en", { month: "long" }), true)}
              {renderMetricCard("Year", year, false)}
              {renderMetricCard("Records", attendance.length, true)}
            </div>

            <div className="mt-6 space-y-4">
              {attendance.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/60">No attendance records found for this month.</div>
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
                      <div className="grid gap-3 text-sm md:grid-cols-4">
                        <div>
                          <p className="text-white/40">Check In</p>
                          <p>{item.check_in_time || "—"}</p>
                        </div>
                        <div>
                          <p className="text-white/40">Check Out</p>
                          <p>{item.check_out_time || "—"}</p>
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
