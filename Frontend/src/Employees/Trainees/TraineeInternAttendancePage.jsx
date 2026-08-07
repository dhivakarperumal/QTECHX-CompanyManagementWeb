import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Select from 'react-select';
import { CalendarDays, PlusCircle, Loader2, Eye, UserRoundCheck, UserRoundX, GraduationCap, Search, LayoutGrid, List, X } from 'lucide-react';
import api from '../../api';
import ModalPortal from '../../Componets/CommonComponents/ModalPortal';

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#1a1d24',
    border: `1px solid ${state.isFocused
        ? '#f97316'
        : 'rgba(255,255,255,0.1)'
      }`,
    boxShadow: 'none',
    outline: 'none',
    minHeight: '42px',
    height: '42px',
    borderRadius: '12px',

    // '&:hover': {
    //   border: '1px solid #f97316',
    // },
  }),

  valueContainer: (provided) => ({
    ...provided,
    padding: '0 12px',
    fontSize: '13px',
  }),

  singleValue: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
  }),

  placeholder: (provided) => ({
    ...provided,
    color: 'rgba(255,255,255,.35)',
    fontSize: '13px',
  }),

  input: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
    margin: 0,
    padding: 0,
  }),

  menu: (provided) => ({
    ...provided,
    background: '#1a1d24',
    // border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  }),

  menuList: (provided) => ({
    ...provided,
    padding: 0,
    fontSize: '13px',
  }),

  option: (provided, state) => ({
    ...provided,
    fontSize: '13px',      // dropdown font size
    padding: '8px 14px',   // reduce option height
    backgroundColor: state.isSelected
      ? '#f97316'
      : state.isFocused
        ? 'rgba(249,115,22,.15)'
        : '#1a1d24',
    color: '#fff',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#ea580c',
    },
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),

  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#888',
    padding: '6px',
  }),
};

const today = new Date();
const defaultMonth = today.getMonth() + 1;
const defaultYear = today.getFullYear();

export default function TraineeInternAttendancePage() {
  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    trainee_intern_id: '',
    date: today.toISOString().slice(0, 10),
    check_in_time: '',
    check_out_time: '',
    attendance_status: 'Present',
    location: '',
  });
  const [metrics, setMetrics] = useState({ working_hours: '0h 0m', late_entry: 'No', early_exit: 'No', overtime: 'No' });

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [membersRes, summaryRes] = await Promise.all([
        api.get('/trainee-intern?limit=200'),
        api.get(`/trainee-intern-attendance/summary?month=${selectedMonth}&year=${selectedYear}`),
      ]);
      setMembers(membersRes?.data?.data || []);
      setSummary(summaryRes?.data?.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to load trainee/intern attendance');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (checkIn, checkOut) => {
    const parseTime = (value) => {
      if (!value) return null;
      const [hours, minutes] = value.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const officeCheckIn = parseTime('09:30');
    const officeCheckOut = parseTime('18:00');
    const checkInMinutes = parseTime(checkIn);
    const checkOutMinutes = parseTime(checkOut);

    let workingHours = '0h 0m';
    let lateEntry = 'No';
    let earlyExit = 'No';
    let overtime = 'No';

    if (checkInMinutes !== null && checkOutMinutes !== null) {
      const durationMinutes = Math.max(0, checkOutMinutes - checkInMinutes);
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      workingHours = `${hours}h ${minutes}m`;
    }

    if (checkInMinutes !== null) {
      const lateBy = checkInMinutes - officeCheckIn;
      if (lateBy > 0) lateEntry = `${Math.floor(lateBy / 60)}h ${lateBy % 60}m`;
    }

    if (checkOutMinutes !== null) {
      const exitBefore = officeCheckOut - checkOutMinutes;
      if (exitBefore > 0) earlyExit = `${Math.floor(exitBefore / 60)}h ${exitBefore % 60}m`;
    }

    if (checkOutMinutes !== null) {
      const overtimeMinutes = Math.max(0, checkOutMinutes - officeCheckOut);
      if (overtimeMinutes > 0) overtime = `${Math.floor(overtimeMinutes / 60)}h ${overtimeMinutes % 60}m`;
    }

    return { working_hours: workingHours, late_entry: lateEntry, early_exit: earlyExit, overtime };
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

    if (name === 'check_in_time' || name === 'check_out_time') {
      setMetrics(calculateMetrics(nextForm.check_in_time, nextForm.check_out_time));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/trainee-intern-attendance', {
        trainee_intern_id: form.trainee_intern_id,
        date: form.date,
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
      setForm({ trainee_intern_id: '', date: today.toISOString().slice(0, 10), check_in_time: '', check_out_time: '', attendance_status: 'Present', location: '' });
      setMetrics({ working_hours: '0h 0m', late_entry: 'No', early_exit: 'No', overtime: 'No' });
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || 'Could not save attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const cards = useMemo(() => {
    const baseCards = summary.length
      ? summary
      : (members || []).map((member) => ({ trainee_intern_id: member.uuid, trainee_name: member.full_name, person_id: member.person_id, type: member.type, present_days: 0, absent_days: 0 }));
    const term = searchTerm.trim().toLowerCase();
    if (!term) return baseCards;
    return baseCards.filter((person) => {
      const haystack = `${person.trainee_name || person.full_name || ''} ${person.person_id || ''} ${person.type || ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [summary, members, searchTerm]);

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5 shadow-2xl shadow-black/20 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-orange-400">Trainee & Intern Attendance</p>
          <h2 className="text-2xl font-semibold">Attendance dashboard</h2>
          <p className="mt-2 text-sm text-white/60">Track day-to-day attendance and review monthly reports for trainees and interns.</p>
        </div>
        <div className="flex flex-wrap gap-3">

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm min-w-[160px]">
            <CalendarDays size={16} className="text-orange-400 ml-2" />
            <Select
              value={{ value: selectedMonth, label: new Date(2024, selectedMonth - 1).toLocaleString('en', { month: 'long' }) }}
              onChange={(option) => setSelectedMonth(Number(option.value))}
              options={Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: new Date(2024, index).toLocaleString('en', { month: 'long' }) }))}
              styles={{ ...customSelectStyles, control: (base, state) => ({ ...customSelectStyles.control(base, state), minHeight: '38px', backgroundColor: 'transparent', border: 'none', boxShadow: 'none', cursor: 'pointer' }) }}
              isSearchable={false}
              className="flex-1"
            />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm min-w-[120px]">
            <CalendarDays size={16} className="text-orange-400 ml-2" />
            <Select
              value={{ value: selectedYear, label: selectedYear.toString() }}
              onChange={(option) => setSelectedYear(Number(option.value))}
              options={[selectedYear - 1, selectedYear, selectedYear + 1].map(year => ({ value: year, label: year.toString() }))}
              styles={{ ...customSelectStyles, control: (base, state) => ({ ...customSelectStyles.control(base, state), minHeight: '38px', backgroundColor: 'transparent', border: 'none', boxShadow: 'none', cursor: 'pointer' }) }}
              isSearchable={false}
              className="flex-1"
            />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 font-medium text-white transition hover:bg-orange-600">
            <PlusCircle size={16} /> Add Attendance
          </button>
          <div className="flex items-center rounded-full border border-white/10 bg-white/10 p-1">
            <button onClick={() => setViewMode('table')} className={`rounded-full p-2 transition ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-white/60 hover:text-white'}`} title="Table view"><List size={16} /></button>
            <button onClick={() => setViewMode('card')} className={`rounded-full p-2 transition ${viewMode === 'card' ? 'bg-orange-500 text-white' : 'text-white/60 hover:text-white'}`} title="Card view"><LayoutGrid size={16} /></button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search trainee or intern" className="w-64 rounded-full border border-white/10 bg-white/10 px-9 py-2 text-sm text-white outline-none focus:border-orange-500/70" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-[#0f172a]/70 p-10">
          <Loader2 className="mr-3 animate-spin" /> Loading attendance details...
        </div>
      ) : (
        <>
          {error && <div className="rounded-2xl border border-red-500/40 bg-red-900/20 p-4 text-red-200">{error}</div>}
          {viewMode === 'table' ? (
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0f172a]/70">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5 text-white/60">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Person ID</th>
                    <th className="px-4 py-3 text-left">Present</th>
                    <th className="px-4 py-3 text-left">Absent</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {cards.length === 0 ? (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-white/60">No trainee or intern records found.</td></tr>
                  ) : cards.map((person) => (
                    <tr key={person.trainee_intern_id} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-semibold text-white">{person.trainee_name || person.full_name}</td>
                      <td className="px-4 py-3 text-white/60">{person.type || 'Trainee / Intern'}</td>
                      <td className="px-4 py-3 text-white/60">{person.person_id || 'TI'}</td>
                      <td className="px-4 py-3 text-emerald-400">{person.present_days || 0}</td>
                      <td className="px-4 py-3 text-rose-400">{person.absent_days || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/admin/trainees/attendance/view/${person.trainee_intern_id}?month=${selectedMonth}&year=${selectedYear}`} className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 px-3 py-2 text-orange-300 transition hover:bg-orange-400/10"><Eye size={14} /> View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cards.length === 0 ? (
                <div className="col-span-full rounded-3xl border border-white/10 bg-[#0f172a]/70 p-10 text-center text-white/60">No trainee or intern records found.</div>
              ) : cards.map((person) => (
                <div key={person.trainee_intern_id} className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg shadow-black/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/40">{person.person_id || 'TI'}</p>
                      <h3 className="mt-1 text-lg font-semibold">{person.trainee_name || person.full_name}</h3>
                      <p className="text-sm text-white/60">{person.type || 'Trainee / Intern'}</p>
                    </div>
                    <div className={`rounded-full p-2 ${Number(person.present_days || 0) > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-slate-700/60 text-slate-300'}`}>
                      {Number(person.present_days || 0) > 0 ? <UserRoundCheck size={18} /> : <UserRoundX size={18} />}
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-white/40">Present Days</p>
                      <p className="mt-1 text-xl font-semibold text-emerald-400">{person.present_days || 0}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                      <p className="text-white/40">Absent Days</p>
                      <p className="mt-1 text-xl font-semibold text-rose-400">{person.absent_days || 0}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between text-sm text-white/60">
                    <span className="font-medium">ID: {person.trainee_intern_id}</span>
                    <Link to={`/admin/trainees/attendance/view/${person.trainee_intern_id}?month=${selectedMonth}&year=${selectedYear}`} className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 px-3 py-2 text-orange-300 transition hover:bg-orange-400/10">
                      <Eye size={14} /> View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
            onClick={(event) => event.target === event.currentTarget && setIsModalOpen(false)}
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#111318] p-6 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-orange-400">New record</p>
                  <h3 className="text-xl font-semibold">Add trainee/intern attendance</h3>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full border border-white/10 p-2 text-white/70 hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/70">Trainee / Intern</label>
                  <Select
                    value={form.trainee_intern_id ? { value: form.trainee_intern_id, label: members.find(m => m.uuid === form.trainee_intern_id) ? `${members.find(m => m.uuid === form.trainee_intern_id).full_name} (${members.find(m => m.uuid === form.trainee_intern_id).person_id || form.trainee_intern_id})` : 'Select member' } : null}
                    onChange={(option) => handleFormChange({ target: { name: 'trainee_intern_id', value: option ? option.value : '' } })}
                    options={members.map((member) => ({ value: member.uuid, label: `${member.full_name} (${member.person_id || member.uuid})` }))}
                    styles={customSelectStyles}
                    placeholder="Select member"
                    isSearchable={true}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/70">Date</label>
                  <input type="date" name="date" value={form.date} onChange={handleFormChange} required className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/70">Attendance Status</label>
                  <Select
                    value={form.attendance_status ? { value: form.attendance_status, label: form.attendance_status } : null}
                    onChange={(option) => handleFormChange({ target: { name: 'attendance_status', value: option ? option.value : '' } })}
                    options={[
                      { value: 'Present', label: 'Present' },
                      { value: 'Absent', label: 'Absent' }
                    ]}
                    styles={customSelectStyles}
                    isSearchable={false}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/70">Check-in Time</label>
                  <input type="time" name="check_in_time" value={form.check_in_time} onChange={handleFormChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-white/70">Check-out Time</label>
                  <input type="time" name="check_out_time" value={form.check_out_time} onChange={handleFormChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" />
                </div>
                <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="grid gap-3 md:grid-cols-4 text-sm">
                    <div><p className="text-white/40">Working Hours</p><p className="mt-1 font-semibold text-white">{metrics.working_hours}</p></div>
                    <div><p className="text-white/40">Late Entry</p><p className="mt-1 font-semibold text-white">{metrics.late_entry}</p></div>
                    <div><p className="text-white/40">Early Exit</p><p className="mt-1 font-semibold text-white">{metrics.early_exit}</p></div>
                    <div><p className="text-white/40">Overtime</p><p className="mt-1 font-semibold text-white">{metrics.overtime}</p></div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-white/70">Location</label>
                  <input type="text" name="location" value={form.location} onChange={handleFormChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" placeholder="Optional location" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70">Cancel</button>
                  <button type="submit" disabled={submitting} className="rounded-2xl bg-orange-500 hover:bg-orange-600 px-6 py-3 font-medium text-white transition disabled:opacity-50 flex justify-center items-center">
                    {submitting ? "Saving..." : "Save / Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
