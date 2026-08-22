import { useEffect, useState, useRef } from "react";
import { 
  ArrowLeft, Edit3, FileText, Loader2, Printer, Download, 
  Mail, Share2, Eye, X, CheckCircle2, AlertCircle, Clock
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import dayjs from "dayjs";
import api from "../../api";
import QuotationPrintTemplate from "./QuotationPrintTemplate";
import ModalPortal from "../../Componets/CommonComponents/ModalPortal";

const money = (value, currency = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
  return `${symbol}${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const date = (value) => (value ? dayjs(value).format("DD MMM YYYY") : "—");

function Section({ title, icon: Icon, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden ${className}`}>
      <div className="border-b border-white/10 bg-white/[0.025] px-5 py-3.5 flex items-center gap-2.5">
        {Icon && <Icon size={16} className="text-orange-400 shrink-0" />}
        <h2 className="text-xs font-bold uppercase tracking-wider text-orange-300">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, value, highlight = false }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</p>
      <p className={`mt-1 whitespace-pre-wrap text-sm ${highlight ? "font-semibold text-orange-300" : "text-white/85"}`}>
        {value || "—"}
      </p>
    </div>
  );
}

export default function QuotationDetailsPage() {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const printRef = useRef(null);
  const modalPrintRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: quotation
      ? `Quotation_${quotation.quotation_number || "Document"}_${quotation.client_name || quotation.company_name || ""}`
      : "Quotation",
  });

  const handleModalPrint = useReactToPrint({
    contentRef: modalPrintRef,
    documentTitle: quotation
      ? `Quotation_${quotation.quotation_number || "Document"}_${quotation.client_name || quotation.company_name || ""}`
      : "Quotation",
  });

  useEffect(() => {
    let mounted = true;
    api.get(`/quotations/${uuid}`)
      .then(({ data }) => {
        if (mounted) setQuotation(data?.data ?? data);
      })
      .catch(() => {
        toast.error("Failed to load quotation details.");
        navigate("/admin/myprojects/quotations");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [uuid, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-orange-400">
        <Loader2 size={36} className="animate-spin" />
        <p className="text-xs uppercase tracking-widest text-white/40">Loading quotation...</p>
      </div>
    );
  }

  if (!quotation) return null;

  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const phases = Array.isArray(quotation.timeline_items) ? quotation.timeline_items : [];
  const terms = Array.isArray(quotation.terms_sections) ? quotation.terms_sections : [];
  const approval = quotation.approval || {};
  const charges = Array.isArray(quotation.additional_charges_items) ? quotation.additional_charges_items : [];
  const support = quotation.support_details || {};
  const currency = quotation.currency || "INR";

  const shareQuotation = async () => {
    try {
      const { data } = await api.get(`/quotations/${quotation.uuid || quotation.id}/share`);
      const message = `Hello ${quotation.client_name || "there"}, quotation ${quotation.quotation_number} for ${quotation.project_name} is ready. Total: ${money(quotation.grand_total, currency)}. View: ${data.data.url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Unable to create share link.");
    }
  };

  const emailQuotation = () => {
    window.location.href = `mailto:${quotation.email || ""}?subject=${encodeURIComponent(
      `Quotation ${quotation.quotation_number} - Q-Techx Solutions`
    )}&body=${encodeURIComponent(
      `Dear ${quotation.client_name || "Client"},\n\nPlease find the quotation details for project "${quotation.project_name}".\n\nQuotation Number: ${quotation.quotation_number}\nTotal Amount: ${money(quotation.grand_total, currency)}\nValid Until: ${date(quotation.valid_until)}\n\nBest Regards,\nQ-Techx Solutions`
    )}`;
  };

  return (
    <div className="quotation-view-wrapper min-h-screen">
      {/* ═══════════════════════════════════════════
          SCREEN VIEW (Hidden during print)
         ═══════════════════════════════════════════ */}
      <div className="quotation-screen-view print:hidden space-y-6 pb-16">
        {/* Top Header & Actions Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/myprojects/quotations")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
              title="Back to Quotations"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/20">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">Quotation details</p>
                <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  {quotation.status || "Draft"}
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">{quotation.quotation_number || "Quotation"}</h1>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handlePrint()}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-3.5 py-2 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:bg-orange-600 transition"
              title="Print quotation document"
            >
              <Printer size={15} />
              Print Quotation
            </button>
            <button
              onClick={() => handlePrint()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              title="Download as PDF"
            >
              <Download size={15} />
              PDF
            </button>
            <button
              onClick={() => setShowPreviewModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              title="Preview A4 printable document"
            >
              <Eye size={15} />
              A4 Preview
            </button>
            <button
              onClick={emailQuotation}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              title="Send via Email"
            >
              <Mail size={15} />
              Email
            </button>
            <button
              onClick={shareQuotation}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              title="Share via WhatsApp"
            >
              <Share2 size={15} />
              WhatsApp
            </button>
            <button
              onClick={() => navigate(`/admin/myprojects/quotations/edit/${quotation.uuid || quotation.id}`)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              title="Edit Quotation"
            >
              <Edit3 size={15} />
              Edit
            </button>
          </div>
        </header>

        {/* Top 3 Summary Cards */}
        <div className="grid gap-5 lg:grid-cols-3">
          <Section title="Quotation Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Quotation Number" value={quotation.quotation_number} highlight />
              <Field label="Status" value={quotation.status} />
              <Field label="Quotation Date" value={date(quotation.quotation_date)} />
              <Field label="Valid Until" value={date(quotation.valid_until)} />
              <Field label="Prepared By" value={quotation.prepared_by} />
              <Field label="Salesperson" value={quotation.sales_executive} />
            </div>
          </Section>

          <Section title="Client Details">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Field label="Company" value={quotation.company_name} highlight />
              <Field label="Client Name" value={quotation.client_name} />
              <Field label="Email" value={quotation.email} />
              <Field label="Phone" value={quotation.phone_number} />
              <Field label="Address" value={quotation.address} />
              <Field label="GST Number" value={quotation.gst_number} />
            </div>
          </Section>

          <Section title="Project Details">
            <div className="space-y-3.5">
              <Field label="Project Name" value={quotation.project_name} highlight />
              <Field label="Project Type" value={quotation.project_type} />
              <Field label="Service Category" value={quotation.service_type} />
              <Field label="Timeline" value={quotation.delivery_timeline} />
              <Field label="Description" value={quotation.project_description} />
              <Field label="Scope of Work" value={quotation.scope_of_work} />
              <Field label="Technologies" value={quotation.technologies_used} />
            </div>
          </Section>
        </div>

        {/* Financial Highlights Banner */}
        <section className="grid gap-4 rounded-2xl border border-orange-500/30 bg-orange-500/[0.08] p-5 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Total Amount</p>
            <p className="mt-2 text-2xl font-black text-orange-300">{money(quotation.grand_total, currency)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Advance Required / Paid</p>
            <p className="mt-2 text-2xl font-black text-emerald-400">{money(quotation.advance_amount, currency)}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">Remaining Balance</p>
            <p className="mt-2 text-2xl font-black text-rose-400">
              {money(quotation.balance_amount ?? Math.max(Number(quotation.grand_total || 0) - Number(quotation.advance_amount || 0), 0), currency)}
            </p>
          </div>
        </section>

        {/* Timeline Phases */}
        {phases.length > 0 && (
          <Section title="Project Timeline & Milestones">
            <div className="space-y-3">
              {phases.map((phase, index) => (
                <div key={phase.id || index} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Field label="Phase" value={`${index + 1}. ${phase.phase || phase.phase_name}`} highlight />
                    <Field label="Description" value={phase.description} />
                    <Field label="Features / Modules" value={Array.isArray(phase.features_modules) ? phase.features_modules.join(", ") : phase.features_modules} />
                    <Field label="Duration" value={phase.duration || `${phase.estimated_working_days || 0} days`} />
                    <Field label="Phase Cost" value={money(phase.cost, currency)} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Commercial Proposal Table */}
        <Section title="Commercial Proposal">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-white/40">
                <tr>
                  {["#", "Item / Service", "Description", "Qty", "Unit Price", "Discount", "Tax", "Total"].map((label) => (
                    <th key={label} className="px-3 py-2.5">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-white/[0.02]">
                    <td className="px-3 py-3 text-white/40 text-xs">{index + 1}</td>
                    <td className="px-3 py-3 font-semibold text-white">{item.service_name || item.item_component || "—"}</td>
                    <td className="max-w-xs px-3 py-3 text-xs text-white/60">{item.description || "—"}</td>
                    <td className="px-3 py-3 text-white/80">{item.quantity} {item.unit || ""}</td>
                    <td className="px-3 py-3 text-white/80">{money(item.unit_price, currency)}</td>
                    <td className="px-3 py-3 text-white/80">{item.discount || item.discount_percentage || 0}%</td>
                    <td className="px-3 py-3 text-white/80">{item.tax_percentage || 0}%</td>
                    <td className="px-3 py-3 font-bold text-orange-300">{money(item.total, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto mt-6 max-w-sm space-y-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between text-white/60">
              <span>Subtotal:</span>
              <span className="font-semibold text-white/90">{money(quotation.subtotal, currency)}</span>
            </div>
            {Number(quotation.discount || 0) > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>Discount:</span>
                <span className="font-semibold">- {money(quotation.discount, currency)}</span>
              </div>
            )}
            {Number(quotation.tax_amount || 0) > 0 && (
              <div className="flex justify-between text-white/60">
                <span>Tax / GST:</span>
                <span className="font-semibold text-white/90">{money(quotation.tax_amount, currency)}</span>
              </div>
            )}
            {Number(quotation.additional_charges || 0) > 0 && (
              <div className="flex justify-between text-white/60">
                <span>Additional Charges:</span>
                <span className="font-semibold text-white/90">{money(quotation.additional_charges, currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/10 pt-2.5 text-base font-black text-orange-300">
              <span>Grand Total:</span>
              <span>{money(quotation.grand_total, currency)}</span>
            </div>
          </div>
        </Section>

        {/* Additional Charges & Support */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Section title="Additional / Third-Party Charges">
            <div className="space-y-3">
              {charges.length > 0 ? (
                charges.map((charge, index) => (
                  <div key={charge.id || index} className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 text-sm">
                    <div>
                      <p className="font-semibold text-white">{charge.service_name}</p>
                      <p className="text-xs text-white/50">
                        {charge.description || "—"} {charge.billing_type === "Recurring" ? `(${charge.billing_period || "recurring"})` : ""}
                      </p>
                    </div>
                    <span className="font-bold text-orange-300">{money(charge.total, currency)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/40">No additional charges.</p>
              )}
            </div>
          </Section>

          <Section title="Support & Maintenance">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Free Support" value={support.free_support_duration} />
              <Field label="AMC Status" value={support.amc_status} />
              <Field label="Bug-Fix Terms" value={support.bug_fix_terms} />
              <Field label="Deployment Support" value={support.deployment_support} />
              <Field label="AMC Details" value={support.amc_details} />
              <Field label="AMC Cost" value={money(support.amc_cost, currency)} />
              <Field label="AMC Duration" value={support.amc_duration} />
              <Field label="AMC Period" value={`${date(support.amc_start_date)} - ${date(support.amc_end_date)}`} />
            </div>
          </Section>
        </div>

        {/* Terms & Notes */}
        <div className="grid gap-5 lg:grid-cols-2">
          <Section title="Terms and Conditions">
            <div className="space-y-3">
              {terms.length > 0 ? (
                terms.map((term, index) => (
                  <div key={term.id || index} className="text-sm">
                    <p className="font-bold text-orange-200">{term.title || `Term ${index + 1}`}</p>
                    <p className="mt-1 whitespace-pre-wrap text-white/70 text-xs leading-relaxed">{term.content || term.term_text || "—"}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-white/40">No custom terms added.</p>
              )}
            </div>
          </Section>

          <Section title="Approval and Notes">
            <div className="space-y-4">
              <Field label="Approved By" value={approval.approved_by} />
              <Field label="Approval Comments" value={approval.comments} />
              <Field label="Internal Notes" value={quotation.notes} />
              <Field label="Client Message" value={quotation.client_message} />
            </div>
          </Section>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          DEDICATED PRINT CONTAINER
          (Hidden on screen, active during print)
         ═══════════════════════════════════════════ */}
      <div className="hidden print:block w-full" ref={printRef}>
        <QuotationPrintTemplate quotation={quotation} />
      </div>

      {/* ═══════════════════════════════════════════
          A4 PRINT PREVIEW MODAL
         ═══════════════════════════════════════════ */}
      {showPreviewModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-2 sm:p-4">
            <div className="relative flex max-h-[95vh] w-full max-w-4xl flex-col rounded-2xl bg-slate-900 border border-white/20 shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <img src="/images/logo.png" alt="Q-TechX" className="h-8 w-8 object-contain" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Print Preview — Quotation A4 Document</h3>
                    <p className="text-[10px] text-white/50">{quotation.quotation_number} | {quotation.client_name || quotation.company_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleModalPrint()}
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition shadow-sm"
                  >
                    <Printer size={14} />
                    Print Now
                  </button>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Scrollable A4 Document Preview */}
              <div className="overflow-y-auto p-4 sm:p-6 bg-slate-950 flex justify-center">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-[210mm] border border-slate-300" ref={modalPrintRef}>
                  <QuotationPrintTemplate quotation={quotation} />
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
