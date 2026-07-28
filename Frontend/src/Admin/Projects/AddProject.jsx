import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2, FileText, RefreshCw, Save, Users, Code2, CheckCircle,
  AlertCircle, ArrowLeft, Loader2, Search, X, UserPlus, Trash2,
} from 'lucide-react';
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
function EmployeePicker({ role, onSelect, onClose }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/employees?limit=200');
        setEmployees(data.data || []);
      } catch (_) { setEmployees([]); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = employees.filter(e => {
    const full = `${e.first_name} ${e.last_name} ${e.designation || ''}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111318] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8 shrink-0">
          <div>
            <h3 className="text-white font-bold text-base">Select Employee</h3>
            <p className="text-white/40 text-xs mt-0.5">Assign as <span className="text-orange-400 font-semibold">{role}</span></p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition">
            <X size={15} />
          </button>
        </div>
        {/* Search */}
        <div className="p-4 border-b border-white/[0.06] shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or designation…"
              className="w-full bg-white/[0.04] border border-white/10 text-white text-sm rounded-xl pl-9 pr-4 py-2 outline-none focus:border-orange-500/50 transition placeholder:text-white/20" />
          </div>
        </div>
        {/* List */}
        <div className="overflow-y-auto flex-1 p-3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={22} className="animate-spin text-orange-500/60" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-white/30 text-sm py-10">No employees found</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((e, i) => (
                <button key={e.employee_id} onClick={() => onSelect(e)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-orange-500/10 hover:border-orange-500/20 border border-transparent transition text-left">
                  <EmpAvatar name={`${e.first_name} ${e.last_name}`} index={i} />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{e.first_name} {e.last_name}</p>
                    <p className="text-white/40 text-xs truncate">{e.designation || 'No designation'}</p>
                  </div>
                  <div className="ml-auto shrink-0">
                    <span className="text-[10px] font-bold text-orange-400 border border-orange-500/25 bg-orange-500/10 px-2 py-0.5 rounded-full">Select</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Team Field with Picker ────────────────────────────────────────────────────
function TeamField({ label, fieldName, value, onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  const handleSelect = (emp) => {
    const name = `${emp.first_name} ${emp.last_name}`;
    // For multi-person roles, append; for single roles, replace
    const isSingle = fieldName === 'project_manager' || fieldName === 'ui_ux_designer';
    if (isSingle) {
      onChange(fieldName, name);
    } else {
      const existing = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
      if (!existing.includes(name)) existing.push(name);
      onChange(fieldName, existing.join(', '));
    }
    setShowPicker(false);
  };

  const handleClear = () => onChange(fieldName, '');

  return (
    <>
      {showPicker && <EmployeePicker role={label} onSelect={handleSelect} onClose={() => setShowPicker(false)} />}
      <label className="text-sm text-white/60">
        <span className="mb-1.5 block font-medium">{label}</span>
        <div className="flex gap-2">
          <input className={fieldClass} name={fieldName} value={value}
            onChange={e => onChange(fieldName, e.target.value)}
            placeholder={`Type or pick ${label.toLowerCase()}…`} />
          <button type="button" onClick={() => setShowPicker(true)}
            className="shrink-0 w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/25 text-orange-400 hover:bg-orange-500/25 flex items-center justify-center transition" title={`Pick ${label}`}>
            <UserPlus size={15} />
          </button>
          {value && (
            <button type="button" onClick={handleClear}
              className="shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition" title="Clear">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </label>
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AddProject() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData]         = useState(BLANK);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [projectCodeLoading, setProjectCodeLoading] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientFilter, setClientFilter] = useState('');
  const [selectedClientUuid, setSelectedClientUuid] = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');

  useEffect(() => {
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

  const handleTeamChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.project_name.trim()) { setError('Project name is required.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const payload = {
        ...formData,
        total_project_cost:  formData.total_project_cost  ? Number(formData.total_project_cost)  : null,
        overall_progress:    Number(formData.overall_progress)    || 0,
        ui_progress:         Number(formData.ui_progress)         || 0,
        frontend_progress:   Number(formData.frontend_progress)   || 0,
        backend_progress:    Number(formData.backend_progress)    || 0,
        testing_progress:    Number(formData.testing_progress)    || 0,
        deployment_progress: Number(formData.deployment_progress) || 0,
      };
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });
      const res = isEdit
        ? await api.put(`/projects/${id}`, payload)
        : await api.post('/projects', payload);
      if (!res.data.success) throw new Error(res.data.message || 'Failed');
      setSuccess(isEdit ? 'Project updated!' : 'Project created!');
      setTimeout(() => navigate('/admin/projects'), 1400);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save project');
    } finally { setLoading(false); }
  };

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
              <span className="mb-1.5 block font-medium">Agreement Uploaded</span>
              <select className={fieldClass} name="agreement_uploaded" value={formData.agreement_uploaded} onChange={handleChange}>
                <option value="No">No</option><option value="Yes">Yes</option>
              </select>
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

        {/* Team Assignment with Employee Picker */}
        <section className={sectionClass}>
          <div className="mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/15 flex items-center justify-center"><Users size={15} className="text-pink-400" /></div>
            <div>
              <h2 className="text-base font-bold text-white">Team Assignment</h2>
              <p className="text-white/35 text-xs mt-0.5">Click <UserPlus size={10} className="inline" /> to pick from employee list</p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <TeamField label="Project Manager"     fieldName="project_manager"     value={formData.project_manager}     onChange={handleTeamChange} />
            <TeamField label="UI/UX Designer"      fieldName="ui_ux_designer"      value={formData.ui_ux_designer}      onChange={handleTeamChange} />
            <TeamField label="Frontend Developers" fieldName="frontend_developers" value={formData.frontend_developers} onChange={handleTeamChange} />
            <TeamField label="Backend Developers"  fieldName="backend_developers"  value={formData.backend_developers}  onChange={handleTeamChange} />
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
            {[['proposal_doc','Proposal'],['quotation_doc','Quotation'],['agreement_doc','Agreement'],['nda_doc','NDA'],['api_documentation','API Docs'],['database_schema','DB Schema'],['source_code_backup','Source Code Backup']].map(([name,label]) => (
              <label key={name} className="text-sm text-white/60">
                <span className="mb-1.5 block font-medium">{label}</span>
                <input className={fieldClass} name={name} value={formData[name]} onChange={handleChange} placeholder="Link or file name" />
              </label>
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Project'}
          </button>
          {!isEdit && (
            <button type="button" onClick={() => { setFormData(BLANK); setError(''); setSuccess(''); }} disabled={loading}
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
