import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { CalendarDays, Loader2, RefreshCw, Search, X } from "lucide-react";

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("Newest");

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

  const leaveTypes = [
    "All",
    ...new Set(leaves.map((l) => l.leave_type)),
  ];

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

  const filteredLeaves = [...leaves]
    .filter((leave) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        leave.leave_type?.toLowerCase().includes(search) ||
        leave.reason?.toLowerCase().includes(search) ||
        (leave.admin_reason || "").toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || leave.status === statusFilter;

      const matchesLeaveType =
        leaveTypeFilter === "All" ||
        leave.leave_type === leaveTypeFilter;

      const leaveFrom = new Date(leave.from_date);

      const matchesFrom =
        !fromDate || leaveFrom >= new Date(fromDate);

      const matchesTo =
        !toDate || leaveFrom <= new Date(toDate);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLeaveType &&
        matchesFrom &&
        matchesTo
      );
    })
    .sort((a, b) => {
      if (sortBy === "Newest") {
        return new Date(b.from_date) - new Date(a.from_date);
      }

      return new Date(a.from_date) - new Date(b.from_date);
    });

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3">

            {/* Search */}
            <div className="relative xl:col-span-2">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="text"
                placeholder="Search leave type or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-sm text-white outline-none focus:border-orange-500"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Leave Type */}
            <select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              className="h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white"
            >
              {leaveTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>

            {/* From */}
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white"
            />

            {/* To */}
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-11 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white"
            />

          </div>

          <div className="flex justify-between items-center mt-4">

            <div className="text-sm text-white/50">
              Showing {filteredLeaves.length} of {leaves.length} leave requests
            </div>

            <div className="flex gap-2">

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-white"
              >
                <option value="Newest">Newest First</option>
                <option value="Oldest">Oldest First</option>
              </select>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  setLeaveTypeFilter("All");
                  setFromDate("");
                  setToDate("");
                  setSortBy("Newest");
                }}
                className="h-10 px-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition flex items-center gap-2"
              >
                <X size={15} />
                Reset
              </button>

            </div>

          </div>
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
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-white/40">No leave history found.</td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
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
