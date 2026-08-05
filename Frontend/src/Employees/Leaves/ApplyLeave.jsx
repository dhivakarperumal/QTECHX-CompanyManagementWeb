import { useState, useEffect } from 'react';
import { useAuth } from '../../PrivateRouter/AuthContext';
import api from '../../api';
import toast, { Toaster } from 'react-hot-toast';
import { FileText, Loader2, Send, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ModalPortal from '../../Componets/CommonComponents/ModalPortal';
import Select from 'react-select';

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#1a1d24',
    border: `1px solid ${state.isFocused ? '#f97316' : 'rgba(255,255,255,0.1)'}`,
    boxShadow: 'none',
    outline: 'none',
    minHeight: '42px',
    height: '42px',
    borderRadius: '12px',
    '&:hover': {
      border: '1px solid #f97316',
    },
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
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '12px',
    overflow: 'hidden',
    zIndex: 9999,
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0,
    fontSize: '13px',
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '13px',
    padding: '8px 14px',
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


const defaultLeaveTypes = [
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Work From Home",
  "Comp Off"
];

const ApplyLeave = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    leave_type: 'Casual Leave',
    from_date: '',
    to_date: '',
    no_of_days: 0,
    day_type: 'Full Day',
    half_day_type: 'Morning',
    reason: ''
  });

  const [loading, setLoading] = useState(false);
  const [leaveSettings, setLeaveSettings] = useState([]);
  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [events, setEvents] = useState([]);
  const [holidayOverlap, setHolidayOverlap] = useState(false);
  const [holidayMessage, setHolidayMessage] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(true);
  const availableLeaveTypes = [...new Set([...(leaveSettings || []).map((item) => item.leave_type), ...defaultLeaveTypes])].filter(Boolean);
  const enrichedLeaveSettings = leaveSettings.map((setting) => {
    const taken = employeeLeaves
      .filter((leave) => leave.leave_type === setting.leave_type && leave.status === 'Approved')
      .reduce((sum, leave) => sum + Number(leave.no_of_days || 0), 0);

    return {
      ...setting,
      taken,
      remaining: Math.max(Number(setting.max_days || 0) - taken, 0),
    };
  });
  const selectedLeaveSetting = enrichedLeaveSettings.find((item) => item.leave_type === formData.leave_type) || null;

  useEffect(() => {
    const fetchLeaveSettings = async () => {
      try {
        const [settingsRes, leavesRes, eventsRes] = await Promise.all([
          api.get('/leave-settings'),
          api.get('/employee-leaves/my-leaves'),
          api.get('/events')
        ]);

        setLeaveSettings(settingsRes.data?.data || []);
        setEmployeeLeaves(leavesRes.data?.data || []);
        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      } catch (error) {
        console.error('Failed to load leave settings', error);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchLeaveSettings();
  }, []);

  useEffect(() => {
    if (formData.from_date && formData.to_date) {
      const start = new Date(formData.from_date);
      const end = new Date(formData.to_date);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        if (formData.day_type === 'Half Day') {
          days = 0.5;
        }
        
        setFormData(prev => ({ ...prev, no_of_days: days }));
      } else {
        setFormData(prev => ({ ...prev, no_of_days: 0 }));
      }
    }
  }, [formData.from_date, formData.to_date, formData.day_type]);

  useEffect(() => {
    if (formData.day_type === 'Half Day' && formData.from_date) {
      setFormData(prev => ({ ...prev, to_date: prev.from_date || formData.from_date }));
    }
  }, [formData.day_type, formData.from_date]);

  useEffect(() => {
    if (!formData.from_date || !formData.to_date || !events?.length) {
      setHolidayOverlap(false);
      setHolidayMessage('');
      return;
    }

    const from = new Date(formData.from_date);
    const to = new Date(formData.to_date);
    const overlappingHoliday = events.some((event) => {
      if (String(event.eventType).toLowerCase() !== 'holiday') return false;
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate || event.startDate);
      return eventStart <= to && eventEnd >= from;
    });

    if (overlappingHoliday) {
      setHolidayOverlap(true);
      setHolidayMessage('Selected leave dates overlap with a holiday. Please adjust the range.');
    } else {
      setHolidayOverlap(false);
      setHolidayMessage('');
    }
  }, [formData.from_date, formData.to_date, events]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toDateOnly = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const hasDuplicateLeave = () => {
    if (!formData.from_date) return false;
    const selectedFrom = toDateOnly(formData.from_date);
    const selectedTo = toDateOnly(formData.day_type === 'Half Day' ? formData.from_date : formData.to_date || formData.from_date);
    if (!selectedFrom || !selectedTo) return false;

    return employeeLeaves.some((leave) => {
      if (!leave.from_date) return false;
      const leaveFrom = toDateOnly(leave.from_date);
      const leaveTo = toDateOnly(leave.to_date || leave.from_date);
      if (!leaveFrom || !leaveTo) return false;
      const status = String(leave.status || '').toLowerCase();
      if (status.includes('reject')) return false;
      if (status.includes('cancel')) return false;
      return leaveFrom.getTime() <= selectedTo.getTime() && leaveTo.getTime() >= selectedFrom.getTime();
    });
  };

  const hasSundayInRange = () => {
    if (!formData.from_date) return false;
    const start = toDateOnly(formData.from_date);
    const end = toDateOnly(formData.day_type === 'Half Day' ? formData.from_date : formData.to_date || formData.from_date);
    if (!start || !end) return false;

    for (let d = new Date(start); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 0) {
        return true;
      }
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.no_of_days <= 0) {
      toast.error('Invalid date range');
      return;
    }

    if (hasDuplicateLeave()) {
      toast.error('Leave has already been applied for the selected date. Duplicate same-day leave requests are not allowed.');
      return;
    }

    if (hasSundayInRange()) {
      toast.error('Leave cannot be applied for Sunday. Please choose another date.');
      return;
    }

    const selectedSetting = enrichedLeaveSettings.find((item) => item.leave_type === formData.leave_type);
    if (holidayOverlap) {
      toast.error('Selected leave dates overlap with a holiday. Please adjust the range.');
      return;
    }

    if (selectedSetting && Number(selectedSetting.is_active) === 1 && Number(formData.no_of_days) > Number(selectedSetting.max_days || 0)) {
      toast.error(`${formData.leave_type} limit exceeded. Maximum allowed days: ${selectedSetting.max_days}`);
      return;
    }
    setLoading(true);
    try {
      await api.post('/employee-leaves/apply', formData);
      toast.success('Leave applied successfully');
      navigate('/employee/leaves/history');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply leave');
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  return (
    <ModalPortal>
      <Toaster position="top-right" containerStyle={{ zIndex: 99999 }} />
      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={(event) => event.target === event.currentTarget && navigate('/employee/leaves/history')}
      >
        <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-[#0f1117] shadow-2xl shadow-black/50 max-h-[90vh] overflow-hidden">
          <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-white/10 bg-[#0f1117] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/employee/leaves/history')}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
                <FileText size={22} className="text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Apply for Leave</h1>
                <p className="text-white/40 text-xs mt-0.5">Submit a new leave request for approval</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/employee/leaves/history')}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10"
            >
              <X size={18} />
            </button>
          </div>

          <div className="max-h-[calc(90vh-92px)] overflow-y-auto p-6">
            <div className="rounded-2xl border border-white/10 bg-[#111318] p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Read-only Employee Info */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">Employee Name</label>
                    <input 
                      type="text" 
                      value={user?.first_name ? `${user.first_name} ${user.last_name || ''}` : (user?.name || user?.username || '')} 
                      disabled 
                      className="w-full bg-white/4 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white cursor-not-allowed outline-none" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">Employee ID</label>
                    <input 
                      type="text" 
                      value={user?.employee_code || user?.user_id || user?.employee_id || user?.employeeId || ''} 
                      disabled 
                      className="w-full text-white rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm  cursor-not-allowed outline-none" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">Mobile Number</label>
                    <input 
                      type="text" 
                      value={user?.mobile_number || user?.mobile || user?.phone || ''} 
                      disabled 
                      className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white cursor-not-allowed outline-none" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">Email ID</label>
                    <input 
                      type="text" 
                      value={user?.personal_email || user?.email || ''} 
                      disabled 
                      className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white cursor-not-allowed outline-none" 
                    />
                  </div>

                  {/* Leave Fields */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">Leave Type</label>
                    <Select
                      styles={customSelectStyles}
                      value={{ value: formData.leave_type, label: formData.leave_type }}
                      onChange={(option) => handleChange({ target: { name: 'leave_type', value: option ? option.value : '' } })}
                      options={availableLeaveTypes.map(type => ({ value: type, label: type }))}
                      isSearchable={false}
                    />
                    {!settingsLoading && (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                        <p className="font-semibold text-white">Leave balance</p>
                        {selectedLeaveSetting ? (
                          <div className="mt-2 flex items-center justify-between">
                            <span>Total allowed: <span className="text-white">{selectedLeaveSetting.max_days ?? 0}</span></span>
                            <span>Taken: <span className="text-orange-400">{selectedLeaveSetting.taken ?? 0}</span></span>
                            <span>Remaining: <span className="text-emerald-400">{selectedLeaveSetting.remaining ?? 0}</span></span>
                          </div>
                        ) : (
                          <p className="mt-2 text-white/40">Leave balance not available for this type yet.</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">Day Type</label>
                    <div className="flex space-x-6 mt-3">
                      <label className="flex items-center space-x-2 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="day_type" 
                          value="Full Day" 
                          checked={formData.day_type === 'Full Day'} 
                          onChange={handleChange}
                          className="w-4 h-4 text-orange-500 border-white/20 bg-white/5 focus:ring-orange-500 focus:ring-offset-[#111318]"
                        />
                        <span className="text-sm text-white/70 group-hover:text-white transition">Full Day</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="day_type" 
                          value="Half Day" 
                          checked={formData.day_type === 'Half Day'} 
                          onChange={handleChange}
                          className="w-4 h-4 text-orange-500 border-white/20 bg-white/5 focus:ring-orange-500 focus:ring-offset-[#111318]"
                        />
                        <span className="text-sm text-white/70 group-hover:text-white transition">Half Day</span>
                      </label>
                    </div>
                  </div>

                  {formData.day_type === 'Half Day' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white/70">Half Day Session</label>
                      <div className="flex space-x-6 mt-3">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="half_day_type" 
                            value="Morning" 
                            checked={formData.half_day_type === 'Morning'} 
                            onChange={handleChange}
                            className="w-4 h-4 text-orange-500 border-white/20 bg-white/5 focus:ring-orange-500 focus:ring-offset-[#111318]"
                          />
                          <span className="text-sm text-white/70 group-hover:text-white transition">Morning</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="half_day_type" 
                            value="Afternoon" 
                            checked={formData.half_day_type === 'Afternoon'} 
                            onChange={handleChange}
                            className="w-4 h-4 text-orange-500 border-white/20 bg-white/5 focus:ring-orange-500 focus:ring-offset-[#111318]"
                          />
                          <span className="text-sm text-white/70 group-hover:text-white transition">Afternoon</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">From Date</label>
                    <input 
                      type="date" 
                      name="from_date" 
                      value={formData.from_date} 
                      onChange={handleChange} 
                      required
                      className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition scheme-dark" 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">To Date</label>
                    <input 
                      type="date" 
                      name="to_date" 
                      value={formData.day_type === 'Half Day' ? formData.from_date : formData.to_date} 
                      onChange={handleChange} 
                      disabled={formData.day_type === 'Half Day'}
                      required
                      min={formData.from_date}
                      className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed scheme-dark" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white/70">Number of Days</label>
                    <input 
                      type="text" 
                      value={formData.no_of_days} 
                      disabled 
                      className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-orange-400 font-bold outline-none" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white/70">Reason for Leave</label>
                  <textarea 
                    name="reason" 
                    value={formData.reason} 
                    onChange={handleChange} 
                    required
                    rows="4"
                    placeholder="Please provide a brief reason for your leave request..."
                    className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 transition resize-none placeholder-white/20"
                  ></textarea>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-xl transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default ApplyLeave;
