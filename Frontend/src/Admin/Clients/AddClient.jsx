import { useState } from 'react';
import {
  UserRoundPlus, Building2, Mail, Phone, Globe,
  MapPin, User, Briefcase, FileText, ChevronLeft,
} from 'lucide-react';

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
  'Construction', 'Logistics', 'Real Estate', 'Manufacturing', 'Other',
];

const countries = ['India', 'USA', 'UK', 'UAE', 'Singapore', 'Australia', 'Canada', 'Germany'];

const initialForm = {
  companyName: '', industry: '', website: '', description: '',
  contactName: '', contactEmail: '', contactPhone: '', contactDesignation: '',
  street: '', city: '', state: '', country: '',
};

export default function AddClient() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New client:', form);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleReset = () => setForm(initialForm);

  /* ─── Shared input class ─── */
  const inp = `
    w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5
    text-sm text-white placeholder-white/30
    focus:outline-none focus:border-primary/50 focus:bg-white/8
    transition
  `;

  const label = (Icon, text) => (
    <label className="flex items-center gap-1.5 text-xs text-white/50 font-medium mb-1.5">
      <Icon size={13} className="text-primary" />
      {text}
    </label>
  );

  return (
    <div className="space-y-6 pb-8 text-white min-h-screen max-w-4xl mx-auto">

      {/* ── Header ── */}
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
      {submitted && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium px-5 py-3 rounded-xl">
          ✅ Client added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Company Information ── */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/8">
            <Building2 size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-white">Company Information</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              {label(Building2, 'Company Name *')}
              <input required className={inp} placeholder="e.g. NovaTech Solutions" value={form.companyName} onChange={set('companyName')} />
            </div>
            <div>
              {label(Briefcase, 'Industry *')}
              <select required className={inp} value={form.industry} onChange={set('industry')}>
                <option value="" disabled>Select industry</option>
                {industries.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              {label(Globe, 'Website')}
              <input className={inp} placeholder="https://example.com" value={form.website} onChange={set('website')} />
            </div>
            <div className="sm:col-span-2">
              {label(FileText, 'Description')}
              <textarea
                rows={3}
                className={inp + ' resize-none'}
                placeholder="Brief description about the client…"
                value={form.description}
                onChange={set('description')}
              />
            </div>
          </div>
        </div>

        {/* ── Contact Person ── */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/8">
            <User size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-white">Contact Person</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              {label(User, 'Full Name *')}
              <input required className={inp} placeholder="e.g. Arjun Mehta" value={form.contactName} onChange={set('contactName')} />
            </div>
            <div>
              {label(Briefcase, 'Designation')}
              <input className={inp} placeholder="e.g. CEO, Project Manager" value={form.contactDesignation} onChange={set('contactDesignation')} />
            </div>
            <div>
              {label(Mail, 'Email Address *')}
              <input required type="email" className={inp} placeholder="contact@company.com" value={form.contactEmail} onChange={set('contactEmail')} />
            </div>
            <div>
              {label(Phone, 'Phone Number')}
              <input className={inp} placeholder="+91 98765 43210" value={form.contactPhone} onChange={set('contactPhone')} />
            </div>
          </div>
        </div>

        {/* ── Address ── */}
        <div className="bg-white/4 border border-white/8 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/8">
            <MapPin size={16} className="text-primary" />
            <h2 className="text-sm font-bold text-white">Address</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              {label(MapPin, 'Street Address')}
              <input className={inp} placeholder="123 Main Street, Apt 4B" value={form.street} onChange={set('street')} />
            </div>
            <div>
              {label(MapPin, 'City')}
              <input className={inp} placeholder="e.g. Bangalore" value={form.city} onChange={set('city')} />
            </div>
            <div>
              {label(MapPin, 'State / Province')}
              <input className={inp} placeholder="e.g. Karnataka" value={form.state} onChange={set('state')} />
            </div>
            <div>
              {label(Globe, 'Country')}
              <select className={inp} value={form.country} onChange={set('country')}>
                <option value="" disabled>Select country</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            Reset
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-lg shadow-primary/30"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
          >
            Add Client
          </button>
        </div>

      </form>
    </div>
  );
}
