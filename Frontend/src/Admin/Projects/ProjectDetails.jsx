import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Building2, CalendarDays, CheckCircle, FileText, Loader2,
  User, DollarSign, TrendingUp, FolderKanban, Users, Code2, Paperclip,
} from 'lucide-react';
import api from '../../api';

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

const StatPill = ({ label, value, color }) => (
  <div className={`flex flex-col items-center justify-center rounded-xl border p-3 ${color}`}>
    <span className="text-lg font-bold">{value}</span>
    <span className="text-[10px] uppercase tracking-wider mt-0.5 opacity-70">{label}</span>
  </div>
);

function ProgressSection({ projectId }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/projects/${projectId}/progress`);
      if (data.success) setProgress(data);
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, 15000);
    return () => clearInterval(interval);
  }, [fetchProgress]);

  if (loading && !progress) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-center justify-center min-h-[120px]">
        <Loader2 size={20} className="animate-spin text-white/30" />
      </div>
    );
  }

  const pct = progress?.progress ?? 0;
  const total = progress?.total ?? 0;
  const completed = progress?.completed ?? 0;
  const inProgress = progress?.inProgress ?? 0;
  const pending = progress?.pending ?? 0;
  const onHold = progress?.onHold ?? 0;
  const cancelled = progress?.cancelled ?? 0;
  const remaining = progress?.remaining ?? 0;

  const barColor = pct >= 100 ? '#22c55e' : pct >= 70 ? '#f97316' : pct >= 40 ? '#3b82f6' : '#ef4444';
  const isFullyCompleted = pct >= 100 && total > 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp size={16} className="text-emerald-400" />
        <h2 className="text-base font-semibold">Project Progress</h2>
        {loading && <Loader2 size={12} className="animate-spin text-white/30 ml-auto" />}
      </div>

      {isFullyCompleted ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-emerald-400 font-bold text-sm">
          <CheckCircle size={18} />
          ✅ Project Completed (100%)
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-white/50">Overall Progress</span>
            <span className="font-bold text-lg" style={{ color: barColor }}>{pct}%</span>
          </div>
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}aa, ${barColor})` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/30 mt-1">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </>
      )}

      {total === 0 ? (
        <p className="text-xs text-white/30 text-center py-2">No tasks assigned yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 pt-1">
          <StatPill label="Total"       value={total}      color="border-white/10 text-white/80" />
          <StatPill label="Completed"   value={completed}  color="border-emerald-500/30 text-emerald-400" />
          <StatPill label="Remaining"   value={remaining}  color="border-orange-500/30 text-orange-400" />
          <StatPill label="In Progress" value={inProgress} color="border-blue-500/30 text-blue-400" />
          <StatPill label="Pending"     value={pending}    color="border-yellow-500/30 text-yellow-400" />
          <StatPill label="On Hold"     value={onHold}     color="border-violet-500/30 text-violet-400" />
          <div className="col-span-3">
            <StatPill label="Cancelled" value={cancelled}  color="border-rose-500/30 text-rose-400" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/projects')}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
          >
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

      {/* Summary + Progress */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-orange-400" />
            <h2 className="text-base font-semibold">Project Summary</h2>
          </div>
          <p className="text-sm leading-7 text-white/70">{project.description || 'No description provided.'}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoCard title="Project Code" value={project.project_code} icon={FileText} />
            <InfoCard title="Category"     value={project.project_category} icon={FolderKanban} />
            <InfoCard title="Industry"     value={project.industry} icon={Building2} />
            <InfoCard title="Client"       value={project.client_name} icon={Users} />
          </div>
        </div>

        {/* Dynamic Progress Section */}
        <ProgressSection projectId={id} />
      </div>

      {/* Dates */}
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard title="Start Date"           value={fmtDate(project.project_start_date)} icon={CalendarDays} />
        <InfoCard title="Estimated Completion" value={fmtDate(project.estimated_completion_date)} icon={CalendarDays} />
        <InfoCard title="Total Cost"           value={formatCurrency(project.total_project_cost)} icon={DollarSign} />
      </div>

      {/* Client & Tech */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-blue-400" />
            <h2 className="text-base font-semibold">Client &amp; Team</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard title="Contact Person"  value={project.contact_person} icon={User} />
            <InfoCard title="Email"           value={project.email} icon={FileText} />
            <InfoCard title="Phone"           value={project.phone_number} icon={FileText} />
            <InfoCard title="Project Manager" value={project.project_manager} icon={Users} />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={16} className="text-violet-400" />
            <h2 className="text-base font-semibold">Tech &amp; Documents</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard title="Frontend Tech"      value={project.frontend_tech} icon={Code2} />
            <InfoCard title="Backend Tech"       value={project.backend_tech} icon={Code2} />
            <InfoCard title="Database"           value={project.database_tech} icon={Code2} />
            <InfoCard title="Agreement Uploaded" value={project.agreement_uploaded} icon={Paperclip} />
          </div>
        </div>
      </div>

      {/* Objectives */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={16} className="text-emerald-400" />
          <h2 className="text-base font-semibold">Objectives &amp; Requirements</h2>
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

    </div>
  );
}
