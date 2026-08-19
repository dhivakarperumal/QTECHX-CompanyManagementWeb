import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Save, Plus, Trash2, ChevronRight, ChevronLeft,
  User, Building2, Mail, Phone, Briefcase, Calendar, CreditCard,
  FileText, Layers, Clock, Tag, DollarSign, CheckCircle2,
  FileSpreadsheet, MessageSquare, Paperclip, Settings, Loader2,
  Hash, AlertCircle, Check,
} from "lucide-react";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import api from "../../api";

// ─── Helpers (same logic as list page) ────────────────────────────────────────
const createEmptyItem = () => ({
  service_name: "",
  description: "",
  quantity: 1,
  unit: "Hour",
  duration: "",
  unit_price: 0,
  discount: 0,
  tax_percentage: 18,
  total: 0,
});

const createDefaultTerms = () => [
  { title: "Payment Terms",   content: "50% advance and the remaining balance on project delivery." },
  { title: "Support Policy",  content: "Free support is included for the first 30 days after deployment." },
  { title: "Revision Policy", content: "Two rounds of revisions are covered within the agreed scope." },
];

const createDefaultTimeline = () => [
  { phase: "Requirement Collection", start_date: "", end_date: "", duration: "7 Days" },
  { phase: "UI Design",              start_date: "", end_date: "", duration: "10 Days" },
  { phase: "Development",            start_date: "", end_date: "", duration: "20 Days" },
];

const createDefaultForm = (defaults = {}) => ({
  id: null, uuid: null,
  quotation_number: "",
  client_name: "",
  company_name: "",
  contact_person: "",
  email: "",
  phone_number: "",
  project_name: "",
  project_description: "",
  scope_of_work: "",
  technologies_used: "",
  project_type: "Website",
  service_category: "Web Development",
  service_type: "Website Development",
  quotation_date: dayjs().format("YYYY-MM-DD"),
  valid_until: dayjs().add(30, "day").format("YYYY-MM-DD"),
  currency: "INR",
  payment_terms: "50%-50%",
  delivery_timeline: "4 Weeks",
  sales_executive: "Admin",
  prepared_by: "Admin",
  platform: "Website",
  subtotal: 0, discount: 0, additional_charges: 0,
  tax_amount: 0, round_off: 0, grand_total: 0,
  advance_amount: 0, balance_amount: 0,
  status: "Draft",
  approval_status: "Pending",
  payment_status: "Pending",
  notes: "",
  terms_conditions: "",
  created_by: "Admin",
  updated_by: "Admin",
  created_at: "", updated_at: "",
  items: [createEmptyItem()],
  timeline_items: createDefaultTimeline(),
  terms_sections: createDefaultTerms(),
  attachments: [], activity_logs: [],
  approval: { approved_by: "", approval_status: "Pending", comments: "", approved_at: "", rejection_reason: "" },
  client_message: "", response_date: "", sent_date: "", viewed_date: "",
  download_count: 0, email_status: "Pending", whatsapp_status: "Pending",
  ...defaults,
});

const calculatePricing = (items, values) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0) - (Number(item.discount) || 0);
  }, 0);
  const summaryDiscount   = Number(values.discount) || 0;
  const additionalCharges = Number(values.additional_charges) || 0;
  const taxRate           = Number(values.tax_rate) || 18;
  const advanceAmount     = Number(values.advance_amount) || 0;
  const net         = Math.max(subtotal - summaryDiscount + additionalCharges, 0);
  const taxAmount   = (net * taxRate) / 100;
  const grandTotal  = Math.round((net + taxAmount + Number(values.round_off || 0)) * 100) / 100;
  return {
    subtotal:           Math.round(subtotal * 100) / 100,
    discount:           summaryDiscount,
    additional_charges: additionalCharges,
    tax_amount:         Math.round(taxAmount * 100) / 100,
    round_off:          Number(values.round_off || 0),
    grand_total:        grandTotal,
    advance_amount:     advanceAmount,
    balance_amount:     Math.round(Math.max(grandTotal - advanceAmount, 0) * 100) / 100,
  };
};

const fmt = (amount, currency = "INR") => {
  const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
  return `${sym}${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ─── Step config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: "client",   label: "Client Info",    icon: User },
  { id: "project",  label: "Project",        icon: Briefcase },
  { id: "items",    label: "Line Items",     icon: Layers },
  { id: "pricing",  label: "Pricing",        icon: DollarSign },
  { id: "timeline", label: "Timeline",       icon: Clock },
  { id: "terms",    label: "Terms",          icon: FileText },
  { id: "approval", label: "Approval",       icon: CheckCircle2 },
];

// ─── Reusable field components ────────────────────────────────────────────────
function Label({ children }) {
  return <span className="block text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-1.5">{children}</span>;
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 focus:bg-white/[0.07] transition";
const selectCls = inputCls + " [&>option]:bg-[#111318]";
const textareaCls = inputCls + " resize-none min-h-[100px] leading-relaxed";

// ─── Section card wrapper ─────────────────────────────────────────────────────
function Section({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/8 bg-white/[0.02]">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center shrink-0">
            <Icon size={15} className="text-orange-400" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {subtitle && <p className="text-[11px] text-white/35 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function QuotationFormPage() {
  const navigate = useNavigate();
  const { uuid }  = useParams();             // present → edit mode
  const isEdit    = Boolean(uuid);

  const [step, setStep]         = useState(0);
  const [formData, setFormData] = useState(createDefaultForm());
  const [clients, setClients]   = useState([]);
  const [selectedClientUuid, setSelectedClientUuid] = useState("");
  const [saving, setSaving]     = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  // ── Load existing quotation for edit ──
  useEffect(() => {
    let isMounted = true;
    if (isEdit) {
      api.get(`/quotations/${uuid}`)
        .then(({ data }) => {
          if (!isMounted) return;
          const q = data?.data ?? data;
          setFormData(createDefaultForm({ ...q, approval: q.approval || createDefaultForm().approval }));
        })
        .catch(() => {
          if (isMounted) toast.error("Failed to load quotation.");
        })
        .finally(() => {
          if (isMounted) setLoadingData(false);
        });
    }
    return () => { isMounted = false; };
  }, [uuid, isEdit]);

  // ── Load clients ──
  useEffect(() => {
    api.get("/clients?limit=500&page=1")
      .then(({ data }) => {
        if (data.success && Array.isArray(data.data)) setClients(data.data);
        else if (data.success && data.data?.rows)      setClients(data.data.rows);
      })
      .catch(() => {});
  }, []);

  // ── Field updaters ──
  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const setApproval = (field, value) =>
    setFormData(prev => ({ ...prev, approval: { ...prev.approval, [field]: value } }));

  const handleClientPick = (clientUuid) => {
    setSelectedClientUuid(clientUuid);
    const c = clients.find(x => x.uuid === clientUuid || x.id === clientUuid);
    if (!c) return;
    setFormData(prev => ({
      ...prev,
      client_name:    c.client_name    || prev.client_name,
      company_name:   c.company_name   || prev.company_name,
      contact_person: c.contact_person || prev.contact_person,
      email:          c.email          || prev.email,
      phone_number:   c.phone_number   || prev.phone_number,
      service_type:   c.service_type   || prev.service_type,
    }));
  };

  // ── Line items ──
  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      const total = Number(items[index].quantity || 0) * Number(items[index].unit_price || 0) - Number(items[index].discount || 0);
      items[index] = { ...items[index], total: Math.round(total * 100) / 100 };
      return { ...prev, items, ...calculatePricing(items, prev) };
    });
  };

  const addItem = () =>
    setFormData(prev => ({ ...prev, items: [...prev.items, createEmptyItem()] }));

  const removeItem = idx =>
    setFormData(prev => {
      const items = prev.items.filter((_, i) => i !== idx);
      return { ...prev, items, ...calculatePricing(items, prev) };
    });

  // ── Pricing summary field change (recalculate) ──
  const setPricingField = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      return { ...next, ...calculatePricing(next.items, next) };
    });
  };

  // ── Timeline ──
  const updateTimeline = (idx, field, value) =>
    setFormData(prev => ({
      ...prev,
      timeline_items: prev.timeline_items.map((t, i) => i === idx ? { ...t, [field]: value } : t),
    }));

  const addTimeline = () =>
    setFormData(prev => ({ ...prev, timeline_items: [...prev.timeline_items, { phase: "", start_date: "", end_date: "", duration: "" }] }));

  const removeTimeline = idx =>
    setFormData(prev => ({ ...prev, timeline_items: prev.timeline_items.filter((_, i) => i !== idx) }));

  // ── Terms ──
  const updateTerms = (idx, field, value) =>
    setFormData(prev => ({
      ...prev,
      terms_sections: prev.terms_sections.map((t, i) => i === idx ? { ...t, [field]: value } : t),
    }));

  const addTerms = () =>
    setFormData(prev => ({ ...prev, terms_sections: [...prev.terms_sections, { title: "", content: "" }] }));

  const removeTerms = idx =>
    setFormData(prev => ({ ...prev, terms_sections: prev.terms_sections.filter((_, i) => i !== idx) }));

  // ── Submit ──
  const handleSubmit = async () => {
    if (!formData.project_name.trim() || !formData.client_name.trim()) {
      toast.error("Project name and client name are required.");
      setStep(0);
      return;
    }
    const now      = dayjs().toISOString();
    const pricing  = calculatePricing(formData.items, formData);
    const payload  = {
      ...formData,
      ...pricing,
      terms_conditions: formData.terms_conditions ||
        formData.terms_sections.map(s => `${s.title}: ${s.content}`).join("\n"),
      activity_logs: [
        ...(formData.activity_logs || []),
        {
          action:      isEdit ? "Edited" : "Created",
          description: isEdit ? "Quotation updated." : "Quotation created.",
          user:        formData.prepared_by || "Admin",
          created_at:  now,
        },
      ],
    };
    if (!isEdit) delete payload.quotation_number;

    setSaving(true);
    try {
      if (isEdit && formData.uuid) {
        await api.put(`/quotations/${formData.uuid}`, payload);
        toast.success("Quotation updated successfully.");
      } else {
        await api.post("/quotations", payload);
        toast.success("Quotation created successfully.");
      }
      navigate("/admin/myprojects/quotations");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save quotation.");
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="animate-spin text-orange-400" />
          <p className="text-white/50 text-sm">Loading quotation…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-16">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/myprojects/quotations")}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <FileText size={20} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isEdit ? "Edit Quotation" : "New Quotation"}
            </h1>
            <p className="text-white/35 text-xs mt-0.5">
              {isEdit ? `Editing ${formData.quotation_number || "draft"}` : "Fill in the details to create a quotation"}
            </p>
          </div>
        </div>

        {/* Save button */}
        <button
          disabled={saving}
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-lg shadow-orange-500/25 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Saving…" : isEdit ? "Update Quotation" : "Save Quotation"}
        </button>
      </div>

      {/* ── Step Progress ── */}
      <div className="mb-8">
        <div className="flex items-center gap-0 overflow-x-auto pb-1">
          {STEPS.map((s, i) => {
            const Icon      = s.icon;
            const isActive  = i === step;
            const isDone    = i < step;
            return (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                className="flex items-center gap-0 group"
              >
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "bg-orange-500/20 border border-orange-500/40 text-orange-400"
                    : isDone
                    ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                    : "bg-white/5 border border-white/10 text-white/40 hover:text-white/60 hover:bg-white/8"
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isActive ? "bg-orange-500 text-white" : isDone ? "bg-emerald-500 text-white" : "bg-white/10 text-white/40"
                  }`}>
                    {isDone ? <Check size={10} /> : <Icon size={10} />}
                  </div>
                  {s.label}
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight size={14} className="text-white/20 mx-0.5 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="space-y-5">
        {step === 0 && <StepClient formData={formData} set={set} clients={clients} selectedClientUuid={selectedClientUuid} onClientPick={handleClientPick} />}
        {step === 1 && <StepProject formData={formData} set={set} />}
        {step === 2 && <StepItems formData={formData} updateItem={updateItem} addItem={addItem} removeItem={removeItem} />}
        {step === 3 && <StepPricing formData={formData} set={setPricingField} fmt={fmt} />}
        {step === 4 && <StepTimeline formData={formData} updateTimeline={updateTimeline} addTimeline={addTimeline} removeTimeline={removeTimeline} />}
        {step === 5 && <StepTerms formData={formData} updateTerms={updateTerms} addTerms={addTerms} removeTerms={removeTerms} set={set} />}
        {step === 6 && <StepApproval formData={formData} set={set} setApproval={setApproval} />}
      </div>

      {/* ── Step Nav Buttons ── */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/8">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={15} /> Previous
        </button>

        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className={`w-2 h-2 rounded-full transition ${i === step ? "bg-orange-500 w-5" : i < step ? "bg-emerald-500" : "bg-white/20"}`} />
          ))}
        </div>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => Math.min(STEPS.length - 1, s + 1))}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
          >
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button
            disabled={saving}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Saving…" : isEdit ? "Update Quotation" : "Save Quotation"}
          </button>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// STEP COMPONENTS
// ──────────────────────────────────────────────────────────────────────────────

function StepClient({ formData, set, clients, selectedClientUuid, onClientPick }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Section title="Auto-fill from Client" subtitle="Pick an existing client to fill details automatically" icon={User}>
        <Field label="Select existing client">
          <select value={selectedClientUuid} onChange={e => onClientPick(e.target.value)} className={selectCls}>
            <option value="">— Choose a client —</option>
            {clients.map(c => (
              <option key={c.uuid || c.id} value={c.uuid || c.id}>
                {c.client_name || c.company_name || "Untitled"}{c.phone_number ? ` · ${c.phone_number}` : ""}
              </option>
            ))}
          </select>
        </Field>
        <p className="mt-3 text-[11px] text-white/30 leading-relaxed">
          Selecting a client auto-fills name, company, email and phone. You can still edit them manually below.
        </p>
      </Section>

      <Section title="Client Details" subtitle="Contact information for this quotation" icon={Building2}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Client name *">
            <input value={formData.client_name} onChange={e => set("client_name", e.target.value)} placeholder="Full name" className={inputCls} />
          </Field>
          <Field label="Company name">
            <input value={formData.company_name} onChange={e => set("company_name", e.target.value)} placeholder="Company Ltd." className={inputCls} />
          </Field>
          <Field label="Contact person">
            <input value={formData.contact_person} onChange={e => set("contact_person", e.target.value)} placeholder="Person to contact" className={inputCls} />
          </Field>
          <Field label="Phone number">
            <div className="relative">
              <Phone size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input value={formData.phone_number} onChange={e => set("phone_number", e.target.value)} placeholder="+91 99999 99999" className={inputCls + " pl-9"} />
            </div>
          </Field>
          <Field label="Email address" className="sm:col-span-2">
            <div className="relative">
              <Mail size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
              <input type="email" value={formData.email} onChange={e => set("email", e.target.value)} placeholder="email@company.com" className={inputCls + " pl-9"} />
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Quotation Meta" subtitle="Dates, currency and ownership" icon={Calendar}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quotation date">
            <input type="date" value={formData.quotation_date} onChange={e => set("quotation_date", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Valid until">
            <input type="date" value={formData.valid_until} onChange={e => set("valid_until", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Currency">
            <select value={formData.currency} onChange={e => set("currency", e.target.value)} className={selectCls}>
              <option value="INR">₹ INR — Indian Rupee</option>
              <option value="USD">$ USD — US Dollar</option>
              <option value="EUR">€ EUR — Euro</option>
              <option value="GBP">£ GBP — British Pound</option>
            </select>
          </Field>
          <Field label="Prepared by">
            <input value={formData.prepared_by} onChange={e => set("prepared_by", e.target.value)} placeholder="Admin" className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="Status" subtitle="Current state of this quotation" icon={Settings}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quotation status">
            <select value={formData.status} onChange={e => set("status", e.target.value)} className={selectCls}>
              {["Draft","Sent","Viewed","Under Discussion","Approved","Rejected","Expired","Converted to Project"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Approval status">
            <select value={formData.approval_status} onChange={e => set("approval_status", e.target.value)} className={selectCls}>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </Field>
          <Field label="Payment terms">
            <select value={formData.payment_terms} onChange={e => set("payment_terms", e.target.value)} className={selectCls}>
              {["100% Advance","50%-50%","40%-40%-20%","Milestone Based","Monthly","Custom"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Payment status">
            <select value={formData.payment_status} onChange={e => set("payment_status", e.target.value)} className={selectCls}>
              {["Pending","Advance Paid","Partial","Complete"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>
    </div>
  );
}

function StepProject({ formData, set }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Section title="Project Information" subtitle="Core details about the project" icon={Briefcase}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project name *" className="sm:col-span-2">
            <input value={formData.project_name} onChange={e => set("project_name", e.target.value)} placeholder="e.g. E-commerce Website Redesign" className={inputCls} />
          </Field>
          <Field label="Project type">
            <select value={formData.project_type} onChange={e => set("project_type", e.target.value)} className={selectCls}>
              {["Website","Web Application","Mobile App","ERP","CRM","Other"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Service category">
            <input value={formData.service_category} onChange={e => set("service_category", e.target.value)} placeholder="e.g. Web Development" className={inputCls} />
          </Field>
          <Field label="Service type">
            <select value={formData.service_type} onChange={e => set("service_type", e.target.value)} className={selectCls}>
              {["Website Development","Mobile App Development","ERP Development","UI/UX Design","CRM Development","Other"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Platform">
            <input value={formData.platform} onChange={e => set("platform", e.target.value)} placeholder="e.g. Web, iOS, Android" className={inputCls} />
          </Field>
          <Field label="Delivery timeline" className="sm:col-span-2">
            <input value={formData.delivery_timeline} onChange={e => set("delivery_timeline", e.target.value)} placeholder="e.g. 4 Weeks, 3 Months" className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="Scope &amp; Description" subtitle="Detailed project scope and technologies" icon={FileSpreadsheet}>
        <div className="grid gap-4">
          <Field label="Project description">
            <textarea value={formData.project_description} onChange={e => set("project_description", e.target.value)} placeholder="Brief overview of what the project entails…" className={textareaCls} />
          </Field>
          <Field label="Scope of work">
            <textarea value={formData.scope_of_work} onChange={e => set("scope_of_work", e.target.value)} placeholder="List the features, modules, and deliverables…" className={textareaCls + " min-h-[130px]"} />
          </Field>
          <Field label="Technologies used">
            <input value={formData.technologies_used} onChange={e => set("technologies_used", e.target.value)} placeholder="e.g. React, Node.js, MySQL, AWS" className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section title="Internal Notes" subtitle="Notes and client message (not printed on quotation)" icon={MessageSquare} >
        <div className="grid gap-4">
          <Field label="Internal notes">
            <textarea value={formData.notes} onChange={e => set("notes", e.target.value)} placeholder="Notes for the internal team…" className={textareaCls} />
          </Field>
          <Field label="Client message">
            <textarea value={formData.client_message} onChange={e => set("client_message", e.target.value)} placeholder="Message to share with the client…" className={textareaCls} />
          </Field>
        </div>
      </Section>
    </div>
  );
}

function StepItems({ formData, updateItem, addItem, removeItem }) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Line Items</h2>
          <p className="text-white/35 text-xs mt-0.5">Add services, products, or tasks to this quotation</p>
        </div>
        <button
          onClick={addItem}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
        >
          <Plus size={13} /> Add Row
        </button>
      </div>

      {/* Item table header */}
      <div className="hidden lg:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1.2fr_1fr_0.8fr_auto] gap-3 px-4 py-2">
        {["Service","Description","Qty","Unit","Duration","Unit Price","Discount","Tax %",""].map(h => (
          <span key={h} className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{h}</span>
        ))}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {formData.items.map((item, idx) => (
          <div key={idx} className="bg-white/[0.03] border border-white/8 rounded-2xl p-4">
            {/* Mobile label */}
            <div className="flex items-center justify-between mb-3 lg:hidden">
              <span className="text-xs font-bold text-orange-400">Item {idx + 1}</span>
              {formData.items.length > 1 && (
                <button onClick={() => removeItem(idx)} className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition">
                  <Trash2 size={11} />
                </button>
              )}
            </div>

            {/* Desktop row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_2fr_1fr_1fr_1fr_1.2fr_1fr_0.8fr_auto] gap-3 items-start">
              <div>
                <span className="lg:hidden text-[10px] text-white/30 uppercase tracking-wider font-semibold block mb-1">Service</span>
                <input value={item.service_name} onChange={e => updateItem(idx, "service_name", e.target.value)} placeholder="Service name" className={inputCls} />
              </div>
              <div>
                <span className="lg:hidden text-[10px] text-white/30 uppercase tracking-wider font-semibold block mb-1">Description</span>
                <input value={item.description} onChange={e => updateItem(idx, "description", e.target.value)} placeholder="Details…" className={inputCls} />
              </div>
              <div>
                <span className="lg:hidden text-[10px] text-white/30 uppercase tracking-wider font-semibold block mb-1">Qty</span>
                <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, "quantity", Number(e.target.value))} className={inputCls} />
              </div>
              <div>
                <span className="lg:hidden text-[10px] text-white/30 uppercase tracking-wider font-semibold block mb-1">Unit</span>
                <input value={item.unit} onChange={e => updateItem(idx, "unit", e.target.value)} placeholder="Hour" className={inputCls} />
              </div>
              <div>
                <span className="lg:hidden text-[10px] text-white/30 uppercase tracking-wider font-semibold block mb-1">Duration</span>
                <input value={item.duration} onChange={e => updateItem(idx, "duration", e.target.value)} placeholder="e.g. 5 Days" className={inputCls} />
              </div>
              <div>
                <span className="lg:hidden text-[10px] text-white/30 uppercase tracking-wider font-semibold block mb-1">Unit Price</span>
                <input type="number" min="0" value={item.unit_price} onChange={e => updateItem(idx, "unit_price", Number(e.target.value))} className={inputCls} />
              </div>
              <div>
                <span className="lg:hidden text-[10px] text-white/30 uppercase tracking-wider font-semibold block mb-1">Discount</span>
                <input type="number" min="0" value={item.discount} onChange={e => updateItem(idx, "discount", Number(e.target.value))} className={inputCls} />
              </div>
              <div>
                <span className="lg:hidden text-[10px] text-white/30 uppercase tracking-wider font-semibold block mb-1">Tax %</span>
                <input type="number" min="0" value={item.tax_percentage} onChange={e => updateItem(idx, "tax_percentage", Number(e.target.value))} className={inputCls} />
              </div>

              {/* Delete - desktop */}
              <div className="hidden lg:flex items-start pt-1">
                {formData.items.length > 1 && (
                  <button onClick={() => removeItem(idx)} className="w-8 h-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center text-rose-400 transition">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Row total */}
            <div className="mt-3 flex items-center justify-end gap-2 text-xs text-white/40 border-t border-white/[0.06] pt-2">
              <span>Row Total:</span>
              <span className="font-bold text-white/70">{fmt(item.total || 0, formData.currency)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Subtotal preview */}
      <div className="flex items-center justify-end gap-4 px-4 py-3 bg-white/[0.03] border border-white/8 rounded-2xl">
        <span className="text-sm text-white/50">Subtotal (before summary discounts/tax):</span>
        <span className="text-base font-bold text-white">{fmt(formData.subtotal || 0, formData.currency)}</span>
      </div>
    </div>
  );
}

function StepPricing({ formData, set, fmt }) {
  const rows = [
    { label: "Subtotal",         value: fmt(formData.subtotal || 0, formData.currency),     muted: true },
    { label: "Summary Discount", value: null, field: "discount",           type: "number" },
    { label: "Additional Charges",value: null, field: "additional_charges", type: "number" },
    { label: "Tax Rate (%)",     value: null, field: "tax_rate",           type: "number", placeholder: "18" },
    { label: "Round Off",        value: null, field: "round_off",          type: "number" },
    { label: "GST Amount",       value: fmt(formData.tax_amount || 0, formData.currency),    muted: true },
    { label: "Grand Total",      value: fmt(formData.grand_total || 0, formData.currency),   highlight: true },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Section title="Pricing Summary" subtitle="Review and adjust the final pricing" icon={DollarSign}>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${r.highlight ? "bg-orange-500/10 border-orange-500/25" : "bg-white/[0.03] border-white/8"}`}>
              <span className={`text-sm font-medium ${r.highlight ? "text-orange-300 font-bold" : "text-white/60"}`}>{r.label}</span>
              {r.muted || r.highlight ? (
                <span className={`text-sm font-bold ${r.highlight ? "text-orange-400 text-base" : "text-white/70"}`}>{r.value}</span>
              ) : (
                <input
                  type={r.type || "text"}
                  value={r.field === "tax_rate" ? (formData.tax_rate || 18) : (formData[r.field] || 0)}
                  onChange={e => set(r.field, Number(e.target.value))}
                  placeholder={r.placeholder || "0"}
                  className="w-36 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white text-right focus:outline-none focus:border-orange-500/50 transition"
                />
              )}
            </div>
          ))}
        </div>
      </Section>

      <div className="space-y-5">
        <Section title="Advance &amp; Balance" subtitle="Track advance payment and remaining balance" icon={CreditCard}>
          <div className="space-y-4">
            <Field label="Advance amount">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                  {formData.currency === "USD" ? "$" : formData.currency === "EUR" ? "€" : formData.currency === "GBP" ? "£" : "₹"}
                </span>
                <input type="number" min="0" value={formData.advance_amount} onChange={e => set("advance_amount", Number(e.target.value))} placeholder="0" className={inputCls + " pl-8"} />
              </div>
            </Field>
            <div className="rounded-xl bg-white/[0.03] border border-white/8 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-white/50">Remaining Balance</span>
              <span className="text-sm font-bold text-emerald-400">{fmt(formData.balance_amount || 0, formData.currency)}</span>
            </div>
          </div>
        </Section>

        {/* Summary card */}
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
          <p className="text-[11px] font-bold text-orange-400/70 uppercase tracking-wider mb-4">Quotation Summary</p>
          <div className="space-y-2">
            {[
              ["Items",         formData.items?.length || 0],
              ["Subtotal",      fmt(formData.subtotal || 0, formData.currency)],
              ["Discount",      `- ${fmt(formData.discount || 0, formData.currency)}`],
              ["Tax",           fmt(formData.tax_amount || 0, formData.currency)],
              ["Grand Total",   fmt(formData.grand_total || 0, formData.currency)],
              ["Advance",       fmt(formData.advance_amount || 0, formData.currency)],
              ["Balance Due",   fmt(formData.balance_amount || 0, formData.currency)],
            ].map(([label, value], i) => (
              <div key={i} className={`flex justify-between text-sm ${i >= 4 ? "font-bold text-white border-t border-white/10 pt-2 mt-2" : "text-white/60"}`}>
                <span>{label}</span>
                <span className={i === 4 ? "text-orange-400" : ""}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepTimeline({ formData, updateTimeline, addTimeline, removeTimeline }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">Project Timeline</h2>
          <p className="text-white/35 text-xs mt-0.5">Define the phases and milestones for this project</p>
        </div>
        <button onClick={addTimeline} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition hover:opacity-90" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
          <Plus size={13} /> Add Phase
        </button>
      </div>

      <div className="space-y-3">
        {formData.timeline_items.map((item, idx) => (
          <div key={idx} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-orange-500/15 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-orange-400">{idx + 1}</span>
                </div>
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Phase {idx + 1}</span>
              </div>
              {formData.timeline_items.length > 1 && (
                <button onClick={() => removeTimeline(idx)} className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center text-rose-400 transition">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Phase name" className="lg:col-span-2">
                <input value={item.phase} onChange={e => updateTimeline(idx, "phase", e.target.value)} placeholder="e.g. UI Design" className={inputCls} />
              </Field>
              <Field label="Duration">
                <input value={item.duration} onChange={e => updateTimeline(idx, "duration", e.target.value)} placeholder="e.g. 10 Days" className={inputCls} />
              </Field>
              <Field label="Start date">
                <input type="date" value={item.start_date} onChange={e => updateTimeline(idx, "start_date", e.target.value)} className={inputCls} />
              </Field>
              <Field label="End date">
                <input type="date" value={item.end_date} onChange={e => updateTimeline(idx, "end_date", e.target.value)} className={inputCls} />
              </Field>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepTerms({ formData, updateTerms, addTerms, removeTerms, set }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
      <Section title="Terms &amp; Conditions" subtitle="Add policy sections for the quotation" icon={FileText}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-white/40">{formData.terms_sections.length} section(s)</span>
          <button onClick={addTerms} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white/70 bg-white/5 border border-white/10 hover:bg-white/10 transition">
            <Plus size={11} /> Add Section
          </button>
        </div>
        <div className="space-y-4">
          {formData.terms_sections.map((section, idx) => (
            <div key={idx} className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-orange-400/70 uppercase tracking-wider">Section {idx + 1}</span>
                {formData.terms_sections.length > 1 && (
                  <button onClick={() => removeTerms(idx)} className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition">
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <Field label="Title">
                  <input value={section.title} onChange={e => updateTerms(idx, "title", e.target.value)} placeholder="e.g. Payment Terms" className={inputCls} />
                </Field>
                <Field label="Content">
                  <textarea value={section.content} onChange={e => updateTerms(idx, "content", e.target.value)} placeholder="Describe this policy…" className={textareaCls} />
                </Field>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="space-y-5">
        <Section title="Combined Terms Text" subtitle="Auto-generated from sections or override manually" icon={Hash}>
          <Field label="Terms &amp; Conditions (full text)">
            <textarea
              value={formData.terms_conditions || formData.terms_sections.map(s => `${s.title}: ${s.content}`).join("\n\n")}
              onChange={e => set("terms_conditions", e.target.value)}
              placeholder="Combined terms text (auto-populated from sections)…"
              className={textareaCls + " min-h-[220px]"}
            />
          </Field>
          <p className="mt-2 text-[11px] text-white/25 leading-relaxed">
            Leave blank to auto-combine sections above. Or type here to override.
          </p>
        </Section>

        <Section title="File Attachments" subtitle="Reference documents or samples" icon={Paperclip}>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-orange-400/30 bg-orange-500/5 px-4 py-8 text-center transition hover:bg-orange-500/10">
            <Paperclip size={22} className="text-orange-400/60 mb-2" />
            <span className="text-sm font-semibold text-orange-300/70">Click to upload files</span>
            <span className="text-[11px] text-white/25 mt-1">PDF, DOC, XLS, PNG up to 10 MB</span>
            <input type="file" multiple className="hidden" onChange={e => {
              const files = Array.from(e.target.files || []);
              const attachments = files.map(f => ({ file_name: f.name, file_size: f.size, uploaded_by: "Admin", created_at: dayjs().format("YYYY-MM-DD") }));
              set("attachments", [...(formData.attachments || []), ...attachments]);
              toast.success(`${files.length} file${files.length > 1 ? "s" : ""} attached.`);
            }} />
          </label>
          {formData.attachments?.length > 0 && (
            <div className="mt-3 space-y-2">
              {formData.attachments.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/8 text-xs text-white/60">
                  <Paperclip size={11} className="text-orange-400 shrink-0" />
                  <span className="flex-1 truncate">{a.file_name}</span>
                  <span className="text-white/30">{Math.round(a.file_size / 1024)} KB</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function StepApproval({ formData, set, setApproval }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Section title="Approval Details" subtitle="Record who approved or rejected this quotation" icon={CheckCircle2}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Approval status" className="sm:col-span-2">
            <div className="flex gap-2">
              {["Pending", "Approved", "Rejected"].map(s => (
                <button
                  key={s}
                  onClick={() => { set("approval_status", s); setApproval("approval_status", s); }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${
                    formData.approval_status === s
                      ? s === "Approved" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                      : s === "Rejected" ? "bg-rose-500/20 border-rose-500/50 text-rose-400"
                      : "bg-amber-500/20 border-amber-500/50 text-amber-400"
                      : "bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/8"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Approved by">
            <input value={formData.approval?.approved_by || ""} onChange={e => setApproval("approved_by", e.target.value)} placeholder="Name of approver" className={inputCls} />
          </Field>
          <Field label="Approval date">
            <input type="date" value={formData.approval?.approved_at || ""} onChange={e => setApproval("approved_at", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Rejection reason" className="sm:col-span-2">
            <input value={formData.approval?.rejection_reason || ""} onChange={e => setApproval("rejection_reason", e.target.value)} placeholder="Reason for rejection (if applicable)" className={inputCls} />
          </Field>
          <Field label="Manager comments" className="sm:col-span-2">
            <textarea value={formData.approval?.comments || ""} onChange={e => setApproval("comments", e.target.value)} placeholder="Any additional comments from the manager…" className={textareaCls} />
          </Field>
        </div>
      </Section>

      <div className="space-y-5">
        <Section title="Sales &amp; Delivery" subtitle="Sales executive and delivery information" icon={Tag}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sales executive">
              <input value={formData.sales_executive} onChange={e => set("sales_executive", e.target.value)} placeholder="Sales team member" className={inputCls} />
            </Field>
            <Field label="Delivery timeline">
              <input value={formData.delivery_timeline} onChange={e => set("delivery_timeline", e.target.value)} placeholder="e.g. 4 Weeks" className={inputCls} />
            </Field>
            <Field label="Sent date">
              <input type="date" value={formData.sent_date} onChange={e => set("sent_date", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Response date">
              <input type="date" value={formData.response_date} onChange={e => set("response_date", e.target.value)} className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* Final summary card */}
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 space-y-3">
          <p className="text-[11px] font-bold text-orange-400/70 uppercase tracking-wider">Quotation Summary</p>
          {[
            ["Project",   formData.project_name || "—"],
            ["Client",    formData.client_name  || "—"],
            ["Status",    formData.status        || "Draft"],
            ["Approval",  formData.approval_status || "Pending"],
            ["Total",     (() => { const sym = formData.currency === "USD" ? "$" : formData.currency === "EUR" ? "€" : formData.currency === "GBP" ? "£" : "₹"; return `${sym}${Number(formData.grand_total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`; })()],
          ].map(([label, value], i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-white/40">{label}</span>
              <span className={`font-semibold ${i === 4 ? "text-orange-400 text-base" : "text-white/80"}`}>{value}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-300/70 leading-relaxed">
            All 7 steps completed. Click <strong>Save Quotation</strong> to finalize and save to the database.
          </p>
        </div>
      </div>
    </div>
  );
}

