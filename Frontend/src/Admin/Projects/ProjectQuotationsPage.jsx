import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
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
  RefreshCw,
  List,
  LayoutGrid,
  SlidersHorizontal,
  ChevronDown,
  X,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import api from "../../api";

// ─── Style maps (logic unchanged) ────────────────────────────────────────────
const statusStyles = {
  Draft: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  Sent: "bg-sky-500/15 text-sky-400 border border-sky-500/25",
  Viewed: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25",
  "Under Discussion": "bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/25",
  Approved: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  Rejected: "bg-rose-500/15 text-rose-400 border border-rose-500/25",
  Expired: "bg-slate-500/15 text-slate-300 border border-slate-400/25",
  "Converted to Project": "bg-violet-500/15 text-violet-400 border border-violet-500/25",
};

const approvalStyles = {
  Pending: "bg-amber-500/15 text-amber-400",
  Approved: "bg-emerald-500/15 text-emerald-400",
  Rejected: "bg-rose-500/15 text-rose-400",
};

// status dot colours for pills
const STATUS_DOTS = {
  Draft: "bg-amber-400",
  Sent: "bg-sky-400",
  Viewed: "bg-indigo-400",
  "Under Discussion": "bg-fuchsia-400",
  Approved: "bg-emerald-400",
  Rejected: "bg-rose-400",
  Expired: "bg-slate-400",
  "Converted to Project": "bg-violet-400",
};

const AVATAR_COLOURS = [
  "#6366f1","#10b981","#f59e0b","#3b82f6","#ec4899",
  "#14b8a6","#f97316","#8b5cf6","#ef4444","#22c55e",
];

// ─── Pure helpers (logic unchanged) ──────────────────────────────────────────
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

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "??";

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── Avatar (AllClients style) ────────────────────────────────────────────────
function Avatar({ name, index, size = "md" }) {
  const c = AVATAR_COLOURS[index % AVATAR_COLOURS.length];
  const cls = size === "lg" ? "w-14 h-14 rounded-2xl text-base" : "w-10 h-10 rounded-xl text-xs";
  return (
    <div
      className={`${cls} flex items-center justify-center font-bold shrink-0 select-none`}
      style={{ background: c + "28", border: `1.5px solid ${c}44`, color: c }}
    >
      {initials(name)}
    </div>
  );
}

// ─── Status Pill (AllClients style) ──────────────────────────────────────────
function StatusPill({ status }) {
  const dot = STATUS_DOTS[status] || "bg-white/40";
  const pill = statusStyles[status] || statusStyles.Draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status || "Draft"}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const ProjectQuotationsPage = () => {
  const navigate = useNavigate();

  // ── All state ──
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
  // View modal (read-only) still uses local state
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeQuotation, setActiveQuotation] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── UI state ──
  const [viewMode, setViewMode] = useState("table");
  const [showFilters, setShowFilters] = useState(false);

  // ── Derived (logic unchanged) ──
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

  const getQuoteKey = (quote) => quote.uuid || quote.id;

  // ── Effects (logic unchanged) ──
  useEffect(() => {
    let isMounted = true;
    const loadQuotations = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/quotations?limit=200&page=1");
        const payload = data?.data ?? data?.rows ?? data ?? [];
        if (isMounted) setQuotations(Array.isArray(payload) ? payload : []);
      } catch (err) {
        console.error("loadQuotations:", err);
        toast.error("Failed to load quotations from the server.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadQuotations();
    return () => { isMounted = false; };
  }, []);

  // ── Stat cards (logic unchanged) ──
  const statCards = useMemo(() => {
    const totalValue = quotations.reduce((sum, item) => sum + Number(item.grand_total || 0), 0);
    const approvedValue = quotations
      .filter((item) => item.approval_status === "Approved")
      .reduce((sum, item) => sum + Number(item.grand_total || 0), 0);
    const pendingApprovals = quotations.filter((item) => item.approval_status === "Pending").length;
    return [
      { label: "Total Quotations",    value: quotations.length,                                                          icon: FileText,        cls: "text-sky-400",     bg: "bg-sky-500/15"     },
      { label: "Draft",               value: quotations.filter((item) => item.status === "Draft").length,                icon: RotateCcw,       cls: "text-amber-400",   bg: "bg-amber-500/15"   },
      { label: "Approved",            value: quotations.filter((item) => item.approval_status === "Approved").length,    icon: CheckCircle2,    cls: "text-emerald-400", bg: "bg-emerald-500/15" },
      { label: "Rejected",            value: quotations.filter((item) => item.status === "Rejected").length,             icon: XCircle,         cls: "text-rose-400",    bg: "bg-rose-500/15"    },
      { label: "Expired",             value: quotations.filter((item) => item.status === "Expired").length,              icon: Clock3,          cls: "text-slate-400",   bg: "bg-slate-500/15"   },
      { label: "Converted",           value: quotations.filter((item) => item.status === "Converted to Project").length, icon: FolderKanban,    cls: "text-violet-400",  bg: "bg-violet-500/15"  },
      { label: "Total Value",         value: formatCurrency(totalValue),                                                  icon: CircleDollarSign,cls: "text-orange-400",  bg: "bg-orange-500/15"  },
      { label: "Approved Value",      value: formatCurrency(approvedValue),                                               icon: Sparkles,        cls: "text-teal-400",    bg: "bg-teal-500/15"    },
      { label: "Pending Approvals",   value: pendingApprovals,                                                            icon: CircleAlert,     cls: "text-fuchsia-400", bg: "bg-fuchsia-500/15" },
    ];
  }, [quotations]);

  // ── Action handlers ──
  const openCreateModal = () => {
    navigate("/admin/myprojects/quotations/new");
  };

  const openEditModal = (quote) => {
    navigate(`/admin/myprojects/quotations/edit/${getQuoteKey(quote)}`);
  };

  const openViewModal = (quote) => {
    setActiveQuotation(quote);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setActiveQuotation(null);
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
        console.error("handleDelete:", err);
        toast.error("Failed to delete quotation.");
        return;
      }
    }
    setQuotations((prev) => prev.filter((item) => item.id !== quote.id));
    setSelectedIds((prev) => prev.filter((id) => id !== quote.id));
    toast.success("Quotation deleted.");
  };

  const handleDuplicate = async (quote) => {
    try {
      const { data } = await api.post(`/quotations/${getQuoteKey(quote)}/duplicate`);
      setQuotations((prev) => [data.data, ...prev]);
      toast.success("Quotation duplicated successfully.");
    } catch (err) {
      console.error("handleDuplicate:", err);
      toast.error("Unable to duplicate quotation.");
    }
  };

  const handleQuickAction = async (action, quote) => {
    const key = getQuoteKey(quote);
    if (action === "email") {
      await api.patch(`/quotations/${key}/status`, { status: "Sent" });
      setQuotations((prev) =>
        prev.map((item) => (getQuoteKey(item) === key ? { ...item, status: "Sent" } : item))
      );
      toast.success("Quotation marked as sent. Configure email delivery to attach the PDF.");
    } else if (action === "pdf") {
      const { data } = await api.get(`/quotations/${key}/preview`);
      const printWindow = window.open("", "quotation-preview", "width=900,height=700");
      if (printWindow) {
        printWindow.document.write(
          `<pre style="white-space:pre-wrap;font:14px sans-serif;padding:32px">${JSON.stringify(data.data, null, 2)}</pre>`
        );
        printWindow.document.close();
        printWindow.print();
      }
      toast.success("Quotation preview opened for printing.");
    } else if (action === "print") {
      window.print();
      toast.success("Print dialog opened.");
    } else if (action === "whatsapp") {
      const { data } = await api.get(`/quotations/${key}/share`);
      const message = `Hello ${quote.client_name || "there"}, quotation ${quote.quotation_number} for ${quote.project_name} is ready. Total: ${formatCurrency(quote.grand_total, quote.currency)}. View: ${data.data.url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      await api.patch(`/quotations/${key}/status`, { status: "Sent" });
      setQuotations((prev) =>
        prev.map((item) => (getQuoteKey(item) === key ? { ...item, status: "Sent" } : item))
      );
      toast.success("WhatsApp share prepared.");
    }
  };

  const toggleSelection = (key) => {
    setSelectedIds((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      prev.length === filteredQuotations.length ? [] : filteredQuotations.map(getQuoteKey)
    );
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
      setQuotations((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id)
            ? { ...item, status: "Sent", sent_date: dayjs().format("YYYY-MM-DD"), email_status: "Sent" }
            : item
        )
      );
      setSelectedIds([]);
      toast.success("Selected quotations sent.");
    } else if (action === "export") {
      toast.success("Excel export prepared for selected quotations.");
    }
  };

  // ── Filter helpers ──
  const hasFilters = !!(
    filters.search || filters.client || filters.project ||
    filters.service_type || filters.status || filters.approval_status ||
    filters.date_from || filters.date_to
  );

  const clearFilters = () =>
    setFilters({ search: "", client: "", project: "", service_type: "", status: "", approval_status: "", created_by: "", date_from: "", date_to: "" });

  const activeFilterCount = [
    filters.client, filters.project, filters.service_type,
    filters.status, filters.approval_status, filters.date_from, filters.date_to,
  ].filter(Boolean).length;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">

      {/* ── Page Header (AllClients style) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <FileText size={22} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Project Quotations</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? "Loading…" : `${filteredQuotations.length} quotation${filteredQuotations.length !== 1 ? "s" : ""} total`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setLoading(true);
              api.get("/quotations?limit=200&page=1")
                .then(({ data }) => {
                  const payload = data?.data ?? data?.rows ?? data ?? [];
                  setQuotations(Array.isArray(payload) ? payload : []);
                })
                .catch(() => toast.error("Failed to refresh quotations."))
                .finally(() => setLoading(false));
            }}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-orange-400" : ""} />
          </button>
          <button
            disabled={loading}
            onClick={() => handleBulkAction("export")}
            className="inline-flex items-center gap-2 text-white/70 text-sm font-semibold px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition disabled:opacity-50"
          >
            <FileSpreadsheet size={15} /> Export
          </button>
          <button
            disabled={loading}
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-orange-500/25 hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
          >
            <Plus size={15} /> New Quotation
          </button>
        </div>
      </div>

      {/* ── Stat Cards (AllClients style) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/[0.04] border border-white/8 rounded-2xl p-4 flex items-center gap-3 hover:bg-white/[0.06] transition">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={18} className={s.cls} />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-white/50 text-xs">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Toolbar (AllClients style) ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search quotation, project, client, service…"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition"
          />
          {filters.search && (
            <button onClick={() => setFilters((prev) => ({ ...prev, search: "" }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
            showFilters || hasFilters
              ? "bg-orange-500/15 border-orange-500/40 text-orange-400"
              : "bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          <SlidersHorizontal size={13} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>

        {/* View toggle */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === "table" ? "bg-orange-500 text-white shadow-md" : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
            title="Table View"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === "card" ? "bg-orange-500 text-white shadow-md" : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
            title="Card View"
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* ── Filters Panel (AllClients chip style) ── */}
      {showFilters && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Filter By</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-orange-400/70 hover:text-orange-400 flex items-center gap-1 transition">
                <X size={10} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Status chips */}
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(statusStyles).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilters((prev) => ({ ...prev, status: prev.status === s ? "" : s }))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                      filters.status === s
                        ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                        : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Approval chips */}
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Approval</p>
              <div className="flex flex-wrap gap-1.5">
                {["Pending", "Approved", "Rejected"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilters((prev) => ({ ...prev, approval_status: prev.approval_status === s ? "" : s }))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                      filters.approval_status === s
                        ? "bg-orange-500/20 border-orange-500/50 text-orange-400"
                        : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Client / Project / Date selects */}
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Client</p>
                <select
                  value={filters.client}
                  onChange={(e) => setFilters((prev) => ({ ...prev, client: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 outline-none [&>option]:bg-[#111318]"
                >
                  <option value="">All clients</option>
                  {clientOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">Project</p>
                <select
                  value={filters.project}
                  onChange={(e) => setFilters((prev) => ({ ...prev, project: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 outline-none [&>option]:bg-[#111318]"
                >
                  <option value="">All projects</option>
                  {projectOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">From</p>
                  <input type="date" value={filters.date_from} onChange={(e) => setFilters((prev) => ({ ...prev, date_from: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 outline-none" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2">To</p>
                  <input type="date" value={filters.date_to} onChange={(e) => setFilters((prev) => ({ ...prev, date_to: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Bulk actions row */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/8">
            <button onClick={toggleAll} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition">
              {selectedIds.length === filteredQuotations.length && filteredQuotations.length ? "Clear all" : "Select all"}
            </button>
            <button onClick={() => handleBulkAction("send")} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-sky-500/10 border border-sky-500/25 text-sky-400 hover:bg-sky-500/20 transition">
              Send selected
            </button>
            <button onClick={() => handleBulkAction("delete")} className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-rose-500/10 border border-rose-500/25 text-rose-400 hover:bg-rose-500/20 transition">
              Delete selected
            </button>
            {selectedIds.length > 0 && (
              <span className="px-3 py-1.5 text-[11px] text-white/40">{selectedIds.length} selected</span>
            )}
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={30} className="animate-spin text-orange-400/70" />
            <p className="text-sm text-white/40">Loading quotations…</p>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && filteredQuotations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <FileText size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No quotations found</p>
          <p className="text-xs mt-1">
            {hasFilters ? "Try adjusting your filters." : "Create your first quotation to get started."}
          </p>
          {!hasFilters && (
            <button
              onClick={openCreateModal}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
              style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}
            >
              <Plus size={14} /> New Quotation
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          TABLE MODE
      ══════════════════════════════════════════ */}
      {!loading && filteredQuotations.length > 0 && viewMode === "table" && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredQuotations.length && filteredQuotations.length > 0}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-white/20 bg-transparent accent-orange-500"
                    />
                  </th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Quotation</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Project</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Client</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Service</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Date</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Total</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Status</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Approval</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map((quote, i) => (
                  <tr
                    key={getQuoteKey(quote)}
                    className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(getQuoteKey(quote))}
                        onChange={() => toggleSelection(getQuoteKey(quote))}
                        className="h-4 w-4 rounded border-white/20 bg-transparent accent-orange-500"
                      />
                    </td>

                    {/* Quotation number with avatar */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={quote.project_name || quote.client_name || "Q"} index={i} />
                        <div>
                          <p className="text-white font-semibold text-sm leading-tight">{quote.quotation_number || "—"}</p>
                          <p className="text-white/35 text-xs mt-0.5">{quote.company_name || quote.client_name || "Unknown"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-white/70 text-sm">{quote.project_name || "—"}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-white/70 text-sm">{quote.client_name || "—"}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      {quote.service_type ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/55 bg-white/[0.07] border border-white/10 px-2.5 py-1 rounded-lg">
                          <Building2 size={9} className="text-white/25" /> {quote.service_type}
                        </span>
                      ) : (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-white/35 text-xs">{fmtDate(quote.quotation_date)}</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-white font-semibold text-sm">
                        {formatCurrency(quote.grand_total || 0, quote.currency || "INR")}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusPill status={quote.status} />
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${approvalStyles[quote.approval_status] || approvalStyles.Pending}`}>
                        {quote.approval_status || "Pending"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openViewModal(quote)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition" title="View">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => openEditModal(quote)} className="w-7 h-7 rounded-lg bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 border border-transparent hover:border-orange-500/30 flex items-center justify-center transition" title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDuplicate(quote)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 border border-transparent hover:border-white/15 flex items-center justify-center transition" title="Duplicate">
                          <Copy size={13} />
                        </button>
                        <button onClick={() => handleQuickAction("pdf", quote)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 border border-transparent hover:border-white/15 flex items-center justify-center transition" title="PDF">
                          <Download size={13} />
                        </button>
                        <button onClick={() => handleQuickAction("email", quote)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 border border-transparent hover:border-white/15 flex items-center justify-center transition" title="Email">
                          <Mail size={13} />
                        </button>
                        <button onClick={() => handleQuickAction("print", quote)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 border border-transparent hover:border-white/15 flex items-center justify-center transition" title="Print">
                          <Printer size={13} />
                        </button>
                        <button onClick={() => handleDelete(quote)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          CARD MODE
      ══════════════════════════════════════════ */}
      {!loading && filteredQuotations.length > 0 && viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filteredQuotations.map((quote, i) => {
            const colour = AVATAR_COLOURS[i % AVATAR_COLOURS.length];
            return (
              <div
                key={getQuoteKey(quote)}
                className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={quote.project_name || quote.client_name || "Q"} index={i} />
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm leading-tight truncate">
                        {quote.quotation_number || "—"}
                      </p>
                      <p className="text-white/35 text-xs mt-0.5 truncate">
                        {quote.company_name || quote.client_name || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={quote.status} />
                </div>

                {/* Project & amount */}
                <div className="space-y-1.5">
                  {quote.project_name && (
                    <p className="text-white/55 text-xs">{quote.project_name}</p>
                  )}
                  <p className="text-white font-bold text-base">
                    {formatCurrency(quote.grand_total || 0, quote.currency || "INR")}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {quote.service_type && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: colour + "20", color: colour }}>
                      {quote.service_type}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${approvalStyles[quote.approval_status] || approvalStyles.Pending}`}>
                    {quote.approval_status || "Pending"}
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.07]">
                  <span className="text-[10px] text-white/25">{fmtDate(quote.quotation_date)}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openViewModal(quote)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-blue-500/15 text-white/40 hover:text-blue-400 border border-transparent hover:border-blue-500/25 flex items-center justify-center transition" title="View">
                      <Eye size={13} />
                    </button>
                    <button onClick={() => openEditModal(quote)} className="w-7 h-7 rounded-lg bg-orange-500/10 hover:bg-orange-500/25 text-orange-400 flex items-center justify-center transition" title="Edit">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDuplicate(quote)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 flex items-center justify-center transition" title="Duplicate">
                      <Copy size={13} />
                    </button>
                    <button onClick={() => handleDelete(quote)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/15 text-white/30 hover:text-rose-400 border border-transparent hover:border-rose-500/25 flex items-center justify-center transition" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View Modal (Read-only Preview) ── */}
      {showViewModal && activeQuotation && createPortal(
        <div className="fixed inset-0 z-[120] w-full h-full overflow-y-auto bg-black/80 px-3 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto max-w-6xl rounded-[28px] border border-white/10 bg-[#0f1119] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.3em] text-orange-300/80">
                  Quotation overview
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {activeQuotation.quotation_number || "Quotation"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  Capture the project scope, pricing, approvals, and engagement history in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-between">
                <button onClick={() => openEditModal(activeQuotation)} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button onClick={closeViewModal} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Close</button>
              </div>
            </div>

            {activeQuotation && (
              <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(249,115,22,0.16),rgba(15,17,25,0.95)_45%,rgba(30,41,59,0.9))] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                    <div className="border-b border-white/10 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-orange-300/80">Quotation preview</div>
                          <h3 className="mt-2 text-xl font-semibold text-white">{activeQuotation.project_name}</h3>
                          <p className="mt-1 text-sm text-slate-300">{activeQuotation.company_name} • {activeQuotation.client_name}</p>
                        </div>
                        <StatusPill status={activeQuotation.status} />
                      </div>
                    </div>
                    <div className="grid gap-3 p-5 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-[#0f1119]/80 p-3">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Quotation number</p>
                        <p className="mt-2 text-sm font-semibold text-white">{activeQuotation.quotation_number}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#0f1119]/80 p-3">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Grand total</p>
                        <p className="mt-2 text-sm font-semibold text-white">{formatCurrency(activeQuotation.grand_total || 0, activeQuotation.currency || "INR")}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#0f1119]/80 p-3">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Payment terms</p>
                        <p className="mt-2 text-sm font-semibold text-white">{activeQuotation.payment_terms || "—"}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-[#0f1119]/80 p-3">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Delivery timeline</p>
                        <p className="mt-2 text-sm font-semibold text-white">{activeQuotation.delivery_timeline || "—"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.16)]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Scope of work</h3>
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-400">Engagement summary</div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-300">{activeQuotation.scope_of_work || "No scope of work captured yet."}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.16)]">
                    <h3 className="text-lg font-semibold text-white">Approval status</h3>
                    <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-[#0f1119]/70 p-4 text-sm text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Current status</span>
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${approvalStyles[activeQuotation.approval_status] || approvalStyles.Pending}`}>{activeQuotation.approval_status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Approved by</span>
                        <span className="text-white">{activeQuotation.approval?.approved_by || "Pending"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Comments</span>
                        <span className="text-white">{activeQuotation.approval?.comments || "No comments yet."}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.16)]">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Activity timeline</h3>
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-400">History</div>
                    </div>
                    <div className="mt-4 space-y-3">
                      {(activeQuotation.activity_logs || []).slice().reverse().map((entry, index) => (
                        <div key={`${entry.action}-${index}`} className="rounded-2xl border border-white/10 bg-[#0f1119]/70 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-white">{entry.action}</p>
                            <p className="text-xs text-slate-500">{dayjs(entry.created_at).format("DD MMM YYYY")}</p>
                          </div>
                          <p className="mt-2 text-sm text-slate-400">{entry.description}</p>
                          <p className="mt-2 text-xs text-slate-500">By {entry.user}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ProjectQuotationsPage;
