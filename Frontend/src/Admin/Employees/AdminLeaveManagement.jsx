import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import api from '../../api';
import toast from 'react-hot-toast';
import { Briefcase, Loader2, RefreshCw, CheckCircle, XCircle, Search, Filter, List, LayoutGrid, CalendarDays, User } from 'lucide-react';

const AdminLeaveManagement = () => {
  const [viewMode, setViewMode] = useState('table');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionModal, setActionModal] = useState({ show: false, action: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkSelection, setBulkSelection] = useState([]);
  const [bulkReason, setBulkReason] = useState('');

  const pendingLeaves = leaves.filter(l => l.status === 'Pending');

  const toggleBulkSelection = (id) => {
    if (bulkSelection.includes(id)) {
      setBulkSelection(bulkSelection.filter(item => item !== id));
    } else {
      setBulkSelection([...bulkSelection, id]);
    }
  };

  const toggleAllBulkSelection = () => {
    if (bulkSelection.length === pendingLeaves.length && pendingLeaves.length > 0) {
      setBulkSelection([]);
    } else {
      setBulkSelection(pendingLeaves.map(l => l.id));
    }
  };

  const submitBulkAction = async (action) => {
    if (!bulkReason && action === 'Rejected') {
      toast.error('Please provide a reason for rejection');
      return;
    }

    if (bulkSelection.length === 0) {
      toast.error('Please select at least one leave request');
      return;
    }

    setSubmitting(true);
    try {
      await Promise.all(bulkSelection.map(id => 
        api.put(`/employee-leaves/${id}/status`, {
          status: action,
          admin_reason: bulkReason
        })
      ));
      
      toast.success(`${bulkSelection.length} Leaves ${action.toLowerCase()} successfully`);
      setShowBulkModal(false);
      setBulkSelection([]);
      setBulkReason('');
      fetchLeaves();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update some leave statuses');
      fetchLeaves();
    } finally {
      setSubmitting(false);
    }
  };


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

  const uniqueLeaveTypes = [...new Set(leaves.map(l => l.leave_type).filter(Boolean))];

  const filteredLeaves = leaves.filter(leave => {
    const fullName = `${leave.first_name || ''} ${leave.last_name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                          (leave.employee_code || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;
    
    const matchesType = leaveTypeFilter === 'All' || leave.leave_type === leaveTypeFilter;

    let matchesDate = true;
    if (dateFilter !== 'All') {
      const from = new Date(leave.from_date);
      const to = new Date(leave.to_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'Today') {
        matchesDate = from <= today && to >= today;
      } else if (dateFilter === 'Tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        matchesDate = from <= tomorrow && to >= tomorrow;
      } else if (dateFilter === 'This Week') {
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        const lastDayOfWeek = new Date(today);
        lastDayOfWeek.setDate(today.getDate() - today.getDay() + 6);
        matchesDate = from <= lastDayOfWeek && to >= firstDayOfWeek;
      } else if (dateFilter === 'This Month') {
        matchesDate = from.getMonth() === today.getMonth() && from.getFullYear() === today.getFullYear();
      } else if (dateFilter === 'This Year') {
        matchesDate = from.getFullYear() === today.getFullYear();
      } else if (dateFilter === 'Custom') {
        if (customStartDate && customEndDate) {
            const cStart = new Date(customStartDate);
            const cEnd = new Date(customEndDate);
            cStart.setHours(0,0,0,0);
            cEnd.setHours(23,59,59,999);
            matchesDate = from <= cEnd && to >= cStart;
        }
      }
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });
  const stats = [
    { label: 'Total Leaves', value: leaves.length, icon: Briefcase, cls: 'text-blue-400', bg: 'bg-blue-500/15' },
    { label: 'Approved', value: leaves.filter(l => l.status === 'Approved').length, icon: CheckCircle, cls: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { label: 'Rejected', value: leaves.filter(l => l.status === 'Rejected').length, icon: XCircle, cls: 'text-rose-400', bg: 'bg-rose-500/15' },
    { label: 'Pending', value: leaves.filter(l => l.status === 'Pending').length, icon: RefreshCw, cls: 'text-orange-400', bg: 'bg-orange-500/15' },
  ];

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
          <button onClick={() => setShowBulkModal(true)} className="inline-flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition hover:opacity-90 bg-orange-600">
            <CheckCircle size={15} /> Approve Leaves
          </button>
          <button onClick={fetchLeaves} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition">
            <RefreshCw size={15} className={loading ? "animate-spin text-orange-500" : ""} />
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.06] transition">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={18} className={s.cls} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-white/50 text-xs">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#111318] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-orange-500 transition"
          />
        </div>
        <div className="relative min-w-[140px]">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <select
            value={leaveTypeFilter}
            onChange={(e) => setLeaveTypeFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-[#111318] py-2.5 pl-10 pr-10 text-sm text-white outline-none focus:border-orange-500 transition cursor-pointer"
          >
            <option value="All">All Types</option>
            {uniqueLeaveTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="relative min-w-[140px]">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-[#111318] py-2.5 pl-10 pr-10 text-sm text-white outline-none focus:border-orange-500 transition cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="relative min-w-[140px]">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/10 bg-[#111318] py-2.5 pl-10 pr-10 text-sm text-white outline-none focus:border-orange-500 transition cursor-pointer"
          >
            <option value="All">All Dates</option>
            <option value="Today">Today</option>
            <option value="Tomorrow">Tomorrow</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="This Year">This Year</option>
            <option value="Custom">Custom Range</option>
          </select>
        </div>
        
        {dateFilter === 'Custom' && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input 
              type="date" 
              value={customStartDate} 
              onChange={(e) => setCustomStartDate(e.target.value)} 
              className="rounded-xl border border-white/10 bg-[#111318] py-2.5 px-3 text-sm text-white outline-none focus:border-orange-500 transition" 
            />
            <span className="text-white/40 text-sm">to</span>
            <input 
              type="date" 
              value={customEndDate} 
              onChange={(e) => setCustomEndDate(e.target.value)} 
              className="rounded-xl border border-white/10 bg-[#111318] py-2.5 px-3 text-sm text-white outline-none focus:border-orange-500 transition" 
            />
          </div>
        )}
        
        {/* View toggle */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1 ml-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === 'table' ? 'bg-orange-500 text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            title="Table View"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === 'card' ? 'bg-orange-500 text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            title="Card View"
          >
            <LayoutGrid size={15} />
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
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-white/40">No leave requests found matching filters.</td>
                </tr>
              ) : (
                filteredLeaves.map((leave, index) => (
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
      )}

      {viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full py-8 text-center text-white/40">
              <Loader2 size={18} className="mx-auto animate-spin" />
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="col-span-full py-8 text-center text-white/40">
              No leave requests found matching filters.
            </div>
          ) : (
            filteredLeaves.map((leave, index) => (
              <div key={leave.id} className="rounded-2xl border border-white/10 bg-[#111318] p-5 hover:bg-white/[0.02] transition relative">
                <div className="absolute top-5 right-5 text-xs text-white/40 font-medium">#{index + 1}</div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <User size={16} className="text-white/60" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-base leading-tight">{leave.first_name} {leave.last_name}</div>
                    <div className="text-white/40 text-xs">{leave.employee_code}</div>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">Leave Type</span>
                    <div className="text-right">
                      <span className="font-medium text-white text-sm">{leave.leave_type}</span>
                      {leave.day_type === 'Half Day' && (
                        <span className="text-white/40 text-xs ml-1">({leave.half_day_type})</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">Duration</span>
                    <span className="font-medium text-white text-sm">
                      {new Date(leave.from_date).toLocaleDateString()} 
                      {leave.from_date !== leave.to_date && ` - ${new Date(leave.to_date).toLocaleDateString()}`}
                      <span className="text-white/40 ml-1">({leave.no_of_days} days)</span>
                    </span>
                  </div>
                  {leave.reason && (
                    <div>
                      <span className="text-white/40 text-xs block mb-1">Reason</span>
                      <p className="text-white/70 text-sm bg-white/5 rounded-lg p-2.5 line-clamp-2" title={leave.reason}>
                        {leave.reason}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  {getStatusBadge(leave.status)}
                  {leave.status === 'Pending' && (
                    <div className="flex gap-2">
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
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Action Modal */}
      {actionModal.show && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
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
