import { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserRoundPlus, Building2, Mail, Phone, User, Briefcase,
  FileText, ChevronLeft, Calendar, Clock, MessageSquare,
  Bell, BellOff, Upload, Trash2, CheckCircle2, AlertCircle,
  Loader2, Hash, Info, FilePlus2, ShieldCheck,
} from 'lucide-react';
import api from '../../api';

// ─── Constants (mirror backend) ──────────────────────────────────────────────
const CLIENT_STATUSES   = ['Lead', 'Prospect', 'Active', 'Inactive', 'Converted', 'Closed'];
const SERVICE_TYPES     = ['Website', 'Mobile App', 'Web App', 'Software', 'Other'];
const FOLLOW_UP_STATUSES = ['Pending', 'Completed', 'Rescheduled', 'Cancelled'];
const DOCUMENT_TYPES    = ['Requirement Document', 'Project Quotation'];
const ALLOWED_EXTS      = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
const MAX_FILE_BYTES    = 10 * 1024 * 1024; // 10 MB

// ─── Status badge colours ─────────────────────────────────────────────────────
const statusColour = {
  Lead:      'bg-sky-500/15 text-sky-400',
  Prospect:  'bg-violet-500/15 text-violet-400',
  Active:    'bg-emerald-500/15 text-emerald-400',
  Inactive:  'bg-rose-500/15 text-rose-400',
  Converted: 'bg-amber-500/15 text-amber-400',
  Closed:    'bg-white/10 text-white/50',
};
const followupColour = {
  Pending:     'bg-amber-500/15 text-amber-400',
  Completed:   'bg-emerald-500/15 text-emerald-400',
  Rescheduled: 'bg-sky-500/15 text-sky-400',
  Cancelled:   'bg-rose-500/15 text-rose-400',
};

// ─── Initial state ────────────────────────────────────────────────────────────
const initForm = {
  company_name:       '',
  client_name:        '',
  email:              '',
  phone_number:       '',
  contact_person:     '',
  client_status:      'Lead',
  service_type:       '',
  business_name:      '',
  business_type:      '',
  requirement:        '',
  notes_summary:      '',
  follow_up_date:     '',
  follow_up_time:     '',
  next_follow_up_date:'',
  next_follow_up_time:'',
  discussion_summary: '',
  follow_up_status:   'Pending',
  reminder:           false,
};

const initDocs = {
  'Requirement Document': { file: null, name: '' },
  'Project Quotation':    { file: null, name: '' },
};

// ─── Shared styles ────────────────────────────────────────────────────────────
const inp = `
  w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5
  text-sm text-white placeholder-white/30
  focus:outline-none focus:border-primary/60 focus:bg-white/8
  transition-all duration-200
`;

const selectCls = `
  w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5
  text-sm text-white focus:outline-none focus:border-primary/60
  transition-all duration-200 cursor-pointer
`;

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-2.5 pb-4 border-b border-white/8">
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
    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>
      {value}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddClient() {
  const navigate  = useNavigate();
  const uid       = useId();
  const [form, setForm]     = useState(initForm);
  const [docs, setDocs]     = useState(initDocs);
  const [loading, setLoading] = useState(false);
  const [error,   setError]  = useState('');
  const [success, setSuccess] = useState('');
  const [docErrors, setDocErrors] = useState({});

  // ── Helpers ──
  const set = (field) => (e) => {
    setError('');
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const toggleReminder = () =>
    setForm((f) => ({ ...f, reminder: !f.reminder }));

  // ── Doc handlers ──
  const handleDocFile = (type) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      setDocErrors((d) => ({ ...d, [type]: 'Only PDF, DOC, DOCX, XLS, XLSX allowed' }));
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setDocErrors((d) => ({ ...d, [type]: 'File must be ≤ 10 MB' }));
      e.target.value = '';
      return;
    }
    setDocErrors((d) => ({ ...d, [type]: '' }));
    setDocs((d) => ({ ...d, [type]: { ...d[type], file } }));
  };

  const handleDocName = (type) => (e) =>
    setDocs((d) => ({ ...d, [type]: { ...d[type], name: e.target.value } }));

  const removeDoc = (type) => {
    setDocs((d) => ({ ...d, [type]: { file: null, name: '' } }));
    setDocErrors((d) => ({ ...d, [type]: '' }));
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required doc names when file is picked
    for (const type of DOCUMENT_TYPES) {
      if (docs[type].file && !docs[type].name.trim()) {
        setError(`Please enter a document name for "${type}".`);
        return;
      }
    }

    setLoading(true);
    try {
      // 1. Create client
      const payload = {
        ...form,
        reminder: form.reminder ? true : false,
      };
      // strip empty strings → null
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '') payload[k] = null;
      });

      const { data: res } = await api.post('/clients', payload);
      if (!res.success) throw new Error(res.message || 'Failed to create client');

      const clientUUID = res.data.uuid;

      // 2. Upload documents
      for (const docType of DOCUMENT_TYPES) {
        const { file, name } = docs[docType];
        if (!file) continue;

        const fd = new FormData();
        fd.append('document', file);
        fd.append('document_type', docType);
        fd.append('document_name', name.trim());

        await api.post(`/clients/${clientUUID}/documents`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSuccess(`Client "${res.data.client_name}" created successfully!`);
      setTimeout(() => navigate('/admin/clients'), 1800);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initForm);
    setDocs(initDocs);
    setError('');
    setSuccess('');
    setDocErrors({});
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-10 text-white min-h-screen max-w-5xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-center gap-4">
        <a
          href="#/admin/clients"
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
        >
          <ChevronLeft size={18} />
        </a>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <UserRoundPlus size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Add New Client</h1>
            <p className="text-white/40 text-xs mt-0.5">Fill in the details to onboard a new client</p>
          </div>
        </div>
      </div>

      {/* ── Success Banner ── */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-medium px-5 py-3.5 rounded-2xl animate-pulse">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" id="add-client-form">

        {/* ══════════════════════════════════════════
            SECTION 1 — CLIENT DETAILS
        ══════════════════════════════════════════ */}
        <SectionCard icon={User} title="Client Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Client Name */}
            <div>
              <FieldLabel icon={User} text="Client Name" required />
              <input
                id={`${uid}-client-name`}
                required
                className={inp}
                placeholder="e.g. Arjun Mehta"
                value={form.client_name}
                onChange={set('client_name')}
              />
            </div>

            {/* Company Name */}
            <div>
              <FieldLabel icon={Building2} text="Company Name" />
              <input
                id={`${uid}-company-name`}
                className={inp}
                placeholder="e.g. NovaTech Solutions"
                value={form.company_name}
                onChange={set('company_name')}
              />
            </div>

            {/* Email */}
            <div>
              <FieldLabel icon={Mail} text="Email" />
              <input
                id={`${uid}-email`}
                type="email"
                className={inp}
                placeholder="contact@company.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>

            {/* Phone */}
            <div>
              <FieldLabel icon={Phone} text="Phone Number" />
              <input
                id={`${uid}-phone`}
                className={inp}
                placeholder="+91 98765 43210"
                value={form.phone_number}
                onChange={set('phone_number')}
              />
            </div>

            {/* Contact Person */}
            <div>
              <FieldLabel icon={User} text="Contact Person" />
              <input
                id={`${uid}-contact-person`}
                className={inp}
                placeholder="Primary point of contact"
                value={form.contact_person}
                onChange={set('contact_person')}
              />
            </div>

            {/* Client Status */}
            <div>
              <FieldLabel icon={ShieldCheck} text="Client Status" />
              <div className="space-y-1.5">
                <select
                  id={`${uid}-client-status`}
                  className={selectCls}
                  value={form.client_status}
                  onChange={set('client_status')}
                >
                  {CLIENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <StatusPill value={form.client_status} colourMap={statusColour} />
              </div>
            </div>

            {/* Service Type */}
            <div>
              <FieldLabel icon={Briefcase} text="Service Type" />
              <select
                id={`${uid}-service-type`}
                className={selectCls}
                value={form.service_type}
                onChange={set('service_type')}
              >
                <option value="">— Select service —</option>
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Business Name */}
            <div>
              <FieldLabel icon={Building2} text="Business Name" />
              <input
                id={`${uid}-business-name`}
                className={inp}
                placeholder="Registered business name"
                value={form.business_name}
                onChange={set('business_name')}
              />
            </div>

            {/* Business Type */}
            <div>
              <FieldLabel icon={Briefcase} text="Business Type" />
              <input
                id={`${uid}-business-type`}
                className={inp}
                placeholder="e.g. Startup, Enterprise, SME"
                value={form.business_type}
                onChange={set('business_type')}
              />
            </div>

            {/* Requirement */}
            <div className="sm:col-span-2">
              <FieldLabel icon={FileText} text="Requirement" />
              <textarea
                id={`${uid}-requirement`}
                rows={3}
                className={inp + ' resize-none'}
                placeholder="Describe the client's main requirement…"
                value={form.requirement}
                onChange={set('requirement')}
              />
            </div>

            {/* Notes / Summary */}
            <div className="sm:col-span-2">
              <FieldLabel icon={MessageSquare} text="Notes / Summary" />
              <textarea
                id={`${uid}-notes`}
                rows={3}
                className={inp + ' resize-none'}
                placeholder="Any additional notes or summary…"
                value={form.notes_summary}
                onChange={set('notes_summary')}
              />
            </div>

          </div>
        </SectionCard>

        {/* ══════════════════════════════════════════
            SECTION 2 — FOLLOW-UP SCHEDULING
        ══════════════════════════════════════════ */}
        <SectionCard icon={Calendar} title="Follow-up Scheduling">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Follow-up Date */}
            <div>
              <FieldLabel icon={Calendar} text="Follow-up Date" />
              <input
                id={`${uid}-follow-up-date`}
                type="date"
                className={inp}
                value={form.follow_up_date}
                onChange={set('follow_up_date')}
              />
            </div>

            {/* Follow-up Time */}
            <div>
              <FieldLabel icon={Clock} text="Follow-up Time" />
              <input
                id={`${uid}-follow-up-time`}
                type="time"
                className={inp}
                value={form.follow_up_time}
                onChange={set('follow_up_time')}
              />
            </div>

            {/* Next Follow-up Date */}
            <div>
              <FieldLabel icon={Calendar} text="Next Follow-up Date" />
              <input
                id={`${uid}-next-follow-up-date`}
                type="date"
                className={inp}
                value={form.next_follow_up_date}
                onChange={set('next_follow_up_date')}
              />
            </div>

            {/* Next Follow-up Time */}
            <div>
              <FieldLabel icon={Clock} text="Next Follow-up Time" />
              <input
                id={`${uid}-next-follow-up-time`}
                type="time"
                className={inp}
                value={form.next_follow_up_time}
                onChange={set('next_follow_up_time')}
              />
            </div>

            {/* Follow-up Status */}
            <div>
              <FieldLabel icon={ShieldCheck} text="Follow-up Status" />
              <div className="space-y-1.5">
                <select
                  id={`${uid}-followup-status`}
                  className={selectCls}
                  value={form.follow_up_status}
                  onChange={set('follow_up_status')}
                >
                  {FOLLOW_UP_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <StatusPill value={form.follow_up_status} colourMap={followupColour} />
              </div>
            </div>

            {/* Reminder Toggle */}
            <div className="flex items-center">
              <div className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {form.reminder
                    ? <Bell size={15} className="text-primary" />
                    : <BellOff size={15} className="text-white/40" />
                  }
                  <div>
                    <p className="text-sm font-medium text-white">Reminder</p>
                    <p className="text-xs text-white/40 mt-0.5">Get notified for this follow-up</p>
                  </div>
                </div>
                <button
                  type="button"
                  id={`${uid}-reminder-toggle`}
                  onClick={toggleReminder}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                    form.reminder ? 'bg-primary' : 'bg-white/15'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${
                      form.reminder ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Discussion Summary */}
            <div className="sm:col-span-2">
              <FieldLabel icon={MessageSquare} text="Discussion Summary" />
              <textarea
                id={`${uid}-discussion`}
                rows={3}
                className={inp + ' resize-none'}
                placeholder="Summarise what was discussed in the last meeting…"
                value={form.discussion_summary}
                onChange={set('discussion_summary')}
              />
            </div>

          </div>
        </SectionCard>

        {/* ══════════════════════════════════════════
            SECTION 3 — DOCUMENTS
        ══════════════════════════════════════════ */}
        <SectionCard icon={FilePlus2} title="Documents">
          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-2 text-xs text-white/40 bg-white/[0.03] border border-white/8 rounded-xl px-4 py-2.5">
              <Info size={13} className="shrink-0 text-primary/60" />
              Accepted: PDF, DOC, DOCX, XLS, XLSX — max 10 MB each. Documents are uploaded after the client is created.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {DOCUMENT_TYPES.map((docType) => {
              const doc = docs[docType];
              const docErr = docErrors[docType];
              return (
                <div
                  key={docType}
                  className="bg-white/[0.02] border border-white/8 rounded-2xl p-4 space-y-3"
                >
                  {/* Doc type header */}
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-primary" />
                    <p className="text-xs font-bold text-white/80">{docType}</p>
                  </div>

                  {/* Document Name */}
                  <div>
                    <FieldLabel text="Document Name" required={!!doc.file} />
                    <input
                      id={`${uid}-doc-name-${docType}`}
                      className={inp}
                      placeholder={`e.g. ${docType} v1`}
                      value={doc.name}
                      onChange={handleDocName(docType)}
                    />
                  </div>

                  {/* File Picker */}
                  {!doc.file ? (
                    <label
                      htmlFor={`${uid}-doc-file-${docType}`}
                      className="flex flex-col items-center gap-2 border border-dashed border-white/15 rounded-xl p-5 cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                        <Upload size={16} className="text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-white/60 group-hover:text-white/80 transition">
                          Click to upload
                        </p>
                        <p className="text-[10px] text-white/30 mt-0.5">PDF, DOC, DOCX, XLS, XLSX</p>
                      </div>
                      <input
                        id={`${uid}-doc-file-${docType}`}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleDocFile(docType)}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center gap-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl px-4 py-3">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-emerald-300 truncate">{doc.file.name}</p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                          {(doc.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        id={`${uid}-remove-doc-${docType}`}
                        onClick={() => removeDoc(docType)}
                        className="w-7 h-7 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 flex items-center justify-center transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}

                  {/* Doc error */}
                  {docErr && (
                    <p className="flex items-center gap-1.5 text-[11px] text-rose-400">
                      <AlertCircle size={11} />
                      {docErr}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ══════════════════════════════════════════
            SECTION 4 — AUDIT INFO (read-only hint)
        ══════════════════════════════════════════ */}
        <div className="bg-white/[0.02] border border-white/6 rounded-2xl px-5 py-4 flex flex-wrap gap-x-8 gap-y-2 text-xs text-white/30">
          <span className="flex items-center gap-1.5">
            <Hash size={11} className="text-primary/50" />
            UUID — auto-generated on save
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={11} className="text-primary/50" />
            Created at / Updated at — set by server
          </span>
          <span className="flex items-center gap-1.5">
            <User size={11} className="text-primary/50" />
            Created by / Updated by — set to logged-in user
          </span>
        </div>

        {/* ── Form Actions ── */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            id={`${uid}-reset`}
            onClick={handleReset}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-40"
          >
            Reset
          </button>
          <button
            type="submit"
            id={`${uid}-submit`}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-lg shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <UserRoundPlus size={15} />
                Add Client
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
