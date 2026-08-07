import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Loader2, UserRoundCheck, UserRoundX } from 'lucide-react';
import api from '../../api';

export default function TraineeInternAttendanceView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const month = Number(searchParams.get('month')) || new Date().getMonth() + 1;
  const year = Number(searchParams.get('year')) || new Date().getFullYear();
  const [member, setMember] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const [memberRes, attendanceRes] = await Promise.all([
          api.get(`/trainee-intern/${id}`),
          api.get(`/trainee-intern-attendance/${id}?month=${month}&year=${year}`),
        ]);
        setMember(memberRes?.data?.data || null);
        setAttendance(attendanceRes?.data?.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load attendance details.');
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [id, month, year]);

  if (loading) {
    return <div className="min-h-screen bg-[#161C24] p-6 text-white"><div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-10 text-center"><Loader2 className="mx-auto mb-4 animate-spin" size={32} /> <p>Loading attendance details...</p></div></div>;
  }

  if (error) {
    return <div className="min-h-screen bg-[#161C24] p-6 text-white"><div className="rounded-3xl border border-red-500/40 bg-red-900/20 p-10 text-center text-red-200"><p>{error}</p><Link to="/employee/trainees/attendance" className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">Back</Link></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#161C24] text-white p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5 shadow-2xl shadow-black/20 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-orange-400">Trainee / Intern attendance</p>
            <h2 className="text-2xl font-semibold">Attendance details</h2>
            <p className="mt-2 text-sm text-white/60">Viewing attendance for {member?.full_name} in {new Date(year, month - 1).toLocaleString('en', { month: 'long' })} {year}.</p>
          </div>
          <Link to="/employee/trainees/attendance" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/10">
            <ArrowLeft size={16} /> Back to Attendance
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg shadow-black/20">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-orange-500/10 p-3 text-orange-300">
                <UserRoundCheck size={28} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">Person</p>
                <h3 className="mt-2 text-xl font-semibold">{member?.full_name}</h3>
                <p className="mt-1 text-sm text-white/60">{member?.person_id || member?.uuid}</p>
              </div>
            </div>
            <div className="mt-6 space-y-3 text-sm text-white/70">
              <div><p className="text-white/40">Type</p><p className="mt-1 font-medium text-white">{member?.type || 'N/A'}</p></div>
              <div><p className="text-white/40">Department</p><p className="mt-1 font-medium text-white">{member?.department || 'N/A'}</p></div>
              <div><p className="text-white/40">Email</p><p className="mt-1 font-medium text-white">{member?.email_address || 'N/A'}</p></div>
              <div><p className="text-white/40">Mobile</p><p className="mt-1 font-medium text-white">{member?.mobile_number || 'N/A'}</p></div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg shadow-black/20">
            <div className="mt-6 space-y-4">
              {attendance.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/60">No attendance records found for this month.</div>
              ) : attendance.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold">{item.attendance_date}</p>
                      <p className="text-sm text-white/60">Status: {item.attendance_status}</p>
                    </div>
                    <div className="grid gap-3 text-sm md:grid-cols-4">
                      <div><p className="text-white/40">Check In</p><p>{item.check_in_time || '—'}</p></div>
                      <div><p className="text-white/40">Check Out</p><p>{item.check_out_time || '—'}</p></div>
                      <div><p className="text-white/40">Working Hours</p><p>{item.working_hours || '—'}</p></div>
                      <div><p className="text-white/40">Location</p><p>{item.location || '—'}</p></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

