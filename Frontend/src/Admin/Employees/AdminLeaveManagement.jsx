import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { Briefcase, Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const AdminLeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionModal, setActionModal] = useState({ show: false, action: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/employee-leaves/all');
      if (data.success) {
        setLeaves(data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (leave, action) => {
    setSelectedLeave(leave);
    setActionModal({ show: true, action, reason: '' });
  };

  const submitAction = async () => {
    if (!actionModal.reason && actionModal.action === 'Rejected') {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/employee-leaves/${selectedLeave.id}/status`, {
        status: actionModal.action,
        admin_reason: actionModal.reason
      });
      toast.success(`Leave ${actionModal.action.toLowerCase()} successfully`);
      setActionModal({ show: false, action: '', reason: '' });
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update leave status');
    } finally {
      setSubmitting(false);
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
            <Briefcase size={22} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Leave Requests</h1>
            <p className="text-white/40 text-xs mt-0.5">Manage employee leave applications</p>
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
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Leave Type</th>
                <th className="px-4 py-3 text-left">Date Range</th>
                <th className="px-4 py-3 text-left">Days</th>
                <th className="px-4 py-3 text-left">Reason</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-white/40"><Loader2 size={18} className="mx-auto animate-spin" /></td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-white/40">No leave requests found.</td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="border-t border-white/10 hover:bg-white/2">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{leave.first_name} {leave.last_name}</div>
                      <div className="text-white/40 text-xs">{leave.employee_code}</div>
                    </td>
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
                    <td className="px-4 py-3 text-right">
                      {leave.status === 'Pending' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleActionClick(leave, 'Approved')}
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition"
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button 
                            onClick={() => handleActionClick(leave, 'Rejected')}
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                            title="Reject"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-white/40 text-xs">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-white/10 bg-[#111318] max-w-md w-full p-6 animate-fade-in-up">
            <h3 className={`text-xl font-bold mb-4 tracking-tight ${actionModal.action === 'Approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {actionModal.action === 'Approved' ? 'Approve Leave' : 'Reject Leave'}
            </h3>
            
            <div className="mb-4 rounded-xl border border-white/10 bg-white/4 p-4">
              <p className="text-sm text-white font-semibold mb-1">
                {selectedLeave?.first_name} {selectedLeave?.last_name} <span className="text-white/40">({selectedLeave?.employee_code})</span>
              </p>
              <p className="text-sm text-white/70 mb-1">
                <span className="font-medium text-white/50">Type:</span> {selectedLeave?.leave_type} ({selectedLeave?.no_of_days} days)
              </p>
              <p className="text-sm text-white/70">
                <span className="font-medium text-white/50">Date:</span> {new Date(selectedLeave?.from_date).toLocaleDateString()} to {new Date(selectedLeave?.to_date).toLocaleDateString()}
              </p>
            </div>

            <div className="mb-6 space-y-2">
              <label className="text-sm font-semibold text-white/70">
                Reason / Remarks {actionModal.action === 'Rejected' && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                value={actionModal.reason}
                onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
                placeholder="Enter any remarks or reasons..."
                className="w-full rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none focus:border-orange-500/50 resize-none transition"
                rows="3"
                required={actionModal.action === 'Rejected'}
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActionModal({ show: false, action: '', reason: '' })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={submitting}
                className={`inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:opacity-90 ${
                  actionModal.action === 'Approved' 
                    ? 'bg-emerald-600' 
                    : 'bg-rose-600'
                }`}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                {submitting ? 'Processing...' : `Confirm ${actionModal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveManagement;
