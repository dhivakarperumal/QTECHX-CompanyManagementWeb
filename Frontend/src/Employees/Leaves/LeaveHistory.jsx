import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { CalendarDays, Loader2, RefreshCw } from 'lucide-react';

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/employee-leaves/my-leaves');
      if (data.success) {
        setLeaves(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch leave history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="rounded-full border border-emerald-500/25 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Approved</span>;
      case 'Rejected':
        return <span className="rounded-full border border-rose-500/25 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-rose-400 uppercase">Rejected</span>;
      default:
        return <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-orange-300 uppercase">Pending</span>;
    }
  };

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <CalendarDays size={22} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">My Leave History</h1>
            <p className="text-white/40 text-xs mt-0.5">Track your past and pending leave requests</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLeaves} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition">
            <RefreshCw size={15} className={loading ? "animate-spin text-orange-500" : ""} />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111318] p-4 space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/4 text-white/60">
              <tr>
                <th className="px-4 py-3 text-left">Leave Type</th>
                <th className="px-4 py-3 text-left">Date Range</th>
                <th className="px-4 py-3 text-left">Days</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Admin Remark</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-white/40"><Loader2 size={18} className="mx-auto animate-spin" /></td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-white/40">No leave history found.</td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="border-t border-white/10 hover:bg-white/2">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{leave.leave_type}</div>
                      {leave.day_type === 'Half Day' && (
                        <div className="text-white/40 text-xs">Half Day ({leave.half_day_type})</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {new Date(leave.from_date).toLocaleDateString()} 
                      {leave.from_date !== leave.to_date && ` - ${new Date(leave.to_date).toLocaleDateString()}`}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      {leave.no_of_days}
                    </td>
                    <td className="px-4 py-3 text-white/70 max-w-xs truncate" title={leave.reason}>
                      {leave.reason}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="px-4 py-3 text-white/70 max-w-xs truncate" title={leave.admin_reason}>
                      {leave.admin_reason || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveHistory;
