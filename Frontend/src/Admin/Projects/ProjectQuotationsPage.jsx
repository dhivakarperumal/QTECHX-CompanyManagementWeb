import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Mail,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  XCircle,
  Clock3,
  CircleDollarSign,
  Sparkles,
  FolderKanban,
  RotateCcw,
  Save,
  FileSpreadsheet,
  CircleAlert,
} from "lucide-react";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import api from "../../api";

const statusStyles = {
  Draft: "bg-amber-500/15 text-amber-300 border border-amber-400/20",
  Sent: "bg-sky-500/15 text-sky-300 border border-sky-400/20",
  Viewed: "bg-indigo-500/15 text-indigo-300 border border-indigo-400/20",
  "Under Discussion": "bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-400/20",
  Approved: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20",
  Rejected: "bg-rose-500/15 text-rose-300 border border-rose-400/20",
  Expired: "bg-slate-500/15 text-slate-200 border border-slate-400/20",
  "Converted to Project": "bg-violet-500/15 text-violet-300 border border-violet-400/20",
};

const approvalStyles = {
  Pending: "bg-slate-500/15 text-slate-200 border border-slate-400/20",
  Approved: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20",
  Rejected: "bg-rose-500/15 text-rose-300 border border-rose-400/20",
};

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
  { title: "Payment Terms", content: "50% advance and the remaining balance on project delivery." },
  { title: "Support Policy", content: "Free support is included for the first 30 days after deployment." },
  { title: "Revision Policy", content: "Two rounds of revisions are covered within the agreed scope." },
];

const createDefaultTimeline = () => [
  { phase: "Requirement Collection", start_date: "", end_date: "", duration: "7 Days" },
  { phase: "UI Design", start_date: "", end_date: "", duration: "10 Days" },
  { phase: "Development", start_date: "", end_date: "", duration: "20 Days" },
];

const createDefaultForm = (defaults = {}) => ({
  id: null,
  uuid: null,
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
  subtotal: 0,
  discount: 0,
  additional_charges: 0,
  tax_amount: 0,
  round_off: 0,
  grand_total: 0,
  advance_amount: 0,
  balance_amount: 0,
  status: "Draft",
  approval_status: "Pending",
  payment_status: "Pending",
  notes: "",
  terms_conditions: "",
  created_by: "Admin",
  updated_by: "Admin",
  created_at: "",
  updated_at: "",
  items: [createEmptyItem()],
  timeline_items: createDefaultTimeline(),
  terms_sections: createDefaultTerms(),
  attachments: [],
  activity_logs: [],
  approval: {
    approved_by: "",
    approval_status: "Pending",
    comments: "",
    approved_at: "",
    rejection_reason: "",
  },
  client_message: "",
  response_date: "",
  sent_date: "",
  viewed_date: "",
  download_count: 0,
  email_status: "Pending",
  whatsapp_status: "Pending",
  ...defaults,
});

const calculatePricing = (items, values) => {
  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    const discount = Number(item.discount) || 0;
    const total = quantity * unitPrice - discount;
    return sum + total;
  }, 0);

  const summaryDiscount = Number(values.discount) || 0;
  const additionalCharges = Number(values.additional_charges) || 0;
  const taxRate = Number(values.tax_rate) || 18;
  const advanceAmount = Number(values.advance_amount) || 0;

  const netAfterDiscount = Math.max(subtotal - summaryDiscount + additionalCharges, 0);
  const taxAmount = (netAfterDiscount * taxRate) / 100;
  const grandTotal = Math.round((netAfterDiscount + taxAmount + Number(values.round_off || 0)) * 100) / 100;
  const balanceAmount = Math.max(grandTotal - advanceAmount, 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: summaryDiscount,
    additional_charges: additionalCharges,
    tax_amount: Math.round(taxAmount * 100) / 100,
    round_off: Number(values.round_off || 0),
    grand_total: grandTotal,
    advance_amount: advanceAmount,
    balance_amount: Math.round(balanceAmount * 100) / 100,
  };
};

const formatCurrency = (amount, currency = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
  return `${symbol}${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ProjectQuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    client: "",
    project: "",
    service_type: "",
    status: "",
    approval_status: "",
    created_by: "",
    date_from: "",
    date_to: "",
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [activeQuotation, setActiveQuotation] = useState(null);
  const [formData, setFormData] = useState(createDefaultForm());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientLoading, setClientLoading] = useState(false);
  const [selectedClientUuid, setSelectedClientUuid] = useState('');

  const clientOptions = useMemo(() => Array.from(new Set(quotations.map((item) => item.company_name || item.client_name).filter(Boolean))), [quotations]);
  const projectOptions = useMemo(() => Array.from(new Set(quotations.map((item) => item.project_name).filter(Boolean))), [quotations]);
  const createdByOptions = useMemo(() => Array.from(new Set(quotations.map((item) => item.created_by).filter(Boolean))), [quotations]);

  const filteredQuotations = useMemo(() => {
    return quotations.filter((item) => {
      const matchesSearch = [item.quotation_number, item.project_name, item.client_name, item.company_name, item.service_type]
        .join(" ")
        .toLowerCase()
        .includes(filters.search.toLowerCase());
      const matchesClient = !filters.client || item.company_name === filters.client || item.client_name === filters.client;
      const matchesProject = !filters.project || item.project_name === filters.project;
      const matchesService = !filters.service_type || item.service_type === filters.service_type;
      const matchesStatus = !filters.status || item.status === filters.status;
      const matchesApproval = !filters.approval_status || item.approval_status === filters.approval_status;
      const matchesCreatedBy = !filters.created_by || item.created_by === filters.created_by;
      const matchesDateFrom = !filters.date_from || item.quotation_date >= filters.date_from;
      const matchesDateTo = !filters.date_to || item.quotation_date <= filters.date_to;
      return matchesSearch && matchesClient && matchesProject && matchesService && matchesStatus && matchesApproval && matchesCreatedBy && matchesDateFrom && matchesDateTo;
    });
  }, [quotations, filters]);

  const serializeForApi = (data) => ({
    ...data,
    items: data.items || [],
    timeline_items: data.timeline_items || [],
    terms_sections: data.terms_sections || [],
    attachments: data.attachments || [],
    activity_logs: data.activity_logs || [],
    approval: data.approval || {},
  });

  useEffect(() => {
    let isMounted = true;
    const loadQuotations = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/quotations?limit=200&page=1');
        if (isMounted) setQuotations(data.data || []);
      } catch (err) {
        console.error('loadQuotations:', err);
        toast.error('Failed to load quotations from the server.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadQuotations();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const loadClients = async () => {
      setClientLoading(true);
      try {
        const { data } = await api.get('/clients?limit=500&page=1');
        if (data.success && Array.isArray(data.data)) {
          setClients(data.data);
        } else if (data.success && data.data?.rows) {
          setClients(data.data.rows);
        }
      } catch (err) {
        console.warn('Failed to load clients for quotations form:', err?.message || err);
      } finally {
        setClientLoading(false);
      }
    };

    loadClients();
  }, []);

  const statCards = useMemo(() => {
    const totalValue = quotations.reduce((sum, item) => sum + Number(item.grand_total || 0), 0);
    const approvedValue = quotations.filter((item) => item.approval_status === "Approved").reduce((sum, item) => sum + Number(item.grand_total || 0), 0);
    const pendingApprovals = quotations.filter((item) => item.approval_status === "Pending").length;
    return [
      { label: "Total Quotations", value: quotations.length, icon: FileText, accent: "from-sky-500/20 to-sky-600/10" },
      { label: "Draft Quotations", value: quotations.filter((item) => item.status === "Draft").length, icon: RotateCcw, accent: "from-amber-500/20 to-amber-600/10" },
      { label: "Approved Quotations", value: quotations.filter((item) => item.approval_status === "Approved").length, icon: CheckCircle2, accent: "from-emerald-500/20 to-emerald-600/10" },
      { label: "Rejected Quotations", value: quotations.filter((item) => item.status === "Rejected").length, icon: XCircle, accent: "from-rose-500/20 to-rose-600/10" },
      { label: "Expired Quotations", value: quotations.filter((item) => item.status === "Expired").length, icon: Clock3, accent: "from-slate-500/20 to-slate-600/10" },
      { label: "Converted Projects", value: quotations.filter((item) => item.status === "Converted to Project").length, icon: FolderKanban, accent: "from-violet-500/20 to-violet-600/10" },
      { label: "Total Quotation Value", value: formatCurrency(totalValue), icon: CircleDollarSign, accent: "from-orange-500/20 to-orange-600/10" },
      { label: "Approved Value", value: formatCurrency(approvedValue), icon: Sparkles, accent: "from-teal-500/20 to-teal-600/10" },
      { label: "Pending Approvals", value: pendingApprovals, icon: CircleAlert, accent: "from-fuchsia-500/20 to-fuchsia-600/10" },
    ];
  }, [quotations]);

  const openCreateModal = () => {
    setFormData(createDefaultForm());
    setShowModal(true);
    setModalMode("create");
    setActiveQuotation(null);
  };

  const openEditModal = (quote) => {
    setFormData(createDefaultForm({ ...quote, approval: quote.approval || createDefaultForm().approval }));
    setShowModal(true);
    setModalMode("edit");
    setActiveQuotation(quote);
  };

  const openViewModal = (quote) => {
    setActiveQuotation(quote);
    setModalMode("view");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setActiveQuotation(null);
    setModalMode("create");
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (field, value) => {
    setFormData((prev) => ({ ...prev, approval: { ...prev.approval, [field]: value } }));
  };

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
      service_type: client.service_type || prev.service_type,
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      const computed = calculatePricing(items, prev);
      const nextTotal = Number(items[index].quantity || 0) * Number(items[index].unit_price || 0) - Number(items[index].discount || 0);
      items[index] = { ...items[index], total: Math.round(nextTotal * 100) / 100 };
      return { ...prev, items, ...computed };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({ ...prev, items: [...prev.items, createEmptyItem()] }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({ ...prev, items: prev.items.filter((_, idx) => idx !== index) }));
  };

  const addTimelineItem = () => {
    setFormData((prev) => ({ ...prev, timeline_items: [...prev.timeline_items, { phase: "", start_date: "", end_date: "", duration: "" }] }));
  };

  const updateTimelineItem = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      timeline_items: prev.timeline_items.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addTermsSection = () => {
    setFormData((prev) => ({ ...prev, terms_sections: [...prev.terms_sections, { title: "", content: "" }] }));
  };

  const updateTermsSection = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      terms_sections: prev.terms_sections.map((section, idx) => (idx === index ? { ...section, [field]: value } : section)),
    }));
  };

  const handleAttachmentUpload = (event) => {
    const files = Array.from(event.target.files || []);
    const attachments = files.map((file) => ({
      file_name: file.name,
      file_size: file.size,
      uploaded_by: "Admin",
      created_at: dayjs().format("YYYY-MM-DD"),
    }));
    setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, ...attachments] }));
    toast.success(`${attachments.length} file${attachments.length > 1 ? "s" : ""} attached.`);
  };

  const submitQuotation = async () => {
    const now = dayjs().toISOString();
    const nextSummary = calculatePricing(formData.items, formData);
    const payload = serializeForApi({
      ...formData,
      ...nextSummary,
      terms_conditions: formData.terms_conditions || formData.terms_sections.map((section) => `${section.title}: ${section.content}`).join("\n"),
      activity_logs: [
        ...(formData.activity_logs || []),
        {
          action: modalMode === "edit" ? "Edited" : "Created",
          description: modalMode === "edit" ? "Quotation updated in the admin panel." : "Quotation created and saved in the admin panel.",
          user: formData.prepared_by || "Admin",
          created_at: now,
        },
      ],
      created_by: formData.created_by || "Admin",
      updated_by: formData.updated_by || "Admin",
    });

    if (modalMode === 'create') {
      delete payload.quotation_number;
    }

    setSaving(true);
    try {
      if (modalMode === "edit" && formData.uuid) {
        const { data } = await api.put(`/quotations/${formData.uuid}`, payload);
        setQuotations((prev) => prev.map((item) => (item.uuid === formData.uuid ? data.data : item)));
        toast.success("Quotation updated successfully.");
      } else {
        const { data } = await api.post('/quotations', payload);
        setQuotations((prev) => [data.data, ...prev]);
        toast.success("Quotation created successfully.");
      }
      closeModal();
    } catch (err) {
      console.error('submitQuotation:', err);
      toast.error('Unable to save quotation.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (quote) => {
    if (quote.uuid) {
      try {
        await api.delete(`/quotations/${quote.uuid}`);
        setQuotations((prev) => prev.filter((item) => item.uuid !== quote.uuid));
        setSelectedIds((prev) => prev.filter((id) => id !== quote.id));
        toast.success("Quotation deleted.");
        return;
      } catch (err) {
        console.error('handleDelete:', err);
        toast.error('Failed to delete quotation.');
        return;
      }
    }

    setQuotations((prev) => prev.filter((item) => item.id !== quote.id));
    setSelectedIds((prev) => prev.filter((id) => id !== quote.id));
    toast.success("Quotation deleted.");
  };

  const handleDuplicate = async (quote) => {
    const { id, quotation_number, ...quotePayload } = quote;
    const payload = serializeForApi({
      ...quotePayload,
      uuid: null,
      status: "Draft",
      approval_status: "Pending",
      payment_status: "Pending",
      quotation_date: dayjs().format("YYYY-MM-DD"),
      valid_until: dayjs().add(30, "day").format("YYYY-MM-DD"),
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
      activity_logs: [
        ...(quote.activity_logs || []),
        {
          action: "Created",
          description: "Quotation duplicated from an existing record.",
          user: "Admin",
          created_at: dayjs().toISOString(),
        },
      ],
    });

    try {
      const { data } = await api.post('/quotations', payload);
      setQuotations((prev) => [data.data, ...prev]);
      toast.success("Quotation duplicated successfully.");
    } catch (err) {
      console.error('handleDuplicate:', err);
      toast.error('Unable to duplicate quotation.');
    }
  };

  const handleQuickAction = (action, quote) => {
    if (action === "email") {
      const updated = { ...quote, email_status: "Sent", status: quote.status === "Draft" ? "Sent" : quote.status, sent_date: dayjs().format("YYYY-MM-DD"), updated_at: dayjs().toISOString() };
      setQuotations((prev) => prev.map((item) => (item.id === quote.id ? updated : item)));
      toast.success("Quotation emailed successfully.");
    } else if (action === "pdf") {
      const updated = { ...quote, download_count: Number(quote.download_count || 0) + 1, viewed_date: dayjs().format("YYYY-MM-DD"), status: quote.status === "Draft" ? "Viewed" : quote.status, updated_at: dayjs().toISOString() };
      setQuotations((prev) => prev.map((item) => (item.id === quote.id ? updated : item)));
      toast.success("Quotation PDF prepared.");
    } else if (action === "print") {
      window.print();
      toast.success("Print dialog opened.");
    } else if (action === "whatsapp") {
      const updated = { ...quote, whatsapp_status: "Delivered", status: quote.status === "Draft" ? "Sent" : quote.status, sent_date: dayjs().format("YYYY-MM-DD"), updated_at: dayjs().toISOString() };
      setQuotations((prev) => prev.map((item) => (item.id === quote.id ? updated : item)));
      toast.success("WhatsApp share prepared.");
    }
  };


  const toggleSelection = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedIds((prev) => (prev.length === filteredQuotations.length ? [] : filteredQuotations.map((item) => item.id)));
  };

  const handleBulkAction = (action) => {
    if (!selectedIds.length) {
      toast.error("Select at least one quotation first.");
      return;
    }

    if (action === "delete") {
      setQuotations((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      toast.success("Selected quotations deleted.");
    } else if (action === "send") {
      setQuotations((prev) => prev.map((item) => (selectedIds.includes(item.id) ? { ...item, status: "Sent", sent_date: dayjs().format("YYYY-MM-DD"), email_status: "Sent" } : item)));
      setSelectedIds([]);
      toast.success("Selected quotations sent.");
    } else if (action === "export") {
      toast.success("Excel export prepared for selected quotations.");
    }
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-white">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_25%)] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.3em] text-orange-300/80">
                <FileText className="h-4 w-4" /> Project Quotations
              </div>
              <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Quotation management for winning new work</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                Create, review, approve, and convert quotations into projects with a cleaner workflow tailored for the admin team.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button disabled={loading} onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus className="h-4 w-4" /> {loading ? 'Loading...' : 'New quotation'}
              </button>
              <button disabled={loading} onClick={() => handleBulkAction("export")} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed">
                <FileSpreadsheet className="h-4 w-4" /> Export
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={`rounded-2xl border border-white/10 bg-linear-to-br ${card.accent} p-4`}> 
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{card.label}</p>
                      <p className="mt-2 text-xl font-semibold text-white">{card.value}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-[#0f1119] p-4 shadow-[0_20px_70px_rgba(0,0,0,0.25)] sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={filters.search} onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))} placeholder="Search quotation" className="w-full bg-transparent outline-none placeholder:text-slate-500" />
              </label>
              <select value={filters.client} onChange={(event) => setFilters((prev) => ({ ...prev, client: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none">
                <option value="">All clients</option>
                {clientOptions.map((client) => <option key={client} value={client}>{client}</option>)}
              </select>
              <select value={filters.project} onChange={(event) => setFilters((prev) => ({ ...prev, project: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none">
                <option value="">All projects</option>
                {projectOptions.map((project) => <option key={project} value={project}>{project}</option>)}
              </select>
              <select value={filters.service_type} onChange={(event) => setFilters((prev) => ({ ...prev, service_type: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none">
                <option value="">Service type</option>
                <option value="Website Development">Website Development</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="ERP Development">ERP Development</option>
                <option value="UI/UX Design">UI/UX Design</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none">
                <option value="">Status</option>
                {Object.keys(statusStyles).map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
              <select value={filters.approval_status} onChange={(event) => setFilters((prev) => ({ ...prev, approval_status: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none">
                <option value="">Approval</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select value={filters.created_by} onChange={(event) => setFilters((prev) => ({ ...prev, created_by: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-100 outline-none">
                <option value="">Created by</option>
                {createdByOptions.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button onClick={toggleAll} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10">{selectedIds.length === filteredQuotations.length && filteredQuotations.length ? "Clear all" : "Select all"}</button>
              <button onClick={() => handleBulkAction("send")} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10">Send selected</button>
              <button onClick={() => handleBulkAction("delete")} className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/20">Delete selected</button>
            </div>
            <div className="flex gap-2 text-sm text-slate-400">
              <label className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="mr-2">From</span>
                <input type="date" value={filters.date_from} onChange={(event) => setFilters((prev) => ({ ...prev, date_from: event.target.value }))} className="bg-transparent outline-none" />
              </label>
              <label className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                <span className="mr-2">To</span>
                <input type="date" value={filters.date_to} onChange={(event) => setFilters((prev) => ({ ...prev, date_to: event.target.value }))} className="bg-transparent outline-none" />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0f1119] shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-left text-slate-400">
                <tr>
                  <th className="px-4 py-3"><input type="checkbox" checked={selectedIds.length === filteredQuotations.length && filteredQuotations.length > 0} onChange={toggleAll} className="h-4 w-4 rounded border-white/20 bg-transparent" /></th>
                  <th className="px-4 py-3">Quotation</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Grand Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Approval</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map((quote) => (
                  <tr key={quote.id} className="border-t border-white/10 text-slate-200 hover:bg-white/5">
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(quote.id)} onChange={() => toggleSelection(quote.id)} className="h-4 w-4 rounded border-white/20 bg-transparent" /></td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{quote.quotation_number}</div>
                      <div className="mt-1 text-xs text-slate-400">{quote.company_name || quote.client_name || 'Unknown client'}</div>
                    </td>
                    <td className="px-4 py-3">{quote.project_name}</td>
                    <td className="px-4 py-3">{quote.client_name}</td>
                    <td className="px-4 py-3">{quote.service_type}</td>
                    <td className="px-4 py-3">{dayjs(quote.quotation_date).format("DD MMM YYYY")}</td>
                    <td className="px-4 py-3">{formatCurrency(quote.grand_total || 0, quote.currency || "INR")}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[quote.status] || statusStyles.Draft}`}>{quote.status}</span></td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${approvalStyles[quote.approval_status] || approvalStyles.Pending}`}>{quote.approval_status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => openViewModal(quote)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10" title="View"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => openEditModal(quote)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10" title="Edit"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDuplicate(quote)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10" title="Duplicate"><Copy className="h-4 w-4" /></button>
                        <button onClick={() => handleQuickAction("pdf", quote)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10" title="PDF"><Download className="h-4 w-4" /></button>
                        <button onClick={() => handleQuickAction("email", quote)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10" title="Email"><Mail className="h-4 w-4" /></button>
                        <button onClick={() => handleQuickAction("print", quote)} className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10" title="Print"><Printer className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(quote)} className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-120 overflow-y-auto bg-black/80 px-3 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-[#0f1119] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.3em] text-orange-300/80">{modalMode === "view" ? "Quotation overview" : modalMode === "edit" ? "Edit quotation" : "New quotation"}</div>
                <h2 className="mt-2 text-2xl font-semibold text-white">{modalMode === "view" ? (activeQuotation?.quotation_number || "Quotation") : modalMode === "edit" ? "Update quotation details" : "Create a new quotation"}</h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">Capture the project scope, pricing, approvals, and engagement history in one place.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-between">
                {modalMode === "view" ? (
                  <button onClick={() => openEditModal(activeQuotation)} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                    <Pencil className="h-4 w-4" /> Edit
                  </button>
                ) : null}
                <button onClick={closeModal} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Close</button>
              </div>
            </div>

            {modalMode === "view" && activeQuotation ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{activeQuotation.project_name}</h3>
                      <p className="mt-1 text-sm text-slate-400">{activeQuotation.company_name} • {activeQuotation.client_name}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[activeQuotation.status] || statusStyles.Draft}`}>{activeQuotation.status}</span>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-[#0f1119] p-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Quotation number</p>
                      <p className="mt-2 text-sm font-semibold text-white">{activeQuotation.quotation_number}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0f1119] p-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Grand total</p>
                      <p className="mt-2 text-sm font-semibold text-white">{formatCurrency(activeQuotation.grand_total || 0, activeQuotation.currency || "INR")}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0f1119] p-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Payment terms</p>
                      <p className="mt-2 text-sm font-semibold text-white">{activeQuotation.payment_terms}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#0f1119] p-3">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Delivery timeline</p>
                      <p className="mt-2 text-sm font-semibold text-white">{activeQuotation.delivery_timeline}</p>
                    </div>
                  </div>
                  <div className="mt-6 rounded-2xl border border-white/10 bg-[#0f1119] p-4">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Scope of work</h4>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{activeQuotation.scope_of_work || "No scope of work captured yet."}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">Activity timeline</h3>
                    <div className="mt-4 space-y-3">
                      {(activeQuotation.activity_logs || []).slice().reverse().map((entry, index) => (
                        <div key={`${entry.action}-${index}`} className="rounded-2xl border border-white/10 bg-[#0f1119] p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">{entry.action}</p>
                            <p className="text-xs text-slate-500">{dayjs(entry.created_at).format("DD MMM YYYY")}</p>
                          </div>
                          <p className="mt-2 text-sm text-slate-400">{entry.description}</p>
                          <p className="mt-2 text-xs text-slate-500">By {entry.user}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">Approval details</h3>
                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                      <p><span className="text-slate-500">Status:</span> {activeQuotation.approval_status}</p>
                      <p><span className="text-slate-500">Approved by:</span> {activeQuotation.approval?.approved_by || "Pending"}</p>
                      <p><span className="text-slate-500">Comments:</span> {activeQuotation.approval?.comments || "No comments yet."}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-6">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">Basic information</h3>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Quotation number</span>
                        <input value={formData.quotation_number || "Auto generated on save"} readOnly className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-slate-400 outline-none" placeholder="Auto generated on save" />
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Project name</span>
                        <input value={formData.project_name} onChange={(event) => updateField("project_name", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Select existing client</span>
                        <select value={selectedClientUuid} onChange={(event) => handleSelectClient(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none">
                          <option value="">Choose a client to auto-fill details</option>
                          {clientLoading ? (
                            <option value="">Loading clients...</option>
                          ) : clients.length === 0 ? (
                            <option value="">No clients available</option>
                          ) : (
                            clients.map((client) => (
                              <option key={client.uuid || client.id} value={client.uuid || client.id}>
                                {`${client.client_name || client.company_name || client.business_name || 'Untitled client'}${client.phone_number ? ` (${client.phone_number})` : ''}`}
                              </option>
                            ))
                          )}
                        </select>
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Client</span>
                        <input value={formData.client_name} onChange={(event) => updateField("client_name", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Company name</span>
                        <input value={formData.company_name} onChange={(event) => updateField("company_name", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Contact person</span>
                        <input value={formData.contact_person} onChange={(event) => updateField("contact_person", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Email</span>
                        <input value={formData.email} onChange={(event) => updateField("email", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Phone</span>
                        <input value={formData.phone_number} onChange={(event) => updateField("phone_number", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Service type</span>
                        <select value={formData.service_type} onChange={(event) => updateField("service_type", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none">
                          <option value="Website Development">Website Development</option>
                          <option value="Mobile App Development">Mobile App Development</option>
                          <option value="ERP Development">ERP Development</option>
                          <option value="UI/UX Design">UI/UX Design</option>
                        </select>
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Quotation date</span>
                        <input type="date" value={formData.quotation_date} onChange={(event) => updateField("quotation_date", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Valid until</span>
                        <input type="date" value={formData.valid_until} onChange={(event) => updateField("valid_until", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Currency</span>
                        <select value={formData.currency} onChange={(event) => updateField("currency", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none">
                          <option value="INR">INR</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">Project information</h3>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Project type</span>
                        <select value={formData.project_type} onChange={(event) => updateField("project_type", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none">
                          <option value="Website">Website</option>
                          <option value="Web Application">Web Application</option>
                          <option value="Mobile App">Mobile App</option>
                          <option value="ERP">ERP</option>
                          <option value="CRM">CRM</option>
                        </select>
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Service category</span>
                        <input value={formData.service_category} onChange={(event) => updateField("service_category", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300 md:col-span-2">
                        <span className="mb-2 block">Project description</span>
                        <textarea value={formData.project_description} onChange={(event) => updateField("project_description", event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300 md:col-span-2">
                        <span className="mb-2 block">Scope of work</span>
                        <textarea value={formData.scope_of_work} onChange={(event) => updateField("scope_of_work", event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300 md:col-span-2">
                        <span className="mb-2 block">Technologies used</span>
                        <input value={formData.technologies_used} onChange={(event) => updateField("technologies_used", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Quotation items</h3>
                      <button onClick={addItem} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10">Add row</button>
                    </div>
                    <div className="mt-4 space-y-3">
                      {formData.items.map((item, index) => (
                        <div key={`item-${index}`} className="rounded-2xl border border-white/10 bg-[#0f1119] p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-white">Item {index + 1}</p>
                            {formData.items.length > 1 && (
                              <button onClick={() => removeItem(index)} className="text-sm text-rose-300 transition hover:text-rose-200">Remove</button>
                            )}
                          </div>
                          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <label className="text-sm text-slate-300">
                              <span className="mb-2 block">Service</span>
                              <input value={item.service_name} onChange={(event) => updateItem(index, "service_name", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                            </label>
                            <label className="text-sm text-slate-300">
                              <span className="mb-2 block">Description</span>
                              <input value={item.description} onChange={(event) => updateItem(index, "description", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                            </label>
                            <label className="text-sm text-slate-300">
                              <span className="mb-2 block">Quantity</span>
                              <input type="number" value={item.quantity} onChange={(event) => updateItem(index, "quantity", Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                            </label>
                            <label className="text-sm text-slate-300">
                              <span className="mb-2 block">Unit</span>
                              <input value={item.unit} onChange={(event) => updateItem(index, "unit", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                            </label>
                            <label className="text-sm text-slate-300">
                              <span className="mb-2 block">Duration</span>
                              <input value={item.duration} onChange={(event) => updateItem(index, "duration", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                            </label>
                            <label className="text-sm text-slate-300">
                              <span className="mb-2 block">Unit price</span>
                              <input type="number" value={item.unit_price} onChange={(event) => updateItem(index, "unit_price", Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                            </label>
                            <label className="text-sm text-slate-300">
                              <span className="mb-2 block">Discount</span>
                              <input type="number" value={item.discount} onChange={(event) => updateItem(index, "discount", Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                            </label>
                            <label className="text-sm text-slate-300">
                              <span className="mb-2 block">Tax %</span>
                              <input type="number" value={item.tax_percentage} onChange={(event) => updateItem(index, "tax_percentage", Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                   <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">Pricing summary</h3>
                    <div className="mt-4 grid gap-3">
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-3 text-sm text-slate-300"><span>Sub total</span><span>{formatCurrency(formData.subtotal || 0, formData.currency || "INR")}</span></div>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Discount</span>
                        <input type="number" value={formData.discount} onChange={(event) => updateField("discount", Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Additional charges</span>
                        <input type="number" value={formData.additional_charges} onChange={(event) => updateField("additional_charges", Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Tax rate %</span>
                        <input type="number" value={formData.tax_rate || 18} onChange={(event) => updateField("tax_rate", Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Round off</span>
                        <input type="number" value={formData.round_off} onChange={(event) => updateField("round_off", Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-3 text-sm text-slate-300"><span>GST</span><span>{formatCurrency(formData.tax_amount || 0, formData.currency || "INR")}</span></div>
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-3 text-sm text-slate-300"><span>Grand total</span><span>{formatCurrency(formData.grand_total || 0, formData.currency || "INR")}</span></div>
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Advance amount</span>
                        <input type="number" value={formData.advance_amount} onChange={(event) => updateField("advance_amount", Number(event.target.value))} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                      </label>
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-3 text-sm text-slate-300"><span>Remaining balance</span><span>{formatCurrency(formData.balance_amount || 0, formData.currency || "INR")}</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                 

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">Project timeline</h3>
                    <div className="mt-4 space-y-3">
                      {formData.timeline_items.map((item, index) => (
                        <div key={`timeline-${index}`} className="rounded-2xl border border-white/10 bg-[#0f1119] p-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <label className="text-sm text-slate-300">
                              <span className="mb-2 block">Phase</span>
                              <input value={item.phase} onChange={(event) => updateTimelineItem(index, "phase", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                            </label>
                            <label className="text-sm text-slate-300">
                              <span className="mb-2 block">Duration</span>
                              <input value={item.duration} onChange={(event) => updateTimelineItem(index, "duration", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                            </label>
                            <label className="text-sm text-slate-300">
                              <span className="mb-2 block">Start date</span>
                              <input type="date" value={item.start_date} onChange={(event) => updateTimelineItem(index, "start_date", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                            </label>
                            <label className="text-sm text-slate-300">
                              <span className="mb-2 block">End date</span>
                              <input type="date" value={item.end_date} onChange={(event) => updateTimelineItem(index, "end_date", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                            </label>
                          </div>
                        </div>
                      ))}
                      <button onClick={addTimelineItem} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10">Add timeline phase</button>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">Terms & conditions</h3>
                    <div className="mt-4 space-y-3">
                      {formData.terms_sections.map((section, index) => (
                        <div key={`term-${index}`} className="rounded-2xl border border-white/10 bg-[#0f1119] p-3">
                          <label className="text-sm text-slate-300">
                            <span className="mb-2 block">Section title</span>
                            <input value={section.title} onChange={(event) => updateTermsSection(index, "title", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                          </label>
                          <label className="mt-3 block text-sm text-slate-300">
                            <span className="mb-2 block">Content</span>
                            <textarea value={section.content} onChange={(event) => updateTermsSection(index, "content", event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-white outline-none" />
                          </label>
                        </div>
                      ))}
                      <button onClick={addTermsSection} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10">Add section</button>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <h3 className="text-lg font-semibold text-white">Attachments & approvals</h3>
                    <div className="mt-4 space-y-3">
                      <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-orange-400/40 bg-orange-500/10 px-3 py-3 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/20">
                        <input type="file" multiple className="hidden" onChange={handleAttachmentUpload} />
                        Upload files
                      </label>
                      {formData.attachments.length ? (
                        <div className="space-y-2">
                          {formData.attachments.map((item, index) => (
                            <div key={`attachment-${index}`} className="rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-sm text-slate-300">
                              {item.file_name} • {Math.round(item.file_size / 1024)} KB
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No attachments added yet.</p>
                      )}
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="text-sm text-slate-300">
                          <span className="mb-2 block">Status</span>
                          <select value={formData.status} onChange={(event) => updateField("status", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none">
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Viewed">Viewed</option>
                            <option value="Under Discussion">Under Discussion</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Expired">Expired</option>
                            <option value="Converted to Project">Converted to Project</option>
                          </select>
                        </label>
                        <label className="text-sm text-slate-300">
                          <span className="mb-2 block">Approval status</span>
                          <select value={formData.approval_status} onChange={(event) => updateField("approval_status", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none">
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </label>
                        <label className="text-sm text-slate-300">
                          <span className="mb-2 block">Payment status</span>
                          <select value={formData.payment_status} onChange={(event) => updateField("payment_status", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none">
                            <option value="Pending">Pending</option>
                            <option value="Advance Paid">Advance Paid</option>
                            <option value="Partial">Partial</option>
                            <option value="Complete">Complete</option>
                          </select>
                        </label>
                        <label className="text-sm text-slate-300">
                          <span className="mb-2 block">Payment terms</span>
                          <select value={formData.payment_terms} onChange={(event) => updateField("payment_terms", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none">
                            <option value="100% Advance">100% Advance</option>
                            <option value="50%-50%">50%-50%</option>
                            <option value="40%-40%-20%">40%-40%-20%</option>
                            <option value="Milestone Based">Milestone Based</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Custom">Custom</option>
                          </select>
                        </label>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="text-sm text-slate-300">
                          <span className="mb-2 block">Approved by</span>
                          <input value={formData.approval.approved_by} onChange={(event) => updateNestedField("approved_by", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                        </label>
                        <label className="text-sm text-slate-300">
                          <span className="mb-2 block">Approval date</span>
                          <input type="date" value={formData.approval.approved_at} onChange={(event) => updateNestedField("approved_at", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                        </label>
                        <label className="text-sm text-slate-300 md:col-span-2">
                          <span className="mb-2 block">Rejection reason</span>
                          <input value={formData.approval.rejection_reason} onChange={(event) => updateNestedField("rejection_reason", event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                        </label>
                        <label className="text-sm text-slate-300 md:col-span-2">
                          <span className="mb-2 block">Manager comments</span>
                          <textarea value={formData.approval.comments} onChange={(event) => updateNestedField("comments", event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                        </label>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-lg font-semibold text-white">Notes & follow-up</h3>
                <div className="mt-4 space-y-3">
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Internal notes</span>
                    <textarea value={formData.notes} onChange={(event) => updateField("notes", event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                  </label>
                  <label className="text-sm text-slate-300">
                    <span className="mb-2 block">Client notes</span>
                    <textarea value={formData.client_message} onChange={(event) => updateField("client_message", event.target.value)} className="min-h-24 w-full rounded-2xl border border-white/10 bg-[#0f1119] px-3 py-2.5 text-white outline-none" />
                  </label>
                </div>
              </div>
              </>
            )}
            {modalMode !== 'view' && (
              <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
                <button onClick={closeModal} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Close</button>
                <button disabled={saving} onClick={submitQuotation} className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70">
                  <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save quotation'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectQuotationsPage;
