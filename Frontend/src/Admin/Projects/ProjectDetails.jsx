import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarDays, CheckCircle, FileText, Loader2, User, DollarSign, TrendingUp, FolderKanban, Users, Code2, Paperclip, LayoutDashboard, ListTodo } from 'lucide-react';
import api from '../../api';
import ProjectTasks from './ProjectTasks';

const formatCurrency = (value) => {
  if (!value && value !== 0) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const InfoCard = ({ title, value, icon: Icon }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
    <div className="flex items-center gap-2 text-white/50 text-xs uppercase tracking-wider mb-2">
      <Icon size={14} /> {title}
    </div>
    <div className="text-white font-semibold text-sm leading-6">{value || '—'}</div>
  </div>
);

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/projects/${id}`);
        if (!data.success) throw new Error(data.message || 'Project not found');
        setProject(data.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={30} className="animate-spin text-orange-500/70" />
          <p className="text-sm text-white/40">Loading project details…</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/admin/projects')} className="inline-flex items-center gap-2 text-white/70 hover:text-white">
          <ArrowLeft size={16} /> Back to projects
        </button>
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-5 text-sm text-rose-400">
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 text-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/projects')} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-400">
              <FolderKanban size={11} /> Project Details
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{project.project_name || 'Project'}</h1>
            <p className="text-sm text-white/40 mt-0.5">{project.short_name || project.project_code || 'Project overview'}</p>
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/70">
          {project.current_status || 'Planning'}
        </div>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-white/10 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 pb-3 text-sm font-medium transition border-b-2 ${
            activeTab === 'overview'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-white/50 hover:text-white/80'
          }`}
        >
          <LayoutDashboard size={16} /> Overview
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 pb-3 text-sm font-medium transition border-b-2 ${
            activeTab === 'tasks'
              ? 'border-orange-500 text-orange-400'
              : 'border-transparent text-white/50 hover:text-white/80'
          }`}
        >
          <ListTodo size={16} /> Tasks
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-orange-400" />
            <h2 className="text-base font-semibold">Project Summary</h2>
          </div>
          <p className="text-sm leading-7 text-white/70">{project.description || 'No description provided.'}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoCard title="Project Code" value={project.project_code} icon={FileText} />
            <InfoCard title="Category" value={project.project_category} icon={FolderKanban} />
            <InfoCard title="Industry" value={project.industry} icon={Building2} />
            <InfoCard title="Client" value={project.client_name} icon={Users} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-emerald-400" />
            <h2 className="text-base font-semibold">Progress</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm text-white/60 mb-1">
                <span>Overall</span>
                <span>{project.overall_progress || 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-orange-500" style={{ width: `${project.overall_progress || 0}%` }} />
              </div>
            </div>
            <InfoCard title="Cost" value={formatCurrency(project.total_project_cost)} icon={DollarSign} />
            <InfoCard title="Start Date" value={fmtDate(project.project_start_date)} icon={CalendarDays} />
            <InfoCard title="Estimated Completion" value={fmtDate(project.estimated_completion_date)} icon={CalendarDays} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-blue-400" />
            <h2 className="text-base font-semibold">Client & Team</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard title="Contact Person" value={project.contact_person} icon={User} />
            <InfoCard title="Email" value={project.email} icon={FileText} />
            <InfoCard title="Phone" value={project.phone_number} icon={FileText} />
            <InfoCard title="Project Manager" value={project.project_manager} icon={Users} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={16} className="text-violet-400" />
            <h2 className="text-base font-semibold">Tech & Documents</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard title="Frontend Tech" value={project.frontend_tech} icon={Code2} />
            <InfoCard title="Backend Tech" value={project.backend_tech} icon={Code2} />
            <InfoCard title="Database" value={project.database_tech} icon={Code2} />
            <InfoCard title="Agreement Uploaded" value={project.agreement_uploaded} icon={Paperclip} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={16} className="text-emerald-400" />
          <h2 className="text-base font-semibold">Objectives & Requirements</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Objective</p>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={16} className="text-orange-400" />
                <h2 className="text-base font-semibold">Project Summary</h2>
              </div>
              <p className="text-sm leading-7 text-white/70">{project.description || 'No description provided.'}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <InfoCard title="Project Code" value={project.project_code} icon={FileText} />
                <InfoCard title="Category" value={project.project_category} icon={FolderKanban} />
                <InfoCard title="Industry" value={project.industry} icon={Building2} />
                <InfoCard title="Client" value={project.client_name} icon={Users} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-emerald-400" />
                <h2 className="text-base font-semibold">Progress</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm text-white/60 mb-1">
                    <span>Overall</span>
                    <span>{project.overall_progress || 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full bg-orange-500" style={{ width: `${project.overall_progress || 0}%` }} />
                  </div>
                </div>
                <InfoCard title="Cost" value={formatCurrency(project.total_project_cost)} icon={DollarSign} />
                <InfoCard title="Start Date" value={fmtDate(project.project_start_date)} icon={CalendarDays} />
                <InfoCard title="Estimated Completion" value={fmtDate(project.estimated_completion_date)} icon={CalendarDays} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 mb-4">
                <User size={16} className="text-blue-400" />
                <h2 className="text-base font-semibold">Client & Team</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard title="Contact Person" value={project.contact_person} icon={User} />
                <InfoCard title="Email" value={project.email} icon={FileText} />
                <InfoCard title="Phone" value={project.phone_number} icon={FileText} />
                <InfoCard title="Project Manager" value={project.project_manager} icon={Users} />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 mb-4">
                <Code2 size={16} className="text-violet-400" />
                <h2 className="text-base font-semibold">Tech & Documents</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard title="Frontend Tech" value={project.frontend_tech} icon={Code2} />
                <InfoCard title="Backend Tech" value={project.backend_tech} icon={Code2} />
                <InfoCard title="Database" value={project.database_tech} icon={Code2} />
                <InfoCard title="Agreement Uploaded" value={project.agreement_uploaded} icon={Paperclip} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={16} className="text-emerald-400" />
              <h2 className="text-base font-semibold">Objectives & Requirements</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Objective</p>
                <p className="text-sm leading-7 text-white/70">{project.objective || 'No objective provided.'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-white/40 mb-2">Business Requirements</p>
                <p className="text-sm leading-7 text-white/70">{project.business_requirements || 'No requirements provided.'}</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <ProjectTasks projectUuid={project.uuid} />
      )}
    </div>
  );
}
