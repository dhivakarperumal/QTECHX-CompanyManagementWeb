import React from 'react';
import { useAuth } from '../../PrivateRouter/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Edit3, 
  Key,
  CalendarDays,
  CheckCircle2,
  MapPin
} from 'lucide-react';

const AdminProfile = () => {
  const { user, profileName, role, email, phone } = useAuth();
  
  // Fake data for visual completeness
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Jan 15, 2026';
  const location = 'Chennai, India';
  const status = 'Active';

  return (
    <div className="space-y-6 pb-6 text-white min-h-screen">
      
      {/* ── PROFILE BANNER ── */}
      <div className="relative rounded-[2rem] overflow-hidden p-6 md:p-8 border border-white/10 bg-[#12131a]/70 shadow-2xl shadow-black/40 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 rounded-full bg-[radial-gradient(circle,_rgba(248,116,14,0.12),transparent_45%)] blur-3xl" />
        
        {/* Avatar Section */}
        <div className="relative z-10 shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 overflow-hidden bg-[#1a1c23] flex items-center justify-center shadow-xl shadow-black/50">
            {user?.profile_photo ? (
              <img src={user.profile_photo} alt={profileName} className="w-full h-full object-cover" />
            ) : (
              <User size={64} className="text-white/20" />
            )}
          </div>
          {/* <button className="absolute bottom-2 right-2 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-105 transition-transform">
            <Edit3 size={16} />
          </button> */}
        </div>

        {/* Info Section */}
        <div className="relative z-10 flex-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-4 tracking-wider uppercase">
            <Shield size={12} /> {role}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-2">{profileName}</h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/50 mt-4">
            <div className="flex items-center gap-1.5">
              <Mail size={16} /> {email || 'admin@qtechx.com'}
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

      {/* ── DETAILS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Personal Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-[2rem] bg-white/5 border border-white/10 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User size={20} className="text-primary" /> Personal Information
              </h2>
              {/* <button className="text-xs text-primary hover:underline font-medium">Edit Details</button> */}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">Full Name</p>
                <p className="font-medium text-white/90">{profileName}</p>
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
                <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">Role</p>
                <p className="font-medium text-white/90 capitalize">{role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Account Status & Security */}
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
            <button className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 transition border border-white/10 rounded-xl p-4 group">
              <div className="flex items-center gap-3 text-white/80 group-hover:text-white">
                <Key size={18} className="text-primary" />
                <span className="text-sm font-medium">Change Password</span>
              </div>
              <ChevronRightIcon />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default AdminProfile;
