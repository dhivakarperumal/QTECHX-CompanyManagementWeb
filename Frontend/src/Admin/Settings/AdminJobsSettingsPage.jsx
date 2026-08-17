import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight, CircleDollarSign, Clock3, FileText, Globe2, ImageIcon, Loader2, MapPin, Pencil, Plus, Search, ShieldCheck, Sparkles, Tag, Trash2, X } from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import { useAuth } from '../../PrivateRouter/AuthContext';

const blankJob = {
  id: null,
  job_title: '',
  job_id: '',
  job_code: '',
  job_category: '',
  job_subcategory: '',
  department: '',
  employment_type: 'Full-time',
  job_level: 'Mid-Level',
  vacancies: '1',
  company_name: '',
  company_logo: '',
  company_description: '',
  company_website: '',
  industry: '',
  company_email: '',
  company_phone: '',
  country: '',
  state: '',
  city: '',
  area: '',
  full_address: '',
  pincode: '',
  work_mode: 'On-site',
  willing_to_relocate: 'No',
  travel_required: 'No',
  short_description: '',
  full_job_description: '',
  key_responsibilities: '',
  daily_duties: '',
  required_qualifications: '',
  preferred_qualifications: '',
  required_skills: [],
  preferred_skills: [],
  technical_skills: [],
  soft_skills: [],
  education: '',
  minimum_experience: '0',
  maximum_experience: '3',
  certifications: '',
  languages_required: [],
  salary_type: 'Monthly',
  minimum_salary: '',
  maximum_salary: '',
  currency: 'INR',
  salary_negotiable: 'No',
  performance_bonus: '',
  joining_bonus: '',
  benefits: [],
  other_compensation: '',
  working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  working_hours: '9:00 AM - 6:00 PM',
  shift_type: 'Day Shift',
  shift_start_time: '09:00',
  shift_end_time: '18:00',
  weekly_off: 'Saturday',
  probation_period: '3 Months',
  notice_period_required: '30 Days',
  expected_joining_date: '',
  immediate_joiner: 'No',
  application_start_date: new Date().toISOString().slice(0, 10),
  application_deadline: '',
  application_email: '',
  application_phone: '',
  application_url: '',
  resume_required: 'Yes',
  cover_letter_required: 'No',
  required_documents: [],
  application_instructions: '',
  hiring_contact_person: '',
  screening_questions: [{ id: 1, question: '', question_type: 'Text', options: '', required: 'No' }],
  job_status: 'Draft',
  visibility: 'Public',
  featured_job: 'No',
  urgent_hiring: 'No',
  allow_applications: 'Yes',
  auto_expire: 'No',
  publish_date: '',
  expiry_date: '',
  url_slug: '',
  meta_title: '',
  meta_description: '',
  seo_keywords: [],
  social_share_image: '',
  social_sharing: 'Yes',
  total_applications: 0,
  new_applications: 0,
  shortlisted: 0,
  interview_scheduled: 0,
  interview_completed: 0,
  selected: 0,
  rejected: 0,
  hired: 0,
  created_by: '',
  updated_by: '',
  created_at: '',
  updated_at: '',
  published_at: '',
  closed_at: '',
  view_count: 0,
  application_count: 0,
};

const normalizeJob = (job = {}) => ({
  ...blankJob,
  ...job,
  required_skills: Array.isArray(job.required_skills) ? job.required_skills : (job.required_skills ? String(job.required_skills).split(',') : []),
  preferred_skills: Array.isArray(job.preferred_skills) ? job.preferred_skills : (job.preferred_skills ? String(job.preferred_skills).split(',') : []),
  technical_skills: Array.isArray(job.technical_skills) ? job.technical_skills : (job.technical_skills ? String(job.technical_skills).split(',') : []),
  soft_skills: Array.isArray(job.soft_skills) ? job.soft_skills : (job.soft_skills ? String(job.soft_skills).split(',') : []),
  languages_required: Array.isArray(job.languages_required) ? job.languages_required : (job.languages_required ? String(job.languages_required).split(',') : []),
  benefits: Array.isArray(job.benefits) ? job.benefits : (job.benefits ? String(job.benefits).split(',') : []),
  required_documents: Array.isArray(job.required_documents) ? job.required_documents : (job.required_documents ? String(job.required_documents).split(',') : []),
  seo_keywords: Array.isArray(job.seo_keywords) ? job.seo_keywords : (job.seo_keywords ? String(job.seo_keywords).split(',') : []),
  working_days: Array.isArray(job.working_days) ? job.working_days : (job.working_days ? String(job.working_days).split(',') : []),
  screening_questions: Array.isArray(job.screening_questions) && job.screening_questions.length ? job.screening_questions : [{ id: 1, question: '', question_type: 'Text', options: '', required: 'No' }],
  vacancies: job.vacancies ?? '1',
  minimum_experience: job.minimum_experience ?? '0',
  maximum_experience: job.maximum_experience ?? '3',
});

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value && value !== 0) return [];
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [value];
};

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const statusStyles = {
  Draft: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  Active: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  Paused: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  Closed: 'bg-red-500/10 text-red-300 border-red-500/30',
  Expired: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30',
};

const sortJobs = (jobs) => [...jobs].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

const Section = ({ title, icon: Icon, children }) => (
  <section className="rounded-3xl border border-white/10 bg-[#111827]/80 p-5 shadow-lg shadow-black/10">
    <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
        <Icon size={16} />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
    </div>
    <div className="space-y-5">{children}</div>
  </section>
);

const FormField = ({ label, required, children, hint }) => (
  <label className="block">
    <span className="mb-2 flex items-center gap-1 text-[13px] font-medium text-slate-200">
      {label}
      {required && <span className="text-red-400">*</span>}
    </span>
    {children}
    {hint && <span className="mt-1.5 block text-[11px] text-slate-400">{hint}</span>}
  </label>
);

const TagInput = ({ value, onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    const tag = input.trim();
    if (!tag) return;
    const next = [...new Set([...(value || []), tag])];
    onChange(next);
    setInput('');
  };

  const removeTag = (tag) => {
    onChange((value || []).filter((item) => item !== tag));
  };

  return (
    <div className="rounded-2xl border border-slate-700 bg-[#0f172a]/80 p-2">
      <div className="flex flex-wrap gap-2 p-1">
        {(value || []).map((item) => (
          <span key={item} className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs text-orange-200">
            {item}
            <button type="button" onClick={() => removeTag(item)} className="text-orange-300 hover:text-white">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none"
        />
        <button type="button" onClick={addTag} className="rounded-xl border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-300 hover:bg-orange-500/20">
          Add
        </button>
      </div>
    </div>
  );
};

const AdminJobsSettingsPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [formData, setFormData] = useState(normalizeJob(blankJob));

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/jobs');
      setJobs(sortJobs(Array.isArray(data?.data) ? data.data : []));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesStatus = statusFilter === 'All' || (job.job_status || 'Draft') === statusFilter;
      const matchesSearch = !term || [job.job_title, job.company_name, job.department, job.job_category, job.job_code].join(' ').toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [jobs, search, statusFilter]);

  const openNewJob = () => {
    const currentUserId = user?.user_id || user?.id || user?.uuid || user?.employee_id || user?.employeeId || '';
    const nextJob = normalizeJob({
      ...blankJob,
      job_id: `JOB-${Date.now().toString().slice(-6)}`,
      job_code: `QT-${Date.now().toString().slice(-6)}`,
      created_by: currentUserId,
      updated_by: currentUserId,
      application_start_date: new Date().toISOString().slice(0, 10),
      screening_questions: [{ id: 1, question: '', question_type: 'Text', options: '', required: 'No' }],
    });
    setFormData(nextJob);
    setEditingId(null);
    setIsDrawerOpen(true);
  };

  const openEditJob = (job) => {
    const currentUserId = user?.user_id || user?.id || user?.uuid || user?.employee_id || user?.employeeId || job.updated_by || job.created_by || '';
    const normalized = normalizeJob({ ...job, updated_by: currentUserId, created_by: job.created_by || currentUserId });
    setFormData(normalized);
    setEditingId(job.id);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingId(null);
    setFormData(normalizeJob(blankJob));
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateScreeningQuestion = (index, field, value) => {
    setFormData((prev) => {
      const nextQuestions = [...(prev.screening_questions || [])];
      nextQuestions[index] = { ...nextQuestions[index], [field]: value };
      return { ...prev, screening_questions: nextQuestions };
    });
  };

  const addScreeningQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      screening_questions: [
        ...(prev.screening_questions || []),
        { id: Date.now(), question: '', question_type: 'Text', options: '', required: 'No' },
      ],
    }));
  };

  const removeScreeningQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      screening_questions: (prev.screening_questions || []).filter((_, idx) => idx !== index),
    }));
  };

  const validateJob = () => {
    if (!formData.job_title?.trim()) {
      toast.error('Job title is required');
      return false;
    }
    if (!formData.company_name?.trim()) {
      toast.error('Company name is required');
      return false;
    }
    if (!formData.job_category?.trim()) {
      toast.error('Job category is required');
      return false;
    }
    if (!formData.country?.trim()) {
      toast.error('Country is required');
      return false;
    }
    if (!formData.application_deadline) {
      toast.error('Application deadline is required');
      return false;
    }
    if (formData.minimum_salary && formData.maximum_salary && Number(formData.minimum_salary) > Number(formData.maximum_salary)) {
      toast.error('Minimum salary cannot be greater than maximum salary');
      return false;
    }
    if (formData.application_start_date && formData.application_deadline && new Date(formData.application_deadline) < new Date(formData.application_start_date)) {
      toast.error('Application deadline must not be before the start date');
      return false;
    }
    if (formData.publish_date && formData.expiry_date && new Date(formData.expiry_date) < new Date(formData.publish_date)) {
      toast.error('Expiry date must not be before publish date');
      return false;
    }
    if (formData.company_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.company_email)) {
      toast.error('Company email is invalid');
      return false;
    }
    if (formData.application_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.application_email)) {
      toast.error('Application email is invalid');
      return false;
    }
    if (formData.company_phone && !/^[+0-9\s()-]{7,20}$/.test(formData.company_phone)) {
      toast.error('Company phone is invalid');
      return false;
    }
    if (formData.application_phone && !/^[+0-9\s()-]{7,20}$/.test(formData.application_phone)) {
      toast.error('Application phone is invalid');
      return false;
    }
    if (formData.company_website && !/^https?:\/\//i.test(formData.company_website)) {
      toast.error('Company website must start with http:// or https://');
      return false;
    }
    if (formData.application_url && !/^https?:\/\//i.test(formData.application_url)) {
      toast.error('Application URL must start with http:// or https://');
      return false;
    }
    if (formData.pincode && !/^[0-9a-zA-Z\-\s]{4,12}$/.test(formData.pincode)) {
      toast.error('Pincode is invalid');
      return false;
    }
    return true;
  };

  const handleSave = async (action = 'draft') => {
    if (!validateJob()) return;

    const currentUserId = user?.user_id || user?.id || user?.uuid || user?.employee_id || user?.employeeId || formData.updated_by || formData.created_by || '';
    const payload = {
      ...formData,
      job_status: action === 'publish' ? 'Active' : action === 'draft' ? 'Draft' : formData.job_status || 'Draft',
      publish_date: action === 'publish' ? (formData.publish_date || new Date().toISOString()) : formData.publish_date,
      expiry_date: formData.expiry_date || null,
      created_by: formData.created_by || currentUserId,
      updated_by: currentUserId,
      required_skills: asArray(formData.required_skills),
      preferred_skills: asArray(formData.preferred_skills),
      technical_skills: asArray(formData.technical_skills),
      soft_skills: asArray(formData.soft_skills),
      languages_required: asArray(formData.languages_required),
      benefits: asArray(formData.benefits),
      required_documents: asArray(formData.required_documents),
      seo_keywords: asArray(formData.seo_keywords),
      working_days: asArray(formData.working_days),
      screening_questions: formData.screening_questions || [],
      total_applications: Number(formData.total_applications || 0),
      new_applications: Number(formData.new_applications || 0),
      shortlisted: Number(formData.shortlisted || 0),
      interview_scheduled: Number(formData.interview_scheduled || 0),
      interview_completed: Number(formData.interview_completed || 0),
      selected: Number(formData.selected || 0),
      rejected: Number(formData.rejected || 0),
      hired: Number(formData.hired || 0),
      view_count: Number(formData.view_count || 0),
      application_count: Number(formData.application_count || 0),
      vacancies: Number(formData.vacancies || 1),
      minimum_salary: formData.minimum_salary === '' ? null : Number(formData.minimum_salary),
      maximum_salary: formData.maximum_salary === '' ? null : Number(formData.maximum_salary),
    };

    try {
      setSaving(true);
      if (editingId) {
        await api.put(`/jobs/${editingId}`, payload);
        toast.success('Job updated successfully');
      } else {
        await api.post('/jobs', payload);
        toast.success('Job created successfully');
      }
      await fetchJobs();
      closeDrawer();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setSaving(true);
      await api.delete(`/jobs/${deleteId}`);
      toast.success('Job deleted successfully');
      setDeleteId(null);
      await fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6 pb-10 text-white">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-5 shadow-xl shadow-black/20 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Recruitment</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Post Jobs</h1>
        </div>
        <button onClick={openNewJob} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400">
          <Plus size={16} /> Add New Job
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Total Jobs', value: jobs.length, icon: BriefcaseBusiness },
          { label: 'Active', value: jobs.filter((job) => job.job_status === 'Active').length, icon: CheckCircle2 },
          { label: 'Draft', value: jobs.filter((job) => job.job_status === 'Draft').length, icon: FileText },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-white/10 bg-[#111827]/80 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{item.label}</span>
              <item.icon size={18} className="text-orange-400" />
            </div>
            <div className="mt-4 text-3xl font-bold text-white">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#111827]/80 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
            <Search size={16} className="text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs, company, department..." className="w-full bg-transparent text-white placeholder:text-slate-500 focus:outline-none" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none">
            <option>All</option>
            <option>Draft</option>
            <option>Active</option>
            <option>Paused</option>
            <option>Closed</option>
            <option>Expired</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-3xl border border-white/10 bg-[#111827]/80 text-slate-300">
          <Loader2 size={18} className="mr-2 animate-spin" /> Loading jobs...
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-[#111827]/70 p-10 text-center text-slate-300">
              No jobs found. Create your first job post.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#111827]/80 p-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-xl text-orange-400">
                    {job.company_name?.charAt(0)?.toUpperCase() || 'J'}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{job.job_title}</h3>
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-medium ${statusStyles[job.job_status] || statusStyles.Draft}`}>
                        {job.job_status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{job.company_name} • {job.department || 'General'} • {job.job_category || 'Uncategorized'}</p>
                    <p className="mt-1 text-xs text-slate-400">{job.city || 'Remote'} • {job.employment_type || 'Full-time'} • {job.vacancies || 1} vacancy</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => openEditJob(job)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-200 hover:border-orange-400 hover:text-white">
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => setDeleteId(job.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300 hover:bg-red-500/20">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
          <div className="h-full w-full overflow-y-auto border-l border-white/10 bg-[#0b1120] shadow-2xl shadow-black/40 md:max-w-5xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b1120]/90 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Job Management</p>
                <h2 className="mt-1 text-xl font-bold text-white">{editingId ? 'Edit Job' : 'Add New Job'}</h2>
              </div>
              <button onClick={closeDrawer} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-5">
              <Section title="Job Information" icon={BriefcaseBusiness}>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <FormField label="Job Title" required>
                    <input value={formData.job_title} onChange={(e) => updateField('job_title', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Senior Product Designer" />
                  </FormField>
                  <FormField label="Job ID">
                    <input value={formData.job_id} onChange={(e) => updateField('job_id', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="QTX-102" />
                  </FormField>
                  <FormField label="Job Code / Reference Number">
                    <input value={formData.job_code} onChange={(e) => updateField('job_code', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="JOB-1001" />
                  </FormField>
                  <FormField label="Job Category" required>
                    <select value={formData.job_category} onChange={(e) => updateField('job_category', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option value="">Select category</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Design">Design</option>
                      <option value="Operations">Operations</option>
                      <option value="Sales">Sales</option>
                      <option value="HR">HR</option>
                    </select>
                  </FormField>
                  <FormField label="Job Subcategory">
                    <input value={formData.job_subcategory} onChange={(e) => updateField('job_subcategory', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Frontend Development" />
                  </FormField>
                  <FormField label="Department">
                    <input value={formData.department} onChange={(e) => updateField('department', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Product" />
                  </FormField>
                  <FormField label="Employment Type">
                    <select value={formData.employment_type} onChange={(e) => updateField('employment_type', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Freelance</option>
                      <option>Internship</option>
                    </select>
                  </FormField>
                  <FormField label="Job Level">
                    <select value={formData.job_level} onChange={(e) => updateField('job_level', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Entry-Level</option>
                      <option>Mid-Level</option>
                      <option>Senior</option>
                      <option>Lead</option>
                      <option>Manager</option>
                    </select>
                  </FormField>
                  <FormField label="Number of Vacancies">
                    <input type="number" min="1" value={formData.vacancies} onChange={(e) => updateField('vacancies', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" />
                  </FormField>
                </div>
              </Section>

              <Section title="Company Information" icon={Globe2}>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <FormField label="Company Name" required>
                    <input value={formData.company_name} onChange={(e) => updateField('company_name', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Q Techx" />
                  </FormField>
                  <FormField label="Company Logo">
                    <input value={formData.company_logo} onChange={(e) => updateField('company_logo', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="https://.../logo.png" />
                  </FormField>
                  <FormField label="Company Website">
                    <input value={formData.company_website} onChange={(e) => updateField('company_website', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="https://qtechx.com" />
                  </FormField>
                  <FormField label="Industry">
                    <input value={formData.industry} onChange={(e) => updateField('industry', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Technology" />
                  </FormField>
                  <FormField label="Company Email">
                    <input type="email" value={formData.company_email} onChange={(e) => updateField('company_email', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="careers@company.com" />
                  </FormField>
                  <FormField label="Company Phone">
                    <input value={formData.company_phone} onChange={(e) => updateField('company_phone', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="+91 98765 43210" />
                  </FormField>
                  <div className="md:col-span-2 xl:col-span-3">
                    <FormField label="Company Description">
                      <textarea value={formData.company_description} onChange={(e) => updateField('company_description', e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Describe the company and work culture" />
                    </FormField>
                  </div>
                </div>
              </Section>

              <Section title="Location & Work Mode" icon={MapPin}>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <FormField label="Country" required>
                    <input value={formData.country} onChange={(e) => updateField('country', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="India" />
                  </FormField>
                  <FormField label="State">
                    <input value={formData.state} onChange={(e) => updateField('state', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Tamil Nadu" />
                  </FormField>
                  <FormField label="City">
                    <input value={formData.city} onChange={(e) => updateField('city', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Chennai" />
                  </FormField>
                  <FormField label="Area">
                    <input value={formData.area} onChange={(e) => updateField('area', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Adyar" />
                  </FormField>
                  <FormField label="Full Address">
                    <input value={formData.full_address} onChange={(e) => updateField('full_address', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="35, 5th Street..." />
                  </FormField>
                  <FormField label="Pincode">
                    <input value={formData.pincode} onChange={(e) => updateField('pincode', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="600001" />
                  </FormField>
                  <FormField label="Work Mode">
                    <select value={formData.work_mode} onChange={(e) => updateField('work_mode', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>On-site</option>
                      <option>Remote</option>
                      <option>Hybrid</option>
                    </select>
                  </FormField>
                  <FormField label="Willing to Relocate">
                    <select value={formData.willing_to_relocate} onChange={(e) => updateField('willing_to_relocate', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </FormField>
                  <FormField label="Travel Required">
                    <select value={formData.travel_required} onChange={(e) => updateField('travel_required', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </FormField>
                </div>
              </Section>

              <Section title="Job Details" icon={CalendarDays}>
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField label="Short Description">
                    <textarea value={formData.short_description} onChange={(e) => updateField('short_description', e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="A quick summary of the role" />
                  </FormField>
                  <FormField label="Full Job Description">
                    <textarea value={formData.full_job_description} onChange={(e) => updateField('full_job_description', e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Detailed role, responsibilities and impact" />
                  </FormField>
                  <FormField label="Key Responsibilities">
                    <textarea value={formData.key_responsibilities} onChange={(e) => updateField('key_responsibilities', e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Responsibilities" />
                  </FormField>
                  <FormField label="Daily Duties">
                    <textarea value={formData.daily_duties} onChange={(e) => updateField('daily_duties', e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Daily tasks" />
                  </FormField>
                  <FormField label="Required Qualifications">
                    <textarea value={formData.required_qualifications} onChange={(e) => updateField('required_qualifications', e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Required qualifications" />
                  </FormField>
                  <FormField label="Preferred Qualifications">
                    <textarea value={formData.preferred_qualifications} onChange={(e) => updateField('preferred_qualifications', e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Preferred qualifications" />
                  </FormField>
                  <FormField label="Required Skills">
                    <TagInput value={formData.required_skills} onChange={(value) => updateField('required_skills', value)} placeholder="Add required skill" />
                  </FormField>
                  <FormField label="Preferred Skills">
                    <TagInput value={formData.preferred_skills} onChange={(value) => updateField('preferred_skills', value)} placeholder="Add preferred skill" />
                  </FormField>
                  <FormField label="Technical Skills">
                    <TagInput value={formData.technical_skills} onChange={(value) => updateField('technical_skills', value)} placeholder="Add technical skill" />
                  </FormField>
                  <FormField label="Soft Skills">
                    <TagInput value={formData.soft_skills} onChange={(value) => updateField('soft_skills', value)} placeholder="Add soft skill" />
                  </FormField>
                  <FormField label="Education">
                    <input value={formData.education} onChange={(e) => updateField('education', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Bachelor's or equivalent" />
                  </FormField>
                  <FormField label="Minimum Experience">
                    <input value={formData.minimum_experience} onChange={(e) => updateField('minimum_experience', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="1" />
                  </FormField>
                  <FormField label="Maximum Experience">
                    <input value={formData.maximum_experience} onChange={(e) => updateField('maximum_experience', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="5" />
                  </FormField>
                  <FormField label="Certifications">
                    <input value={formData.certifications} onChange={(e) => updateField('certifications', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="AWS Certified Developer" />
                  </FormField>
                  <FormField label="Languages Required">
                    <TagInput value={formData.languages_required} onChange={(value) => updateField('languages_required', value)} placeholder="Add language" />
                  </FormField>
                </div>
              </Section>

              <Section title="Salary & Benefits" icon={CircleDollarSign}>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <FormField label="Salary Type">
                    <select value={formData.salary_type} onChange={(e) => updateField('salary_type', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Monthly</option>
                      <option>Yearly</option>
                      <option>Hourly</option>
                    </select>
                  </FormField>
                  <FormField label="Minimum Salary">
                    <input type="number" value={formData.minimum_salary} onChange={(e) => updateField('minimum_salary', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="30000" />
                  </FormField>
                  <FormField label="Maximum Salary">
                    <input type="number" value={formData.maximum_salary} onChange={(e) => updateField('maximum_salary', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="50000" />
                  </FormField>
                  <FormField label="Currency">
                    <select value={formData.currency} onChange={(e) => updateField('currency', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>INR</option>
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                    </select>
                  </FormField>
                  <FormField label="Salary Negotiable">
                    <select value={formData.salary_negotiable} onChange={(e) => updateField('salary_negotiable', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </FormField>
                  <FormField label="Performance Bonus">
                    <input value={formData.performance_bonus} onChange={(e) => updateField('performance_bonus', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="10%" />
                  </FormField>
                  <FormField label="Joining Bonus">
                    <input value={formData.joining_bonus} onChange={(e) => updateField('joining_bonus', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="₹50,000" />
                  </FormField>
                  <FormField label="Benefits">
                    <TagInput value={formData.benefits} onChange={(value) => updateField('benefits', value)} placeholder="Add benefit" />
                  </FormField>
                  <FormField label="Other Compensation">
                    <input value={formData.other_compensation} onChange={(e) => updateField('other_compensation', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Health cover, transport etc." />
                  </FormField>
                </div>
              </Section>

              <Section title="Working Details" icon={Clock3}>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <FormField label="Working Days">
                    <TagInput value={formData.working_days} onChange={(value) => updateField('working_days', value)} placeholder="Add working day" />
                  </FormField>
                  <FormField label="Working Hours">
                    <input value={formData.working_hours} onChange={(e) => updateField('working_hours', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="9:00 AM - 6:00 PM" />
                  </FormField>
                  <FormField label="Shift Type">
                    <input value={formData.shift_type} onChange={(e) => updateField('shift_type', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Day Shift" />
                  </FormField>
                  <FormField label="Shift Start Time">
                    <input type="time" value={formData.shift_start_time} onChange={(e) => updateField('shift_start_time', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" />
                  </FormField>
                  <FormField label="Shift End Time">
                    <input type="time" value={formData.shift_end_time} onChange={(e) => updateField('shift_end_time', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" />
                  </FormField>
                  <FormField label="Weekly Off">
                    <input value={formData.weekly_off} onChange={(e) => updateField('weekly_off', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Sunday" />
                  </FormField>
                  <FormField label="Probation Period">
                    <input value={formData.probation_period} onChange={(e) => updateField('probation_period', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="3 Months" />
                  </FormField>
                  <FormField label="Notice Period Required">
                    <input value={formData.notice_period_required} onChange={(e) => updateField('notice_period_required', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="30 Days" />
                  </FormField>
                  <FormField label="Expected Joining Date">
                    <input type="date" value={toDateInput(formData.expected_joining_date)} onChange={(e) => updateField('expected_joining_date', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" />
                  </FormField>
                  <FormField label="Immediate Joiner">
                    <select value={formData.immediate_joiner} onChange={(e) => updateField('immediate_joiner', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </FormField>
                </div>
              </Section>

              <Section title="Application Details" icon={ShieldCheck}>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <FormField label="Application Start Date">
                    <input type="date" value={toDateInput(formData.application_start_date)} onChange={(e) => updateField('application_start_date', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" />
                  </FormField>
                  <FormField label="Application Deadline" required>
                    <input type="date" value={toDateInput(formData.application_deadline)} onChange={(e) => updateField('application_deadline', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" />
                  </FormField>
                  <FormField label="Application Email">
                    <input type="email" value={formData.application_email} onChange={(e) => updateField('application_email', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="jobs@company.com" />
                  </FormField>
                  <FormField label="Application Phone">
                    <input value={formData.application_phone} onChange={(e) => updateField('application_phone', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="+91 98765 43210" />
                  </FormField>
                  <FormField label="Application URL">
                    <input value={formData.application_url} onChange={(e) => updateField('application_url', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="https://apply.company.com" />
                  </FormField>
                  <FormField label="Resume Required">
                    <select value={formData.resume_required} onChange={(e) => updateField('resume_required', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </FormField>
                  <FormField label="Cover Letter Required">
                    <select value={formData.cover_letter_required} onChange={(e) => updateField('cover_letter_required', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </FormField>
                  <FormField label="Required Documents">
                    <TagInput value={formData.required_documents} onChange={(value) => updateField('required_documents', value)} placeholder="Add document" />
                  </FormField>
                  <FormField label="Hiring Contact Person">
                    <input value={formData.hiring_contact_person} onChange={(e) => updateField('hiring_contact_person', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="HR Manager" />
                  </FormField>
                  <div className="md:col-span-2 xl:col-span-3">
                    <FormField label="Application Instructions">
                      <textarea value={formData.application_instructions} onChange={(e) => updateField('application_instructions', e.target.value)} rows={4} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Application instructions for candidates" />
                    </FormField>
                  </div>
                </div>
              </Section>

              <Section title="Screening Questions" icon={Tag}>
                <div className="space-y-4">
                  {(formData.screening_questions || []).map((question, index) => (
                    <div key={question.id || index} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-200">Question {index + 1}</span>
                        {index > 0 && (
                          <button type="button" onClick={() => removeScreeningQuestion(index)} className="text-red-300 hover:text-red-200">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Question">
                          <input value={question.question} onChange={(e) => updateScreeningQuestion(index, 'question', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Why do you want to join?" />
                        </FormField>
                        <FormField label="Question Type">
                          <select value={question.question_type} onChange={(e) => updateScreeningQuestion(index, 'question_type', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                            <option>Text</option>
                            <option>Number</option>
                            <option>Yes-No</option>
                            <option>Dropdown</option>
                          </select>
                        </FormField>
                        <FormField label="Options">
                          <input value={question.options} onChange={(e) => updateScreeningQuestion(index, 'options', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Option 1, Option 2" />
                        </FormField>
                        <FormField label="Required">
                          <select value={question.required} onChange={(e) => updateScreeningQuestion(index, 'required', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </FormField>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addScreeningQuestion} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-orange-500/50 bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-200 hover:bg-orange-500/20">
                    <Plus size={14} /> Add Screening Question
                  </button>
                </div>
              </Section>

              <Section title="Job Status & Visibility" icon={Sparkles}>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <FormField label="Job Status">
                    <select value={formData.job_status} onChange={(e) => updateField('job_status', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Draft</option>
                      <option>Active</option>
                      <option>Paused</option>
                      <option>Closed</option>
                      <option>Expired</option>
                    </select>
                  </FormField>
                  <FormField label="Visibility">
                    <select value={formData.visibility} onChange={(e) => updateField('visibility', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Public</option>
                      <option>Private</option>
                    </select>
                  </FormField>
                  <FormField label="Featured Job">
                    <select value={formData.featured_job} onChange={(e) => updateField('featured_job', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </FormField>
                  <FormField label="Urgent Hiring">
                    <select value={formData.urgent_hiring} onChange={(e) => updateField('urgent_hiring', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </FormField>
                  <FormField label="Allow Applications">
                    <select value={formData.allow_applications} onChange={(e) => updateField('allow_applications', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </FormField>
                  <FormField label="Auto Expire">
                    <select value={formData.auto_expire} onChange={(e) => updateField('auto_expire', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </FormField>
                  <FormField label="Publish Date">
                    <input type="datetime-local" value={formData.publish_date ? formData.publish_date.slice(0, 16) : ''} onChange={(e) => updateField('publish_date', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" />
                  </FormField>
                  <FormField label="Expiry Date">
                    <input type="datetime-local" value={formData.expiry_date ? formData.expiry_date.slice(0, 16) : ''} onChange={(e) => updateField('expiry_date', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" />
                  </FormField>
                </div>
              </Section>

              <Section title="SEO & Social Sharing" icon={ImageIcon}>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <FormField label="URL Slug">
                    <input value={formData.url_slug} onChange={(e) => updateField('url_slug', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="senior-product-designer" />
                  </FormField>
                  <FormField label="Meta Title">
                    <input value={formData.meta_title} onChange={(e) => updateField('meta_title', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Senior Product Designer at Q Techx" />
                  </FormField>
                  <FormField label="Social Share Image">
                    <input value={formData.social_share_image} onChange={(e) => updateField('social_share_image', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="https://.../social.jpg" />
                  </FormField>
                  <FormField label="Social Sharing">
                    <select value={formData.social_sharing} onChange={(e) => updateField('social_sharing', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none">
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                  </FormField>
                  <div className="md:col-span-2 xl:col-span-3">
                    <FormField label="Meta Description">
                      <textarea value={formData.meta_description} onChange={(e) => updateField('meta_description', e.target.value)} rows={3} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" placeholder="Short SEO description" />
                    </FormField>
                  </div>
                  <div className="md:col-span-2 xl:col-span-3">
                    <FormField label="SEO Keywords">
                      <TagInput value={formData.seo_keywords} onChange={(value) => updateField('seo_keywords', value)} placeholder="Add keyword" />
                    </FormField>
                  </div>
                </div>
              </Section>

              <Section title="Recruitment Tracking" icon={ChevronRight}>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {[
                    ['Total Applications', 'total_applications'],
                    ['New Applications', 'new_applications'],
                    ['Shortlisted', 'shortlisted'],
                    ['Interview Scheduled', 'interview_scheduled'],
                    ['Interview Completed', 'interview_completed'],
                    ['Selected', 'selected'],
                    ['Rejected', 'rejected'],
                    ['Hired', 'hired'],
                  ].map(([label, key]) => (
                    <FormField key={key} label={label}>
                      <input type="number" min="0" value={formData[key]} onChange={(e) => updateField(key, e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" />
                    </FormField>
                  ))}
                </div>
              </Section>

              <Section title="System Information" icon={FileText}>
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <FormField label="Created By"><input value={formData.created_by} onChange={(e) => updateField('created_by', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" /></FormField>
                  <FormField label="Updated By"><input value={formData.updated_by} onChange={(e) => updateField('updated_by', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-400 focus:outline-none" /></FormField>
                  <FormField label="Created At"><input type="datetime-local" value={formData.created_at ? formData.created_at.slice(0, 16) : ''} onChange={(e) => updateField('created_at', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" /></FormField>
                  <FormField label="Updated At"><input type="datetime-local" value={formData.updated_at ? formData.updated_at.slice(0, 16) : ''} onChange={(e) => updateField('updated_at', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" /></FormField>
                  <FormField label="Published At"><input type="datetime-local" value={formData.published_at ? formData.published_at.slice(0, 16) : ''} onChange={(e) => updateField('published_at', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" /></FormField>
                  <FormField label="Closed At"><input type="datetime-local" value={formData.closed_at ? formData.closed_at.slice(0, 16) : ''} onChange={(e) => updateField('closed_at', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" /></FormField>
                  <FormField label="View Count"><input type="number" min="0" value={formData.view_count} onChange={(e) => updateField('view_count', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" /></FormField>
                  <FormField label="Application Count"><input type="number" min="0" value={formData.application_count} onChange={(e) => updateField('application_count', e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white focus:border-orange-400 focus:outline-none" /></FormField>
                </div>
              </Section>

              <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-white/10 bg-[#0b1120]/90 px-3 py-4 backdrop-blur md:flex-row md:justify-end">
                <button type="button" onClick={closeDrawer} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10">Cancel</button>
                <button type="button" onClick={() => handleSave('draft')} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-100 hover:border-slate-600">Save as Draft</button>
                <button type="button" onClick={() => handleSave('publish')} className="rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-400">Publish Job</button>
                <button type="button" onClick={() => handleSave('update')} className="rounded-2xl border border-orange-500/40 bg-orange-500/10 px-4 py-2.5 text-sm font-semibold text-orange-200 hover:bg-orange-500/20">{editingId ? 'Update Job' : 'Create Job'}</button>
                <button type="button" onClick={() => setFormData(normalizeJob(blankJob))} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-100 hover:border-slate-600">Reset</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Confirm Delete</p>
            <h3 className="mt-3 text-xl font-semibold text-white">Delete this job?</h3>
            <p className="mt-2 text-sm text-slate-300">This action removes the job post from the portal and cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400">
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobsSettingsPage;
