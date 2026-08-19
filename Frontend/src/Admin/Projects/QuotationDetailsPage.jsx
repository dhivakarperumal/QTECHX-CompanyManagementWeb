import { useEffect, useState } from "react";
import { ArrowLeft, Edit3, FileText, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import api from "../../api";

const money = (value, currency = "INR") => {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "₹";
  return `${symbol}${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const date = value => value ? dayjs(value).format("DD MMM YYYY") : "—";

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] overflow-hidden">
      <h2 className="border-b border-white/10 bg-white/[0.025] px-5 py-4 text-sm font-bold uppercase tracking-wider text-orange-300">{title}</h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-white/80">{value || "—"}</p>
    </div>
  );
}

export default function QuotationDetailsPage() {
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="flex min-h-screen items-center justify-center text-orange-400"><Loader2 size={34} className="animate-spin" /></div>;
  if (!quotation) return null;

  const items = Array.isArray(quotation.items) ? quotation.items : [];
  const phases = Array.isArray(quotation.timeline_items) ? quotation.timeline_items : [];
  const terms = Array.isArray(quotation.terms_sections) ? quotation.terms_sections : [];
  const approval = quotation.approval || {};

  return (
    <div className="min-h-screen pb-16 text-white">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin/myprojects/quotations")} className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10" title="Back">
              <ArrowLeft size={17} />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400"><FileText size={19} /></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-300">Quotation details</p><h1 className="text-xl font-bold">{quotation.quotation_number || "Quotation"}</h1></div>
          </div>
          <button onClick={() => navigate(`/admin/myprojects/quotations/edit/${quotation.uuid || quotation.id}`)} className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold hover:bg-orange-400"><Edit3 size={15} /> Edit quotation</button>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          <Section title="Quotation information"><div className="grid gap-4 sm:grid-cols-2"><Field label="Quotation number" value={quotation.quotation_number} /><Field label="Status" value={quotation.status} /><Field label="Quotation date" value={date(quotation.quotation_date)} /><Field label="Valid until" value={date(quotation.valid_until)} /><Field label="Prepared by" value={quotation.prepared_by} /><Field label="Salesperson" value={quotation.sales_executive} /></div></Section>
          <Section title="Client details"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1"><Field label="Company" value={quotation.company_name} /><Field label="Client" value={quotation.client_name} /><Field label="Email" value={quotation.email} /><Field label="Phone" value={quotation.phone_number} /><Field label="Address" value={quotation.address} /><Field label="GST number" value={quotation.gst_number} /></div></Section>
          <Section title="Project details"><div className="space-y-4"><Field label="Project name" value={quotation.project_name} /><Field label="Project type" value={quotation.project_type} /><Field label="Service type" value={quotation.service_type} /><Field label="Description" value={quotation.project_description} /><Field label="Scope of work" value={quotation.scope_of_work} /><Field label="Technologies" value={quotation.technologies_used} /></div></Section>
        </div>

        <Section title="Project timeline phases"><div className="space-y-3">{phases.length ? phases.map((phase, index) => <div key={phase.id || index} className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"><Field label="Phase" value={`${index + 1}. ${phase.phase || phase.phase_name}`} /><Field label="Description" value={phase.description} /><Field label="Features / modules" value={Array.isArray(phase.features_modules) ? phase.features_modules.join(", ") : phase.features_modules} /><Field label="Duration" value={phase.duration || `${phase.estimated_working_days || 0} days`} /><Field label="Cost" value={money(phase.cost, quotation.currency)} /></div></div>) : <p className="text-sm text-white/40">No timeline phases added.</p>}</div></Section>

        <Section title="Commercial proposal"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-xs uppercase tracking-wider text-white/35"><tr>{["Item","Description","Qty","Unit price","Discount","Tax","Total"].map(label => <th key={label} className="px-3 py-2">{label}</th>)}</tr></thead><tbody>{items.map((item, index) => <tr key={item.id || index} className="border-t border-white/10"><td className="px-3 py-3 text-white">{item.service_name || item.item_component || "—"}</td><td className="max-w-xs px-3 py-3 text-white/60">{item.description || "—"}</td><td className="px-3 py-3">{item.quantity}</td><td className="px-3 py-3">{money(item.unit_price, quotation.currency)}</td><td className="px-3 py-3">{item.discount || item.discount_percentage || 0}</td><td className="px-3 py-3">{item.tax_percentage || 0}%</td><td className="px-3 py-3 font-semibold">{money(item.total, quotation.currency)}</td></tr>)}</tbody></table></div><div className="ml-auto mt-5 max-w-sm space-y-2 border-t border-white/10 pt-4 text-sm"><div className="flex justify-between text-white/60"><span>Subtotal</span><span>{money(quotation.subtotal, quotation.currency)}</span></div><div className="flex justify-between text-white/60"><span>Discount</span><span>{money(quotation.discount, quotation.currency)}</span></div><div className="flex justify-between text-white/60"><span>GST</span><span>{money(quotation.tax_amount, quotation.currency)}</span></div><div className="flex justify-between border-t border-white/10 pt-2 text-base font-bold text-orange-300"><span>Grand total</span><span>{money(quotation.grand_total, quotation.currency)}</span></div></div></Section>

        <div className="grid gap-5 lg:grid-cols-2"><Section title="Terms and conditions"><div className="space-y-3">{terms.length ? terms.map((term, index) => <div key={term.id || index}><p className="text-sm font-semibold text-white">{term.title || `Term ${index + 1}`}</p><p className="mt-1 whitespace-pre-wrap text-sm text-white/60">{term.content || term.term_text || "—"}</p></div>) : <p className="text-sm text-white/40">No terms added.</p>}</div></Section><Section title="Approval and notes"><div className="space-y-4"><Field label="Approved by" value={approval.approved_by} /><Field label="Approval comments" value={approval.comments} /><Field label="Internal notes" value={quotation.notes} /><Field label="Client message" value={quotation.client_message} /></div></Section></div>
      </div>
    </div>
  );
}
