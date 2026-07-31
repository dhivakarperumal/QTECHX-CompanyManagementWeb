import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Clock, CreditCard, AlertCircle, Loader2, Search } from 'lucide-react';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';
import dayjs from 'dayjs';

const EmployeePayroll = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSalaryHistory();
  }, [user]);

  const fetchSalaryHistory = async () => {
    setLoading(true);
    try {
      const possibleIds = [user?.id, user?._id, user?.userId, user?.employee_id, user?.employeeId, user?.user_id, user?.uuid].filter(Boolean).map(String);
      if (possibleIds.length === 0) {
        setError('Employee ID not found in profile.');
        setLoading(false);
        return;
      }

      const res = await api.get('/salary/history');
      if (res.data && res.data.success) {
        const allHistory = res.data.data;
        const myHistory = allHistory.filter(r => possibleIds.includes(String(r.employee_id)));
        myHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setHistory(myHistory);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch salary details.');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(record => {
    const recordMonth = new Date(0, record.salary_month - 1).toLocaleString('default', { month: 'long' }).toLowerCase();
    const searchMatch = !search || 
                        recordMonth.includes(search.toLowerCase()) || 
                        String(record.salary_year).includes(search) || 
                        String(record.total_salary).includes(search);
    const monthMatch = monthFilter === 'all' || Number(record.salary_month) === Number(monthFilter);
    const yearMatch = yearFilter === 'all' || Number(record.salary_year) === Number(yearFilter);
    return searchMatch && monthMatch && yearMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <DollarSign size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Salary Details</h1>
            <p className="text-xs text-white/50">View all your detailed salary records</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search month, year, or amount"
              className="w-full rounded-xl border border-white/10 bg-[#0e1118] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-orange-500/70"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-full sm:w-auto rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/70">
              <option value="all">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>{new Date(0, month - 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="w-full sm:w-auto rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/70">
              <option value="all">All Years</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-white/50"><Loader2 className="animate-spin" size={24} /></div>
      ) : error ? (
        <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 p-4 rounded-xl"><AlertCircle size={18} /> {error}</div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/50 shadow-lg">
          <DollarSign size={48} className="mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold text-white mb-2">No Salary Details Found</h2>
          <p>No payroll records match your selected filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredHistory.map((details) => (
            <div key={details.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <h2 className="text-lg font-bold text-white mb-6 pl-2">
                Salary for {new Date(0, details.salary_month - 1).toLocaleString('default', { month: 'long' })} {details.salary_year}
              </h2>

              <div className="grid md:grid-cols-2 gap-6 pl-2">
                <div className="bg-[#0e1118] border border-white/5 p-5 rounded-xl">
                  <h3 className="text-sm font-bold text-white/80 mb-4 border-b border-white/10 pb-2">Earnings</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Basic Salary</span>
                      <span className="font-semibold text-white">₹{parseFloat(details.basic_salary).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Incentive ({details.incentive_percentage}%)</span>
                      <span className="font-semibold text-emerald-400">+ ₹{parseFloat(details.incentive_amount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0e1118] border border-white/5 p-5 rounded-xl">
                  <h3 className="text-sm font-bold text-white/80 mb-4 border-b border-white/10 pb-2">Deductions</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Leave Deduction ({details.leave_days} days)</span>
                      <span className="font-semibold text-rose-400">- ₹{parseFloat(details.leave_deduction).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Additional Deduction</span>
                      <span className="font-semibold text-rose-400">- ₹{parseFloat(details.additional_deduction).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Net Pay</h3>
                    <p className="text-xs text-emerald-400/60 mt-1">Total credited on {new Date(details.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-3xl font-black text-emerald-400">
                    ₹{parseFloat(details.total_salary).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeePayroll;
