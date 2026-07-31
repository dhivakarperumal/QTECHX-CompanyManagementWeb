import React, { useState, useEffect } from 'react';
import { useAuth } from '../../PrivateRouter/AuthContext';
import api from '../../api';
import toast from 'react-hot-toast';
import { FileText, Loader2, Send } from 'lucide-react';

const leaveTypes = [
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.no_of_days <= 0) {
      toast.error('Invalid date range');
      return;
    }
    setLoading(true);
    try {
      await api.post('/employee-leaves/apply', formData);
      toast.success('Leave applied successfully');
      setFormData({
        ...formData,
        from_date: '',
        to_date: '',
        no_of_days: 0,
        reason: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply leave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <FileText size={22} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Apply for Leave</h1>
            <p className="text-white/40 text-xs mt-0.5">Submit a new leave request for approval</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111318] p-6 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Read-only Employee Info */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Employee Name</label>
              <input 
                type="text" 
                value={user?.first_name ? `${user.first_name} ${user.last_name || ''}` : ''} 
                disabled 
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white/40 cursor-not-allowed outline-none" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Employee ID</label>
              <input 
                type="text" 
                value={user?.employee_code || ''} 
                disabled 
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white/40 cursor-not-allowed outline-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Mobile Number</label>
              <input 
                type="text" 
                value={user?.mobile_number || ''} 
                disabled 
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white/40 cursor-not-allowed outline-none" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Email ID</label>
              <input 
                type="text" 
                value={user?.personal_email || ''} 
                disabled 
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white/40 cursor-not-allowed outline-none" 
              />
            </div>

            {/* Leave Fields */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/70">Leave Type</label>
              <select 
                name="leave_type" 
                value={formData.leave_type} 
                onChange={handleChange} 
                required
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition"
              >
                {leaveTypes.map(type => (
                  <option key={type} value={type} className="bg-[#111318] text-white">{type}</option>
                ))}
              </select>
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
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition [color-scheme:dark]" 
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
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-white outline-none focus:border-orange-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark]" 
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
  );
};

export default ApplyLeave;
