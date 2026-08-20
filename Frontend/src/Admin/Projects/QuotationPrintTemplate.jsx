import React from "react";
import dayjs from "dayjs";
import { 
  Building2, Mail, Phone, MapPin, Globe, Calendar, FileText, 
  CheckCircle2, Shield, Clock, Layers, Award, Sparkles, Receipt
} from "lucide-react";
import { amountToWords } from "../../utils/numberToWords";

const formatMoney = (value, currency = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
  const num = Number(value || 0);
  return `${symbol}${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value) => (value ? dayjs(value).format("DD MMM YYYY") : "—");

export default function QuotationPrintTemplate({ quotation }) {
  if (!quotation) return null;

  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const phases = Array.isArray(quotation.timeline_items) ? quotation.timeline_items : [];
  const terms = Array.isArray(quotation.terms_sections) ? quotation.terms_sections : [];
  const charges = Array.isArray(quotation.additional_charges_items) ? quotation.additional_charges_items : [];
  const support = quotation.support_details || {};
  const approval = quotation.approval || {};
  const currency = quotation.currency || "INR";

  const totalInWords = amountToWords(quotation.grand_total, currency);

  // Status color pill
  const getStatusBadge = (status) => {
    const s = status || "Draft";
    switch (s.toLowerCase()) {
      case "accepted":
      case "approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "sent":
      case "viewed":
        return "bg-blue-50 text-blue-700 border-blue-300";
      case "rejected":
      case "cancelled":
        return "bg-rose-50 text-rose-700 border-rose-300";
      default:
        return "bg-amber-50 text-amber-700 border-amber-300";
    }
  };

  return (
    <div className="quotation-document bg-white text-slate-900 font-sans p-6 sm:p-8 max-w-[210mm] mx-auto print:max-w-none print:p-0 print:m-0 print:w-full print:bg-white text-[11px] leading-relaxed select-text">
      {/* Top Accent Strip */}
      <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-t-sm mb-6 print:mb-5 print:h-1.5"></div>

      {/* Header Section */}
      <header className="flex justify-between items-start pb-6 border-b border-slate-200 gap-6">
        {/* Company Identity */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center font-black text-xl shadow-sm print:shadow-none shrink-0">
              Q
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                Q-TECHX SOLUTIONS
              </h1>
              <p className="text-[10px] font-semibold tracking-wider text-orange-600 uppercase mt-0.5">
                Technology & Software Solutions
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-1 text-slate-600 text-[10.5px]">
            <div className="flex items-start gap-1.5">
              <MapPin size={12} className="text-orange-500 shrink-0 mt-0.5" />
              <span>123, Tech Park, Coimbatore, Tamil Nadu - 641 014, India</span>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Mail size={12} className="text-orange-500 shrink-0" />
                contact@qtechx.com
              </span>
              <span className="flex items-center gap-1">
                <Phone size={12} className="text-orange-500 shrink-0" />
                +91 95972 93504 / +91 98765 43210
              </span>
              <span className="flex items-center gap-1">
                <Globe size={12} className="text-orange-500 shrink-0" />
                www.qtechx.com
              </span>
            </div>
            {quotation.company_gst && (
              <p className="text-[10px] text-slate-500 font-medium">GSTIN: {quotation.company_gst}</p>
            )}
          </div>
        </div>

        {/* Quotation Badge & Reference */}
        <div className="text-right shrink-0">
          <div className="inline-block px-3 py-1 bg-orange-50 border border-orange-200 rounded-md text-orange-600 font-bold text-xs uppercase tracking-widest mb-2">
            QUOTATION
          </div>
          <p className="text-lg font-black text-slate-900 tracking-tight">
            {quotation.quotation_number || "QT-DRAFT"}
          </p>

          <div className="mt-2 space-y-1 text-slate-600 text-[10.5px]">
            <div className="flex justify-end gap-2">
              <span className="text-slate-400 font-medium">Date:</span>
              <span className="font-semibold text-slate-800">{formatDate(quotation.quotation_date)}</span>
            </div>
            <div className="flex justify-end gap-2">
              <span className="text-slate-400 font-medium">Valid Until:</span>
              <span className="font-semibold text-slate-800">{formatDate(quotation.valid_until)}</span>
            </div>
            <div className="flex justify-end gap-2 items-center">
              <span className="text-slate-400 font-medium">Status:</span>
              <span className={`px-2 py-0.5 text-[9.5px] font-bold rounded uppercase border ${getStatusBadge(quotation.status)}`}>
                {quotation.status || "Draft"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Client & Project Overview Cards */}
      <section className="grid grid-cols-2 gap-4 my-5 break-inside-avoid">
        {/* Client Info */}
        <div className="bg-slate-50/75 border border-slate-200 rounded-lg p-3.5 relative">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-orange-600 mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <Building2 size={12} />
            Quotation Prepared For
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div>
              <p className="font-bold text-slate-900 text-xs">{quotation.company_name || quotation.client_name || "Client"}</p>
              {quotation.company_name && quotation.client_name && (
                <p className="text-slate-600 text-[10.5px]">Attn: <span className="font-medium text-slate-800">{quotation.client_name}</span></p>
              )}
            </div>
            {quotation.email && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="text-slate-400 font-medium w-12 text-[10px]">Email:</span>
                <span className="text-slate-800">{quotation.email}</span>
              </div>
            )}
            {quotation.phone_number && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="text-slate-400 font-medium w-12 text-[10px]">Phone:</span>
                <span className="text-slate-800">{quotation.phone_number}</span>
              </div>
            )}
            {quotation.address && (
              <div className="flex items-start gap-1.5 text-slate-600">
                <span className="text-slate-400 font-medium w-12 text-[10px] shrink-0">Address:</span>
                <span className="text-slate-800 leading-tight">{quotation.address}</span>
              </div>
            )}
            {quotation.gst_number && (
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="text-slate-400 font-medium w-12 text-[10px]">GSTIN:</span>
                <span className="font-semibold text-slate-800">{quotation.gst_number}</span>
              </div>
            )}
          </div>
        </div>

        {/* Project Meta Info */}
        <div className="bg-slate-50/75 border border-slate-200 rounded-lg p-3.5 relative">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-orange-600 mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
            <FileText size={12} />
            Project & Proposal Details
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium text-[10.5px]">Project Name:</span>
              <span className="font-bold text-slate-900 text-right">{quotation.project_name || "—"}</span>
            </div>
            {quotation.project_type && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-[10.5px]">Project Type:</span>
                <span className="font-medium text-slate-800 text-right">{quotation.project_type}</span>
              </div>
            )}
            {quotation.service_type && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-[10.5px]">Service Category:</span>
                <span className="font-medium text-slate-800 text-right">{quotation.service_type}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium text-[10.5px]">Prepared By:</span>
              <span className="font-semibold text-slate-800 text-right">{quotation.prepared_by || "Admin"}</span>
            </div>
            {quotation.sales_executive && quotation.sales_executive !== quotation.prepared_by && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-[10.5px]">Sales Executive:</span>
                <span className="font-medium text-slate-800 text-right">{quotation.sales_executive}</span>
              </div>
            )}
            {quotation.delivery_timeline && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-[10.5px]">Timeline:</span>
                <span className="font-semibold text-slate-800 text-right">{quotation.delivery_timeline}</span>
              </div>
            )}
            {quotation.payment_terms && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-[10.5px]">Payment Terms:</span>
                <span className="font-medium text-slate-800 text-right">{quotation.payment_terms}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Project Scope & Description (If provided) */}
      {(quotation.project_description || quotation.scope_of_work || quotation.technologies_used) && (
        <section className="border border-slate-200 rounded-lg p-3.5 mb-5 bg-white break-inside-avoid">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-100 pb-1 flex items-center gap-1.5">
            <Sparkles size={11} className="text-orange-500" />
            Scope of Work & Technical Overview
          </h2>
          <div className="space-y-2 text-[10.5px] text-slate-700">
            {quotation.project_description && (
              <div>
                <p className="text-[9.5px] font-bold text-slate-400 uppercase">Description</p>
                <p className="mt-0.5 text-slate-800 leading-relaxed whitespace-pre-wrap">{quotation.project_description}</p>
              </div>
            )}
            {quotation.scope_of_work && (
              <div>
                <p className="text-[9.5px] font-bold text-slate-400 uppercase">Scope & Deliverables</p>
                <p className="mt-0.5 text-slate-800 leading-relaxed whitespace-pre-wrap">{quotation.scope_of_work}</p>
              </div>
            )}
            {quotation.technologies_used && (
              <div className="pt-1">
                <p className="text-[9.5px] font-bold text-slate-400 uppercase mb-1">Technologies & Stack</p>
                <div className="flex flex-wrap gap-1.5">
                  {quotation.technologies_used.split(/[,;\n]+/).map((tech, idx) => (
                    tech.trim() ? (
                      <span key={idx} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[9.5px] font-medium">
                        {tech.trim()}
                      </span>
                    ) : null
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Commercial Proposal Table */}
      <section className="mb-5 break-inside-avoid">
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[9.5px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3 w-8 text-center">#</th>
                <th className="py-2.5 px-3">Item / Service Description</th>
                <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                <th className="py-2.5 px-3 w-24 text-right">Rate</th>
                <th className="py-2.5 px-3 w-16 text-center">Disc</th>
                <th className="py-2.5 px-3 w-16 text-center">Tax</th>
                <th className="py-2.5 px-3 w-28 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[10.5px]">
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <tr key={item.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="py-2 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <p className="font-bold text-slate-900">{item.service_name || item.item_component || `Item ${idx + 1}`}</p>
                      {item.description && (
                        <p className="text-[9.5px] text-slate-500 mt-0.5 leading-snug whitespace-pre-wrap">
                          {item.description}
                        </p>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center font-medium text-slate-700">
                      {item.quantity} {item.unit && item.unit !== "Hour" ? item.unit : ""}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-800">
                      {formatMoney(item.unit_price, currency)}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600">
                      {item.discount_percentage ? `${item.discount_percentage}%` : (Number(item.discount || 0) > 0 ? formatMoney(item.discount, currency) : "—")}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600">
                      {item.tax_percentage ? `${item.tax_percentage}%` : "0%"}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatMoney(item.total, currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-400">No items specified in commercial proposal.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Additional / Third Party Charges (if any) */}
      {charges.length > 0 && (
        <section className="mb-5 break-inside-avoid">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
            <Layers size={11} className="text-orange-500" />
            Additional / Third-Party Charges
          </h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[9px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-1.5 px-3 w-8 text-center">#</th>
                  <th className="py-1.5 px-3">Service Name & Description</th>
                  <th className="py-1.5 px-3 w-24 text-center">Billing Type</th>
                  <th className="py-1.5 px-3 w-24 text-right">Unit Rate</th>
                  <th className="py-1.5 px-3 w-28 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[10px]">
                {charges.map((charge, idx) => (
                  <tr key={charge.id || idx} className="bg-white">
                    <td className="py-1.5 px-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-1.5 px-3">
                      <span className="font-semibold text-slate-800">{charge.service_name}</span>
                      {charge.description && <span className="text-slate-500 ml-1.5">({charge.description})</span>}
                    </td>
                    <td className="py-1.5 px-3 text-center text-slate-600">
                      {charge.billing_type || "One-Time"} {charge.billing_period ? `(${charge.billing_period})` : ""}
                    </td>
                    <td className="py-1.5 px-3 text-right text-slate-700">
                      {formatMoney(charge.unit_price, currency)}
                    </td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-900">
                      {formatMoney(charge.total, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Financial Summary & Payment Breakdown */}
      <section className="grid grid-cols-12 gap-4 mb-5 break-inside-avoid">
        {/* Left Side: Amount In Words & Payment Milestones */}
        <div className="col-span-7 flex flex-col justify-between">
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Amount in Words</p>
            <p className="text-[11px] font-bold text-slate-800 mt-1 italic leading-snug">
              {totalInWords}
            </p>
          </div>

          {/* Payment Terms Highlights */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">Advance Payable</p>
              <p className="text-sm font-black text-emerald-950 mt-0.5">
                {formatMoney(quotation.advance_amount, currency)}
              </p>
            </div>
            <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-blue-800">Remaining Balance</p>
              <p className="text-sm font-black text-blue-950 mt-0.5">
                {formatMoney(quotation.balance_amount ?? Math.max(Number(quotation.grand_total || 0) - Number(quotation.advance_amount || 0), 0), currency)}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Calculation Totals Card */}
        <div className="col-span-5 border border-slate-200 rounded-lg overflow-hidden bg-white">
          <div className="p-3 space-y-1.5 text-[10.5px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">{formatMoney(quotation.subtotal, currency)}</span>
            </div>
            {Number(quotation.discount || 0) > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount:</span>
                <span className="font-semibold">- {formatMoney(quotation.discount, currency)}</span>
              </div>
            )}
            {Number(quotation.tax_amount || 0) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax / GST:</span>
                <span className="font-semibold text-slate-800">{formatMoney(quotation.tax_amount, currency)}</span>
              </div>
            )}
            {Number(quotation.additional_charges || 0) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Additional Charges:</span>
                <span className="font-semibold text-slate-800">{formatMoney(quotation.additional_charges, currency)}</span>
              </div>
            )}
            {Number(quotation.round_off || 0) !== 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Round Off:</span>
                <span className="font-semibold text-slate-800">{formatMoney(quotation.round_off, currency)}</span>
              </div>
            )}
          </div>

          <div className="bg-orange-500 text-white px-3.5 py-2.5 flex justify-between items-center border-t border-orange-600">
            <span className="font-bold text-xs uppercase tracking-wider">Grand Total:</span>
            <span className="font-black text-base">{formatMoney(quotation.grand_total, currency)}</span>
          </div>
        </div>
      </section>

      {/* Project Timeline Phases (if any) */}
      {phases.length > 0 && (
        <section className="mb-5 break-inside-avoid">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Clock size={11} className="text-orange-500" />
            Project Implementation Timeline & Milestones
          </h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[9px] font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-1.5 px-3 w-8 text-center">#</th>
                  <th className="py-1.5 px-3">Phase / Milestone</th>
                  <th className="py-1.5 px-3">Features & Deliverables</th>
                  <th className="py-1.5 px-3 w-24 text-center">Duration</th>
                  <th className="py-1.5 px-3 w-24 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {phases.map((phase, idx) => (
                  <tr key={phase.id || idx} className="bg-white">
                    <td className="py-1.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-800">
                      {phase.phase || phase.phase_name || `Phase ${idx + 1}`}
                      {phase.description && <p className="text-[9px] text-slate-500 font-normal mt-0.5">{phase.description}</p>}
                    </td>
                    <td className="py-1.5 px-3 text-slate-600">
                      {Array.isArray(phase.features_modules) ? phase.features_modules.join(", ") : phase.features_modules || "—"}
                    </td>
                    <td className="py-1.5 px-3 text-center font-medium text-slate-700">
                      {phase.duration || (phase.estimated_working_days ? `${phase.estimated_working_days} Days` : "—")}
                    </td>
                    <td className="py-1.5 px-3 text-right font-semibold text-slate-900">
                      {Number(phase.cost) > 0 ? formatMoney(phase.cost, currency) : "Included"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Support & Maintenance (if specified) */}
      {(support.free_support_duration || support.amc_status === "Active" || support.amc_cost > 0 || support.bug_fix_terms) && (
        <section className="mb-5 break-inside-avoid border border-slate-200 rounded-lg p-3 bg-slate-50/40">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <Shield size={11} className="text-orange-500" />
            Support, Warranty & AMC Terms
          </h2>
          <div className="grid grid-cols-3 gap-3 text-[10.5px]">
            {support.free_support_duration && (
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Complimentary Support</p>
                <p className="font-semibold text-slate-800 mt-0.5">{support.free_support_duration}</p>
              </div>
            )}
            {support.bug_fix_terms && (
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Bug Fix Warranty</p>
                <p className="font-medium text-slate-700 mt-0.5">{support.bug_fix_terms}</p>
              </div>
            )}
            {(support.amc_status || support.amc_cost > 0) && (
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Annual Maintenance (AMC)</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {support.amc_status || "Optional"} {Number(support.amc_cost) > 0 ? `(${formatMoney(support.amc_cost, currency)} / ${support.amc_duration || "Year"})` : ""}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Terms and Conditions */}
      <section className="mb-6 break-inside-avoid border border-slate-200 rounded-lg p-3.5 bg-white">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-100 pb-1 flex items-center gap-1.5">
          <Award size={11} className="text-orange-500" />
          Terms & Conditions
        </h2>
        {terms.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-[10px] text-slate-600">
            {terms.map((term, idx) => (
              <div key={term.id || idx}>
                <p className="font-bold text-slate-800">
                  {idx + 1}. {term.title || `Term ${idx + 1}`}
                </p>
                <p className="text-slate-600 mt-0.5 leading-snug whitespace-pre-wrap">
                  {term.content || term.term_text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-slate-500">
            1. Quotation is valid for 30 days from date of issue. 2. 50% advance required to commence project. 3. Remaining balance due on final project delivery.
          </p>
        )}
      </section>

      {/* Client Note / Message (if present) */}
      {quotation.client_message && (
        <section className="mb-5 break-inside-avoid p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg">
          <p className="text-[9px] font-bold uppercase tracking-wider text-amber-800">Note for Client</p>
          <p className="text-[10px] text-amber-950 mt-0.5 leading-relaxed whitespace-pre-wrap">{quotation.client_message}</p>
        </section>
      )}

      {/* Signatures & Acceptance Block */}
      <section className="mt-8 pt-4 border-t border-slate-300 break-inside-avoid">
        <div className="grid grid-cols-3 gap-6 text-center text-[10.5px]">
          {/* Prepared By */}
          <div className="flex flex-col items-center justify-end">
            <div className="h-12 border-b border-dashed border-slate-400 w-full mb-1 flex items-end justify-center pb-1">
              <span className="font-signature text-slate-700 italic font-semibold text-sm">
                {quotation.prepared_by || "Admin"}
              </span>
            </div>
            <p className="font-bold text-slate-900">Prepared By</p>
            <p className="text-[9.5px] text-slate-500">Q-Techx Solutions</p>
          </div>

          {/* Authorized Signatory */}
          <div className="flex flex-col items-center justify-end">
            <div className="h-12 border-b border-dashed border-slate-400 w-full mb-1 flex items-end justify-center pb-1">
              <span className="text-[10px] text-slate-400">Official Stamp & Sign</span>
            </div>
            <p className="font-bold text-slate-900">Authorized Signatory</p>
            <p className="text-[9.5px] text-slate-500">Q-Techx Solutions</p>
          </div>

          {/* Client Acceptance */}
          <div className="flex flex-col items-center justify-end">
            <div className="h-12 border-b border-dashed border-slate-400 w-full mb-1 flex items-end justify-center pb-1">
              <span className="text-[10px] text-slate-400">Sign & Company Seal</span>
            </div>
            <p className="font-bold text-slate-900">Client Acceptance</p>
            <p className="text-[9.5px] text-slate-500">{quotation.company_name || quotation.client_name || "Client Signature"}</p>
          </div>
        </div>
      </section>

      {/* Document Footer */}
      <footer className="mt-8 pt-3 border-t border-slate-200 text-center text-[9.5px] text-slate-500 flex justify-between items-center break-inside-avoid">
        <span>Q-Techx Solutions | This quotation is computer generated and valid for the stated duration.</span>
        <span className="font-medium text-slate-400">Page 1 of 1</span>
      </footer>
    </div>
  );
}
