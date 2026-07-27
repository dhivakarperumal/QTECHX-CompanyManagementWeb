import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Building2,
  CalendarRange,
  CheckCircle2,
  Code2,
  FileText,
  FolderKanban,
  RefreshCw,
  Save,
  Server,
  Users,
} from 'lucide-react';

const initialForm = {
  projectCode: '',
  projectName: '',
  shortName: '',
  projectCategory: '',
  industry: '',
  description: '',
  objective: '',
  businessRequirements: '',
  clientName: '',
  companyName: '',
  contactPerson: '',
  email: '',
  phoneNumber: '',
  ndaSigned: 'Yes',
  agreementUploaded: 'Yes',
  totalProjectCost: '',
  currentStatus: 'Planning',
  overallProgress: '0',
  proposalDate: '',
  approvalDate: '',
  projectStartDate: '',
  estimatedCompletionDate: '',
  projectEndDate: '',
  goLiveDate: '',
  supportPeriod: '',
  frontend: '',
  mobile: '',
  backend: '',
  database: '',
  github: '',
  domainName: '',
  subDomainName: '',
  projectManager: '',
  uiUxDesigner: '',
  frontendDevelopers: '',
  backendDevelopers: '',
  uiProgress: '0',
  frontendProgress: '0',
  backendProgress: '0',
  testingProgress: '0',
  deploymentProgress: '0',
  proposal: '',
  quotation: '',
  agreement: '',
  nda: '',
  apiDocumentation: '',
  databaseSchema: '',
  sourceCodeBackup: '',
};

const sectionClass = 'rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5';
const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/70';

const formatCurrency = (value) => {
  if (!value) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

function ProjectManagement() {
  const location = useLocation();
  const [formData, setFormData] = useState(initialForm);
  const [projects, setProjects] = useState([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const storedProjects = localStorage.getItem('qtechx-projects');
    if (storedProjects) {
      try {
        setProjects(JSON.parse(storedProjects));
      } catch {
        setProjects([]);
      }
    } else {
      setProjects([
        {
          id: 1,
          projectName: 'Q-Techx Website Redesign',
          clientName: 'Apex Industries',
          currentStatus: 'In Progress',
          overallProgress: '78',
          totalProjectCost: '250000',
          projectManager: 'Sajid Khan',
        },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('qtechx-projects', JSON.stringify(projects));
  }, [projects]);

  const stats = useMemo(() => {
    const activeCount = projects.filter((item) => ['In Progress', 'Planning', 'Testing'].includes(item.currentStatus)).length;
    const liveCount = projects.filter((item) => item.currentStatus === 'Live').length;
    const completedCount = projects.filter((item) => item.currentStatus === 'Completed').length;
    return {
      total: projects.length,
      active: activeCount,
      live: liveCount,
      completed: completedCount,
    };
  }, [projects]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    const payload = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [payload, ...prev]);
    setFeedback('Project saved successfully.');
    setFormData(initialForm);
  };

  const resetForm = () => {
    setFormData(initialForm);
    setFeedback('');
  };

  const currentPage = location.pathname.split('/').filter(Boolean).pop() || 'projects';
  const pageTitle = currentPage === 'add' ? 'Create Project' : 'Project Management';

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#11141d] via-[#0f131b] to-[#111827] p-5 shadow-2xl shadow-black/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-orange-400">
              <FolderKanban size={14} />
              {pageTitle}
            </div>
            <h2 className="text-2xl font-semibold text-white">Project management workspace</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Capture project essentials, timelines, team assignments, progress, and documents in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
              <span className="text-white">{stats.total}</span> projects
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
              <span className="text-white">{stats.active}</span> active
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
              <span className="text-white">{stats.live}</span> live
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
              <span className="text-white">{stats.completed}</span> completed
            </div>
          </div>
        </div>
      </div>

      {feedback ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSave} className="space-y-6">
          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Project Code</span>
                <input className={fieldClass} name="projectCode" value={formData.projectCode} onChange={handleChange} placeholder="PRJ-001" />
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Project Name</span>
                <input className={fieldClass} name="projectName" value={formData.projectName} onChange={handleChange} placeholder="Client Portal" required />
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Short Name</span>
                <input className={fieldClass} name="shortName" value={formData.shortName} onChange={handleChange} placeholder="CP" />
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Project Category</span>
                <input className={fieldClass} name="projectCategory" value={formData.projectCategory} onChange={handleChange} placeholder="Web Application" />
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Industry</span>
                <input className={fieldClass} name="industry" value={formData.industry} onChange={handleChange} placeholder="Healthcare" />
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Current Status</span>
                <select className={fieldClass} name="currentStatus" value={formData.currentStatus} onChange={handleChange}>
                  <option>Planning</option>
                  <option>In Progress</option>
                  <option>Testing</option>
                  <option>Live</option>
                  <option>Completed</option>
                </select>
              </label>
              <label className="text-sm text-white/70 md:col-span-2">
                <span className="mb-1 block">Description</span>
                <textarea className={`${fieldClass} min-h-[90px]`} name="description" value={formData.description} onChange={handleChange} placeholder="Describe the project scope" />
              </label>
              <label className="text-sm text-white/70 md:col-span-2">
                <span className="mb-1 block">Objective</span>
                <textarea className={`${fieldClass} min-h-[80px]`} name="objective" value={formData.objective} onChange={handleChange} placeholder="What outcome is expected?" />
              </label>
              <label className="text-sm text-white/70 md:col-span-2">
                <span className="mb-1 block">Business Requirements</span>
                <textarea className={`${fieldClass} min-h-[80px]`} name="businessRequirements" value={formData.businessRequirements} onChange={handleChange} placeholder="List the business needs" />
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Client Name</span>
                <input className={fieldClass} name="clientName" value={formData.clientName} onChange={handleChange} placeholder="Client company" />
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Company Name</span>
                <input className={fieldClass} name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Q-Techx Solutions" />
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Contact Person</span>
                <input className={fieldClass} name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Name" />
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Email</span>
                <input className={fieldClass} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" />
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Phone Number</span>
                <input className={fieldClass} name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+91 98765 43210" />
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">NDA Signed</span>
                <select className={fieldClass} name="ndaSigned" value={formData.ndaSigned} onChange={handleChange}>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Agreement Uploaded</span>
                <select className={fieldClass} name="agreementUploaded" value={formData.agreementUploaded} onChange={handleChange}>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Total Project Cost</span>
                <input className={fieldClass} type="number" name="totalProjectCost" value={formData.totalProjectCost} onChange={handleChange} placeholder="500000" />
              </label>
              <label className="text-sm text-white/70">
                <span className="mb-1 block">Overall Progress (%)</span>
                <input className={fieldClass} type="number" max="100" name="overallProgress" value={formData.overallProgress} onChange={handleChange} placeholder="0" />
              </label>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-2">
              <CalendarRange size={16} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Project Timeline</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['proposalDate', 'Proposal Date', 'date'],
                ['approvalDate', 'Approval Date', 'date'],
                ['projectStartDate', 'Project Start Date', 'date'],
                ['estimatedCompletionDate', 'Estimated Completion Date', 'date'],
                ['projectEndDate', 'Project End Date', 'date'],
                ['goLiveDate', 'Go Live Date', 'date'],
              ].map(([name, label, type]) => (
                <label key={name} className="text-sm text-white/70">
                  <span className="mb-1 block">{label}</span>
                  <input className={fieldClass} type={type} name={name} value={formData[name]} onChange={handleChange} />
                </label>
              ))}
              <label className="text-sm text-white/70 md:col-span-2">
                <span className="mb-1 block">Support Period</span>
                <input className={fieldClass} name="supportPeriod" value={formData.supportPeriod} onChange={handleChange} placeholder="12 months" />
              </label>
            </div>
          </section>

          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-2">
              <Code2 size={16} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Technology Stack</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['frontend', 'Frontend'],
                ['mobile', 'Mobile'],
                ['backend', 'Backend'],
                ['database', 'Database'],
                ['github', 'GitHub'],
                ['domainName', 'Domain Name'],
                ['subDomainName', 'Sub-Domain Name'],
              ].map(([name, label]) => (
                <label key={name} className="text-sm text-white/70">
                  <span className="mb-1 block">{label}</span>
                  <input className={fieldClass} name={name} value={formData[name]} onChange={handleChange} />
                </label>
              ))}
            </div>
          </section>

          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-2">
              <Users size={16} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Team Assignment</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['projectManager', 'Project Manager'],
                ['uiUxDesigner', 'UI/UX Designer'],
                ['frontendDevelopers', 'Frontend Developers'],
                ['backendDevelopers', 'Backend Developers'],
              ].map(([name, label]) => (
                <label key={name} className="text-sm text-white/70">
                  <span className="mb-1 block">{label}</span>
                  <input className={fieldClass} name={name} value={formData[name]} onChange={handleChange} />
                </label>
              ))}
            </div>
          </section>

          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Project Progress</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['overallProgress', 'Overall Progress (%)', 'number'],
                ['uiProgress', 'UI Progress (%)', 'number'],
                ['frontendProgress', 'Frontend Progress (%)', 'number'],
                ['backendProgress', 'Backend Progress (%)', 'number'],
                ['testingProgress', 'Testing Progress (%)', 'number'],
                ['deploymentProgress', 'Deployment Progress (%)', 'number'],
              ].map(([name, label, type]) => (
                <label key={name} className="text-sm text-white/70">
                  <span className="mb-1 block">{label}</span>
                  <input className={fieldClass} type={type} max="100" name={name} value={formData[name]} onChange={handleChange} />
                </label>
              ))}
            </div>
          </section>

          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-2">
              <FileText size={16} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Documents</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['proposal', 'Proposal'],
                ['quotation', 'Quotation'],
                ['agreement', 'Agreement'],
                ['nda', 'NDA'],
                ['apiDocumentation', 'API Documentation'],
                ['databaseSchema', 'Database Schema'],
                ['sourceCodeBackup', 'Source Code Backup'],
              ].map(([name, label]) => (
                <label key={name} className="text-sm text-white/70">
                  <span className="mb-1 block">{label}</span>
                  <input className={fieldClass} name={name} value={formData[name]} onChange={handleChange} placeholder="Link or file name" />
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white transition hover:bg-orange-600">
              <Save size={16} /> Save Project
            </button>
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">
              <RefreshCw size={16} /> Reset
            </button>
          </div>
        </form>

        <aside className="space-y-6">
          <div className={sectionClass}>
            <div className="mb-4 flex items-center gap-2">
              <Server size={16} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Project Overview</h3>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="rounded-2xl border border-white/10 bg-[#0e1118] p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{project.projectName || 'Untitled Project'}</h4>
                    <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400">
                      {project.currentStatus || 'Planning'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/50">Client: {project.clientName || '—'}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-white/60">
                    <span>Progress {project.overallProgress || 0}%</span>
                    <span>{formatCurrency(project.totalProjectCost)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={sectionClass}>
            <div className="mb-4 flex items-center gap-2">
              <FolderKanban size={16} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Recent Projects</h3>
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/5 text-white/60">
                  <tr>
                    <th className="px-3 py-2">Project</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.slice(0, 5).map((project) => (
                    <tr key={project.id} className="border-t border-white/10 bg-[#0e1118] text-white/70">
                      <td className="px-3 py-2">{project.projectName || 'Untitled Project'}</td>
                      <td className="px-3 py-2">{project.currentStatus || 'Planning'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ProjectManagement;
