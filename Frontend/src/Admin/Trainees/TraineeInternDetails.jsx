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

  return (
    <div className="space-y-6 text-white pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/trainees')} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition">
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-400"><FileText size={11} /> Member Details</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{member.full_name}</h1>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#111318] p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/15 flex items-center justify-center"><UserCircle2 size={30} className="text-orange-400" /></div>
          <div>
            <p className="text-2xl font-semibold text-white">{member.full_name}</p>
            <p className="text-white/50">{member.type} • {member.department || '—'}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">Basic Info</h3>
            <div className="grid gap-2 text-sm text-white/70">
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Person ID</span><span className="text-white">{member.person_id}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Type</span><span className="text-white">{member.type}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Designation</span><span className="text-white">{member.designation || '—'}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Reporting Manager</span><span className="text-white">{member.reporting_manager || '—'}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Status</span><span className="text-white">{member.status}</span></div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">Contact</h3>
            <div className="grid gap-2 text-sm text-white/70">
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Email</span><span className="text-white">{member.email_address || '—'}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Mobile</span><span className="text-white">{member.mobile_number || '—'}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Emergency Contact</span><span className="text-white">{member.emergency_contact_name || '—'} / {member.emergency_contact_number || '—'}</span></div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-2"><span>Address</span><span className="text-white text-right">{member.current_address || '—'}</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/40">Documents</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {documentFields.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/3 p-3">
                <p className="text-xs uppercase tracking-widest text-white/35">{label}</p>
                {value ? <a href={buildUploadUrl(value)} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm text-orange-400 hover:text-orange-300"><ExternalLink size={14} /> View</a> : <p className="mt-2 text-sm text-white/40">Not uploaded</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
