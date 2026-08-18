import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Download,
  Eye,
  FileText,
  LayoutGrid,
  List,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  User,
  UserCheck,
  X,
  AlertCircle,
  Edit2,
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/* ─── Status pill helper ─── */
const STATUS_OPTIONS = [
  { value: 'Applied',      label: 'Applied',      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     dot: 'bg-blue-400' },
  { value: 'Under Review', label: 'Under Review', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',  dot: 'bg-amber-400' },
  { value: 'Shortlisted',  label: 'Shortlisted',  color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  { value: 'Interview',    label: 'Interview',    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dot: 'bg-purple-400' },
  { value: 'Selected',     label: 'Selected',     color: 'bg-green-500/10 text-green-400 border-green-500/20',  dot: 'bg-green-400' },
  { value: 'Converted',    label: 'Converted',    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',    dot: 'bg-cyan-400' },
  { value: 'Rejected',     label: 'Rejected',     color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',    dot: 'bg-rose-400' },
];

const getStatusOption = (status) =>
  STATUS_OPTIONS.find((s) => s.value === status) || {
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400',
    label: status || 'Applied',
  };

const StatusPill = ({ status }) => {
  const opt = getStatusOption(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${opt.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${opt.dot}`} />
      {opt.label}
    </span>
  );
};

/* ─── Avatar ─── */
const AVATAR_COLOURS = [
  'bg-blue-500/15 text-blue-400 border-blue-500/30',
  'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'bg-amber-500/15 text-amber-400 border-amber-500/30',
  'bg-rose-500/15 text-rose-400 border-rose-500/30',
  'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
];
const Avatar = ({ name, index }) => (
  <div className={`w-9 h-9 rounded-full flex items-center justify-center border font-bold text-sm shrink-0 ${AVATAR_COLOURS[index % AVATAR_COLOURS.length]}`}>
    {name?.charAt(0)?.toUpperCase() || 'A'}
  </div>
);

/* ─── Collapsible Section (modal internal) ─── */
const CollapsibleSection = ({ title, icon, expanded, onToggle, children }) => (
  <div className="border border-white/10 rounded-xl overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.05] transition text-white font-medium text-sm"
    >
      <div className="flex items-center gap-2 text-white/70">
        {icon}
        {title}
      </div>
      <ChevronDown size={16} className={`text-white/40 transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </button>
    {expanded && <div className="p-4 bg-white/[0.02] border-t border-white/10">{children}</div>}
  </div>
);

/* ══════════════════════════════════════════════════════ */
const AdminJobApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [eligibleApplicants, setEligibleApplicants] = useState([]);
  const [selectedApplicantForConversion, setSelectedApplicantForConversion] = useState(null);
  const [convertLoading, setConvertLoading] = useState(false);

  /* ── Fetch all applications ── */
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/job-applications/admin/all', {
        params: {
          job_id: selectedJob !== 'all' ? selectedJob : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        },
      });
      setApplications(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching applications:', error.response?.status, error.response?.data);

      if (error.response?.status === 403) {
        toast.error('You do not have permission to view job applications. Please ensure you are logged in as an admin or recruiter.');
      } else if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Unable to load applications');
      }

      // Try fallback if a specific job is selected
      if (selectedJob !== 'all' && error.response?.status !== 401) {
        try {
          const { data } = await api.get(`/job-applications/job/${selectedJob}/list`);
          setApplications(Array.isArray(data?.data) ? data.data : []);
        } catch (err) {
          console.error('Fallback error:', err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Fetch jobs ── */
  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  useEffect(() => { fetchJobs(); }, []);
  useEffect(() => { fetchApplications(); }, [selectedJob, selectedStatus]);

  /* ── Filter by search ── */
  const filteredApplications = applications.filter((app) => {
    const searchLower = search.toLowerCase();
    return (
      app.full_name?.toLowerCase().includes(searchLower) ||
      app.email?.toLowerCase().includes(searchLower) ||
      app.phone?.includes(search) ||
      app.current_job_title?.toLowerCase().includes(searchLower)
    );
  });

  /* ── Update application status ── */
  const updateStatus = async (applicationId, newStatus) => {
    try {
      setStatusUpdating(applicationId);
      const { data } = await api.put(`/job-applications/${applicationId}/status`, { status: newStatus });
      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus, application_status: newStatus, updated_at: new Date().toISOString() } : app
        )
      );
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus, application_status: newStatus });
      }
      toast.success(`Status updated to "${newStatus}"`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update status');
    } finally {
      setStatusUpdating(null);
    }
  };

  /* ── Delete application ── */
  const deleteApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    try {
      await api.delete(`/job-applications/${applicationId}/delete`);
      setApplications(applications.filter((app) => app.id !== applicationId));
      setShowDetailModal(false);
      setSelectedApplication(null);
      toast.success('Application deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete application');
    }
  };

  /* ── Download file ── */
  const downloadFile = async (applicationId, fileType) => {
    try {
      const response = await api.get(`/job-applications/${applicationId}/download/${fileType}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileType}-${applicationId}`;
      a.click();
    } catch (error) {
      toast.error('Unable to download file');
    }
  };

  /* ── Toggle section expansion ── */
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  /* ── Format date ── */
  const fmtDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  /* ── Fetch eligible applicants for conversion ── */
  const fetchEligibleApplicants = async () => {
    try {
      const { data } = await api.get('/job-applications/admin/eligible-for-conversion');
      setEligibleApplicants(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching eligible applicants:', error);
      toast.error('Failed to load eligible applicants');
    }
  };

  /* ── Convert applicant to employee ── */
  const convertToEmployee = async () => {
    if (!selectedApplicantForConversion) {
      toast.error('Please select an applicant');
      return;
    }

    try {
      setConvertLoading(true);
      const { data } = await api.post('/job-applications/admin/convert-to-employee', {
        application_id: selectedApplicantForConversion.id
      });

      toast.success(data.message || 'Applicant successfully converted to employee');
      
      // Promptly update local state
      const appId = selectedApplicantForConversion.id;
      setApplications(prev => 
        prev.map(app => 
          app.id === appId ? { ...app, status: 'Converted', application_status: 'Converted', updated_at: new Date().toISOString() } : app
        )
      );
      if (selectedApplication?.id === appId) {
        setSelectedApplication(prev => ({ ...prev, status: 'Converted', application_status: 'Converted' }));
      }
      
      // Update the applications list from backend
      await fetchApplications();
      
      // Reset and close modal
      setShowConvertModal(false);
      setSelectedApplicantForConversion(null);
      setEligibleApplicants([]);
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(error.response?.data?.message || 'Failed to convert applicant');
    } finally {
      setConvertLoading(false);
    }
  };

  /* ── Stats ── */
  const totalApps   = applications.length;
  const appliedCnt  = applications.filter(a => (a.status || a.application_status) === 'Applied').length;
  const reviewCnt   = applications.filter(a => (a.status || a.application_status) === 'Under Review').length;
  const selectedCnt = applications.filter(a => (a.status || a.application_status) === 'Selected').length;

  const hasFilters = selectedJob !== 'all' || selectedStatus !== 'all' || !!search;
  const clearFilters = () => { setSearch(''); setSelectedJob('all'); setSelectedStatus('all'); setCurrentPage(1); };

  /* ── Pagination Logic ── */
  const totalApplications = filteredApplications.length;
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(totalApplications / itemsPerPage);
  const startIndex = itemsPerPage === 'all' ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === 'all' ? totalApplications : startIndex + itemsPerPage;
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  /* ─────────────────────────────── DETAIL MODAL ─────────────────────────────── */
  const DetailModal = ({ application, onClose }) => {
    if (!application) return null;
    const statusVal = application.status || application.application_status || 'Applied';

    return createPortal(
      <div
        className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-start justify-end"
        onClick={onClose}
      >
        <div
          className="h-full w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-[#12141c] shadow-2xl shadow-black/40 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#12141c]/90 backdrop-blur-md px-6 py-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border font-bold text-sm ${AVATAR_COLOURS[0]}`}>
                {application.full_name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">{application.full_name}</h2>
                <p className="text-xs text-white/40">{application.current_job_title || 'No job title'}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Status & Actions */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center gap-4 flex-wrap">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-2">Current Status</p>
                <select
                  value={statusVal}
                  onChange={(e) => updateStatus(application.id, e.target.value)}
                  disabled={statusUpdating === application.id}
                  className="px-3 py-2 rounded-xl border border-white/10 bg-[#0a0b10] text-white text-sm focus:outline-none focus:border-primary/50 transition"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => deleteApplication(application.id)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-sm font-semibold transition ml-auto"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>

            {/* Contact Info */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-3">Contact Information</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <Mail size={14} className="text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-white/30">Email</p>
                    <p className="text-white truncate">{application.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <Phone size={14} className="text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/30">Phone</p>
                    <p className="text-white">{application.phone}</p>
                  </div>
                </div>
                {application.alternate_phone && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Phone size={14} className="text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/30">Alternate</p>
                      <p className="text-white">{application.alternate_phone}</p>
                    </div>
                  </div>
                )}
                {application.current_location && (
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin size={14} className="text-primary shrink-0" />
                    <div>
                      <p className="text-[10px] text-white/30">Location</p>
                      <p className="text-white">{application.current_location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Info */}
            <CollapsibleSection
              title="Professional Information"
              icon={<Briefcase size={16} />}
              expanded={expandedSections.professional}
              onToggle={() => toggleSection('professional')}
            >
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Current Job Title', application.current_job_title],
                  ['Current Company', application.current_company],
                  ['Total Experience', application.total_experience ? `${application.total_experience} years` : '—'],
                  ['Relevant Experience', application.relevant_experience ? `${application.relevant_experience} years` : '—'],
                  ['Employment Status', application.employment_status],
                  ['Notice Period', application.notice_period],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-[10px] text-white/30">{label}</p>
                    <p className="text-white font-medium">{val || '—'}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Education */}
            {application.education_details && Array.isArray(application.education_details) && application.education_details.length > 0 && (
              <CollapsibleSection
                title={`Education (${application.education_details.length})`}
                icon={<FileText size={16} />}
                expanded={expandedSections.education}
                onToggle={() => toggleSection('education')}
              >
                <div className="space-y-3">
                  {application.education_details.map((edu, i) => (
                    <div key={i} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                      <p className="font-semibold text-white text-sm">{edu.degree} in {edu.specialization}</p>
                      <p className="text-xs text-white/40 mt-0.5">{edu.college}</p>
                      <div className="flex justify-between mt-2 text-xs text-white/30">
                        <span>{edu.year}</span>
                        <span>CGPA: {edu.cgpa || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Skills */}
            {application.skills_details && Array.isArray(application.skills_details) && application.skills_details.length > 0 && (
              <CollapsibleSection
                title={`Skills (${application.skills_details.length})`}
                icon={<Check size={16} />}
                expanded={expandedSections.skills}
                onToggle={() => toggleSection('skills')}
              >
                <div className="flex flex-wrap gap-2">
                  {application.skills_details.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Documents */}
            {(application.resume || application.cover_letter || application.portfolio_file || application.certificates) && (
              <CollapsibleSection
                title="Uploaded Documents"
                icon={<Download size={16} />}
                expanded={expandedSections.documents}
                onToggle={() => toggleSection('documents')}
              >
                <div className="space-y-2">
                  {application.resume && (
                    <button onClick={() => downloadFile(application.id, 'resume')} className="w-full flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-blue-400 border border-white/5 transition text-sm">
                      <Download size={14} /> Resume
                    </button>
                  )}
                  {application.cover_letter && (
                    <button onClick={() => downloadFile(application.id, 'cover_letter')} className="w-full flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-blue-400 border border-white/5 transition text-sm">
                      <Download size={14} /> Cover Letter
                    </button>
                  )}
                  {application.portfolio_file && (
                    <button onClick={() => downloadFile(application.id, 'portfolio')} className="w-full flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-blue-400 border border-white/5 transition text-sm">
                      <Download size={14} /> Portfolio
                    </button>
                  )}
                  {application.certificates && (
                    <button onClick={() => downloadFile(application.id, 'certificates')} className="w-full flex items-center gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-blue-400 border border-white/5 transition text-sm">
                      <Download size={14} /> Certificates
                    </button>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Additional Info */}
            {(application.why_suitable || application.additional_information) && (
              <CollapsibleSection
                title="Additional Information"
                icon={<AlertCircle size={16} />}
                expanded={expandedSections.additional}
                onToggle={() => toggleSection('additional')}
              >
                <div className="space-y-3">
                  {application.why_suitable && (
                    <div>
                      <p className="text-[10px] text-white/30 mb-1">Why Are You Suitable?</p>
                      <p className="text-white/80 text-sm leading-relaxed">{application.why_suitable}</p>
                    </div>
                  )}
                  {application.additional_information && (
                    <div>
                      <p className="text-[10px] text-white/30 mb-1">Additional Information</p>
                      <p className="text-white/80 text-sm leading-relaxed">{application.additional_information}</p>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Timeline */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-3">Timeline</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/40">Applied:</span>
                  <span className="text-white">{fmtDate(application.applied_at)}</span>
                </div>
                {application.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-white/40">Last Updated:</span>
                    <span className="text-white">{fmtDate(application.updated_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  /* ─────────────────────────────── CONVERT MODAL ─────────────────────────────── */
  const ConvertModal = () => {
    if (!showConvertModal) return null;

    const searchTerm = (selectedApplicantForConversion?.full_name || '').toLowerCase();

    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1120]/95 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-xl font-bold text-white">Convert Job Applicant to Employee</h2>
            <button
              onClick={() => {
                setShowConvertModal(false);
                setSelectedApplicantForConversion(null);
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Applicant Selection */}
            <div>
              <label className="block mb-2.5">
                <span className="text-sm font-medium text-white mb-2 flex items-center gap-1">
                  Select Eligible Applicant
                  <span className="text-red-400">*</span>
                </span>
              </label>
              
              <div className="relative">
                <select
                  value={selectedApplicantForConversion?.id || ''}
                  onChange={(e) => {
                    const applicant = eligibleApplicants.find(a => a.id === e.target.value);
                    setSelectedApplicantForConversion(applicant || null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0a0b10] text-white text-sm focus:outline-none focus:border-primary/50 transition"
                >
                  <option value="">-- Select an applicant --</option>
                  {eligibleApplicants.map((applicant) => (
                    <option key={applicant.id} value={applicant.id}>
                      {applicant.label}
                    </option>
                  ))}
                </select>
                {eligibleApplicants.length === 0 && !convertLoading && (
                  <p className="text-xs text-white/40 mt-2">No eligible applicants available (only 'Selected' status applicants can be converted)</p>
                )}
              </div>
            </div>

            {/* Applicant Details Preview */}
            {selectedApplicantForConversion && (
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Applicant Details</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-white/40">Full Name</p>
                    <p className="text-white font-medium">{selectedApplicantForConversion.full_name}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Email</p>
                    <p className="text-white font-medium break-all">{selectedApplicantForConversion.email}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Phone</p>
                    <p className="text-white font-medium">{selectedApplicantForConversion.phone}</p>
                  </div>
                  <div>
                    <p className="text-white/40">Applied Position</p>
                    <p className="text-white font-medium">{selectedApplicantForConversion.job_title || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/40">Status</p>
                    <p className="text-emerald-400 font-medium">{selectedApplicantForConversion.status}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5 text-xs text-blue-200">
              <p className="font-medium mb-1">ℹ️ Conversion Details</p>
              <ul className="list-disc list-inside space-y-1 text-blue-200/80">
                <li>A user account will be created with the applicant's email</li>
                <li>Employee record will be created in the system</li>
                <li>Application status will be updated to "Converted"</li>
                <li>Employee can log in using the reset password flow</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-6 py-4 bg-white/[0.02] flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowConvertModal(false);
                setSelectedApplicantForConversion(null);
              }}
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition"
              disabled={convertLoading}
            >
              Cancel
            </button>
            <button
              onClick={convertToEmployee}
              disabled={!selectedApplicantForConversion || convertLoading}
              className="px-5 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {convertLoading && <Loader2 size={14} className="animate-spin" />}
              {convertLoading ? 'Converting...' : 'Convert to Employee'}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  /* ═══════════════════════════════════ RENDER ═══════════════════════════════════ */
  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Briefcase size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Job Applications</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? 'Loading…' : `${filteredApplications.length} application${filteredApplications.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowConvertModal(true);
              fetchEligibleApplicants();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-lg shadow-emerald-500/25 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            title="Convert applicant to employee"
          >
            <UserCheck size={15} /> Convert Employee
          </button>
          <button
            onClick={fetchApplications}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-primary' : ''} />
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',       value: totalApps,   icon: Briefcase,    bg: 'bg-blue-500/15',    cls: 'text-blue-400' },
          { label: 'Applied',     value: appliedCnt,  icon: User,         bg: 'bg-amber-500/15',   cls: 'text-amber-400' },
          { label: 'In Review',   value: reviewCnt,   icon: Eye,          bg: 'bg-purple-500/15',  cls: 'text-purple-400' },
          { label: 'Selected',    value: selectedCnt, icon: Check,        bg: 'bg-emerald-500/15', cls: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, bg, cls }) => (
          <div key={label} className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.06] transition">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
              <Icon size={18} className={cls} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-white/50 text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
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
              {[selectedJob !== 'all', selectedStatus !== 'all', !!search].filter(Boolean).length}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Filter by Job</p>
              <select
                value={selectedJob}
                onChange={(e) => { setSelectedJob(e.target.value); setCurrentPage(1); }}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0a0b10] text-white text-sm focus:outline-none focus:border-primary/50 transition"
              >
                <option value="all">All</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>{job.job_title}</option>
                ))}
              </select>
            </div>
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Application Status</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${selectedStatus === 'all' ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}
                >
                  All
                </button>
                {STATUS_OPTIONS.map(s => (
                  <button
                    key={s.value}
                    onClick={() => { setSelectedStatus(s.value); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${selectedStatus === s.value ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-primary/70" />
            <p className="text-sm text-white/40">Loading applications…</p>
          </div>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && filteredApplications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Briefcase size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No applications found</p>
          <p className="text-xs mt-1">
            {hasFilters ? 'Try adjusting your filters.' : 'There are no job applications yet.'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-xs text-primary hover:underline">Clear filters</button>
          )}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {!loading && filteredApplications.length > 0 && viewMode === 'table' && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-center text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5 w-12">S No</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Applicant</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Contact</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Experience</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Status</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Applied</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedApplications.map((app, i) => (
                  <tr key={app.id} className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer" onClick={() => { setSelectedApplication(app); setShowDetailModal(true); }}>
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-white/60 text-xs font-medium">{startIndex + i + 1}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={app.full_name} index={i} />
                        <div>
                          <p className="text-white font-semibold text-sm leading-tight">{app.full_name || 'Unknown'}</p>
                          <p className="text-white/35 text-xs mt-0.5 truncate max-w-[160px]">{app.current_job_title || 'No title'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-white/60 text-xs">{app.email}</p>
                      <p className="text-white/35 text-[11px]">{app.phone}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-white/60 text-xs">{app.current_company || '—'}</p>
                      {app.total_experience && <p className="text-white/35 text-[11px]">{app.total_experience} yrs</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={app.status || app.application_status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-white/35 text-xs">{fmtDate(app.applied_at)}</span>
                    </td>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => { setSelectedApplication(app); setShowDetailModal(true); }}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition"
                          title="View"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => deleteApplication(app.id)}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Controls ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/8 bg-white/[0.02] px-6 py-4">
            <div className="flex items-center gap-3">
              <p className="text-xs text-white/50">Items per page:</p>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#0a0b10] text-white text-xs focus:outline-none focus:border-primary/50 transition"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All</option>
              </select>
              <p className="text-xs text-white/50 ml-2">
                {itemsPerPage === 'all' ? `Showing all ${totalApplications} records` : `Showing ${startIndex + 1}-${Math.min(endIndex, totalApplications)} of ${totalApplications}`}
              </p>
            </div>

            {itemsPerPage !== 'all' && totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/70 text-xs font-semibold hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  ← Prev
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/70 text-xs font-semibold hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CARD VIEW ── */}
      {!loading && filteredApplications.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filteredApplications.map((app, i) => (
            <div
              key={app.id}
              onClick={() => { setSelectedApplication(app); setShowDetailModal(true); }}
              className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={app.full_name} index={i} />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{app.full_name || 'Unknown'}</p>
                    <p className="text-white/40 text-xs truncate">{app.current_job_title || 'No title'}</p>
                  </div>
                </div>
                <StatusPill status={app.status || app.application_status} />
              </div>

              {/* Info */}
              <div className="space-y-2 text-xs text-white/50">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-blue-400 shrink-0" />
                  <span className="truncate">{app.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-emerald-400 shrink-0" />
                  <span>{app.phone}</span>
                </div>
                {app.current_company && (
                  <div className="flex items-center gap-2">
                    <Briefcase size={12} className="text-primary shrink-0" />
                    <span className="truncate">{app.current_company}</span>
                  </div>
                )}
                {app.total_experience && (
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-purple-400 shrink-0" />
                    <span>{app.total_experience} years experience</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
                <p className="text-[10px] font-semibold text-white/30 tracking-wider">{fmtDate(app.applied_at)}</p>
                <Eye size={14} className="text-white/25" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Detail Modal/Drawer ── */}
      {showDetailModal && (
        <DetailModal application={selectedApplication} onClose={() => setShowDetailModal(false)} />
      )}

      {/* ── Convert Modal ── */}
      <ConvertModal />
    </div>
  );
};

export default AdminJobApplicationsPage;
