import { useState, useEffect } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  Loader2,
  RefreshCw,
  Search,
  X,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ModalPortal from '../../Componets/CommonComponents/ModalPortal';
import Select from 'react-select';

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#1a1d24',
    border: `1px solid ${state.isFocused
        ? '#f97316'
        : 'rgba(255,255,255,0.1)'
      }`,
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
  }),

  menuList: (provided) => ({
    ...provided,
    padding: 0,
    fontSize: '13px',
  }),

  option: (provided, state) => ({
    ...provided,
    fontSize: '13px',      // dropdown font size
    padding: '8px 14px',   // reduce option height
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

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [leaveSettings, setLeaveSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [dateFilter, setDateFilter] = useState("All");
  const [viewMode, setViewMode] = useState('table');
  const [showLeaveSummary, setShowLeaveSummary] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const [leaveResponse, settingsResponse] = await Promise.all([
        api.get('/employee-leaves/my-leaves'),
        api.get('/leave-settings')
      ]);

      if (leaveResponse.data.success) {
        setLeaves(leaveResponse.data.data || []);
      }

      if (settingsResponse.data.success) {
        setLeaveSettings(settingsResponse.data.data || []);
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

  const leaveSummary = leaveSettings
    .filter((setting) => Number(setting.is_active ?? 1) === 1)
    .map((setting) => {
      const totalAllowed = Number(setting.max_days || 0);
      const taken = leaves
        .filter((leave) => leave.leave_type === setting.leave_type && leave.status === 'Approved')
        .reduce((sum, leave) => sum + Number(leave.no_of_days || 0), 0);
      const remaining = Math.max(totalAllowed - taken, 0);

      return {
        leave_type: setting.leave_type,
        totalAllowed,
        taken,
        remaining,
      };
    })
    .sort((a, b) => a.leave_type.localeCompare(b.leave_type));

  const overallSummary = leaveSummary.reduce(
    (acc, item) => ({
      totalAllowed: acc.totalAllowed + item.totalAllowed,
      taken: acc.taken + item.taken,
      remaining: acc.remaining + item.remaining,
    }),
    { totalAllowed: 0, taken: 0, remaining: 0 }
  );

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
            onClick={() => setShowLeaveSummary(true)}
            className="h-9 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition flex items-center gap-2"
          >
            Leave Type Details

            <ChevronDown size={16} />
          </button>

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
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Total Allowed</p>
            <p className="mt-2 text-2xl font-semibold text-white">{overallSummary.totalAllowed}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Taken</p>
            <p className="mt-2 text-2xl font-semibold text-orange-400">{overallSummary.taken}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">Remaining</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">{overallSummary.remaining}</p>
          </div>
        </div>

        <div className="mt-4"></div>

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
            <div className="w-full z-[49]">
              <Select
                value={{ value: statusFilter, label: statusFilter === 'All' ? 'All Status' : statusFilter }}
                onChange={(option) => setStatusFilter(option ? option.value : 'All')}
                options={[
                  { value: 'All', label: 'All Status' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Approved', label: 'Approved' },
                  { value: 'Rejected', label: 'Rejected' },
                ]}
                styles={customSelectStyles}
                isSearchable={false}
              />
            </div>

            {/* Leave Type */}
            <div className="w-full z-[48]">
              <Select
                value={{ value: leaveTypeFilter, label: leaveTypeFilter }}
                onChange={(option) => setLeaveTypeFilter(option ? option.value : 'All')}
                options={leaveTypes.map((type) => ({ value: type, label: type }))}
                styles={customSelectStyles}
                isSearchable={false}
              />
            </div>
            
            <div className="w-full z-[47]">
              <Select
                value={{ value: sortBy, label: sortBy === 'Newest' ? 'Newest First' : 'Oldest First' }}
                onChange={(option) => setSortBy(option ? option.value : 'Newest')}
                options={[
                  { value: 'Newest', label: 'Newest First' },
                  { value: 'Oldest', label: 'Oldest First' },
                ]}
                styles={customSelectStyles}
                isSearchable={false}
              />
            </div>

            <div className="w-full z-[46]">
              <Select
                value={{ value: dateFilter, label: dateFilter === 'All' ? 'All Dates' : dateFilter === 'Custom' ? 'Custom Range' : dateFilter }}
                onChange={(option) => setDateFilter(option ? option.value : 'All')}
                options={[
                  { value: 'All', label: 'All Dates' },
                  { value: 'Today', label: 'Today' },
                  { value: 'Yesterday', label: 'Yesterday' },
                  { value: 'This Week', label: 'This Week' },
                  { value: 'This Month', label: 'This Month' },
                  { value: 'This Year', label: 'This Year' },
                  { value: 'Custom', label: 'Custom Range' },
                ]}
                styles={customSelectStyles}
                isSearchable={false}
              />
            </div>
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

      {showLeaveSummary && (
        <ModalPortal>
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={(event) => event.target === event.currentTarget && setShowLeaveSummary(false)}
          >
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#0f1117] p-6 shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-orange-400">Leave Summary</p>
                  <h2 className="text-xl font-semibold text-white">Leave Type Details</h2>
                  <p className="text-sm text-white/40">Review your leave balances and approved usage.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLeaveSummary(false)}
                  className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {leaveSummary.map((item) => (
                  <div
                    key={item.leave_type}
                    className="rounded-2xl border border-white/10 bg-[#12151f] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{item.leave_type}</p>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/40">
                        {item.remaining} left
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <p className="text-white/40 text-[10px] uppercase">Total</p>
                        <p className="mt-1 font-semibold text-white">{item.totalAllowed}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] uppercase">Taken</p>
                        <p className="mt-1 font-semibold text-orange-400">{item.taken}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-[10px] uppercase">Left</p>
                        <p className="mt-1 font-semibold text-emerald-400">{item.remaining}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default LeaveHistory;
