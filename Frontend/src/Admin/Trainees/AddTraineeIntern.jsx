import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Save, Loader2, CheckCircle, AlertCircle, UserCircle2, RefreshCw } from 'lucide-react';
import api from '../../api';

const sectionClass = 'rounded-2xl border border-white/8 bg-white/[0.03] p-5';
const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/70 transition placeholder:text-white/20';
const STATUS_OPTIONS = ['Active', 'Completed', 'On Leave', 'Inactive'];
const TYPE_OPTIONS = ['Trainee', 'Intern'];

const BLANK = {
  person_id: '', full_name: '', type: 'Trainee', department: '', designation: '', reporting_manager: '',
  joining_date: '', end_date: '', status: 'Active', mobile_number: '', email_address: '', current_address: '',
  emergency_contact_name: '', emergency_contact_number: '', college_university: '', course: '',
  academic_department: '', year_semester: '', college_id_number: '', guide_name: '',
  profile_photo: '', resume: '', college_id_doc: '', offer_letter: '', internship_letter: '',
};

const toForm = (item) => ({
  person_id: item.person_id || '', full_name: item.full_name || '', type: item.type || 'Trainee', department: item.department || '', designation: item.designation || '', reporting_manager: item.reporting_manager || '',
  joining_date: item.joining_date ? item.joining_date.slice(0, 10) : '', end_date: item.end_date ? item.end_date.slice(0, 10) : '', status: item.status || 'Active', mobile_number: item.mobile_number || '', email_address: item.email_address || '', current_address: item.current_address || '',
  emergency_contact_name: item.emergency_contact_name || '', emergency_contact_number: item.emergency_contact_number || '', college_university: item.college_university || '', course: item.course || '',
  academic_department: item.academic_department || '', year_semester: item.year_semester || '', college_id_number: item.college_id_number || '', guide_name: item.guide_name || '',
  profile_photo: item.profile_photo || '', resume: item.resume || '', college_id_doc: item.college_id_doc || '', offer_letter: item.offer_letter || '', internship_letter: item.internship_letter || '',
});

function buildUploadUrl(filePath) {
  if (!filePath) return null;
  const normalized = `${filePath}`.replace(/\\/g, '/');
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith('/uploads/')) return `${import.meta.env.VITE_API_URL || '/api'}`.replace(/\/api$/, '') + normalized;
  if (normalized.startsWith('uploads/')) return `${import.meta.env.VITE_API_URL || '/api'}`.replace(/\/api$/, '') + `/${normalized}`;
  return `${import.meta.env.VITE_API_URL || '/api'}`.replace(/\/api$/, '') + `/uploads/${normalized}`;
}

export default function AddTraineeIntern() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [formData, setFormData] = useState(BLANK);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [personIdLoading, setPersonIdLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [files, setFiles] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      setFetchLoading(true);
      try {
        const { data } = await api.get(`/trainee-intern/${id}`);
        if (!data.success) throw new Error(data.message || 'Not found');
        setFormData(toForm(data.data));
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load member');
      } finally {
        setFetchLoading(false);
      }
    })();
  }, [id, isEdit]);

  useEffect(() => {
    if (isEdit || formData.person_id) return;
    (async () => {
      setPersonIdLoading(true);
      try {
        const { data } = await api.get('/trainee-intern/next-person-id');
        if (data.success) setFormData((prev) => ({ ...prev, person_id: data.code || '' }));
      } catch (err) {
        console.warn('Person ID generation failed', err?.message || err);
      } finally {
        setPersonIdLoading(false);
      }
    })();
  }, [isEdit, formData.person_id]);

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFile = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (!selectedFiles?.length) return;
    setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.full_name?.trim()) {
      setError('Full name is required.');
      return;
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) return;
        if (key === 'profile_photo' || key === 'resume' || key === 'college_id_doc' || key === 'offer_letter' || key === 'internship_letter') return;
        form.append(key, value);
      });

      Object.entries(files).forEach(([key, file]) => {
        if (file) form.append(key, file);
      });

      const res = isEdit ? await api.put(`/trainee-intern/${id}`, form) : await api.post('/trainee-intern', form);
      if (!res.data.success) throw new Error(res.data.message || 'Failed');
      setSuccess(isEdit ? 'Member updated successfully!' : 'Member created successfully!');
      setTimeout(() => navigate('/admin/trainees'), 1400);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white pb-10">
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/admin/trainees')} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition shrink-0 mt-1">
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-400">
            <FileText size={11} /> {isEdit ? 'Edit Member' : 'New Member'}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{isEdit ? 'Edit Trainee / Intern' : 'Add Trainee / Intern'}</h1>
          <p className="text-sm text-white/40 mt-0.5">Create a member profile with contact details, documents, and academic info.</p>
        </div>
      </div>

      {success && <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm px-5 py-3.5 rounded-2xl"><CheckCircle size={16} /> {success}</div>}
      {error && <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl"><AlertCircle size={16} /> {error}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center"><UserCircle2 size={15} className="text-orange-400" /></div>
            <h2 className="text-base font-bold text-white">Basic Information</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Person ID</span>
              <div className="flex gap-2">
                <input className={fieldClass} name="person_id" value={formData.person_id} onChange={handleChange} readOnly />
                <button type="button" onClick={async () => { setPersonIdLoading(true); try { const { data } = await api.get('/trainee-intern/next-person-id'); if (data.success) setFormData((prev) => ({ ...prev, person_id: data.code || '' })); } catch (err) { console.warn(err); } finally { setPersonIdLoading(false); } }} className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition flex items-center justify-center">
                  {personIdLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                </button>
              </div>
            </label>
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Full Name *</span>
              <input className={fieldClass} name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Enter full name" />
            </label>
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Type</span>
              <select className={fieldClass} name="type" value={formData.type} onChange={handleChange}>
                {TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Department</span>
              <input className={fieldClass} name="department" value={formData.department} onChange={handleChange} placeholder="e.g. IT / HR" />
            </label>
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Designation</span>
              <input className={fieldClass} name="designation" value={formData.designation} onChange={handleChange} placeholder="Software Developer" />
            </label>
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Reporting Manager</span>
              <input className={fieldClass} name="reporting_manager" value={formData.reporting_manager} onChange={handleChange} placeholder="Manager name" />
            </label>
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Joining Date</span>
              <input className={fieldClass} type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} />
            </label>
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">End Date (Optional)</span>
              <input className={fieldClass} type="date" name="end_date" value={formData.end_date} onChange={handleChange} />
            </label>
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Status</span>
              <select className={fieldClass} name="status" value={formData.status} onChange={handleChange}>
                {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center"><FileText size={15} className="text-orange-400" /></div>
            <h2 className="text-base font-bold text-white">Contact Information</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-white/60"><span className="mb-1.5 block font-medium">Mobile Number</span><input className={fieldClass} name="mobile_number" value={formData.mobile_number} onChange={handleChange} placeholder="9876543210" /></label>
            <label className="text-sm text-white/60"><span className="mb-1.5 block font-medium">Email Address</span><input className={fieldClass} type="email" name="email_address" value={formData.email_address} onChange={handleChange} placeholder="name@email.com" /></label>
            <label className="text-sm text-white/60 md:col-span-2"><span className="mb-1.5 block font-medium">Current Address</span><textarea className={`${fieldClass} min-h-20 resize-y`} name="current_address" value={formData.current_address} onChange={handleChange} placeholder="Current address" /></label>
            <label className="text-sm text-white/60"><span className="mb-1.5 block font-medium">Emergency Contact Name</span><input className={fieldClass} name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} /></label>
            <label className="text-sm text-white/60"><span className="mb-1.5 block font-medium">Emergency Contact Number</span><input className={fieldClass} name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} /></label>
          </div>
        </section>

        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center"><FileText size={15} className="text-orange-400" /></div>
            <h2 className="text-base font-bold text-white">Documents</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['Profile Photo', 'profile_photo'],
              ['Resume', 'resume'],
              ['College ID (Intern/Trainee)', 'college_id_doc'],
              ['Offer Letter', 'offer_letter'],
              ['Internship Letter (Optional)', 'internship_letter'],
            ].map(([label, name]) => (
              <label key={name} className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">{label}</span>
                <input className={fieldClass} type="file" name={name} onChange={handleFile} />
                {formData[name] && (
                  <a href={buildUploadUrl(formData[name])} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-orange-400 hover:text-orange-300">View current file</a>
                )}
              </label>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center"><FileText size={15} className="text-orange-400" /></div>
            <h2 className="text-base font-bold text-white">Academic Information</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-white/60"><span className="mb-1.5 block font-medium">College / University</span><input className={fieldClass} name="college_university" value={formData.college_university} onChange={handleChange} /></label>
            <label className="text-sm text-white/60"><span className="mb-1.5 block font-medium">Course</span><input className={fieldClass} name="course" value={formData.course} onChange={handleChange} /></label>
            <label className="text-sm text-white/60"><span className="mb-1.5 block font-medium">Department</span><input className={fieldClass} name="academic_department" value={formData.academic_department} onChange={handleChange} /></label>
            <label className="text-sm text-white/60"><span className="mb-1.5 block font-medium">Year / Semester</span><input className={fieldClass} name="year_semester" value={formData.year_semester} onChange={handleChange} /></label>
            <label className="text-sm text-white/60"><span className="mb-1.5 block font-medium">College ID</span><input className={fieldClass} name="college_id_number" value={formData.college_id_number} onChange={handleChange} /></label>
            <label className="text-sm text-white/60"><span className="mb-1.5 block font-medium">Guide / Faculty Name</span><input className={fieldClass} name="guide_name" value={formData.guide_name} onChange={handleChange} /></label>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {loading ? 'Saving…' : 'Save Member'}
          </button>
        </div>
      </form>
    </div>
  );
}
