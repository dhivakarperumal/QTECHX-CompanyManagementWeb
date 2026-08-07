import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Loader2, ExternalLink, UserCircle2 } from 'lucide-react';
import api from '../../api';

function buildUploadUrl(filePath) {
  if (!filePath) return null;
  const normalized = `${filePath}`.replace(/\\/g, '/');
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith('/uploads/')) return `${import.meta.env.VITE_API_URL || '/api'}`.replace(/\/api$/, '') + normalized;
  if (normalized.startsWith('uploads/')) return `${import.meta.env.VITE_API_URL || '/api'}`.replace(/\/api$/, '') + `/${normalized}`;
  return `${import.meta.env.VITE_API_URL || '/api'}`.replace(/\/api$/, '') + `/uploads/${normalized}`;
}

export default function TraineeInternDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    (async () => {
      setLoading(true); setError('');
      try {
        const { data } = await api.get(`/trainee-intern/${id}`);
        if (!data.success) throw new Error(data.message || 'Failed');
        setMember(data.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load member');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 size={24} className="animate-spin text-orange-500" /></div>;
  if (error) return <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-rose-400">{error}</div>;
  if (!member) return null;

  const documentFields = [
    ['Profile Photo', member.profile_photo],
    ['Resume', member.resume],
    ['College ID', member.college_id_doc],
    ['Offer Letter', member.offer_letter],
    ['Internship Letter', member.internship_letter],
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">Basic Info</h3>
                <div className="grid gap-2 text-sm text-white/70">
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Person ID</span><span className="text-white font-medium">{member.person_id}</span></div>
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Type</span><span className="text-white font-medium">{member.type}</span></div>
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Designation</span><span className="text-white font-medium">{member.designation || '—'}</span></div>
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Reporting Manager</span><span className="text-white font-medium">{member.reporting_manager || '—'}</span></div>
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Status</span><span className="text-white font-medium">{member.status}</span></div>
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">Contact</h3>
                <div className="grid gap-2 text-sm text-white/70">
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Email</span><span className="text-white font-medium">{member.email_address || '—'}</span></div>
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Mobile</span><span className="text-white font-medium">{member.mobile_number || '—'}</span></div>
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Emergency Contact</span><span className="text-white font-medium text-right">{member.emergency_contact_name || '—'} <br/> {member.emergency_contact_number || ''}</span></div>
                  <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Address</span><span className="text-white font-medium text-right">{member.current_address || '—'}</span></div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Documents':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">Uploaded Documents</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {documentFields.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
                  <p className="text-xs uppercase tracking-widest text-white/40">{label}</p>
                  {value ? (
                    <a href={buildUploadUrl(value)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-orange-400 hover:text-orange-300">
                      <ExternalLink size={15} /> View File
                    </a>
                  ) : (
                    <p className="mt-3 text-sm text-white/30 italic">Not uploaded</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-white pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/employee/trainees')} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trainee / Intern Details</h1>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Profile Card & Tabs */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#111318] p-6 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-orange-500/15 flex items-center justify-center overflow-hidden border-2 border-orange-500/30 mb-4">
              {member.profile_photo ? (
                <img src={buildUploadUrl(member.profile_photo)} alt={member.full_name} className="w-full h-full object-cover" />
              ) : (
                <UserCircle2 size={40} className="text-orange-400" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white">{member.full_name}</h2>
            <p className="text-sm text-white/50 mt-1">{member.type} • {member.department || 'No Dept'}</p>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-xs text-white/70">
                <span className={`w-2 h-2 rounded-full ${member.status?.toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                {member.status || 'Unknown'}
              </div>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {['Overview', 'Documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center justify-start gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
                }`}
              >
                {tab === 'Overview' ? <FileText size={16} /> : <ExternalLink size={16} />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 rounded-2xl border border-white/10 bg-[#111318] p-6 lg:p-8">
          <h2 className="text-lg font-bold text-white mb-6 pb-4 border-b border-white/10">{activeTab}</h2>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

