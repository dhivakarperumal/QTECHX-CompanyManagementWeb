import React, { useState, useEffect } from 'react';
import { useAuth } from '../../PrivateRouter/AuthContext';
import api from '../../api';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  Loader2,
  RefreshCw,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  User,
  Phone,
  Mail,
  Briefcase,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const EmployeeLeaveHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { employeeId } = useParams();

  const [employee, setEmployee] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [leaveSettings, setLeaveSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [dateFilter, setDateFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table');
  const [showLeaveSummary, setShowLeaveSummary] = useState(false);

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const endpoint = employeeId ? `/employee-leaves/employee/${employeeId}` : '/employee-leaves/employee';
      const [leaveResponse, settingsResponse] = await Promise.all([
        api.get(endpoint),
        api.get('/leave-settings')
      ]);

      if (leaveResponse.data.success) {
        setEmployee(leaveResponse.data.data?.employee || null);
        setLeaves(leaveResponse.data.data?.leaves || []);
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

  const leaveTypes = ['All', ...new Set(leaves.map((leave) => leave.leave_type).filter(Boolean))];

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
        (leave.admin_reason || '').toLowerCase().includes(search);

      const matchesStatus = statusFilter === 'All' || leave.status === statusFilter;
      const matchesLeaveType = leaveTypeFilter === 'All' || leave.leave_type === leaveTypeFilter;

      const leaveDate = new Date(leave.from_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      leaveDate.setHours(0, 0, 0, 0);

      let matchesDate = true;

      switch (dateFilter) {
        case 'Today':
          matchesDate = leaveDate.getTime() === today.getTime();
          break;
        case 'Yesterday': {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          matchesDate = leaveDate.getTime() === yesterday.getTime();
          break;
        }
        case 'This Week': {
          const startWeek = new Date(today);
          startWeek.setDate(today.getDate() - today.getDay());
          const endWeek = new Date(startWeek);
          endWeek.setDate(startWeek.getDate() + 6);
          matchesDate = leaveDate >= startWeek && leaveDate <= endWeek;
          break;
        }
        case 'This Month':
          matchesDate = leaveDate.getMonth() === today.getMonth() && leaveDate.getFullYear() === today.getFullYear();
          break;
        case 'This Year':
          matchesDate = leaveDate.getFullYear() === today.getFullYear();
          break;
        case 'Custom':
          matchesDate = (!dateFilter || leaveDate >= new Date(fromDate)) && (!toDate || leaveDate <= new Date(toDate));
          break;
        default:
          matchesDate = true;
      }

      return matchesSearch && matchesStatus && matchesLeaveType && matchesDate;
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') {
        return new Date(b.from_date) - new Date(a.from_date);
      }
      return new Date(a.from_date) - new Date(b.from_date);
    });

  const employeeName = employee?.first_name ? `${employee.first_name} ${employee.last_name || ''}`.trim() : `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <CalendarDays size={22} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Leave History</h1>
            <p className="text-white/40 text-xs mt-0.5">Full leave details for {employeeName || 'this employee'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLeaveSummary(!showLeaveSummary)}
            className="h-9 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition flex items-center gap-2"
          >
            Leave Type Details
            {showLeaveSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={fetchData}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-orange-500' : ''} />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111318] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 flex items-center justify-center">
              <User size={20} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{employeeName || 'Employee details'}</h2>
              <p className="text-sm text-white/40">{employee?.employee_code || user?.employee_code || '—'}</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 min-w-37.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Designation</p>
              <p className="mt-1 text-sm font-semibold text-white">{employee?.designation || '—'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 min-w-37.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Mobile</p>
              <p className="mt-1 text-sm font-semibold text-white">{employee?.mobile_number || '—'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 min-w-45">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Email</p>
              <p className="mt-1 text-sm font-semibold text-white">{employee?.personal_email || '—'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 min-w-37.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Role</p>
              <p className="mt-1 text-sm font-semibold text-white">{employee?.role || user?.role || '—'}</p>
            </div>
          </div>
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

        {showLeaveSummary && (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {leaveSummary.map((item) => (
              <div key={item.leave_type} className="rounded-2xl border border-white/10 bg-[#0f1117] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{item.leave_type}</p>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-white/40">{item.remaining} left</span>
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
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <div className="relative xl:col-span-2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search leave type or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-sm text-white outline-none focus:border-orange-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 rounded-xl bg-[#1a1d24] border border-white/10 px-3 text-sm text-white outline-none focus:border-orange-500"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={leaveTypeFilter}
            onChange={(e) => setLeaveTypeFilter(e.target.value)}
            className="h-11 rounded-xl bg-[#1a1d24] border border-white/10 px-3 text-sm text-white outline-none focus:border-orange-500"
          >
            {leaveTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-11 rounded-xl bg-[#1a1d24] border border-white/10 px-3 text-sm text-white outline-none focus:border-orange-500"
          >
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
          </select>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-white/50">Showing {filteredLeaves.length} of {leaves.length} leave requests</div>
          <div className="flex gap-2">
            <div className="flex bg-black/20 p-1 rounded-lg border border-white/10">
              <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`}>
                <List size={16} />
              </button>
              <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-md transition ${viewMode === 'card' ? 'bg-orange-500 text-white' : 'text-white/50 hover:text-white'}`}>
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
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
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-white/40"><Loader2 size={18} className="mx-auto animate-spin" /></td></tr>
                ) : filteredLeaves.length === 0 ? (
                  <tr><td colSpan="6" className="px-4 py-8 text-center text-white/40">No leave history found.</td></tr>
                ) : (
                  filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="border-t border-white/10 hover:bg-white/2">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{leave.leave_type}</div>
                        {leave.day_type === 'Half Day' && <div className="text-white/40 text-xs">Half Day ({leave.half_day_type})</div>}
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {new Date(leave.from_date).toLocaleDateString()}
                        {leave.from_date !== leave.to_date && ` - ${new Date(leave.to_date).toLocaleDateString()}`}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">{leave.no_of_days}</td>
                      <td className="px-4 py-3 text-white/70 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                      <td className="px-4 py-3">{getStatusBadge(leave.status)}</td>
                      <td className="px-4 py-3 text-white/70 max-w-xs truncate" title={leave.admin_reason}>{leave.admin_reason || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full py-8 text-center text-white/40"><Loader2 size={18} className="mx-auto animate-spin" /></div>
            ) : filteredLeaves.length === 0 ? (
              <div className="col-span-full py-8 text-center text-white/40">No leave history found.</div>
            ) : (
              filteredLeaves.map((leave) => (
                <div key={leave.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-white">{leave.leave_type}</h3>
                      {leave.day_type === 'Half Day' && <div className="text-white/40 text-xs">Half Day ({leave.half_day_type})</div>}
                    </div>
                    {getStatusBadge(leave.status)}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/50">Date</span>
                      <span className="text-white">{new Date(leave.from_date).toLocaleDateString()}{leave.from_date !== leave.to_date && ` - ${new Date(leave.to_date).toLocaleDateString()}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/50">Days</span>
                      <span className="text-white font-medium">{leave.no_of_days}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-white/70" title={leave.reason}><span className="text-white/50">Reason: </span>{leave.reason}</p>
                    {leave.admin_reason && <p className="text-xs text-white/70 mt-1" title={leave.admin_reason}><span className="text-white/50">Admin: </span>{leave.admin_reason}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeLeaveHistoryPage;
