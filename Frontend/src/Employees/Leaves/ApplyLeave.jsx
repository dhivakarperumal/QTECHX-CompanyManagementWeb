import React, { useState, useEffect } from 'react';
import { useAuth } from '../../PrivateRouter/AuthContext';
import api from '../../api';
import toast from 'react-hot-toast';

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

  // Calculate number of days when dates or day type changes
  useEffect(() => {
    if (formData.from_date && formData.to_date) {
      const start = new Date(formData.from_date);
      const end = new Date(formData.to_date);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        let days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        if (formData.day_type === 'Half Day') {
          // Typically half day means 0.5 days, applied to the single day selected,
          // or half of the total period? Usually half day is for a single day.
          // Let's enforce that if half day is selected, it's 0.5 days
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
    <div className="bg-gray-100 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="mb-8 border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Apply for Leave</h2>
          <p className="text-gray-500 text-sm mt-1">Submit your leave request for approval.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Read-only Employee Info */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Employee Name</label>
              <input 
                type="text" 
                value={user?.first_name ? `${user.first_name} ${user.last_name || ''}` : ''} 
                disabled 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Employee ID</label>
              <input 
                type="text" 
                value={user?.employee_code || ''} 
                disabled 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Mobile Number</label>
              <input 
                type="text" 
                value={user?.mobile_number || ''} 
                disabled 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Email ID</label>
              <input 
                type="text" 
                value={user?.personal_email || ''} 
                disabled 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" 
              />
            </div>

            {/* Leave Fields */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Leave Type</label>
              <select 
                name="leave_type" 
                value={formData.leave_type} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Day Type</label>
              <div className="flex space-x-6 mt-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="day_type" 
                    value="Full Day" 
                    checked={formData.day_type === 'Full Day'} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Full Day</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="day_type" 
                    value="Half Day" 
                    checked={formData.day_type === 'Half Day'} 
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Half Day</span>
                </label>
              </div>
            </div>

            {formData.day_type === 'Half Day' && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Half Day Session</label>
                <div className="flex space-x-6 mt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="half_day_type" 
                      value="Morning" 
                      checked={formData.half_day_type === 'Morning'} 
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Morning</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="half_day_type" 
                      value="Afternoon" 
                      checked={formData.half_day_type === 'Afternoon'} 
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Afternoon</span>
                  </label>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">From Date</label>
              <input 
                type="date" 
                name="from_date" 
                value={formData.from_date} 
                onChange={handleChange} 
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">To Date</label>
              <input 
                type="date" 
                name="to_date" 
                value={formData.day_type === 'Half Day' ? formData.from_date : formData.to_date} 
                onChange={handleChange} 
                disabled={formData.day_type === 'Half Day'}
                required
                min={formData.from_date}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Number of Days</label>
              <input 
                type="text" 
                value={formData.no_of_days} 
                disabled 
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 font-bold" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Reason for Leave</label>
            <textarea 
              name="reason" 
              value={formData.reason} 
              onChange={handleChange} 
              required
              rows="4"
              placeholder="Please provide a brief reason for your leave request..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            ></textarea>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Leave Request</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
