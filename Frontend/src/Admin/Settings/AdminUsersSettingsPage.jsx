import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Users,
  UserCog,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import { useAuth } from '../../PrivateRouter/AuthContext';

const ROLE_COLORS = {
  'Super Admin': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  Admin: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  Manager: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Staff: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  Employee: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Trainee: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Customer: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  User: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

const AdminUsersSettingsPage = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    user: null,
    targetStatus: '',
    loading: false,
  });

  // Self Warning Modal State
  const [selfWarningModal, setSelfWarningModal] = useState(false);

  const fetchUsers = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/users?limit=500');
      const list = res.data?.data || [];
      setUsers(list);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Summary statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(
      (u) => String(u.status || '').trim().toLowerCase() === 'active'
    ).length;
    const inactive = total - active;
    const admins = users.filter((u) =>
      ['Super Admin', 'Admin', 'Manager'].includes(u.role)
    ).length;
    return { total, active, inactive, admins };
  }, [users]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const uName = String(u.username || '').toLowerCase();
      const uEmail = String(u.email || '').toLowerCase();
      const uMobile = String(u.mobile || '').toLowerCase();
      const uId = String(u.user_id || '').toLowerCase();
      const query = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !query ||
        uName.includes(query) ||
        uEmail.includes(query) ||
        uMobile.includes(query) ||
        uId.includes(query);

      const matchesRole =
        selectedRole === 'All' ||
        String(u.role || '').toLowerCase() === selectedRole.toLowerCase();

      const uStatus =
        String(u.status || '').trim().toLowerCase() === 'active'
          ? 'Active'
          : 'Inactive';
      const matchesStatus =
        selectedStatus === 'All' || uStatus === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedRole, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  const handleToggleClick = (user) => {
    const isCurrentlyActive =
      String(user.status || '').trim().toLowerCase() === 'active';
    const targetStatus = isCurrentlyActive ? 'Inactive' : 'Active';

    // Prevent deactivating own account
    const currentUserId =
      currentUser?.user_id || currentUser?.id || currentUser?.userId;
    if (
      targetStatus === 'Inactive' &&
      currentUserId &&
      (user.user_id === currentUserId || user.id === currentUserId)
    ) {
      setSelfWarningModal(true);
      return;
    }

    setConfirmModal({
      isOpen: true,
      user,
      targetStatus,
      loading: false,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!confirmModal.user || !confirmModal.targetStatus) return;

    const user = confirmModal.user;
    const newStatus = confirmModal.targetStatus;
    const targetUserId = user.user_id || user.id;

    setConfirmModal((prev) => ({ ...prev, loading: true }));

    try {
      await api.put(`/users/${targetUserId}`, { status: newStatus });

      // Optimistically update local state
      setUsers((prev) =>
        prev.map((u) =>
          (u.user_id === targetUserId || u.id === targetUserId)
            ? { ...u, status: newStatus }
            : u
        )
      );

      toast.success(
        newStatus === 'Active'
          ? `User "${user.username}" activated successfully. Login is now permitted.`
          : `User "${user.username}" deactivated. Login access has been blocked.`
      );

      setConfirmModal({
        isOpen: false,
        user: null,
        targetStatus: '',
        loading: false,
      });
    } catch (error) {
      console.error('Failed to change user status:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update user status'
      );
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <div className="space-y-6 pb-12 text-white min-h-screen">
      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div className="rounded-4xl border border-white/10 bg-[#12131a]/80 backdrop-blur-xl p-6 shadow-2xl shadow-black/40">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/settings')}
              className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:border-orange-500/40 text-white transition-all shadow-md"
              title="Back to Settings"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/30 border border-blue-500/30 flex items-center justify-center shadow-inner shadow-blue-500/10">
              <UserCog className="text-blue-400" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  User Management
                </h1>
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-300">
                  Settings
                </span>
              </div>
              <p className="text-sm text-white/50 mt-0.5">
                Manage user accounts, role authorizations, and active/inactive login privileges.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchUsers(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? 'animate-spin text-orange-400' : ''}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-3xl border border-white/10 bg-[#12131a]/70 p-5 shadow-xl shadow-black/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Total Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            {loading ? '...' : stats.total}
          </div>
          <p className="text-xs text-white/40 mt-1">All registered accounts</p>
        </div>

        {/* Active Users */}
        <div className="rounded-3xl border border-emerald-500/20 bg-[#12131a]/70 p-5 shadow-xl shadow-black/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400/80">
              Active (Login Allowed)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-emerald-400 tracking-tight">
            {loading ? '...' : stats.active}
          </div>
          <p className="text-xs text-emerald-400/60 mt-1">Can log into portal</p>
        </div>

        {/* Inactive Users */}
        <div className="rounded-3xl border border-rose-500/20 bg-[#12131a]/70 p-5 shadow-xl shadow-black/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400/80">
              Inactive (Login Blocked)
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <UserX size={18} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-rose-400 tracking-tight">
            {loading ? '...' : stats.inactive}
          </div>
          <p className="text-xs text-rose-400/60 mt-1">Access restricted</p>
        </div>

        {/* Privileged / Admin Users */}
        <div className="rounded-3xl border border-white/10 bg-[#12131a]/70 p-5 shadow-xl shadow-black/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Admin & Managers
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Shield size={18} />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-white tracking-tight">
            {loading ? '...' : stats.admins}
          </div>
          <p className="text-xs text-white/40 mt-1">Management accounts</p>
        </div>
      </div>

      {/* ── Table Card ────────────────────────────────────────────── */}
      <div className="rounded-4xl border border-white/10 bg-[#12131a]/70 p-6 shadow-2xl shadow-black/30">
        {/* Controls / Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by username, email, phone, user ID..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-orange-500/50 focus:bg-white/[0.07]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 p-1">
              {['All', 'Active', 'Inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status);
                    setCurrentPage(1);
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                    selectedStatus === status
                      ? status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : status === 'Inactive'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-white/15 text-white shadow-sm'
                      : 'text-white/50 hover:text-white'
                  }`}
                >
                  {status === 'Active' && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  )}
                  {status === 'Inactive' && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5" />
                  )}
                  {status}
                </button>
              ))}
            </div>

            {/* Role Filter */}
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 pr-9 text-xs font-semibold text-white outline-none hover:bg-white/10 transition cursor-pointer"
              >
                <option value="All" className="bg-[#12131a] text-white">
                  All Roles
                </option>
                <option value="Super Admin" className="bg-[#12131a] text-white">
                  Super Admin
                </option>
                <option value="Admin" className="bg-[#12131a] text-white">
                  Admin
                </option>
                <option value="Manager" className="bg-[#12131a] text-white">
                  Manager
                </option>
                <option value="Employee" className="bg-[#12131a] text-white">
                  Employee
                </option>
                <option value="Trainee" className="bg-[#12131a] text-white">
                  Trainee
                </option>
                <option value="Customer" className="bg-[#12131a] text-white">
                  Customer
                </option>
                <option value="User" className="bg-[#12131a] text-white">
                  User
                </option>
              </select>
              <Filter
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/10 bg-white/[0.02]">
            <Loader2 size={32} className="text-orange-500 animate-spin mb-3" />
            <p className="text-sm font-medium text-white/60">
              Loading users directory...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-white/10 bg-white/[0.02] text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-3">
              <Users size={28} />
            </div>
            <h3 className="text-base font-semibold text-white">No Users Found</h3>
            <p className="text-xs text-white/40 max-w-sm mt-1">
              {searchTerm || selectedRole !== 'All' || selectedStatus !== 'All'
                ? 'Try adjusting your search query or filters to find what you are looking for.'
                : 'No users registered in the database.'}
            </p>
            {(searchTerm || selectedRole !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedRole('All');
                  setSelectedStatus('All');
                }}
                className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-orange-400 hover:bg-white/10 transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-wider text-white/40">
                  <th className="py-3.5 px-4 rounded-l-2xl">User</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-center">Login Status</th>
                  <th className="py-3.5 px-4 text-center rounded-r-2xl">
                    Active / Inactive Toggle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedUsers.map((user) => {
                  const isActive =
                    String(user.status || '').trim().toLowerCase() === 'active';
                  const roleClass =
                    ROLE_COLORS[user.role] ||
                    'bg-slate-500/15 text-slate-300 border-slate-500/30';
                  const isCurrent =
                    currentUser &&
                    (user.user_id === currentUser.user_id ||
                      user.id === currentUser.id);

                  return (
                    <tr
                      key={user.id || user.user_id}
                      className={`group transition hover:bg-white/[0.03] ${
                        !isActive ? 'opacity-85' : ''
                      }`}
                    >
                      {/* User Info */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shrink-0 border transition-all ${
                              isActive
                                ? 'bg-gradient-to-br from-orange-500 to-amber-600 border-orange-400/30 shadow-md shadow-orange-500/20'
                                : 'bg-gradient-to-br from-neutral-700 to-neutral-800 border-white/10 text-white/40'
                            }`}
                          >
                            {getInitials(user.username)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-white group-hover:text-orange-400 transition-colors">
                                {user.username || 'Unnamed'}
                              </span>
                              {isCurrent && (
                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-white/40 block mt-0.5">
                              ID: {user.user_id || user.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-white/80">
                            <Mail size={13} className="text-white/40 shrink-0" />
                            <span className="truncate max-w-[200px]" title={user.email}>
                              {user.email || '—'}
                            </span>
                          </div>
                          {user.mobile && (
                            <div className="flex items-center gap-1.5 text-xs text-white/50">
                              <Phone size={13} className="text-white/40 shrink-0" />
                              <span>{user.mobile}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold ${roleClass}`}
                        >
                          <Shield size={12} />
                          {user.role || 'Customer'}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-white/50">
                          <Calendar size={13} className="text-white/30" />
                          <span>
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString(
                                  'en-US',
                                  {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  }
                                )
                              : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Action Toggle Switch */}
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleToggleClick(user)}
                            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 ${
                              isActive
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/20'
                                : 'bg-neutral-800 border border-white/10'
                            }`}
                            title={
                              isActive
                                ? 'Click to deactivate user'
                                : 'Click to activate user'
                            }
                          >
                            <span
                              className={`inline-flex h-5 w-5 transform items-center justify-center rounded-full bg-white transition-transform duration-300 shadow-sm ${
                                isActive ? 'translate-x-8' : 'translate-x-1'
                              }`}
                            >
                              {isActive ? (
                                <CheckCircle2
                                  size={12}
                                  className="text-emerald-600 font-bold"
                                />
                              ) : (
                                <X size={12} className="text-neutral-500 font-bold" />
                              )}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {!loading && filteredUsers.length > pageSize && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10 text-xs text-white/50">
            <div>
              Showing{' '}
              <span className="font-semibold text-white">
                {(currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-white">
                {Math.min(currentPage * pageSize, filteredUsers.length)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-white">
                {filteredUsers.length}
              </span>{' '}
              users
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-white hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1
                    );
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    return (
                      <React.Fragment key={page}>
                        {prev && page - prev > 1 && (
                          <span className="px-1 text-white/30">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${
                            currentPage === page
                              ? 'bg-orange-500 text-white'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-medium text-white hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Customized Status Confirmation Modal ────────────────────── */}
      {confirmModal.isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
              onClick={() => {
                if (!confirmModal.loading) {
                  setConfirmModal({
                    isOpen: false,
                    user: null,
                    targetStatus: '',
                    loading: false,
                  });
                }
              }}
            />

            {/* Modal Dialog */}
            <div
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#0f1117] shadow-2xl shadow-black/80"
              style={{ animation: 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              {/* Header Accent Bar */}
              <div
                className={`h-1.5 w-full ${
                  confirmModal.targetStatus === 'Active'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400'
                    : 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500'
                }`}
              />

              <div className="p-6 md:p-8 space-y-6">
                {/* Header Icon + Titles */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                      confirmModal.targetStatus === 'Active'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {confirmModal.targetStatus === 'Active' ? (
                      <UserCheck size={24} />
                    ) : (
                      <AlertTriangle size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {confirmModal.targetStatus === 'Active'
                        ? 'Activate User Account?'
                        : 'Deactivate User Account?'}
                    </h3>
                    <p className="text-xs text-white/50 mt-1">
                      {confirmModal.targetStatus === 'Active'
                        ? 'Permit login access for this user in the portal.'
                        : 'Block login access for this user in the portal.'}
                    </p>
                  </div>
                  <button
                    disabled={confirmModal.loading}
                    onClick={() =>
                      setConfirmModal({
                        isOpen: false,
                        user: null,
                        targetStatus: '',
                        loading: false,
                      })
                    }
                    className="text-white/40 hover:text-white transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* User Information Card */}
                {confirmModal.user && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-sm">
                          {getInitials(confirmModal.user.username)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {confirmModal.user.username}
                          </p>
                          <p className="text-xs text-white/50">
                            {confirmModal.user.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-xl border ${
                          ROLE_COLORS[confirmModal.user.role] ||
                          'bg-white/10 text-white/70 border-white/10'
                        }`}
                      >
                        {confirmModal.user.role || 'Customer'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-white/40 block">Current Status</span>
                        <span
                          className={`font-semibold ${
                            String(confirmModal.user.status).toLowerCase() ===
                            'active'
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {confirmModal.user.status || 'Inactive'}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 block">New Status</span>
                        <span
                          className={`font-bold ${
                            confirmModal.targetStatus === 'Active'
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {confirmModal.targetStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contextual Warning / Info Notice */}
                {confirmModal.targetStatus === 'Inactive' ? (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-rose-200">
                      <ShieldAlert size={16} className="shrink-0 text-rose-400" />
                      Login Access Will Be Revoked
                    </div>
                    <p className="text-rose-300/80 leading-relaxed">
                      Setting this account to <strong>Inactive</strong> prevents the user
                      from signing into the system. Any active sessions will be rejected
                      on next login.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-emerald-200">
                      <ShieldCheck size={16} className="shrink-0 text-emerald-400" />
                      Login Access Will Be Granted
                    </div>
                    <p className="text-emerald-300/80 leading-relaxed">
                      Setting this account to <strong>Active</strong> permits the user to
                      sign into the portal with their email/username and password.
                    </p>
                  </div>
                )}

                {/* Modal Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={confirmModal.loading}
                    onClick={() =>
                      setConfirmModal({
                        isOpen: false,
                        user: null,
                        targetStatus: '',
                        loading: false,
                      })
                    }
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={confirmModal.loading}
                    onClick={handleConfirmStatusChange}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition shadow-lg disabled:opacity-50 ${
                      confirmModal.targetStatus === 'Active'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-500/25'
                    }`}
                  >
                    {confirmModal.loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Updating Status...
                      </>
                    ) : confirmModal.targetStatus === 'Active' ? (
                      <>
                        <UserCheck size={16} />
                        Yes, Activate User
                      </>
                    ) : (
                      <>
                        <UserX size={16} />
                        Yes, Deactivate User
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ── Self-Deactivation Prevention Modal ─────────────────────── */}
      {selfWarningModal &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setSelfWarningModal(false)}
            />
            <div
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/30 bg-[#0f1117] shadow-2xl p-6 text-center space-y-4"
              style={{ animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Cannot Deactivate Your Own Account
              </h3>
              <p className="text-xs text-white/60 leading-relaxed">
                For security reasons, administrators are not permitted to deactivate
                their own currently active session account to prevent accidental lockout.
              </p>
              <button
                type="button"
                onClick={() => setSelfWarningModal(false)}
                className="w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
              >
                Understood
              </button>
            </div>
          </div>,
          document.body
        )}

      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AdminUsersSettingsPage;
