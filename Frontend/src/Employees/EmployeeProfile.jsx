import React, { useState } from 'react';
import { useAuth } from '../PrivateRouter/AuthContext';
import { User, Mail, Phone, Shield, Key, CalendarDays, CheckCircle2, MapPin, X, Loader2, Eye, EyeOff } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';
import ModalPortal from '../Componets/CommonComponents/ModalPortal';

const EmployeeProfile = () => {
  const { user, profileName, role, email, phone } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const employeeId = user?.employee_id || user?.employeeId || user?.id || user?.uuid || 'N/A';
  const designation = user?.designation || user?.job_title || user?.position || 'Employee';
  const department = user?.department || user?.team || user?.department_name || 'N/A';
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : user?.joined_at
      ? new Date(user.joined_at).toLocaleDateString()
      : 'N/A';
  const location = user?.location || 'Chennai, India';
  const status = user?.status || 'Active';

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('New passwords do not match.');
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters.');
    }

    setIsChangingPassword(true);
    try {
      const res = await api.post('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success(res.data.message || 'Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 pb-6 text-white min-h-screen relative">
      <div className="relative rounded-[2rem] overflow-hidden p-6 md:p-8 border border-white/10 bg-[#12131a]/70 shadow-2xl shadow-black/40 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,_rgba(248,116,14,0.12),transparent_45%)] blur-3xl" />

        <div className="relative z-10 shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 overflow-hidden bg-[#1a1c23] flex items-center justify-center shadow-xl shadow-black/50">
            {user?.profile_photo ? (
              <img src={user.profile_photo} alt={profileName} className="w-full h-full object-cover" />
            ) : (
              <User size={64} className="text-white/20" />
            )}
          </div>
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4 tracking-wider uppercase">
            <Shield size={12} /> {role || 'Employee'}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">{profileName}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/50 mt-4">
            <div className="flex items-center gap-1.5">
              <Mail size={16} /> {email || 'Not provided'}
            </div>
            {phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={16} /> {phone}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin size={16} /> {location}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-[2rem] bg-white/5 border border-white/10 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User size={20} className="text-primary" /> Personal Information
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">Full Name</p>
                <p className="font-medium text-white/90">{profileName || 'N/A'}</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">Email Address</p>
                <p className="font-medium text-white/90">{email || 'Not provided'}</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">Phone Number</p>
                <p className="font-medium text-white/90">{phone || 'Not provided'}</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">Designation</p>
                <p className="font-medium text-white/90">{designation}</p>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">Department</p>
                <p className="font-medium text-white/90">{department}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white/5 border border-white/10 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
            <h2 className="text-sm font-bold text-white mb-5 uppercase tracking-wider text-white/50">Account Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Status</p>
                    <p className="text-xs text-white/40">{status}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Member Since</p>
                    <p className="text-xs text-white/40">{joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/5 border border-white/10 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
            <h2 className="text-sm font-bold text-white mb-5 uppercase tracking-wider text-white/50">Security</h2>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 transition border border-white/10 rounded-xl p-4 group"
            >
              <div className="flex items-center gap-3 text-white/80 group-hover:text-white">
                <Key size={18} className="text-primary" />
                <span className="text-sm font-medium">Change Password</span>
              </div>
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#12131a] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl shadow-black/50 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Key size={20} className="text-primary" /> Change Password
                </h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="text-white/40 hover:text-white transition-colors p-1"
                  disabled={isChangingPassword}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full bg-[#0d0e14] border border-white/10 rounded-xl p-3 pr-10 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full bg-[#0d0e14] border border-white/10 rounded-xl p-3 pr-10 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full bg-[#0d0e14] border border-white/10 rounded-xl p-3 pr-10 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    disabled={isChangingPassword}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors text-sm font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? (
                      <><Loader2 size={16} className="animate-spin" /> Updating...</>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default EmployeeProfile;
