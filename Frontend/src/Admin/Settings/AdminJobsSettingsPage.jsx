import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight, ChevronDown, CircleDollarSign, Clock3, FileText, Globe2, ImageIcon, LayoutGrid, List, Loader2, MapPin, Pencil, Plus, RefreshCw, Search, ShieldCheck, Sparkles, SlidersHorizontal, Tag, Trash2, X, Eye, Edit2, AlertCircle, UserCheck, UserX } from 'lucide-react';
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

const Section = ({ title, icon: Icon, children, collapsible = false, isOpen = true, onToggle }) => (
  <section className="rounded-3xl border border-white/10 bg-[#111827]/80 p-5 shadow-lg shadow-black/10">
    <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
          <Icon size={16} />
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      {collapsible && (
        <button
          type="button"
          onClick={onToggle}
          className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-200 hover:bg-white/10"
        >
          {isOpen ? 'Hide' : 'Show'}
        </button>
      )}
    </div>
    {(!collapsible || isOpen) && <div className="space-y-5">{children}</div>}
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

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const JobAvatar = ({ name, index }) => {
  const COLOURS = [
    'bg-blue-500/15 text-blue-400 border-blue-500/30',
    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'bg-purple-500/15 text-purple-400 border-purple-500/30',
    'bg-amber-500/15 text-amber-400 border-amber-500/30',
    'bg-rose-500/15 text-rose-400 border-rose-500/30',
    'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  ];
  const colour = COLOURS[index % COLOURS.length];
  const initial = name ? name.charAt(0).toUpperCase() : 'J';
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center border font-bold text-sm shrink-0 ${colour}`}>
      {initial}
    </div>
  );
};

const JobStatusPill = ({ status }) => {
  const s = (status || 'Draft');
  if (s === 'Active') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active</span>;
  if (s === 'Paused') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Paused</span>;
  if (s === 'Closed') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Closed</span>;
  if (s === 'Expired') return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20"><span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400" /> Expired</span>;
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Draft</span>;
};

const AdminJobsSettingsPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState('');
  const [showSeoSettings, setShowSeoSettings] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
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
    setCompanyLogoFile(null);
    setCompanyLogoPreview('');
    setFormData(normalizeJob(blankJob));
  };

  const handleCompanyLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCompanyLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setCompanyLogoPreview(reader.result);
    reader.readAsDataURL(file);
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

      const formToSubmit = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (Array.isArray(value) || typeof value === 'object') {
          formToSubmit.append(key, JSON.stringify(value));
          return;
        }
        formToSubmit.append(key, String(value));
      });

      if (companyLogoFile) {
        formToSubmit.append('company_logo', companyLogoFile);
      } else if (formData.company_logo) {
        formToSubmit.append('company_logo', formData.company_logo);
      }

      if (editingId) {
        await api.put(`/jobs/${editingId}`, formToSubmit);
        toast.success('Job updated successfully');
      } else {
        await api.post('/jobs', formToSubmit);
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
      setDeleting(true);
      await api.delete(`/jobs/${deleteId}`);
      toast.success('Job deleted successfully');
      setDeleteId(null);
      await fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete job');
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = statusFilter !== 'All' || !!search;
  const clearFilters = () => { setSearch(''); setStatusFilter('All'); };

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(j => j.job_status === 'Active').length;
  const draftJobs = jobs.filter(j => j.job_status === 'Draft').length;
  const closedJobs = jobs.filter(j => ['Closed', 'Expired', 'Paused'].includes(j.job_status)).length;

  const jobStats = [
    { label: 'Total Jobs',  value: totalJobs,  icon: BriefcaseBusiness, cls: 'text-blue-400',    bg: 'bg-blue-500/15' },
    { label: 'Active',      value: activeJobs, icon: UserCheck,          cls: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { label: 'Draft',       value: draftJobs,  icon: FileText,           cls: 'text-amber-400',   bg: 'bg-amber-500/15' },
    { label: 'Closed',      value: closedJobs, icon: UserX,              cls: 'text-rose-400',    bg: 'bg-rose-500/15' },
  ];

  return (
    <div className="min-h-screen space-y-5 pb-10 text-white">

      {/* ── Delete Confirm Modal ── */}
      {deleteId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#12141c] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Job?</h3>
            <p className="text-sm text-white/50 mb-6">This will permanently remove the job posting. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:bg-white/10 transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 transition flex items-center justify-center gap-2">
                {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <BriefcaseBusiness size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">All Jobs</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? 'Loading…' : `${totalJobs} job${totalJobs !== 1 ? 's' : ''} total`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchJobs} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition" title="Refresh">
            <RefreshCw size={15} className={loading ? 'animate-spin text-primary' : ''} />
          </button>
          <button
            onClick={openNewJob}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-primary/25 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            <Plus size={15} /> Add New Job
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {jobStats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.06] transition">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={18} className={s.cls} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-white/50 text-xs">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search jobs, company, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
            showFilters || hasFilters ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasFilters && (
            <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
              {[statusFilter !== 'All' ? 1 : 0, search ? 1 : 0].reduce((a, b) => a + b, 0)}
            </span>
          )}
          <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button onClick={() => setViewMode('table')} className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${viewMode === 'table' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`} title="Table View">
            <List size={15} />
          </button>
          <button onClick={() => setViewMode('card')} className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${viewMode === 'card' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`} title="Card View">
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Filter By</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 transition">
                <X size={10} /> Clear all
              </button>
            )}
          </div>
          <div>
            <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Job Status</p>
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Active', 'Draft', 'Paused', 'Closed', 'Expired'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                    statusFilter === s ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-primary/70" />
            <p className="text-sm text-white/40">Loading jobs…</p>
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <BriefcaseBusiness size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No jobs found</p>
          <p className="text-xs mt-1">{hasFilters ? 'Try adjusting your filters.' : 'Add your first job posting to get started.'}</p>
          {!hasFilters && (
            <button onClick={openNewJob} className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
              <Plus size={14} /> Add First Job
            </button>
          )}
        </div>
      )}

      {/* ── TABLE MODE ── */}
      {!loading && filteredJobs.length > 0 && viewMode === 'table' && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Job</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Location</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Type</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Status</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Deadline</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job, i) => (
                  <tr key={job.id} className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <JobAvatar name={job.company_name || job.job_title} index={i} />
                        <div>
                          <p className="text-white font-semibold text-sm leading-tight">{job.job_title || 'Untitled Job'}</p>
                          <p className="text-white/35 text-xs mt-0.5 max-w-[180px] truncate">{job.company_name} {job.department ? `• ${job.department}` : ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-white/50 text-xs">{[job.city, job.state, job.country].filter(Boolean).join(', ') || 'Remote'}</p>
                      <p className="text-white/30 text-[10px]">{job.work_mode || 'On-site'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-white/60 text-xs">{job.employment_type || 'Full-time'}</p>
                      <p className="text-white/30 text-[10px]">{job.vacancies || 1} vacanc{job.vacancies === 1 ? 'y' : 'ies'}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <JobStatusPill status={job.job_status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-white/35 text-xs">{fmtDate(job.application_deadline)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEditJob(job)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition" title="View">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => openEditJob(job)} className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/25 text-primary border border-transparent hover:border-primary/30 flex items-center justify-center transition" title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteId(job.id)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CARD MODE ── */}
      {!loading && filteredJobs.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filteredJobs.map((job, i) => (
            <div key={job.id} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <JobAvatar name={job.company_name || job.job_title} index={i} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{job.job_title || 'Untitled Job'}</p>
                    <p className="text-white/40 text-xs truncate">{job.company_name || 'Unknown Company'}</p>
                  </div>
                </div>
                <JobStatusPill status={job.job_status} />
              </div>
              <div className="space-y-1 text-xs text-white/50">
                <p>{[job.city, job.state].filter(Boolean).join(', ') || 'Remote'} • {job.work_mode || 'On-site'}</p>
                <p>{job.employment_type || 'Full-time'} • {job.job_category || 'General'}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                <p className="text-[10px] font-semibold text-white/30 tracking-wider">DUE {fmtDate(job.application_deadline)}</p>
                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openEditJob(job); }} className="p-1.5 text-white/40 hover:text-primary transition"><Edit2 size={13} /></button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(job.id); }} className="p-1.5 text-white/40 hover:text-rose-400 transition"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {createPortal(
        <div className={`fixed inset-0 z-[9999] flex justify-end bg-black/60 backdrop-blur-sm transition-all duration-300 ${isDrawerOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}>
          <div className={`h-full w-full overflow-y-auto border-l border-white/10 bg-[#0b1120] shadow-2xl shadow-black/40 md:max-w-5xl transition-transform duration-300 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
                    <div className="space-y-3">
                      <input type="file" accept="image/*" onChange={handleCompanyLogoChange} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white file:mr-3 file:rounded-xl file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white" />
                      {(companyLogoPreview || formData.company_logo) && (
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950/80 p-2">
                          <img src={companyLogoPreview || formData.company_logo} alt="Company logo preview" className="h-14 w-14 rounded-xl object-cover" />
                          <span className="text-xs text-slate-300">{companyLogoFile ? companyLogoFile.name : 'Current logo'}</span>
                        </div>
                      )}
                    </div>
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

              <Section
                title="SEO & Social Sharing"
                icon={ImageIcon}
                collapsible
                isOpen={showSeoSettings}
                onToggle={() => setShowSeoSettings((prev) => !prev)}
              >
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

              <Section
                title="Recruitment Tracking"
                icon={ChevronRight}
                collapsible
                isOpen={showTracking}
                onToggle={() => setShowTracking((prev) => !prev)}
              >
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

              <Section
                title="System Information"
                icon={FileText}
                collapsible
                isOpen={showSystemInfo}
                onToggle={() => setShowSystemInfo((prev) => !prev)}
              >
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
        </div>,
        document.body
      )}

    </div>
  );
};

export default AdminJobsSettingsPage;
