import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Building2, FileText, RefreshCw, Save, Users, Code2, CheckCircle,
  AlertCircle, ArrowLeft, Loader2, Search, X, UserPlus, Trash2,
} from 'lucide-react';
import api, { API_URL } from '../../api';
import { calculateProjectTotal } from './projectCostUtils';

const BACKEND_BASE_URL = API_URL.replace(/\/api$/, '');

function buildUploadUrl(filePath) {
  if (!filePath) return null;
  const normalized = `${filePath}`.replace(/\\/g, '/');
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith('/uploads/')) return `${BACKEND_BASE_URL}${normalized}`;
  if (normalized.startsWith('uploads/')) return `${BACKEND_BASE_URL}/${normalized}`;
  return `${BACKEND_BASE_URL}/uploads/${normalized}`;
}

const BLANK = {
  project_code: '', project_name: '', short_name: '', project_category: '', industry: '',
  description: '', objective: '', business_requirements: '',
  client_name: '', company_name: '', contact_person: '', email: '', phone_number: '',
  nda_signed: 'No', agreement_uploaded: 'No',
  total_project_cost: '', current_status: 'Planning', overall_progress: '0',
  proposal_date: '', approval_date: '', project_start_date: '', estimated_completion_date: '',
  project_end_date: '', go_live_date: '', support_period: '',
  is_extended_project: false, extended_project_amount: '',
  frontend_tech: '', mobile_tech: '', backend_tech: '', database_tech: '',
  github_link: '', domain_name: '', sub_domain_name: '',
  project_manager: '', ui_ux_designer: '', frontend_developers: '', backend_developers: '',
  ui_progress: '0', frontend_progress: '0', backend_progress: '0',
  testing_progress: '0', deployment_progress: '0',
  proposal_doc: '', quotation_doc: '', agreement_doc: '', nda_doc: '',
  api_documentation: '', database_schema: '', source_code_backup: '',
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
  is_extended_project: Boolean(p.is_extended_project),
  extended_project_amount: p.extended_project_amount != null ? String(p.extended_project_amount) : '',
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
const DOCUMENT_FIELDS = ['proposal_doc','quotation_doc','api_documentation','database_schema','source_code_backup'];

const AVATAR_COLOURS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#f97316','#8b5cf6'];
const initials = (n = '') => n.trim().split(' ').slice(0,2).map(w => w[0]||'').join('').toUpperCase() || '?';
function EmpAvatar({ name, index, size = 8 }) {
  const c = AVATAR_COLOURS[(index||0) % AVATAR_COLOURS.length];
  return (
    <div className={`w-${size} h-${size} rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0`}
      style={{ background: c+'28', border:`1px solid ${c}44`, color: c }}>
      {initials(name)}
    </div>
  );
}

// ── Employee Picker Popup ─────────────────────────────────────────────────────


// ── Main Component ────────────────────────────────────────────────────────────
export default function AddProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData]         = useState(BLANK);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [projectCodeLoading, setProjectCodeLoading] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientFilter, setClientFilter] = useState('');
  const [selectedClientUuid, setSelectedClientUuid] = useState('');
  const [documentFiles, setDocumentFiles] = useState({});
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  useEffect(() => {
    setSuccess('');
    setError('');
    if (!isEdit) {
      setFormData(BLANK);
      setDocumentFiles({});
    } else {
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
    }
  }, [id, isEdit]);

  useEffect(() => {
    (async () => {
      setClientLoading(true);
      try {
        const { data } = await api.get('/clients?limit=500&page=1');
        if (data.success && Array.isArray(data.data)) {
          setClients(data.data);
        } else if (data.success && data.data?.rows) {
          setClients(data.data.rows);
        }
      } catch (err) {
        console.warn('Failed to load clients for project form:', err?.message || err);
      } finally {
        setClientLoading(false);
      }
    })();
  }, []);

  const handleSelectClient = (uuid) => {
    setSelectedClientUuid(uuid);
    const client = clients.find((c) => c.uuid === uuid || c.id === uuid);
    if (!client) return;
    setFormData((prev) => ({
      ...prev,
      client_name: client.client_name || prev.client_name,
      company_name: client.company_name || prev.company_name,
      contact_person: client.contact_person || prev.contact_person,
      email: client.email || prev.email,
      phone_number: client.phone_number || prev.phone_number,
    }));
  };

  useEffect(() => {
    if (isEdit || formData.project_code.trim()) return;
    (async () => {
      setProjectCodeLoading(true);
      try {
        const { data } = await api.get('/projects/next-code');
        if (!data.success) throw new Error(data.message || 'Failed to generate project code');
        setFormData(prev => ({ ...prev, project_code: data.code || '' }));
      } catch (err) {
        console.warn('Project code generation failed:', err?.message || err);
      } finally { setProjectCodeLoading(false); }
    })();
  }, [isEdit, formData.project_code]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExtendedProjectToggle = (checked) => {
    setFormData(prev => ({
      ...prev,
      is_extended_project: checked,
      extended_project_amount: checked ? prev.extended_project_amount : '',
    }));
  };

  const handleFileChange = (name, file) => {
    setDocumentFiles(prev => ({ ...prev, [name]: file }));
    if (name === 'agreement_doc' && file) {
      setFormData(prev => ({ ...prev, agreement_uploaded: 'Yes' }));
    }
    if (name === 'nda_doc' && file) {
      setFormData(prev => ({ ...prev, nda_signed: 'Yes' }));
    }
  };

  const handleTeamChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.project_name.trim()) { setError('Project name is required.'); return; }
    if (formData.agreement_uploaded === 'Yes' && !documentFiles.agreement_doc && !formData.agreement_doc) {
      setError('Agreement upload is required when Agreement Uploaded is set to Yes.');
      return;
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      const form = new FormData();
      const totalProjectCost = calculateProjectTotal({
        baseAmount: formData.total_project_cost,
        extensionAmount: formData.extended_project_amount,
        isExtended: Boolean(formData.is_extended_project),
      });
      const payload = {
        ...formData,
        total_project_cost: totalProjectCost || (formData.total_project_cost ? Number(formData.total_project_cost) : null),
        overall_progress:    Number(formData.overall_progress)    || 0,
        ui_progress:         Number(formData.ui_progress)         || 0,
        frontend_progress:   Number(formData.frontend_progress)   || 0,
        backend_progress:    Number(formData.backend_progress)    || 0,
        testing_progress:    Number(formData.testing_progress)    || 0,
        deployment_progress: Number(formData.deployment_progress) || 0,
      };
      Object.keys(payload).forEach((k) => {
        const value = payload[k];
        if (DOCUMENT_FIELDS.includes(k) || k === 'nda_doc' || k === 'agreement_doc') return;
        if (value === '' || value === null || value === undefined) return;
        form.append(k, value);
      });
      const documentFieldsToSend = [...DOCUMENT_FIELDS, 'nda_doc'];
      documentFieldsToSend.forEach((field) => {
        if (documentFiles[field]) {
          form.append(field, documentFiles[field]);
        }
      });
      const res = isEdit
        ? await api.put(`/projects/${id}`, form)
        : await api.post('/projects', form);
      if (!res.data.success) throw new Error(res.data.message || 'Failed');
      setSuccess(isEdit ? 'Project updated!' : 'Project created!');
      setTimeout(() => {
        navigate('/admin/projects');
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save project');
    } finally { setLoading(false); }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={30} className="animate-spin text-orange-500/70" />
          <p className="text-sm text-white/40">Loading project…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6 text-white min-h-screen">
      <div className="w-full bg-[#0d0f14] border border-white/10 rounded-2xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="shrink-0 bg-[#0d0f14]/95 backdrop-blur border-b border-white/8 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center">
              <FileText size={18} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">
                {isEdit ? (formData.project_name || 'Edit Project') : 'Create a Project'}
              </h2>
              <p className="text-white/40 text-xs mt-0.5">
                {isEdit ? 'Update project details and save changes.' : 'Fill in project details, timeline, team, and documents.'}
              </p>
            </div>
          </div>
          <button onClick={() => navigate('/admin/projects')} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-5">
          {success && (
            <div className="mb-5 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm px-5 py-3.5 rounded-2xl">
              <CheckCircle size={16} /> {success}
            </div>
          )}
          {error && (
            <div className="mb-5 flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form id="project-form" onSubmit={handleSave} className="space-y-6 pb-6">
        {/* Basic Info */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center"><Building2 size={15} className="text-orange-400" /></div>
            <h2 className="text-base font-bold text-white">Basic Information</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {['project_code','project_name','short_name','project_category','industry'].map((name) => {
              const labels = {
                project_code: 'Project Code',
                project_name: 'Project Name *',
                short_name: 'Short Name',
                project_category: 'Category',
                industry: 'Industry',
              };
              const placeholders = {
                project_code: 'PRJ-001',
                project_name: 'e.g. Client Portal',
                short_name: 'CP',
                project_category: 'Web Application',
                industry: 'Healthcare',
              };
              const type = name === 'project_code' ? 'text' : 'text';
              return (
                <label key={name} className="text-sm text-white/60">
                  <span className="mb-1.5 block font-medium">{labels[name]}</span>
                  <div className="flex gap-2">
                    <input className={fieldClass} type={type} name={name} value={formData[name]} onChange={handleChange} placeholder={placeholders[name]} />
                    {name === 'project_code' && (
                      <button type="button" onClick={async () => {
                        setProjectCodeLoading(true);
                        try {
                          const { data } = await api.get('/projects/next-code');
                          if (data.success) setFormData(prev => ({ ...prev, project_code: data.code || '' }));
                        } catch (err) {
                          console.warn('Failed to regenerate project code', err);
                        } finally {
                          setProjectCodeLoading(false);
                        }
                      }}
                      className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition flex items-center justify-center"
                      title="Regenerate project code">
                        {projectCodeLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      </button>
                    )}
                  </div>
                </label>
              );
            })}
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
              <span className="mb-1.5 block font-medium">Extended Project</span>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#0e1118] px-3 py-3">
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="radio"
                    name="is_extended_project"
                    checked={Boolean(formData.is_extended_project)}
                    onChange={() => handleExtendedProjectToggle(true)}
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="radio"
                    name="is_extended_project"
                    checked={!Boolean(formData.is_extended_project)}
                    onChange={() => handleExtendedProjectToggle(false)}
                  />
                  <span>No</span>
                </label>
                {Boolean(formData.is_extended_project) && (
                  <div className="flex-1 min-w-[220px]">
                    <input
                      className={fieldClass}
                      type="number"
                      name="extended_project_amount"
                      value={formData.extended_project_amount}
                      onChange={handleChange}
                      placeholder="Enter extension amount"
                      min="0"
                    />
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-white/40">
                Total cost will be {formData.total_project_cost ? `${Number(formData.total_project_cost).toLocaleString('en-IN')} + extension` : 'base amount + extension'} when enabled.
              </p>
            </label>
            <label className="text-sm text-white/60 md:col-span-2">
              <span className="mb-1.5 block font-medium">Calculated Total Cost (₹)</span>
              <input
                className={`${fieldClass} bg-white/5 text-orange-300`}
                type="text"
                readOnly
                value={calculateProjectTotal({
                  baseAmount: formData.total_project_cost,
                  extensionAmount: formData.extended_project_amount,
                  isExtended: Boolean(formData.is_extended_project),
                }).toLocaleString('en-IN')}
              />
            </label>
            <label className="text-sm text-white/60 md:col-span-2">
              <span className="mb-1.5 block font-medium">Description</span>
              <textarea className={`${fieldClass} min-h-20 resize-y`} name="description" value={formData.description} onChange={handleChange} placeholder="Describe the project scope…" />
            </label>
            <label className="text-sm text-white/60 md:col-span-2">
              <span className="mb-1.5 block font-medium">Objective</span>
              <textarea className={`${fieldClass} min-h-17.5 resize-y`} name="objective" value={formData.objective} onChange={handleChange} placeholder="Expected business outcome…" />
            </label>
            <label className="text-sm text-white/60 md:col-span-2">
              <span className="mb-1.5 block font-medium">Business Requirements</span>
              <textarea className={`${fieldClass} min-h-17.5 resize-y`} name="business_requirements" value={formData.business_requirements} onChange={handleChange} placeholder="Key business needs…" />
            </label>
          </div>
        </section>

        {/* Client Details */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center"><Users size={15} className="text-blue-400" /></div>
            <h2 className="text-base font-bold text-white">Client Details</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-white/60 md:col-span-2">
              <span className="mb-1.5 block font-medium">Select Existing Client</span>
              <div className="flex gap-2">
                <select className={fieldClass} value={selectedClientUuid} onChange={(e) => handleSelectClient(e.target.value)}>
                  <option value="">Choose a client to auto-fill details</option>
                  {clientLoading ? (
                    <option value="">Loading clients...</option>
                  ) : clients.length === 0 ? (
                    <option value="">No clients available</option>
                  ) : (
                    clients
                      .filter((client) => {
                        if (!clientFilter.trim()) return true;
                        const term = clientFilter.toLowerCase();
                        return [client.client_name, client.company_name, client.email, client.phone_number]
                          .filter(Boolean)
                          .some((value) => value.toLowerCase().includes(term));
                      })
                      .map((client) => (
                        <option key={client.uuid || client.id} value={client.uuid || client.id}>
                          {client.client_name || 'Unnamed client'}{client.company_name ? ` — ${client.company_name}` : ''}
                        </option>
                      ))
                  )}
                </select>
                <button type="button" onClick={() => setSelectedClientUuid('')}
                  className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition"
                  title="Clear client selection">
                  <X size={18} />
                </button>
              </div>
            </label>
            <label className="text-sm text-white/60 md:col-span-2">
              <span className="mb-1.5 block font-medium">Search clients</span>
              <input className={fieldClass} value={clientFilter} onChange={(e) => setClientFilter(e.target.value)} placeholder="Filter client list…" />
            </label>
            {[['client_name','Client Name','text','Client company'],['company_name','Company Name','text','Q-Techx Solutions'],['contact_person','Contact Person','text','Full name'],['email','Email','email','name@example.com'],['phone_number','Phone Number','tel','+91 98765 43210']].map(([name,label,type,ph]) => (
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
              <span className="mb-1.5 block font-medium">Upload NDA Document</span>
              <input className={fieldClass} type="file" name="nda_doc" onChange={(e) => handleFileChange('nda_doc', e.target.files?.[0] || null)} />
              {documentFiles.nda_doc ? (
                <p className="mt-2 text-xs text-white/50">Selected NDA: {documentFiles.nda_doc.name}</p>
              ) : formData.nda_doc ? (
                <a href={buildUploadUrl(formData.nda_doc)} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-orange-300 underline truncate">
                  View current NDA
                </a>
              ) : null}
            </label>
            <label className="text-sm text-white/60">
              <span className="mb-1.5 block font-medium">Agreement Uploaded</span>
              <select className={fieldClass} name="agreement_uploaded" value={formData.agreement_uploaded} onChange={handleChange}>
                <option value="No">No</option><option value="Yes">Yes</option>
              </select>
              {formData.agreement_uploaded === 'Yes' && (
                <p className="mt-1 text-xs text-orange-300">Yes means you should upload the agreement file below.</p>
              )}
            </label>
          </div>
        </section>

        {/* Timeline */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 flex items-center justify-center"><FileText size={15} className="text-violet-400" /></div>
            <h2 className="text-base font-bold text-white">Project Timeline</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[['proposal_date','Proposal Date'],['approval_date','Approval Date'],['project_start_date','Start Date'],['estimated_completion_date','Estimated Completion'],['project_end_date','End Date'],['go_live_date','Go Live Date']].map(([name,label]) => (
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

        {/* Tech Stack */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center"><Code2 size={15} className="text-emerald-400" /></div>
            <h2 className="text-base font-bold text-white">Tech Stack</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[['frontend_tech','Frontend Technology','React, Next.js…'],['mobile_tech','Mobile Technology','React Native, Flutter…'],['backend_tech','Backend Technology','Node.js, Express…'],['database_tech','Database','MySQL, MongoDB…'],['github_link','GitHub Repository','https://github.com/…'],['domain_name','Domain Name','example.com'],['sub_domain_name','Sub-Domain','app.example.com']].map(([name,label,ph]) => (
              <label key={name} className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">{label}</span>
                <input className={fieldClass} name={name} value={formData[name]} onChange={handleChange} placeholder={ph} />
              </label>
            ))}
          </div>
        </section>

        {/* Phase Progress */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center"><CheckCircle size={15} className="text-cyan-400" /></div>
            <h2 className="text-base font-bold text-white">Phase Progress</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[['ui_progress','UI/UX (%)'],['frontend_progress','Frontend (%)'],['backend_progress','Backend (%)'],['testing_progress','Testing (%)'],['deployment_progress','Deployment (%)']].map(([name,label]) => (
              <label key={name} className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">{label}</span>
                <input className={fieldClass} type="number" min="0" max="100" name={name} value={formData[name]} onChange={handleChange} />
              </label>
            ))}
          </div>
        </section>

        {/* Documents */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center"><FileText size={15} className="text-amber-400" /></div>
            <h2 className="text-base font-bold text-white">Documents & Links</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-white/60 md:col-span-2">
              <span className="mb-1.5 block font-medium">Upload Agreement</span>
              <input className={fieldClass} type="file" name="agreement_doc" onChange={(e) => handleFileChange('agreement_doc', e.target.files?.[0] || null)} />
              {documentFiles.agreement_doc ? (
                <p className="mt-2 text-xs text-white/50">Selected: {documentFiles.agreement_doc.name}</p>
              ) : formData.agreement_doc ? (
                <a href={buildUploadUrl(formData.agreement_doc)} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-orange-300 underline truncate">
                  View current agreement
                </a>
              ) : null}
            </label>
            {DOCUMENT_FIELDS.map((name) => {
              const labels = {
                proposal_doc: 'Proposal',
                quotation_doc: 'Quotation',
                agreement_doc: 'Agreement',
                api_documentation: 'API Docs',
                database_schema: 'DB Schema',
                source_code_backup: 'Source Code Backup',
              };
              const existingUrl = formData[name];
              const selectedFile = documentFiles[name];
              return (
                <label key={name} className="text-sm text-white/60">
                  <span className="mb-1.5 block font-medium">{labels[name]}</span>
                  <input className={fieldClass} type="file" name={name} onChange={(e) => handleFileChange(name, e.target.files?.[0] || null)} />
                  {selectedFile ? (
                    <p className="mt-2 text-xs text-white/50">Selected: {selectedFile.name}</p>
                  ) : existingUrl ? (
                    <a href={buildUploadUrl(existingUrl)} target="_blank" rel="noreferrer" className="mt-2 block text-xs text-orange-300 underline truncate">
                      View current {labels[name].toLowerCase()}
                    </a>
                  ) : null}
                </label>
              );
            })}
          </div>
        </section>

          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-[#0d0f14]/95 backdrop-blur border-t border-white/8 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
          {!isEdit && (
            <button type="button" onClick={() => { setFormData(BLANK); setError(''); setSuccess(''); }} disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-40">
              Reset
            </button>
          )}
          <button type="button" onClick={() => navigate('/admin/projects')} disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-40">
            Cancel
          </button>
          <button type="submit" form="project-form" disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-lg shadow-orange-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
