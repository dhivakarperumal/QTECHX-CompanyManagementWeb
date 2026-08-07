import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Building2, CalendarDays, CheckCircle, FileText, Loader2, User, 
  DollarSign, TrendingUp, FolderKanban, Users, Code2, Paperclip, LayoutDashboard, ListTodo
} from 'lucide-react';
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

export default function MyProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [progressData, setProgressData] = useState(null);

  const fetchProgress = useCallback(async (uuid) => {
    try {
      const { data } = await api.get(`/projects/${uuid}/progress`);
      if (data.success) setProgressData(data);
    } catch (e) { console.error('Failed to fetch progress', e); }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Fetch project details
        const projectRes = await api.get(`/projects/${id}`);
        if (!projectRes.data.success) throw new Error(projectRes.data.message || 'Project not found');
        setProject(projectRes.data.data);
        fetchProgress(id);

        // Fetch assigned employees
        try {
          const empRes = await api.get(`/projects/${id}/assignments`);
          let assignments = [];
          
          if (Array.isArray(empRes.data)) {
            assignments = empRes.data;
          } else if (empRes.data) {
            assignments = empRes.data.assignedEmployees 
              || empRes.data.employees 
              || empRes.data.project?.assignedEmployees 
              || empRes.data.project?.employees 
              || (Array.isArray(empRes.data.data) ? empRes.data.data : []);
          }

          if (!assignments || assignments.length === 0) {
            // Fallback to project details response if assignment route returns empty
            assignments = projectRes.data.assignedEmployees || projectRes.data.employees || [];
          }
          
          setAssignedEmployees(assignments);
        } catch (err) {
          console.error("Failed to load assigned employees", err);
          // Fallback to project details response
          setAssignedEmployees(projectRes.data.assignedEmployees || projectRes.data.employees || []);
        }

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
        <button onClick={() => navigate('/admin/myprojects')} className="inline-flex items-center gap-2 text-white/70 hover:text-white">
          <ArrowLeft size={16} /> Back to my projects
        </button>
        <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 p-5 text-sm text-rose-400">
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 text-white overflow-hidden pb-4">
      {/* Sidebar Tabs */}
      <div className="w-64 shrink-0 flex flex-col gap-2 border-r border-white/10 pr-4 overflow-y-auto">
        <div className="mb-4">
          <button onClick={() => navigate('/admin/myprojects')} className="inline-flex items-center gap-2 text-white/40 hover:text-white transition text-sm mb-4">
            <ArrowLeft size={16} /> Back to projects
          </button>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-400">
            <FolderKanban size={11} /> Project Menu
          </div>
          <h1 className="text-xl font-bold tracking-tight leading-tight mt-2">{project.project_name || 'Project'}</h1>
        </div>

        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            activeTab === 'overview' 
              ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold' 
              : 'bg-white/[0.02] border border-transparent text-white/60 hover:bg-white/[0.05] hover:text-white'
          }`}
        >
          <LayoutDashboard size={18} />
          <span className="text-sm">Overview</span>
        </button>

        <button 
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            activeTab === 'team' 
              ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold' 
              : 'bg-white/[0.02] border border-transparent text-white/60 hover:bg-white/[0.05] hover:text-white'
          }`}
        >
          <Users size={18} />
          <span className="text-sm">Assigned Team</span>
          {assignedEmployees.length > 0 && (
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
              activeTab === 'team' ? 'bg-orange-500/20 text-orange-300' : 'bg-white/10 text-white/60'
            }`}>
              {assignedEmployees.length}
            </span>
          )}
        </button>

        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
            activeTab === 'tasks' 
              ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold' 
              : 'bg-white/[0.02] border border-transparent text-white/60 hover:bg-white/[0.05] hover:text-white'
          }`}
        >
          <ListTodo size={18} />
          <span className="text-sm">Tasks</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Project Overview</h2>
              <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/70">
                {project.current_status || 'Planning'}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 size={16} className="text-orange-400" />
                  <h3 className="text-base font-semibold">Project Summary</h3>
                </div>
                <p className="text-sm leading-7 text-white/70">{project.description || 'No description provided.'}</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <InfoCard title="Project Code" value={project.project_code} icon={FileText} />
                  <InfoCard title="Category" value={project.project_category} icon={FolderKanban} />
                  <InfoCard title="Industry" value={project.industry} icon={Building2} />
                  <InfoCard title="Client" value={project.client_name} icon={Users} />
                </div>
              </div>
              
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={16} className="text-emerald-400" />
                  <h3 className="text-base font-semibold">Progress</h3>
                </div>
                <div className="space-y-3">
                  {progressData?.total > 0 && progressData?.progress >= 100 ? (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-emerald-400 font-bold text-sm">
                      <CheckCircle size={18} />
                      ✅ Project Completed (100%)
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-sm text-white/60 mb-1">
                        <span>Overall</span>
                        <span className="font-bold" style={{ color: (progressData?.progress ?? 0) >= 70 ? '#22c55e' : (progressData?.progress ?? 0) >= 40 ? '#f97316' : '#ef4444' }}>
                          {progressData?.progress ?? 0}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${progressData?.progress ?? 0}%`, background: 'linear-gradient(90deg, #f97316aa, #f97316)' }}
                        />
                      </div>
                    </div>
                  )}
                  {(progressData?.total ?? 0) > 0 && (
                    <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                      {[
                        { label: 'Total',       value: progressData?.total,      cls: 'text-white/70' },
                        { label: 'Completed',   value: progressData?.completed,  cls: 'text-emerald-400' },
                        { label: 'Remaining',   value: progressData?.remaining,  cls: 'text-orange-400' },
                        { label: 'In Progress', value: progressData?.inProgress, cls: 'text-blue-400' },
                        { label: 'Pending',     value: progressData?.pending,    cls: 'text-yellow-400' },
                        { label: 'On Hold',     value: progressData?.onHold,     cls: 'text-violet-400' },
                      ].map(s => (
                        <div key={s.label} className="flex flex-col items-center rounded-xl border border-white/8 bg-white/[0.02] p-2">
                          <span className={`font-bold text-sm ${s.cls}`}>{s.value ?? 0}</span>
                          <span className="text-white/35 text-[9px] uppercase tracking-wide mt-0.5">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
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
                  <h3 className="text-base font-semibold">Client & Team</h3>
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
                  <h3 className="text-base font-semibold">Tech & Documents</h3>
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
                <h3 className="text-base font-semibold">Objectives & Requirements</h3>
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

        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Assigned Team Members</h2>
              <div className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/80">
                {assignedEmployees.length} Members
              </div>
            </div>

            {assignedEmployees.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-white/70">
                    <thead className="bg-white/5 text-white">
                      <tr>
                        <th className="p-4 font-semibold w-16">S.No</th>
                        <th className="p-4 font-semibold">Employee</th>
                        <th className="p-4 font-semibold">Designation</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {assignedEmployees.map((employee, index) => (
                        <tr key={`${employee.employee_id}-${employee.id}`} className="hover:bg-white/5 transition">
                          <td className="p-4 text-white/50">{index + 1}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 shrink-0 border border-white/10">
                                <User size={14} />
                              </div>
                              <div>
                                <p className="font-semibold text-white">
                                  {employee.full_name || employee.employee_name || [employee.first_name, employee.last_name].filter(Boolean).join(' ') || 'Unknown'}
                                </p>
                                <p className="text-[11px] text-white/45 mt-0.5">{employee.employee_code || employee.employee_id || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {employee.designation || employee.role || 'Employee'}
                          </td>
                          <td className="p-4">
                            <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-orange-300">
                              {employee.status || employee.role || 'Assigned'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => navigate(`/admin/employees/view/${employee.employee_id}`)}
                              className="text-[11px] font-semibold text-white/60 hover:text-white transition underline underline-offset-2"
                            >
                              View Profile →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 flex flex-col items-center justify-center text-center">
                <Users size={32} className="text-white/20 mb-3" />
                <p className="text-sm font-semibold text-white/60">No team members assigned</p>
                <p className="text-xs text-white/40 mt-1">This project doesn't have any assigned employees yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Project Tasks</h2>
            <ProjectTasks projectUuid={project.uuid || id} assignedEmployees={assignedEmployees} />
          </div>
        )}
      </div>
    </div>
  );
}
