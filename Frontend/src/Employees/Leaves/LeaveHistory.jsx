import React, { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import { CalendarDays, Loader2, RefreshCw, Search, X, LayoutGrid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [dateFilter, setDateFilter] = useState("All");
  const [viewMode, setViewMode] = useState('table');
  const navigate = useNavigate();

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

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const leaveDate = new Date(leave.from_date);
      leaveDate.setHours(0, 0, 0, 0);

      let matchesDate = true;

      switch (dateFilter) {
        case "Today":
          matchesDate =
            leaveDate.getTime() === today.getTime();
          break;

        case "Yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);

          matchesDate =
            leaveDate.getTime() === yesterday.getTime();
          break;

        case "This Week":
          const startWeek = new Date(today);
          startWeek.setDate(today.getDate() - today.getDay());

          const endWeek = new Date(startWeek);
          endWeek.setDate(startWeek.getDate() + 6);

          matchesDate =
            leaveDate >= startWeek &&
            leaveDate <= endWeek;
          break;

        case "This Month":
          matchesDate =
            leaveDate.getMonth() === today.getMonth() &&
            leaveDate.getFullYear() === today.getFullYear();
          break;

        case "This Year":
          matchesDate =
            leaveDate.getFullYear() === today.getFullYear();
          break;

        case "Custom":
          matchesDate =
            (!fromDate || leaveDate >= new Date(fromDate)) &&
            (!toDate || leaveDate <= new Date(toDate));
          break;

        default:
          matchesDate = true;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLeaveType &&
        matchesDate
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
          <button
            onClick={() => navigate("/employee/leaves/apply")}
            className="h-9 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition flex items-center gap-2"
          >
            <CalendarDays size={15} />
            Apply Leave
          </button>

          <button
            onClick={fetchLeaves}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin text-orange-500" : ""}
            />
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
              className="h-11 rounded-xl bg-[#1a1d24] border border-white/10 px-3 text-sm text-white outline-none focus:border-orange-500"
            >
              <option className="bg-[#1a1d24] text-white" value="All">
                All Status
              </option>
              <option className="bg-[#1a1d24] text-white" value="Pending">
                Pending
              </option>
              <option className="bg-[#1a1d24] text-white" value="Approved">
                Approved
              </option>
              <option className="bg-[#1a1d24] text-white" value="Rejected">
                Rejected
              </option>
            </select>

            {/* Leave Type */}
            <select
              value={leaveTypeFilter}
              onChange={(e) => setLeaveTypeFilter(e.target.value)}
              className="h-11 rounded-xl bg-[#1a1d24] border border-white/10 px-3 text-sm text-white outline-none focus:border-orange-500"
            >
              {leaveTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                  className="bg-[#1a1d24] text-white"
                >
                  {type}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 rounded-xl bg-[#1a1d24] border border-white/10 px-3 text-sm text-white outline-none focus:border-orange-500"
            >
              <option
                value="Newest"
                className="bg-[#1a1d24] text-white"
              >
                Newest First
              </option>

              <option
                value="Oldest"
                className="bg-[#1a1d24] text-white"
              >
                Oldest First
              </option>
            </select>


            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-11 rounded-xl bg-[#1a1d24] border border-white/10 px-3 text-sm text-white outline-none focus:border-orange-500"
            >
              <option value="All" className="bg-[#1a1d24] text-white">
                All Dates
              </option>
              <option value="Today" className="bg-[#1a1d24] text-white">
                Today
              </option>
              <option value="Yesterday" className="bg-[#1a1d24] text-white">
                Yesterday
              </option>
              <option value="This Week" className="bg-[#1a1d24] text-white">
                This Week
              </option>
              <option value="This Month" className="bg-[#1a1d24] text-white">
                This Month
              </option>
              <option value="This Year" className="bg-[#1a1d24] text-white">
                This Year
              </option>
              <option value="Custom" className="bg-[#1a1d24] text-white">
                Custom Range
              </option>
            </select>
            {dateFilter === "Custom" && (
              <>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-11 rounded-xl bg-[#1a1d24] border border-white/10 px-3 text-sm text-white"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-11 rounded-xl bg-[#1a1d24] border border-white/10 px-3 text-sm text-white"
                />
              </>
            )}

          </div>

          <div className="flex justify-between items-center mt-4">

            <div className="text-sm text-white/50">
              Showing {filteredLeaves.length} of {leaves.length} leave requests
            </div>

            <div className="flex gap-2">
              <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`p-1.5 rounded-md transition ${viewMode === 'card' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`}
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>

          </div>
          {viewMode === 'table' ? (
            <table className="min-w-full mt-5 text-sm">
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
              {loading ? (
                <div className="col-span-full py-8 text-center text-white/40"><Loader2 size={18} className="mx-auto animate-spin" /></div>
              ) : filteredLeaves.length === 0 ? (
                <div className="col-span-full py-8 text-center text-white/40">No leave history found.</div>
              ) : (
                filteredLeaves.map((leave) => (
                  <div key={leave.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-white">{leave.leave_type}</h3>
                        {leave.day_type === 'Half Day' && (
                          <div className="text-white/40 text-xs">Half Day ({leave.half_day_type})</div>
                        )}
                      </div>
                      {getStatusBadge(leave.status)}
                    </div>
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-white/50">Date</span>
                        <span className="text-white">
                          {new Date(leave.from_date).toLocaleDateString()}
                          {leave.from_date !== leave.to_date && ` - ${new Date(leave.to_date).toLocaleDateString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Days</span>
                        <span className="text-white font-medium">{leave.no_of_days}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-white/70 line-clamp-2" title={leave.reason}>
                        <span className="text-white/50">Reason: </span>{leave.reason}
                      </p>
                      {leave.admin_reason && (
                        <p className="text-xs text-white/70 line-clamp-2 mt-1" title={leave.admin_reason}>
                          <span className="text-white/50">Admin: </span>{leave.admin_reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveHistory;
