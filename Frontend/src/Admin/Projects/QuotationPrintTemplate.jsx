import React from "react";
import dayjs from "dayjs";
import { 
  Building2, Mail, Phone, MapPin, Globe, FileText, 
  Shield, Clock, Layers, Award, Sparkles, UserCheck, Briefcase, Info
} from "lucide-react";
import { amountToWords } from "../../utils/numberToWords";

const formatMoney = (value, currency = "INR") => {
  if (value === null || value === undefined || value === "") return "—";
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
  const num = Number(value || 0);
  return `${symbol}${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value) => (value ? dayjs(value).format("DD MMM YYYY") : "—");

export default function QuotationPrintTemplate({ quotation }) {
  if (!quotation) return null;

  const currency = quotation.currency || "INR";

  const rawItems = Array.isArray(quotation.items) ? quotation.items.filter(Boolean) : [];
  const items = rawItems;

  const rawPhases = Array.isArray(quotation.timeline_items) ? quotation.timeline_items.filter(Boolean) : [];
  const phases = rawPhases;

  const rawTerms = Array.isArray(quotation.terms_sections) ? quotation.terms_sections.filter(Boolean) : [];
  const terms = rawTerms;

  const rawCharges = Array.isArray(quotation.additional_charges_items) ? quotation.additional_charges_items.filter(Boolean) : [];
  const charges = rawCharges;

  const support = quotation.support_details || {};
  const approval = quotation.approval || {};
  const totalInWords = amountToWords(quotation.grand_total || 0, currency);

  // Format AMC Period
  const amcPeriod = (support.amc_start_date || support.amc_end_date)
    ? `${formatDate(support.amc_start_date)} - ${formatDate(support.amc_end_date)}`
    : "—";

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
      <header className="flex justify-between items-start pb-5 border-b border-slate-200 gap-6">
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

          <div className="mt-2.5 space-y-1 text-slate-600 text-[10.5px]">
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
          <div className="inline-block px-3 py-1 bg-orange-50 border border-orange-200 rounded-md text-orange-600 font-bold text-xs uppercase tracking-widest mb-1.5">
            QUOTATION
          </div>
          <p className="text-lg font-black text-slate-900 tracking-tight">
            {quotation.quotation_number || "—"}
          </p>

          <div className="mt-2 space-y-1 text-slate-600 text-[10.5px]">
            <div className="flex justify-end gap-2">
              <span className="text-slate-400 font-medium">Quotation Date:</span>
              <span className="font-semibold text-slate-800">{formatDate(quotation.quotation_date)}</span>
            </div>
            <div className="flex justify-end gap-2">
              <span className="text-slate-400 font-medium">Valid Until:</span>
              <span className="font-semibold text-slate-800">{formatDate(quotation.valid_until)}</span>
            </div>
            <div className="flex justify-end gap-2 items-center">
              <span className="text-slate-400 font-medium">Status:</span>
              <span className={`px-2 py-0.5 text-[9.5px] font-bold rounded uppercase border ${getStatusBadge(quotation.status)}`}>
                {quotation.status || "—"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 1. QUOTATION INFORMATION & CLIENT DETAILS (2-Column Grid) */}
      <section className="grid grid-cols-2 gap-4 my-4 break-inside-avoid">
        {/* Quotation Information Card */}
        <div className="bg-slate-50/75 border border-slate-200 rounded-lg p-3.5 relative flex flex-col justify-between">
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-orange-600 mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Info size={12} />
              QUOTATION INFORMATION
            </div>
            <div className="space-y-1.5 text-[10.5px]">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-[10px] uppercase">QUOTATION NUMBER:</span>
                <span className="font-bold text-slate-900 text-right">{quotation.quotation_number || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-[10px] uppercase">STATUS:</span>
                <span className="font-semibold text-slate-800 text-right">{quotation.status || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-[10px] uppercase">QUOTATION DATE:</span>
                <span className="font-semibold text-slate-800 text-right">{formatDate(quotation.quotation_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-[10px] uppercase">VALID UNTIL:</span>
                <span className="font-semibold text-slate-800 text-right">{formatDate(quotation.valid_until)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-[10px] uppercase">PREPARED BY:</span>
                <span className="font-semibold text-slate-800 text-right">{quotation.prepared_by || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-[10px] uppercase">SALESPERSON:</span>
                <span className="font-medium text-slate-800 text-right">{quotation.sales_executive || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-[10px] uppercase">PAYMENT TERMS:</span>
                <span className="font-medium text-slate-800 text-right">{quotation.payment_terms || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium text-[10px] uppercase">DELIVERY TIMELINE:</span>
                <span className="font-semibold text-slate-800 text-right">{quotation.delivery_timeline || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client Details Card */}
        <div className="bg-slate-50/75 border border-slate-200 rounded-lg p-3.5 relative flex flex-col justify-between">
          <div>
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-orange-600 mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <Building2 size={12} />
              CLIENT DETAILS
            </div>
            <div className="space-y-1.5 text-[10.5px]">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium w-24 shrink-0 text-[10px] uppercase">COMPANY:</span>
                <span className="font-bold text-slate-900">{quotation.company_name || "—"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium w-24 shrink-0 text-[10px] uppercase">CLIENT NAME:</span>
                <span className="font-semibold text-slate-800">{quotation.client_name || quotation.contact_person || "—"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium w-24 shrink-0 text-[10px] uppercase">EMAIL:</span>
                <span className="text-slate-800">{quotation.email || "—"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium w-24 shrink-0 text-[10px] uppercase">PHONE:</span>
                <span className="text-slate-800">{quotation.phone_number || "—"}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-slate-400 font-medium w-24 shrink-0 text-[10px] uppercase mt-0.5">ADDRESS:</span>
                <span className="text-slate-800 leading-tight">{quotation.address || "—"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium w-24 shrink-0 text-[10px] uppercase">GST NUMBER:</span>
                <span className="font-medium text-slate-800">{quotation.gst_number || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FULL PROJECT DETAILS SECTION */}
      <section className="border border-slate-200 rounded-lg p-3.5 mb-4 bg-white break-inside-avoid">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-100 pb-1 flex items-center gap-1.5">
          <Briefcase size={11} className="text-orange-500" />
          PROJECT DETAILS
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 text-[10.5px]">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">PROJECT NAME</p>
            <p className="font-bold text-slate-900 mt-0.5">{quotation.project_name || "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">PROJECT TYPE</p>
            <p className="font-medium text-slate-800 mt-0.5">{quotation.project_type || "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">SERVICE CATEGORY</p>
            <p className="font-medium text-slate-800 mt-0.5">{quotation.service_type || quotation.service_category || "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">PLATFORM</p>
            <p className="font-medium text-slate-800 mt-0.5">{quotation.platform || "—"}</p>
          </div>
        </div>

        <div className="space-y-2 text-[10.5px] text-slate-700 border-t border-slate-100 pt-2">
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase">DESCRIPTION</p>
            <p className="mt-0.5 text-slate-800 leading-relaxed whitespace-pre-wrap">
              {quotation.project_description || "—"}
            </p>
          </div>
          <div>
            <p className="text-[9.5px] font-bold text-slate-400 uppercase">SCOPE OF WORK</p>
            <p className="mt-0.5 text-slate-800 leading-relaxed whitespace-pre-wrap">
              {quotation.scope_of_work || "—"}
            </p>
          </div>
          <div className="pt-1">
            <p className="text-[9.5px] font-bold text-slate-400 uppercase mb-1">TECHNOLOGIES</p>
            {quotation.technologies_used ? (
              <div className="flex flex-wrap gap-1.5">
                {quotation.technologies_used.split(/[,;\n]+/).map((tech, idx) => (
                  tech.trim() ? (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded text-[9.5px] font-medium">
                      {tech.trim()}
                    </span>
                  ) : null
                ))}
              </div>
            ) : (
              <p className="text-slate-800">—</p>
            )}
          </div>
        </div>
      </section>

      {/* 3. COMMERCIAL PROPOSAL TABLE */}
      <section className="mb-4 break-inside-avoid">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
          <FileText size={11} className="text-orange-500" />
          COMMERCIAL PROPOSAL
        </h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[9.5px] font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3 w-8 text-center">#</th>
                <th className="py-2.5 px-3">Item / Service Description</th>
                <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                <th className="py-2.5 px-3 w-24 text-right">Unit Rate</th>
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
                      <p className="font-bold text-slate-900">{item.service_name || item.item_component || "—"}</p>
                      {item.description ? (
                        <p className="text-[9.5px] text-slate-500 mt-0.5 leading-snug whitespace-pre-wrap">
                          {item.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="py-2 px-3 text-center font-medium text-slate-700">
                      {item.quantity ?? "—"} {item.unit || ""}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-800">
                      {item.unit_price !== undefined ? formatMoney(item.unit_price, currency) : "—"}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600">
                      {item.discount_percentage ? `${item.discount_percentage}%` : (Number(item.discount || 0) > 0 ? formatMoney(item.discount, currency) : "0%")}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-600">
                      {item.tax_percentage ? `${item.tax_percentage}%` : "0%"}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {item.total !== undefined ? formatMoney(item.total, currency) : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white">
                  <td className="py-2 px-3 text-center text-slate-400">1</td>
                  <td className="py-2 px-3 text-slate-800">—</td>
                  <td className="py-2 px-3 text-center text-slate-800">—</td>
                  <td className="py-2 px-3 text-right text-slate-800">—</td>
                  <td className="py-2 px-3 text-center text-slate-800">—</td>
                  <td className="py-2 px-3 text-center text-slate-800">—</td>
                  <td className="py-2 px-3 text-right text-slate-800">—</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. ADDITIONAL / THIRD PARTY CHARGES TABLE */}
      <section className="mb-4 break-inside-avoid">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
          <Layers size={11} className="text-orange-500" />
          ADDITIONAL / THIRD-PARTY CHARGES
        </h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-[9px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-1.5 px-3 w-8 text-center">#</th>
                <th className="py-1.5 px-3">Service Name & Description</th>
                <th className="py-1.5 px-3 w-28 text-center">Billing Type</th>
                <th className="py-1.5 px-3 w-24 text-right">Unit Rate</th>
                <th className="py-1.5 px-3 w-28 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[10px]">
              {charges.length > 0 ? (
                charges.map((charge, idx) => (
                  <tr key={charge.id || idx} className="bg-white">
                    <td className="py-1.5 px-3 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-1.5 px-3">
                      <span className="font-semibold text-slate-800">{charge.service_name || "—"}</span>
                      {charge.description ? <span className="text-slate-500 ml-1.5">({charge.description})</span> : null}
                    </td>
                    <td className="py-1.5 px-3 text-center text-slate-600">
                      {charge.billing_type || "—"} {charge.billing_period ? `(${charge.billing_period})` : ""}
                    </td>
                    <td className="py-1.5 px-3 text-right text-slate-700">
                      {charge.unit_price !== undefined ? formatMoney(charge.unit_price, currency) : "—"}
                    </td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-900">
                      {charge.total !== undefined ? formatMoney(charge.total, currency) : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white">
                  <td className="py-1.5 px-3 text-center text-slate-400">1</td>
                  <td className="py-1.5 px-3 text-slate-800">—</td>
                  <td className="py-1.5 px-3 text-center text-slate-800">—</td>
                  <td className="py-1.5 px-3 text-right text-slate-800">—</td>
                  <td className="py-1.5 px-3 text-right text-slate-800">—</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. FINANCIAL TOTALS & PAYMENT BREAKDOWN */}
      <section className="grid grid-cols-12 gap-4 mb-4 break-inside-avoid">
        {/* Left Side: Amount In Words & Payment Milestones */}
        <div className="col-span-7 flex flex-col justify-between">
          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">TOTAL AMOUNT IN WORDS</p>
            <p className="text-[11px] font-bold text-slate-800 mt-1 italic leading-snug">
              {totalInWords || "—"}
            </p>
          </div>

          {/* Payment Terms Highlights */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="border border-emerald-200 bg-emerald-50/40 rounded-lg p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">ADVANCE PAID</p>
              <p className="text-sm font-black text-emerald-950 mt-0.5">
                {quotation.advance_amount !== undefined && quotation.advance_amount !== null ? formatMoney(quotation.advance_amount, currency) : "—"}
              </p>
            </div>
            <div className="border border-blue-200 bg-blue-50/40 rounded-lg p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wider text-blue-800">REMAINING AMOUNT</p>
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
              <span className="font-semibold text-slate-800">{quotation.subtotal !== undefined ? formatMoney(quotation.subtotal, currency) : "—"}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Discount:</span>
              <span className="font-semibold text-slate-800">
                {Number(quotation.discount || 0) > 0 ? `- ${formatMoney(quotation.discount, currency)}` : "—"}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST / Tax:</span>
              <span className="font-semibold text-slate-800">
                {Number(quotation.tax_amount || 0) > 0 ? formatMoney(quotation.tax_amount, currency) : "—"}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Additional Charges:</span>
              <span className="font-semibold text-slate-800">
                {Number(quotation.additional_charges || 0) > 0 ? formatMoney(quotation.additional_charges, currency) : "—"}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Round Off:</span>
              <span className="font-semibold text-slate-800">
                {Number(quotation.round_off || 0) !== 0 ? formatMoney(quotation.round_off, currency) : "—"}
              </span>
            </div>
          </div>

          <div className="bg-orange-500 text-white px-3.5 py-2.5 flex justify-between items-center border-t border-orange-600">
            <span className="font-bold text-xs uppercase tracking-wider">GRAND TOTAL:</span>
            <span className="font-black text-base">{quotation.grand_total !== undefined ? formatMoney(quotation.grand_total, currency) : "—"}</span>
          </div>
        </div>
      </section>

      {/* 6. PROJECT TIMELINE PHASES */}
      <section className="mb-4 break-inside-avoid">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-1.5 flex items-center gap-1.5">
          <Clock size={11} className="text-orange-500" />
          PROJECT TIMELINE PHASES
        </h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-[9px] font-bold uppercase tracking-wider border-b border-slate-200">
                <th className="py-1.5 px-3 w-8 text-center">#</th>
                <th className="py-1.5 px-3 w-44">Phase</th>
                <th className="py-1.5 px-3">Description</th>
                <th className="py-1.5 px-3">Features / Modules</th>
                <th className="py-1.5 px-3 w-20 text-center">Duration</th>
                <th className="py-1.5 px-3 w-24 text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {phases.length > 0 ? (
                phases.map((phase, idx) => (
                  <tr key={phase.id || idx} className="bg-white">
                    <td className="py-1.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-1.5 px-3 font-semibold text-slate-800">
                      {phase.phase || phase.phase_name || "—"}
                    </td>
                    <td className="py-1.5 px-3 text-slate-600">
                      {phase.description || "—"}
                    </td>
                    <td className="py-1.5 px-3 text-slate-600">
                      {Array.isArray(phase.features_modules) ? phase.features_modules.join(", ") : phase.features_modules || "—"}
                    </td>
                    <td className="py-1.5 px-3 text-center font-medium text-slate-700">
                      {phase.duration || (phase.estimated_working_days ? `${phase.estimated_working_days} Days` : "—")}
                    </td>
                    <td className="py-1.5 px-3 text-right font-semibold text-slate-900">
                      {Number(phase.cost) > 0 ? formatMoney(phase.cost, currency) : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white">
                  <td className="py-1.5 px-3 text-center text-slate-400">1</td>
                  <td className="py-1.5 px-3 text-slate-800">—</td>
                  <td className="py-1.5 px-3 text-slate-800">—</td>
                  <td className="py-1.5 px-3 text-slate-800">—</td>
                  <td className="py-1.5 px-3 text-center text-slate-800">—</td>
                  <td className="py-1.5 px-3 text-right text-slate-800">—</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. SUPPORT & MAINTENANCE */}
      <section className="mb-4 break-inside-avoid border border-slate-200 rounded-lg p-3.5 bg-slate-50/40">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-2.5 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
          <Shield size={11} className="text-orange-500" />
          SUPPORT & MAINTENANCE
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10.5px]">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">FREE SUPPORT</p>
            <p className="font-semibold text-slate-800 mt-0.5">{support.free_support_duration || "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">AMC STATUS</p>
            <p className="font-semibold text-slate-800 mt-0.5">{support.amc_status || "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">BUG-FIX TERMS</p>
            <p className="font-medium text-slate-700 mt-0.5 leading-snug whitespace-pre-wrap">{support.bug_fix_terms || "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">DEPLOYMENT SUPPORT</p>
            <p className="font-medium text-slate-700 mt-0.5 leading-snug whitespace-pre-wrap">{support.deployment_support || "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">AMC DETAILS</p>
            <p className="font-medium text-slate-700 mt-0.5 whitespace-pre-wrap">{support.amc_details || "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">AMC COST</p>
            <p className="font-semibold text-slate-800 mt-0.5">
              {support.amc_cost !== undefined && support.amc_cost !== null && support.amc_cost !== "" ? formatMoney(support.amc_cost, currency) : "—"}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">AMC DURATION</p>
            <p className="font-semibold text-slate-800 mt-0.5">{support.amc_duration || "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">AMC PERIOD</p>
            <p className="font-semibold text-slate-800 mt-0.5">{amcPeriod}</p>
          </div>
        </div>
      </section>

      {/* 8. TERMS AND CONDITIONS */}
      <section className="mb-4 break-inside-avoid border border-slate-200 rounded-lg p-3.5 bg-white">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-2 border-b border-slate-100 pb-1 flex items-center gap-1.5">
          <Award size={11} className="text-orange-500" />
          TERMS AND CONDITIONS
        </h2>
        {terms.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-[10px] text-slate-600">
            {terms.map((term, idx) => (
              <div key={term.id || idx}>
                <p className="font-bold text-slate-800">
                  {idx + 1}. {term.title || `Term ${idx + 1}`}
                </p>
                <p className="text-slate-600 mt-0.5 leading-snug whitespace-pre-wrap">
                  {term.content || term.term_text || "—"}
                </p>
              </div>
            ))}
          </div>
        ) : quotation.terms_conditions ? (
          <p className="text-[10px] text-slate-700 whitespace-pre-wrap">{quotation.terms_conditions}</p>
        ) : (
          <p className="text-[10px] text-slate-800">—</p>
        )}
      </section>

      {/* 9. APPROVAL AND NOTES */}
      <section className="mb-4 break-inside-avoid border border-slate-200 rounded-lg p-3.5 bg-white">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-2.5 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
          <UserCheck size={11} className="text-orange-500" />
          APPROVAL AND NOTES
        </h2>
        <div className="grid grid-cols-2 gap-4 text-[10.5px]">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">APPROVED BY</p>
            <p className="font-semibold text-slate-800 mt-0.5">{approval.approved_by || "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">APPROVAL COMMENTS</p>
            <p className="font-medium text-slate-700 mt-0.5 whitespace-pre-wrap">{approval.comments || "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase">INTERNAL NOTES</p>
            <p className="font-medium text-slate-700 mt-0.5 whitespace-pre-wrap">{quotation.notes || "—"}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-700 uppercase">CLIENT MESSAGE</p>
            <p className="font-medium text-slate-800 mt-0.5 whitespace-pre-wrap">{quotation.client_message || "—"}</p>
          </div>
        </div>
      </section>

      {/* 10. SIGNATURES & ACCEPTANCE BLOCK */}
      <section className="mt-6 pt-4 border-t border-slate-300 break-inside-avoid">
        <div className="grid grid-cols-3 gap-6 text-center text-[10.5px]">
          {/* Prepared By */}
          <div className="flex flex-col items-center justify-end">
            <div className="h-12 border-b border-dashed border-slate-400 w-full mb-1 flex items-end justify-center pb-1">
              <span className="font-signature text-slate-700 italic font-semibold text-sm">
                {quotation.prepared_by || "—"}
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
            <p className="text-[9.5px] text-slate-500">{quotation.company_name || quotation.client_name || "—"}</p>
          </div>
        </div>
      </section>

      {/* Document Footer */}
      <footer className="mt-6 pt-3 border-t border-slate-200 text-center text-[9.5px] text-slate-500 flex justify-between items-center break-inside-avoid">
        <span>Q-Techx Solutions | This quotation is computer generated.</span>
        <span className="font-medium text-slate-400">Page 1 of 1</span>
      </footer>
    </div>
  );
}
