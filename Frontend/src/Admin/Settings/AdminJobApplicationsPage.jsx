import React, { useEffect, useState } from 'react';
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
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Trash2,
  User,
  X,
  AlertCircle,
} from 'lucide-react';
import api from '../../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminJobApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('card');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const STATUS_OPTIONS = [
    { value: 'Applied', label: 'Applied', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    { value: 'Under Review', label: 'Under Review', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    { value: 'Shortlisted', label: 'Shortlisted', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { value: 'Interview', label: 'Interview', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    { value: 'Selected', label: 'Selected', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
    { value: 'Rejected', label: 'Rejected', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  ];

  // Fetch all applications
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

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const { data } = await api.get('/jobs');
      setJobs(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [selectedJob, selectedStatus]);

  // Filter applications based on search
  const filteredApplications = applications.filter((app) => {
    const searchLower = search.toLowerCase();
    return (
      app.full_name?.toLowerCase().includes(searchLower) ||
      app.email?.toLowerCase().includes(searchLower) ||
      app.phone?.includes(search) ||
      app.current_job_title?.toLowerCase().includes(searchLower)
    );
  });

  // Get status color
  const getStatusColor = (status) => {
    return STATUS_OPTIONS.find((s) => s.value === status)?.color || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  // Update application status
  const updateStatus = async (applicationId, newStatus) => {
    try {
      setStatusUpdating(applicationId);
      const { data } = await api.put(`/job-applications/${applicationId}/status`, { status: newStatus });
      // Update local state
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

  // Delete application
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

  // Download file
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

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Format date
  const fmtDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Detail Modal
  const DetailModal = ({ application, onClose }) => {
    if (!application) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div
          className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full my-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-white">{application.full_name}</h2>
              <p className="text-sm text-slate-400 mt-1">{application.current_job_title || 'No job title'}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="p-6 space-y-6">
              {/* Status & Actions */}
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-slate-400 mb-2">Current Status</p>
                  <select
                    value={application.status || application.application_status || 'Applied'}
                    onChange={(e) => updateStatus(application.id, e.target.value)}
                    disabled={statusUpdating === application.id}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition cursor-pointer ${getStatusColor(
                      application.status || application.application_status
                    )}`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => deleteApplication(application.id)}
                  className="px-4 py-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-sm font-medium transition flex items-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>

              {/* Contact Info */}
              <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-white mb-3">Contact Information</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail size={14} className="text-blue-400" />
                    <div>
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="text-white truncate">{application.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone size={14} className="text-green-400" />
                    <div>
                      <p className="text-xs text-slate-400">Phone</p>
                      <p className="text-white">{application.phone}</p>
                    </div>
                  </div>
                  {application.alternate_phone && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone size={14} className="text-green-400" />
                      <div>
                        <p className="text-xs text-slate-400">Alternate</p>
                        <p className="text-white">{application.alternate_phone}</p>
                      </div>
                    </div>
                  )}
                  {application.current_location && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin size={14} className="text-orange-400" />
                      <div>
                        <p className="text-xs text-slate-400">Location</p>
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
                  <div>
                    <p className="text-xs text-slate-400">Current Job Title</p>
                    <p className="text-white font-medium">{application.current_job_title || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Current Company</p>
                    <p className="text-white font-medium">{application.current_company || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Experience</p>
                    <p className="text-white font-medium">{application.total_experience || '—'} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Relevant Experience</p>
                    <p className="text-white font-medium">{application.relevant_experience || '—'} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Employment Status</p>
                    <p className="text-white font-medium">{application.employment_status || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Notice Period</p>
                    <p className="text-white font-medium">{application.notice_period || '—'}</p>
                  </div>
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
                      <div key={i} className="bg-slate-800/30 rounded-lg p-3">
                        <p className="font-medium text-white text-sm">
                          {edu.degree} in {edu.specialization}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{edu.college}</p>
                        <div className="flex justify-between mt-2 text-xs text-slate-400">
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
                      <button
                        onClick={() => downloadFile(application.id, 'resume')}
                        className="w-full flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 text-blue-300 transition text-sm"
                      >
                        <Download size={14} /> Resume
                      </button>
                    )}
                    {application.cover_letter && (
                      <button
                        onClick={() => downloadFile(application.id, 'cover_letter')}
                        className="w-full flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 text-blue-300 transition text-sm"
                      >
                        <Download size={14} /> Cover Letter
                      </button>
                    )}
                    {application.portfolio_file && (
                      <button
                        onClick={() => downloadFile(application.id, 'portfolio')}
                        className="w-full flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 text-blue-300 transition text-sm"
                      >
                        <Download size={14} /> Portfolio
                      </button>
                    )}
                    {application.certificates && (
                      <button
                        onClick={() => downloadFile(application.id, 'certificates')}
                        className="w-full flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 text-blue-300 transition text-sm"
                      >
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
                        <p className="text-xs text-slate-400 mb-1">Why Are You Suitable?</p>
                        <p className="text-white text-sm leading-relaxed">{application.why_suitable}</p>
                      </div>
                    )}
                    {application.additional_information && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Additional Information</p>
                        <p className="text-white text-sm leading-relaxed">{application.additional_information}</p>
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              )}

              {/* Timeline */}
              <div className="bg-slate-800/50 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-3">Timeline</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Applied:</span>
                    <span className="text-white">{fmtDate(application.applied_at)}</span>
                  </div>
                  {application.updated_at && (
                    <div className="flex justify-between text-slate-400">
                      <span>Last Updated:</span>
                      <span className="text-white">{fmtDate(application.updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-8 text-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/settings')}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            title="Back to Settings"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Job Applications</h1>
            <p className="text-sm text-white/50 mt-1">Manage all submitted job applications</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-white/8 bg-white/[0.03] text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          {/* Job Filter */}
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-white/8 bg-white/[0.03] text-white focus:outline-none focus:border-orange-500/50 appearance-none"
          >
            <option value="all">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.job_title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-white/8 bg-white/[0.03] text-white focus:outline-none focus:border-orange-500/50 appearance-none"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>Showing {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-orange-500/70" />
            <p className="text-sm text-white/40">Loading applications…</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredApplications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Briefcase size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No applications found</p>
          <p className="text-xs mt-1">There are no job applications matching your filters yet.</p>
        </div>
      )}

      {/* Card View */}
      {!loading && filteredApplications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              onClick={() => {
                setSelectedApplication(app);
                setShowDetailModal(true);
              }}
              className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 cursor-pointer hover:bg-white/[0.05] hover:border-white/12 hover:shadow-lg transition-all duration-200 flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {app.full_name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{app.full_name || 'Unknown'}</p>
                    <p className="text-white/40 text-xs truncate">{app.current_job_title || 'No title'}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block shrink-0 ${getStatusColor(app.status || app.application_status)}`}>
                  {app.status || app.application_status || 'Applied'}
                </span>
              </div>

              {/* Info */}
              <div className="space-y-2 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-blue-400" />
                  <span className="truncate">{app.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-green-400" />
                  <span>{app.phone}</span>
                </div>
                {app.current_company && (
                  <div className="flex items-center gap-2">
                    <Briefcase size={12} className="text-orange-400" />
                    <span className="truncate">{app.current_company}</span>
                  </div>
                )}
                {app.total_experience && (
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-purple-400" />
                    <span>{app.total_experience} years experience</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] text-xs text-white/40">
                <span>{fmtDate(app.applied_at)}</span>
                <Eye size={14} className="text-white/30" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && (
        <div onClick={() => setShowDetailModal(false)} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <DetailModal application={selectedApplication} onClose={() => setShowDetailModal(false)} />
        </div>
      )}
    </div>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({ title, icon, expanded, onToggle, children }) => {
  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-slate-800/30 hover:bg-slate-800/50 transition text-white font-medium text-sm"
      >
        <div className="flex items-center gap-2">
          {icon}
          {title}
        </div>
        <ChevronDown size={16} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && <div className="p-4 bg-slate-800/10 border-t border-slate-700">{children}</div>}
    </div>
  );
};

export default AdminJobApplicationsPage;
