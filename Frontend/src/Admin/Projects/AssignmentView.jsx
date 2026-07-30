import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Loader2, FolderKanban, Users, User,
  Mail, Phone, Calendar, Eye, Trash2,
  AlertCircle, RefreshCw, CheckCircle, LayoutDashboard,
  Building2, TrendingUp, CalendarDays, DollarSign,
  FileText, Code2, Paperclip, ListTodo,
} from 'lucide-react';
import api from '../../api';
import ModalPortal from '../../Componets/CommonComponents/ModalPortal';
import ProjectTasks from './ProjectTasks';

/* ── helpers ── */
const AVATAR_COLOURS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#f97316','#8b5cf6','#ef4444','#22c55e'];
const initials = (n = '') => n.trim().split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?';

function Avatar({ name, size = 10, index = 0 }) {
  const c = AVATAR_COLOURS[(index||0) % AVATAR_COLOURS.length];
  return (
    <div
      className={`w-${size} h-${size} rounded-xl flex items-center justify-center text-xs font-bold shrink-0`}
      style={{ background: c+'28', border: `1.5px solid ${c}44`, color: c }}
    >
      {initials(name)}
    </div>
  );
}

const ROLE_STYLES = {
  'Project Manager':    'bg-violet-500/15 text-violet-400 border-violet-500/25',
  'UI/UX Designer':     'bg-pink-500/15 text-pink-400 border-pink-500/25',
  'Frontend Developer': 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  'Backend Developer':  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'Tester':             'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'DevOps':             'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  'QA':                 'bg-rose-500/15 text-rose-400 border-rose-500/25',
};

const STATUS_STYLES = {
  Planning:      'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  'In Progress': 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  Testing:       'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  'On Hold':     'bg-orange-500/10 text-orange-300 border border-orange-500/20',
  Live:          'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
  Completed:     'bg-purple-500/10 text-purple-300 border border-purple-500/20',
  Cancelled:     'bg-rose-500/10 text-rose-300 border border-rose-500/20',
};

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
      <Icon size={13} /> {title}
    </div>
    <div className="text-white font-semibold text-sm leading-6">{value || '—'}</div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════ */
export default function AssignmentView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject]   = useState(null);
  const [members, setMembers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [toast, setToast]       = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [projRes, assignRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/assignments`),
      ]);
      if (!projRes.data.success) throw new Error(projRes.data.message || 'Project not found');
      setProject(projRes.data.data);

      const d = assignRes.data;
      let emps = [];
      if (Array.isArray(d)) emps = d;
      else emps = d.assignedEmployees || d.employees || (Array.isArray(d.data) ? d.data : []);
      setMembers(emps);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load data');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await api.delete(`/projects/${id}/assignments`, {
        data: { employee_id: removeTarget.employee_id },
      });
      showToast('Employee removed from project');
      setRemoveTarget(null);
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Remove failed');
      setRemoveTarget(null);
    } finally { setRemoving(false); }
  };

  /* ── sidebar tabs ── */
  const tabs = [
    { key: 'overview', label: 'Overview',      icon: LayoutDashboard },
    { key: 'team',     label: 'Assigned Team', icon: Users,  badge: members.length },
    { key: 'tasks',    label: 'Tasks',          icon: ListTodo },
  ];

  /* ──────────────────────────────── Render ─────────────────────────────── */
  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 text-white overflow-hidden pb-4">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">
          <CheckCircle size={16} /> {toast}
        </div>
      )}

      {/* Remove confirm modal */}
      {removeTarget && (
        <ModalPortal>
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setRemoveTarget(null)} />
            <div className="relative bg-[#111318] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                  <Trash2 size={18} className="text-rose-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Remove Member</h3>
                  <p className="text-white/40 text-xs">This cannot be undone</p>
                </div>
              </div>
              <p className="text-white/60 text-sm mb-6">
                Remove <span className="text-white font-semibold">
                  {removeTarget.full_name || [removeTarget.first_name, removeTarget.last_name].filter(Boolean).join(' ')}
                </span> from <span className="text-orange-400 font-semibold">"{project?.project_name}"</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setRemoveTarget(null)} disabled={removing}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/60 hover:text-white transition">
                  Cancel
                </button>
                <button onClick={handleRemove} disabled={removing}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition flex items-center justify-center gap-2">
                  {removing ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {removing ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-64 shrink-0 flex flex-col gap-2 border-r border-white/10 pr-4 overflow-y-auto">
        <div className="mb-4">
          <button
            onClick={() => navigate('/admin/projects/assignments')}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white transition text-sm mb-4"
          >
            <ArrowLeft size={16} /> Back to assignments
          </button>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-400">
            <FolderKanban size={11} /> Project Menu
          </div>
          <h1 className="text-xl font-bold tracking-tight leading-tight mt-2">
            {loading ? '…' : (project?.project_name || 'Project')}
          </h1>
          {project && (
            <div className="mt-2">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[project.current_status] || 'bg-white/10 text-white/60 border border-white/15'}`}>
                {project.current_status || 'Planning'}
              </span>
            </div>
          )}
        </div>

        {tabs.map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeTab === key
                ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold'
                : 'bg-white/[0.02] border border-transparent text-white/60 hover:bg-white/[0.05] hover:text-white'
            }`}
          >
            <Icon size={18} />
            <span className="text-sm">{label}</span>
            {badge > 0 && (
              <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === key ? 'bg-orange-500/20 text-orange-300' : 'bg-white/10 text-white/60'
              }`}>
                {badge}
              </span>
            )}
          </button>
        ))}

        {/* Refresh */}
        <button
          onClick={fetchData}
          className="mt-2 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.02] border border-transparent text-white/40 hover:text-white hover:bg-white/[0.05] transition text-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-orange-500' : ''} />
          Refresh
        </button>
      </div>

      {/* ── RIGHT CONTENT ── */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl mb-4">
            <AlertCircle size={16} /> {error}
            <button onClick={fetchData} className="ml-auto text-xs underline">Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={30} className="animate-spin text-orange-500/70" />
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {!loading && !error && activeTab === 'overview' && project && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Project Overview</h2>
            </div>

            {/* Summary + Progress */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={16} className="text-orange-400" />
                  <h3 className="text-base font-semibold">Project Summary</h3>
                </div>
                <p className="text-sm leading-7 text-white/70">{project.description || 'No description provided.'}</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <InfoCard title="Project Code" value={project.project_code} icon={FileText} />
                  <InfoCard title="Category"     value={project.project_category} icon={FolderKanban} />
                  <InfoCard title="Industry"     value={project.industry} icon={Building2} />
                  <InfoCard title="Client"       value={project.client_name} icon={Users} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-emerald-400" />
                  <h3 className="text-base font-semibold">Progress</h3>
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
                  <InfoCard title="Cost"                 value={formatCurrency(project.total_project_cost)} icon={DollarSign} />
                  <InfoCard title="Start Date"           value={fmtDate(project.project_start_date)} icon={CalendarDays} />
                  <InfoCard title="Estimated Completion" value={fmtDate(project.estimated_completion_date)} icon={CalendarDays} />
                </div>
              </div>
            </div>

            {/* Client & Tech */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User size={16} className="text-blue-400" />
                  <h3 className="text-base font-semibold">Client &amp; Team</h3>
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
                  <h3 className="text-base font-semibold">Tech &amp; Documents</h3>
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
                <h3 className="text-base font-semibold">Objectives &amp; Requirements</h3>
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
        )}

        {/* ── TEAM TAB ── */}
        {!loading && !error && activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Assigned Team Members</h2>
              <div className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/80">
                {members.length} Members
              </div>
            </div>

            {members.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-14 flex flex-col items-center justify-center text-center">
                <Users size={32} className="text-white/20 mb-3" />
                <p className="text-sm font-semibold text-white/40">No team members assigned</p>
                <p className="text-xs text-white/30 mt-1">Go to Assignments to add employees.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-white/[0.04] border-b border-white/8">
                        <th className="px-5 py-3.5 text-[10px] font-bold text-white/35 uppercase tracking-widest w-14">S.No</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold text-white/35 uppercase tracking-widest">Employee</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold text-white/35 uppercase tracking-widest">Emp ID</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold text-white/35 uppercase tracking-widest">Designation</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold text-white/35 uppercase tracking-widest">Role in Project</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold text-white/35 uppercase tracking-widest">Contact</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold text-white/35 uppercase tracking-widest">Assigned On</th>
                        <th className="px-5 py-3.5 text-[10px] font-bold text-white/35 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {members.map((m, i) => {
                        const name = m.full_name || [m.first_name, m.last_name].filter(Boolean).join(' ') || m.employee_name || m.employee_code || 'Unknown';
                        const roleStyle = ROLE_STYLES[m.role] || 'bg-white/10 text-white/50 border-white/15';
                        return (
                          <tr key={`${m.employee_id}-${i}`} className="hover:bg-white/[0.025] transition">
                            <td className="px-5 py-4 text-white/40">{i + 1}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar name={name} index={i} />
                                <p className="text-white font-semibold text-sm">{name}</p>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="text-white/70 font-mono text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
                                {m.employee_code || '—'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-white/60 text-sm">{m.designation || '—'}</td>
                            <td className="px-5 py-4">
                              {m.role ? (
                                <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-full ${roleStyle}`}>
                                  {m.role}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-5 py-4">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                                  <Mail size={10} className="text-white/30 shrink-0" />
                                  {m.personal_email || m.email || m.official_email || 'No email'}
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-white/50">
                                  <Phone size={10} className="text-white/30 shrink-0" />
                                  {m.mobile_number || m.phone_number || m.alternate_mobile || 'No phone'}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-white/40 text-xs">
                              <div className="flex items-center gap-1.5">
                                <Calendar size={10} className="shrink-0" />
                                {fmtDate(m.assigned_date)}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => navigate(`/admin/employees/view/${m.employee_id}`)}
                                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/25 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition"
                                  title="View Employee Profile"
                                >
                                  <Eye size={14} />
                                </button>
                                <button
                                  onClick={() => setRemoveTarget(m)}
                                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/25 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition"
                                  title="Remove from project"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TASKS TAB ── */}
        {!loading && !error && activeTab === 'tasks' && project && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Project Tasks</h2>
            <ProjectTasks projectUuid={project.uuid || id} assignedEmployees={members} />
          </div>
        )}
      </div>
    </div>
  );
}
