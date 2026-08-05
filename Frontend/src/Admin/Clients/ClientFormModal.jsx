import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  UserRoundPen, Building2, Mail, Phone, User, Briefcase,
  FileText, Calendar, Clock, MessageSquare, Bell, BellOff,
  CheckCircle2, AlertCircle, Loader2, X, ShieldCheck, Upload, Paperclip, Download
} from 'lucide-react';
import Select from 'react-select';
import api from '../../api';

const CLIENT_STATUSES = ['Lead', 'Prospect', 'Active', 'Inactive', 'Converted', 'Closed'];
const SERVICE_TYPES = ['Website', 'Mobile App', 'Web App', 'Software', 'Other'];
const FOLLOW_UP_STATUSES = ['Pending', 'Follow Up', 'Completed', 'Rescheduled', 'Cancelled'];

const statusColour = {
  Lead: 'bg-sky-500/15 text-sky-400',
  Prospect: 'bg-violet-500/15 text-violet-400',
  Active: 'bg-emerald-500/15 text-emerald-400',
  Inactive: 'bg-rose-500/15 text-rose-400',
  Converted: 'bg-amber-500/15 text-amber-400',
  Closed: 'bg-white/10 text-white/50',
};
const followupColour = {
  Pending: 'bg-amber-500/15 text-amber-400',
  Completed: 'bg-emerald-500/15 text-emerald-400',
  Rescheduled: 'bg-sky-500/15 text-sky-400',
  Cancelled: 'bg-rose-500/15 text-rose-400',
};

const inp = `
  w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5
  text-sm text-white placeholder-white/30
  focus:outline-none focus:border-primary/60 focus:bg-white/8
  transition-all duration-200
`;
const selectCls = `
  w-full bg-[#1a1d24] border border-white/10 rounded-xl px-4 py-2.5
  text-sm text-white focus:outline-none focus:border-primary/60
  transition-all duration-200 cursor-pointer admin-select
`;

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#1a1d24',
    border: `1px solid ${state.isFocused
        ? '#f97316'
        : 'rgba(255,255,255,0.1)'
      }`,
    boxShadow: 'none',
    outline: 'none',
    minHeight: '42px',
    height: '42px',
    borderRadius: '12px',

    '&:hover': {
      border: '1px solid #f97316',
    },
  }),

  valueContainer: (provided) => ({
    ...provided,
    padding: '0 12px',
    fontSize: '13px',
  }),

  singleValue: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
  }),

  placeholder: (provided) => ({
    ...provided,
    color: 'rgba(255,255,255,.35)',
    fontSize: '13px',
  }),

  input: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
    margin: 0,
    padding: 0,
  }),

  menu: (provided) => ({
    ...provided,
    background: '#1a1d24',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  }),

  menuList: (provided) => ({
    ...provided,
    padding: 0,
    fontSize: '13px',
  }),

  option: (provided, state) => ({
    ...provided,
    fontSize: '13px',      // dropdown font size
    padding: '8px 14px',   // reduce option height
    backgroundColor: state.isSelected
      ? '#f97316'
      : state.isFocused
        ? 'rgba(249,115,22,.15)'
        : '#1a1d24',
    color: '#fff',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#ea580c',
    },
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),

  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#888',
    padding: '6px',
  }),
};

function buildDocumentUrl(filePath) {
  if (!filePath) return null;
  const value = `${filePath}`.replace(/\\/g, '/');
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/uploads/')) return `http://localhost:5000${value}`;
  if (value.startsWith('uploads/')) return `http://localhost:5000/${value}`;

  const match = value.match(/(?:^|\/)(uploads\/.+)$/i);
  if (match) return `http://localhost:5000/${match[1]}`;

  const fileName = value.split('/').pop();
  return fileName ? `http://localhost:5000/uploads/clients/${fileName}` : null;
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/8">
        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-primary" />
        </div>
        <h2 className="text-sm font-bold text-white tracking-wide">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ icon: Icon, text, required }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-white/50 font-medium mb-1.5">
      {Icon && <Icon size={12} className="text-primary/70" />}
      {text}
      {required && <span className="text-primary ml-0.5">*</span>}
    </label>
  );
}

function StatusPill({ value, colourMap }) {
  if (!value) return null;
  const cls = colourMap[value] || 'bg-white/10 text-white/50';
  return (
    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{value}</span>
  );
}

const DEFAULT_FORM = {
  company_name: '', client_name: '', email: '', phone_number: '',
  contact_person: '', client_status: 'Lead', service_type: '', custom_service_type: '',
  business_name: '', business_type: '', requirement: '',
  notes_summary: '', follow_up_date: '', follow_up_time: '',
  next_follow_up_date: '', next_follow_up_time: '', discussion_summary: '',
  follow_up_status: 'Pending', reminder: false,
};

export default function ClientFormModal({ isOpen, onClose, onSuccess, editClient }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [reqFile, setReqFile] = useState(null);
  const [reqName, setReqName] = useState('');
  const [reqDesc, setReqDesc] = useState('');

  const [quotFile, setQuotFile] = useState(null);
  const [quotName, setQuotName] = useState('');
  const [quotDesc, setQuotDesc] = useState('');

  const [existingDocs, setExistingDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const currentDocs = existingDocs.reduce((acc, doc) => {
    if (doc.document_type) acc[doc.document_type] = doc;
    return acc;
  }, {});

  const reqInputRef = useRef(null);
  const quotInputRef = useRef(null);

  const refreshExistingDocuments = async (clientUuid) => {
    if (!clientUuid) return;
    setLoadingDocs(true);
    try {
      const { data } = await api.get(`/clients/${clientUuid}/documents`);
      setExistingDocs(data?.data || []);
    } catch {
      setExistingDocs([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Hydrate form when modal opens or editClient changes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setSuccess('');
      setReqFile(null);
      setReqName('');
      setReqDesc('');
      setQuotFile(null);
      setQuotName('');
      setQuotDesc('');
      setExistingDocs([]);
      if (editClient) {
        refreshExistingDocuments(editClient.uuid);
        setForm({
          company_name: editClient.company_name || '',
          client_name: editClient.client_name || '',
          email: editClient.email || '',
          phone_number: editClient.phone_number || '',
          contact_person: editClient.contact_person || '',
          client_status: editClient.client_status || 'Lead',
          service_type: SERVICE_TYPES.includes(editClient.service_type) ? editClient.service_type : 'Other',
          custom_service_type: SERVICE_TYPES.includes(editClient.service_type) ? '' : (editClient.service_type || ''),
          business_name: editClient.business_name || '',
          business_type: editClient.business_type || '',
          requirement: editClient.requirement || '',
          notes_summary: editClient.notes_summary || '',
          follow_up_date: editClient.follow_up_date ? editClient.follow_up_date.split('T')[0] : '',
          follow_up_time: editClient.follow_up_time || '',
          next_follow_up_date: editClient.next_follow_up_date ? editClient.next_follow_up_date.split('T')[0] : '',
          next_follow_up_time: editClient.next_follow_up_time || '',
          discussion_summary: editClient.discussion_summary || '',
          follow_up_status: editClient.follow_up_status || 'Pending',
          reminder: !!editClient.reminder,
        });
      } else {
        setForm(DEFAULT_FORM);
      }
    }
  }, [isOpen, editClient]);

  if (!isOpen) return null;

  const set = (field) => (e) => {
    setError('');
    setForm(f => ({ ...f, [field]: e.target.value }));
  };
  const toggleReminder = () => setForm(f => ({ ...f, reminder: !f.reminder }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.client_name?.trim()) { setError('Client name is required.'); return; }
    if (!form.service_type?.trim()) { setError('Service type is required.'); return; }
    if (form.service_type === 'Other' && !form.custom_service_type?.trim()) {
      setError('Please enter a custom service type.');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.service_type === 'Other') {
        payload.service_type = payload.custom_service_type?.trim() || null;
      }
      delete payload.custom_service_type;
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null; });

      let clientUuid = editClient?.uuid;

      if (editClient) {
        const { data } = await api.put(`/clients/${editClient.uuid}`, payload);
        if (!data.success) throw new Error(data.message || 'Update failed');
      } else {
        const { data } = await api.post(`/clients`, payload);
        if (!data.success) throw new Error(data.message || 'Creation failed');
        clientUuid = data.data?.uuid;
      }

      // Upload documents if selected
      if (clientUuid) {
        if (reqFile) {
          const fd = new FormData();
          fd.append('document', reqFile);
          fd.append('document_type', 'Requirement Document');
          fd.append('document_name', reqName || reqFile.name);
          if (reqDesc) fd.append('description', reqDesc);
          await api.post(`/clients/${clientUuid}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        if (quotFile) {
          const fd = new FormData();
          fd.append('document', quotFile);
          fd.append('document_type', 'Project Quotation');
          fd.append('document_name', quotName || quotFile.name);
          if (quotDesc) fd.append('description', quotDesc);
          await api.post(`/clients/${clientUuid}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        }
        if (editClient) {
          await refreshExistingDocuments(clientUuid);
        }
      }

      setSuccess(`"${form.client_name}" saved successfully!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Drawer */}
      <div
        className="relative w-full max-w-2xl bg-[#0d0f14] border-l border-white/10 h-full overflow-hidden flex flex-col shadow-2xl"
        style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Header */}
        <div className="shrink-0 bg-[#0d0f14]/95 backdrop-blur border-b border-white/8 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <UserRoundPen size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">
                {editClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              <p className="text-white/40 text-xs mt-0.5">
                {editClient ? `Editing ${editClient.client_name}` : 'Create a new client profile'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">

          {success && (
            <div className="mb-5 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-medium px-5 py-3 rounded-2xl">
              <CheckCircle2 size={17} className="shrink-0" /> {success}
            </div>
          )}
          {error && (
            <div className="mb-5 flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm font-medium px-5 py-3 rounded-2xl">
              <AlertCircle size={17} className="shrink-0" /> {error}
            </div>
          )}

          <form id="client-form" onSubmit={handleSubmit} className="space-y-6 pb-6">
            {/* Section 1: Client Details */}
            <SectionCard icon={User} title="Client Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel icon={User} text="Client Name" required />
                  <input required className={inp} placeholder="e.g. Arjun Mehta" value={form.client_name} onChange={set('client_name')} />
                </div>
                <div>
                  <FieldLabel icon={Building2} text="Company Name" />
                  <input className={inp} placeholder="e.g. NovaTech Solutions" value={form.company_name} onChange={set('company_name')} />
                </div>
                <div>
                  <FieldLabel icon={Mail} text="Email" />
                  <input type="email" className={inp} placeholder="contact@company.com" value={form.email} onChange={set('email')} />
                </div>
                <div>
                  <FieldLabel icon={Phone} text="Phone Number" />
                  <input className={inp} placeholder="+91 98765 43210" value={form.phone_number} onChange={set('phone_number')} />
                </div>
                <div>
                  <FieldLabel icon={User} text="Contact Person" />
                  <input className={inp} placeholder="Primary point of contact" value={form.contact_person} onChange={set('contact_person')} />
                </div>
                <div>
                  <FieldLabel icon={ShieldCheck} text="Client Status" />
                  <div className="space-y-1.5">
                    <Select
                      options={CLIENT_STATUSES.map(s => ({ value: s, label: s }))}
                      value={{ value: form.client_status, label: form.client_status }}
                      onChange={(option) => setForm(f => ({ ...f, client_status: option.value }))}
                      styles={customSelectStyles}
                      theme={(theme) => ({
                        ...theme,
                        borderRadius: 12,
                        colors: {
                          ...theme.colors,
                          primary: '#c2410c',      // Removes blue
                          primary25: '#fb923c',    // Hover
                          primary50: '#ea580c',
                          primary75: '#c2410c',
                        },
                      })}
                      isSearchable={false}
                    />
                    <StatusPill value={form.client_status} colourMap={statusColour} />
                  </div>
                </div>
                <div>
                  <FieldLabel icon={Briefcase} text="Service Type" required />
                  <Select
                    options={SERVICE_TYPES.map(s => ({ value: s, label: s }))}
                    value={form.service_type ? { value: form.service_type, label: form.service_type } : null}
                    placeholder="— Select service —"
                    onChange={(option) => {
                      const value = option ? option.value : '';
                      setError('');
                      setForm(f => ({
                        ...f,
                        service_type: value,
                        custom_service_type: value === 'Other' ? f.custom_service_type : '',
                      }));
                    }}
                    styles={customSelectStyles}
                    isSearchable={false}
                    isClearable
                  />
                </div>
                <div>
                  <FieldLabel icon={Building2} text="Business Name" />
                  <input className={inp} placeholder="Registered business name" value={form.business_name} onChange={set('business_name')} />
                </div>
                {form.service_type === 'Other' && (
                  <div>
                    <FieldLabel icon={Briefcase} text="Please enter service type" required />
                    <input
                      className={inp}
                      placeholder="e.g. SaaS Platform, E-commerce"
                      value={form.custom_service_type}
                      onChange={set('custom_service_type')}
                    />
                  </div>
                )}
                <div>
                  <FieldLabel icon={Briefcase} text="Business Type" />
                  <input className={inp} placeholder="e.g. Startup, Enterprise" value={form.business_type} onChange={set('business_type')} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel icon={FileText} text="Requirement" />
                  <textarea rows={2} className={inp + ' resize-none'} placeholder="Describe the client's main requirement…" value={form.requirement} onChange={set('requirement')} />
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel icon={MessageSquare} text="Notes / Summary" />
                  <textarea rows={2} className={inp + ' resize-none'} placeholder="Any additional notes…" value={form.notes_summary} onChange={set('notes_summary')} />
                </div>
              </div>
            </SectionCard>

            {/* Section 2: Follow-up Scheduling */}
            <SectionCard icon={Calendar} title="Follow-up Scheduling">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel icon={Calendar} text="Follow-up Date" />
                  <input type="date" className={inp} value={form.follow_up_date} onChange={set('follow_up_date')} />
                </div>
                <div>
                  <FieldLabel icon={Clock} text="Follow-up Time" />
                  <input type="time" className={inp} value={form.follow_up_time} onChange={set('follow_up_time')} />
                </div>
                <div>
                  <FieldLabel icon={Calendar} text="Next Follow-up Date" />
                  <input type="date" className={inp} value={form.next_follow_up_date} onChange={set('next_follow_up_date')} />
                </div>
                <div>
                  <FieldLabel icon={Clock} text="Next Follow-up Time" />
                  <input type="time" className={inp} value={form.next_follow_up_time} onChange={set('next_follow_up_time')} />
                </div>
                <div>
                  <FieldLabel icon={ShieldCheck} text="Follow-up Status" />
                  <div className="space-y-1.5">
                    <Select
                      options={FOLLOW_UP_STATUSES.map(s => ({ value: s, label: s }))}
                      value={{ value: form.follow_up_status, label: form.follow_up_status }}
                      onChange={(option) => setForm(f => ({ ...f, follow_up_status: option.value }))}
                      styles={customSelectStyles}
                      isSearchable={false}
                    />
                    <StatusPill value={form.follow_up_status} colourMap={followupColour} />
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {form.reminder ? <Bell size={15} className="text-primary" /> : <BellOff size={15} className="text-white/40" />}
                      <div>
                        <p className="text-sm font-medium text-white">Reminder</p>
                        <p className="text-[10px] text-white/40 mt-0.5">Get notified for this follow-up</p>
                      </div>
                    </div>
                    <button type="button" onClick={toggleReminder}
                      className={`relative w-10 h-5 rounded-full transition-all duration-300 ${form.reminder ? 'bg-primary' : 'bg-white/15'}`}>
                      <span className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow transition-all duration-300 ${form.reminder ? 'left-[22px]' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <FieldLabel icon={MessageSquare} text="Discussion Summary" />
                  <textarea rows={2} className={inp + ' resize-none'} placeholder="Summarise what was discussed…" value={form.discussion_summary} onChange={set('discussion_summary')} />
                </div>
              </div>
            </SectionCard>

            {/* Section 3: Document Uploads (Optional) */}
            <SectionCard icon={Paperclip} title="Attach Documents (Optional)">
              {/* {editClient && (
                <div className="mb-4 space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Existing Documents</p>
                    {loadingDocs && <Loader2 size={14} className="animate-spin text-white/40" />}
                  </div>
                  {!loadingDocs && existingDocs.length > 0 ? (
                    <div className="space-y-2">
                      {existingDocs.map((doc) => {
                        const documentUrl = buildDocumentUrl(doc.file_path);
                        return (
                          <div key={doc.uuid} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">{doc.document_type}</p>
                            <p className="mt-1 text-sm font-medium text-white">{doc.document_name}</p>
                            {documentUrl && (
                              <a
                                href={documentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex text-sm font-medium text-primary hover:text-primary/80"
                              >
                                View Document
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : !loadingDocs ? (
                    <p className="text-sm text-white/40">No documents uploaded yet.</p>
                  ) : null}
                </div>
              )} */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Requirement Document */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Requirement Document</p>
                  {editClient && currentDocs['Requirement Document'] && (
                    <a
                      href={buildDocumentUrl(currentDocs['Requirement Document'].file_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-xs font-medium text-primary hover:text-primary/80"
                    >
                      View Current Requirement Document
                    </a>
                  )}
                  <div
                    onClick={() => reqInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-white/[0.02] transition h-36"
                  >
                    <input
                      type="file" ref={reqInputRef} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          setReqFile(file);
                          if (!reqName) {
                            const currentDoc = currentDocs['Requirement Document'];
                            setReqName(currentDoc?.document_name || file.name.split('.')[0]);
                          }
                        }
                      }}
                    />
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <Upload size={16} className="text-white/40" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">{reqFile ? reqFile.name : 'Select file'}</p>
                      {!reqFile && <p className="text-[10px] text-white/40 mt-1">PDF, DOC, XLS (Max 10MB)</p>}
                    </div>
                    {reqFile && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setReqFile(null); setReqName(''); }} className="mt-1 text-xs font-semibold text-rose-400 hover:text-rose-300">
                        Remove
                      </button>
                    )}
                  </div>
                  {reqFile && (
                    <div className="space-y-3">
                      <div>
                        <FieldLabel icon={FileText} text="Document Name" required />
                        <input required className={inp} placeholder="e.g. Requirement Spec" value={reqName} onChange={e => setReqName(e.target.value)} />
                      </div>
                      <div>
                        <FieldLabel icon={MessageSquare} text="Description" />
                        <textarea rows={1} className={inp + ' resize-none text-xs'} placeholder="Brief description…" value={reqDesc} onChange={e => setReqDesc(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Project Quotation */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Project Quotation</p>
                  {editClient && currentDocs['Project Quotation'] && (
                    <a
                      href={buildDocumentUrl(currentDocs['Project Quotation'].file_path)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-xs font-medium text-primary hover:text-primary/80"
                    >
                      View Current Project Quotation
                    </a>
                  )}
                  <div
                    onClick={() => quotInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/10 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition h-36"
                  >
                    <input
                      type="file" ref={quotInputRef} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          setQuotFile(file);
                          if (!quotName) {
                            const currentDoc = currentDocs['Project Quotation'];
                            setQuotName(currentDoc?.document_name || file.name.split('.')[0]);
                          }
                        }
                      }}
                    />
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Upload size={16} className="text-emerald-400/60" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">{quotFile ? quotFile.name : 'Select file'}</p>
                      {!quotFile && <p className="text-[10px] text-white/40 mt-1">PDF, DOC, XLS (Max 10MB)</p>}
                    </div>
                    {quotFile && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); setQuotFile(null); setQuotName(''); }} className="mt-1 text-xs font-semibold text-rose-400 hover:text-rose-300">
                        Remove
                      </button>
                    )}
                  </div>
                  {quotFile && (
                    <div className="space-y-3">
                      <div>
                        <FieldLabel icon={FileText} text="Document Name" required />
                        <input required className={inp} placeholder="e.g. Q1 Quotation" value={quotName} onChange={e => setQuotName(e.target.value)} />
                      </div>
                      <div>
                        <FieldLabel icon={MessageSquare} text="Description" />
                        <textarea rows={1} className={inp + ' resize-none text-xs'} placeholder="Brief description…" value={quotDesc} onChange={e => setQuotDesc(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </SectionCard>
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-[#0d0f14]/95 backdrop-blur border-t border-white/8 px-6 py-4 flex items-center justify-end gap-3 z-10">
          <button type="button" onClick={onClose} disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-40">
            Cancel
          </button>
          <button type="submit" form="client-form" disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-lg shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
            {loading ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><UserRoundPen size={15} /> Save Client</>}
          </button>
        </div>

      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>,
    document.body
  );
}
