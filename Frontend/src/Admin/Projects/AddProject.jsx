import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, FileText, RefreshCw, Save, Users, Code2, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../../api';

const BLANK = {
  project_code: '', project_name: '', short_name: '', project_category: '', industry: '',
  description: '', objective: '', business_requirements: '',
  client_name: '', company_name: '', contact_person: '', email: '', phone_number: '',
  nda_signed: 'No', agreement_uploaded: 'No',
  total_project_cost: '', current_status: 'Planning', overall_progress: '0',
  proposal_date: '', approval_date: '', project_start_date: '', estimated_completion_date: '',
  project_end_date: '', go_live_date: '', support_period: '',
  frontend_tech: '', mobile_tech: '', backend_tech: '', database_tech: '',
  github_link: '', domain_name: '', sub_domain_name: '',
  project_manager: '', ui_ux_designer: '', frontend_developers: '', backend_developers: '',
  ui_progress: '0', frontend_progress: '0', backend_progress: '0',
  testing_progress: '0', deployment_progress: '0',
  proposal_doc: '', quotation_doc: '', agreement_doc: '', nda_doc: '',
  api_documentation: '', database_schema: '', source_code_backup: '',
};

const generateProjectCode = () => {
  const today = new Date();
  const stamp = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `PRJ-${stamp}-${suffix}`;
};

const toForm = (p) => ({
  project_code: p.project_code || '', project_name: p.project_name || '', short_name: p.short_name || '',
  project_category: p.project_category || '', industry: p.industry || '',
  description: p.description || '', objective: p.objective || '', business_requirements: p.business_requirements || '',
  client_name: p.client_name || '', company_name: p.company_name || '', contact_person: p.contact_person || '',
  email: p.email || '', phone_number: p.phone_number || '',
  nda_signed: p.nda_signed || 'No', agreement_uploaded: p.agreement_uploaded || 'No',
  total_project_cost: p.total_project_cost != null ? String(p.total_project_cost) : '',
  current_status: p.current_status || 'Planning',
  overall_progress: String(p.overall_progress ?? 0),
  proposal_date: p.proposal_date ? p.proposal_date.slice(0, 10) : '',
  approval_date: p.approval_date ? p.approval_date.slice(0, 10) : '',
  project_start_date: p.project_start_date ? p.project_start_date.slice(0, 10) : '',
  estimated_completion_date: p.estimated_completion_date ? p.estimated_completion_date.slice(0, 10) : '',
  project_end_date: p.project_end_date ? p.project_end_date.slice(0, 10) : '',
  go_live_date: p.go_live_date ? p.go_live_date.slice(0, 10) : '',
  support_period: p.support_period || '',
  frontend_tech: p.frontend_tech || '', mobile_tech: p.mobile_tech || '',
  backend_tech: p.backend_tech || '', database_tech: p.database_tech || '',
  github_link: p.github_link || '', domain_name: p.domain_name || '', sub_domain_name: p.sub_domain_name || '',
  project_manager: p.project_manager || '', ui_ux_designer: p.ui_ux_designer || '',
  frontend_developers: p.frontend_developers || '', backend_developers: p.backend_developers || '',
  ui_progress: String(p.ui_progress ?? 0), frontend_progress: String(p.frontend_progress ?? 0),
  backend_progress: String(p.backend_progress ?? 0), testing_progress: String(p.testing_progress ?? 0),
  deployment_progress: String(p.deployment_progress ?? 0),
  proposal_doc: p.proposal_doc || '', quotation_doc: p.quotation_doc || '',
  agreement_doc: p.agreement_doc || '', nda_doc: p.nda_doc || '',
  api_documentation: p.api_documentation || '', database_schema: p.database_schema || '',
  source_code_backup: p.source_code_backup || '',
});

const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#0e1118] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/70 transition placeholder:text-white/20';
const sectionClass = 'rounded-2xl border border-white/8 bg-white/[0.03] p-5';
const STATUS_OPTIONS = ['Planning', 'In Progress', 'Testing', 'On Hold', 'Live', 'Completed', 'Cancelled'];

export default function AddProject() {
  const { id } = useParams();           // present on /admin/projects/edit/:id
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData]     = useState(() => (
    isEdit ? BLANK : { ...BLANK, project_code: generateProjectCode() }
  ));
  const [clients, setClients]       = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  // ── Load existing project when editing ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/clients?limit=500&page=1');
        if (data?.success) {
          setClients(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load clients', err);
      }
    })();

    if (!isEdit) return;
    (async () => {
      setFetchLoading(true);
      try {
        const { data } = await api.get(`/projects/${id}`);
        if (!data.success) throw new Error(data.message || 'Not found');
        setFormData(toForm(data.data));
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load project');
      } finally { setFetchLoading(false); }
    })();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClientSelect = (e) => {
    const clientId = e.target.value;
    const selectedClient = clients.find((client) => String(client.id ?? client.uuid) === String(clientId));
    setSelectedClientId(clientId);
    setFormData(prev => ({
      ...prev,
      client_name: selectedClient?.client_name || '',
      company_name: selectedClient?.company_name || '',
      contact_person: selectedClient?.contact_person || '',
      email: selectedClient?.email || '',
      phone_number: selectedClient?.phone_number || '',
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.project_name.trim()) { setError('Project name is required.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const payload = {
        ...formData,
        project_code: formData.project_code?.trim() || generateProjectCode(),
        total_project_cost:  formData.total_project_cost  ? Number(formData.total_project_cost)  : null,
        overall_progress:    Number(formData.overall_progress)    || 0,
        ui_progress:         Number(formData.ui_progress)         || 0,
        frontend_progress:   Number(formData.frontend_progress)   || 0,
        backend_progress:    Number(formData.backend_progress)    || 0,
        testing_progress:    Number(formData.testing_progress)    || 0,
        deployment_progress: Number(formData.deployment_progress) || 0,
      };
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });

      let res;
      if (isEdit) {
        res = await api.put(`/projects/${id}`, payload);
      } else {
        res = await api.post('/projects', payload);
      }

      if (!res.data.success) throw new Error(res.data.message || 'Failed');
      setSuccess(isEdit ? 'Project updated successfully!' : 'Project created successfully!');
      setTimeout(() => navigate('/admin/projects'), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save project');
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setFormData(isEdit ? BLANK : { ...BLANK, project_code: generateProjectCode() });
    setError('');
    setSuccess('');
  };

  // ── Loading skeleton while fetching edit data ────────────────────────────────
  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={30} className="animate-spin text-orange-500/70" />
          <p className="text-sm text-white/40">Loading project…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white pb-10">

      {/* Page Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate('/admin/projects')}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition shrink-0 mt-1">
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-400">
            <FileText size={11} /> {isEdit ? 'Edit Project' : 'New Project'}
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isEdit ? (formData.project_name || 'Edit Project') : 'Create a Project'}
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            {isEdit ? 'Update project details and save changes.' : 'Fill in project details, timeline, team, and documents.'}
          </p>
        </div>
      </div>

      {/* Feedback */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm px-5 py-3.5 rounded-2xl">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* ── Basic Info ── */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center"><Building2 size={15} className="text-orange-400" /></div>
            <h2 className="text-base font-bold text-white">Basic Information</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label key="project_code" className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Project Code</span>
              <div className="flex gap-2">
                <input className={`${fieldClass} flex-1`} type="text" name="project_code" value={formData.project_code} onChange={handleChange} placeholder="PRJ-001" readOnly />
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, project_code: generateProjectCode() }))} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/70 transition hover:bg-white/10 hover:text-white" title="Generate project code">
                  <RefreshCw size={15} />
                </button>
              </div>
            </label>
            {[
              ['project_name',     'Project Name *', 'text',  'e.g. Client Portal'],
              ['short_name',       'Short Name',     'text',  'CP'],
              ['project_category', 'Category',       'text',  'Web Application'],
              ['industry',         'Industry',       'text',  'Healthcare'],
            ].map(([name, label, type, ph]) => (
              <label key={name} className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">{label}</span>
                <input className={fieldClass} type={type} name={name} value={formData[name]} onChange={handleChange} placeholder={ph} />
              </label>
            ))}
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Current Status</span>
              <select className={fieldClass} name="current_status" value={formData.current_status} onChange={handleChange}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Total Cost (₹)</span>
              <input className={fieldClass} type="number" name="total_project_cost" value={formData.total_project_cost} onChange={handleChange} placeholder="500000" min="0" />
            </label>
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Overall Progress (%)</span>
              <input className={fieldClass} type="number" name="overall_progress" value={formData.overall_progress} onChange={handleChange} placeholder="0" min="0" max="100" />
            </label>
            <label className="text-sm text-white/60 md:col-span-2">
              <span className="mb-1.5 block font-medium">Description</span>
              <textarea className={`${fieldClass} min-h-[80px] resize-y`} name="description" value={formData.description} onChange={handleChange} placeholder="Describe the project scope…" />
            </label>
            <label className="text-sm text-white/60 md:col-span-2">
              <span className="mb-1.5 block font-medium">Objective</span>
              <textarea className={`${fieldClass} min-h-[70px] resize-y`} name="objective" value={formData.objective} onChange={handleChange} placeholder="Expected business outcome…" />
            </label>
            <label className="text-sm text-white/60 md:col-span-2">
              <span className="mb-1.5 block font-medium">Business Requirements</span>
              <textarea className={`${fieldClass} min-h-[70px] resize-y`} name="business_requirements" value={formData.business_requirements} onChange={handleChange} placeholder="Key business needs…" />
            </label>
          </div>
        </section>

        {/* ── Client Details ── */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center"><Users size={15} className="text-blue-400" /></div>
            <h2 className="text-base font-bold text-white">Client Details</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-white/60 md:col-span-2">
              <span className="mb-1.5 block font-medium">Select Existing Client</span>
              <select className={fieldClass} value={selectedClientId} onChange={handleClientSelect}>
                <option value="">Choose a client...</option>
                {clients.map((client) => (
                  <option key={client.id ?? client.uuid} value={client.id ?? client.uuid}>
                    {client.client_name}{client.company_name ? ` - ${client.company_name}` : ''}
                  </option>
                ))}
              </select>
            </label>
            {[
              ['client_name',    'Client Name',    'text',  'Client company'],
              ['company_name',   'Company Name',   'text',  'Q-Techx Solutions'],
              ['contact_person', 'Contact Person', 'text',  'Full name'],
              ['email',          'Email',          'email', 'name@example.com'],
              ['phone_number',   'Phone Number',   'tel',   '+91 98765 43210'],
            ].map(([name, label, type, ph]) => (
              <label key={name} className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">{label}</span>
                <input className={fieldClass} type={type} name={name} value={formData[name]} onChange={handleChange} placeholder={ph} />
              </label>
            ))}
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">NDA Signed</span>
              <select className={fieldClass} name="nda_signed" value={formData.nda_signed} onChange={handleChange}>
                <option value="No">No</option><option value="Yes">Yes</option>
              </select>
            </label>
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Agreement Uploaded</span>
              <select className={fieldClass} name="agreement_uploaded" value={formData.agreement_uploaded} onChange={handleChange}>
                <option value="No">No</option><option value="Yes">Yes</option>
              </select>
            </label>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center"><FileText size={15} className="text-violet-400" /></div>
            <h2 className="text-base font-bold text-white">Project Timeline</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['proposal_date',             'Proposal Date'],
              ['approval_date',             'Approval Date'],
              ['project_start_date',        'Start Date'],
              ['estimated_completion_date', 'Estimated Completion'],
              ['project_end_date',          'End Date'],
              ['go_live_date',              'Go Live Date'],
            ].map(([name, label]) => (
              <label key={name} className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">{label}</span>
                <input className={fieldClass} type="date" name={name} value={formData[name]} onChange={handleChange} />
              </label>
            ))}
            <label className="text-sm text-white/60 md:col-span-2">
              <span className="mb-1.5 block font-medium">Support Period</span>
              <input className={fieldClass} name="support_period" value={formData.support_period} onChange={handleChange} placeholder="e.g. 12 months" />
            </label>
          </div>
        </section>

        {/* ── Tech Stack & Team ── */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center"><Code2 size={15} className="text-emerald-400" /></div>
            <h2 className="text-base font-bold text-white">Tech Stack & Team</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['frontend_tech',       'Frontend Technology',  'React, Next.js…'],
              ['mobile_tech',         'Mobile Technology',    'React Native, Flutter…'],
              ['backend_tech',        'Backend Technology',   'Node.js, Express…'],
              ['database_tech',       'Database',             'MySQL, MongoDB…'],
              ['github_link',         'GitHub Repository',    'https://github.com/…'],
              ['domain_name',         'Domain Name',          'example.com'],
              ['sub_domain_name',     'Sub-Domain',           'app.example.com'],
              ['project_manager',     'Project Manager',      'Full name'],
              ['ui_ux_designer',      'UI/UX Designer',       'Full name'],
              ['frontend_developers', 'Frontend Developers',  'Name1, Name2…'],
              ['backend_developers',  'Backend Developers',   'Name1, Name2…'],
            ].map(([name, label, ph]) => (
              <label key={name} className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">{label}</span>
                <input className={fieldClass} name={name} value={formData[name]} onChange={handleChange} placeholder={ph} />
              </label>
            ))}
          </div>
        </section>

        {/* ── Phase Progress ── */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center"><CheckCircle size={15} className="text-cyan-400" /></div>
            <h2 className="text-base font-bold text-white">Phase Progress</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              ['ui_progress',         'UI/UX (%)'],
              ['frontend_progress',   'Frontend (%)'],
              ['backend_progress',    'Backend (%)'],
              ['testing_progress',    'Testing (%)'],
              ['deployment_progress', 'Deployment (%)'],
            ].map(([name, label]) => (
              <label key={name} className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">{label}</span>
                <input className={fieldClass} type="number" min="0" max="100" name={name} value={formData[name]} onChange={handleChange} />
              </label>
            ))}
          </div>
        </section>

        {/* ── Documents & Links ── */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center"><FileText size={15} className="text-amber-400" /></div>
            <h2 className="text-base font-bold text-white">Documents & Links</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['proposal_doc',       'Proposal Document'],
              ['quotation_doc',      'Quotation'],
              ['agreement_doc',      'Agreement'],
              ['nda_doc',            'NDA'],
              ['api_documentation',  'API Documentation'],
              ['database_schema',    'Database Schema'],
              ['source_code_backup', 'Source Code Backup'],
            ].map(([name, label]) => (
              <label key={name} className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">{label}</span>
                <input className={fieldClass} name={name} value={formData[name]} onChange={handleChange} placeholder="Link or file name" />
              </label>
            ))}
          </div>
        </section>

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Project'}
          </button>
          {!isEdit && (
            <button type="button" onClick={resetForm} disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40">
              <RefreshCw size={15} /> Reset
            </button>
          )}
          <button type="button" onClick={() => navigate('/admin/projects')} disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40">
            <ArrowLeft size={15} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
