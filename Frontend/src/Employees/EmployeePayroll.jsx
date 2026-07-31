import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Clock, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';
import dayjs from 'dayjs';

const EmployeePayroll = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCurrentSalary();
  }, [user]);

  const fetchCurrentSalary = async () => {
    setLoading(true);
    try {
      const possibleIds = [user?.id, user?._id, user?.userId, user?.employee_id, user?.employeeId, user?.user_id, user?.uuid].filter(Boolean).map(String);
      if (possibleIds.length === 0) {
        setError('Employee ID not found in profile.');
        setLoading(false);
        return;
      }

      // Fetch history to get latest
      const res = await api.get('/salary/history');
      if (res.data && res.data.success) {
        const history = res.data.data;
        const myHistory = history.filter(r => possibleIds.includes(String(r.employee_id)));
        
        if (myHistory.length > 0) {
          // Sort to get latest
          myHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setDetails(myHistory[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch salary details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-white/50"><Loader2 className="animate-spin" size={24} /></div>;
  }

  if (error) {
    return <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-4 rounded-xl"><AlertCircle size={18} /> {error}</div>;
  }

  if (!details) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/50">
        <DollarSign size={48} className="mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold text-white mb-2">No Salary Details Found</h2>
        <p>Your payroll information is not available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl shadow-lg">
        <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
          <DollarSign size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Latest Salary Details</h1>
          <p className="text-xs text-white/50">For the month of {new Date(0, details.salary_month - 1).toLocaleString('default', { month: 'long' })} {details.salary_year}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Earnings</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-white/60">Basic Salary</span>
              <span className="font-semibold text-white">₹{parseFloat(details.basic_salary).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Incentive ({details.incentive_percentage}%)</span>
              <span className="font-semibold text-white">₹{parseFloat(details.incentive_amount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Deductions</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-white/60">Leave Deduction</span>
              <span className="font-semibold text-rose-400">₹{parseFloat(details.leave_deduction).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Additional Deduction</span>
              <span className="font-semibold text-rose-400">₹{parseFloat(details.additional_deduction).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Net Pay</h3>
            <p className="text-xs text-emerald-400/60 mt-1">Total credited amount</p>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            ₹{parseFloat(details.total_salary).toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePayroll;
