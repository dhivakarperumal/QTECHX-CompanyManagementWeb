import { useState } from 'react';
import {
  Handshake, Search, Filter, Edit2, Eye,
  Mail, Phone, Users, TrendingUp, UserCheck, UserX,
} from 'lucide-react';

/* ─── Mock Data ─── */
const clientsData = [
  { id: 1,  company: 'NovaTech Solutions',   contact: 'Arjun Mehta',    email: 'arjun@novatech.io',      phone: '+91 98201 11001', industry: 'Technology',   status: 'Active',   initials: 'NT', color: '#6366f1', newThisMonth: true  },
  { id: 2,  company: 'GreenBridge Infra',    contact: 'Priya Sharma',   email: 'priya@greenbridge.com',  phone: '+91 97301 22002', industry: 'Construction', status: 'Active',   initials: 'GB', color: '#10b981', newThisMonth: true  },
  { id: 3,  company: 'Zenith Retail Co.',    contact: 'Rohan Gupta',    email: 'rohan@zenithretail.in',  phone: '+91 96401 33003', industry: 'Retail',       status: 'Inactive', initials: 'ZR', color: '#f59e0b', newThisMonth: false },
  { id: 4,  company: 'BlueSky Logistics',    contact: 'Ananya Rao',     email: 'ananya@bluesky.co',      phone: '+91 95501 44004', industry: 'Logistics',    status: 'Active',   initials: 'BL', color: '#3b82f6', newThisMonth: false },
  { id: 5,  company: 'Apex FinServ',         contact: 'Kiran Patel',    email: 'kiran@apexfin.com',      phone: '+91 94601 55005', industry: 'Finance',      status: 'Active',   initials: 'AF', color: '#ec4899', newThisMonth: true  },
  { id: 6,  company: 'MediCore Health',      contact: 'Sneha Nair',     email: 'sneha@medicore.in',      phone: '+91 93701 66006', industry: 'Healthcare',   status: 'Active',   initials: 'MC', color: '#14b8a6', newThisMonth: false },
  { id: 7,  company: 'EduSphere Learning',   contact: 'Vijay Kumar',    email: 'vijay@edusphere.org',    phone: '+91 92801 77007', industry: 'Education',    status: 'Inactive', initials: 'ES', color: '#f97316', newThisMonth: false },
  { id: 8,  company: 'PrimeSpace Realty',    contact: 'Divya Menon',    email: 'divya@primespace.com',   phone: '+91 91901 88008', industry: 'Real Estate',  status: 'Active',   initials: 'PS', color: '#8b5cf6', newThisMonth: false },
];

const stats = [
  { label: 'Total Clients',   value: 8,  icon: Users,       color: 'text-blue-400',    bg: 'bg-blue-500/15'    },
  { label: 'Active',          value: 6,  icon: UserCheck,   color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  { label: 'Inactive',        value: 2,  icon: UserX,       color: 'text-rose-400',    bg: 'bg-rose-500/15'    },
  { label: 'New This Month',  value: 3,  icon: TrendingUp,  color: 'text-primary',     bg: 'bg-primary/15'     },
];

export default function AllClients() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = clientsData.filter((c) => {
    const matchSearch =
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 pb-6 text-white min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Handshake size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">All Clients</h1>
            <p className="text-white/40 text-xs mt-0.5">Manage your client relationships</p>
          </div>
        </div>
        <a
          href="#/admin/clients/add"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-primary/30"
        >
          + Add Client
        </a>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/4 border border-white/8 rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Search & Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by company, contact or industry…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-white/40" />
          {['All', 'Active', 'Inactive'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                filter === f
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Client Cards ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No clients found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white/4 border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/6 hover:border-white/14 transition-all duration-200 group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: c.color + '28', border: `1px solid ${c.color}44`, color: c.color }}
                  >
                    {c.initials}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm leading-tight">{c.company}</p>
                    <p className="text-white/40 text-xs mt-0.5">{c.contact}</p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    c.status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-rose-500/15 text-rose-400'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <Mail size={12} />
                  <span className="truncate">{c.email}</span>
                </div>
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <Phone size={12} />
                  <span>{c.phone}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-white/8">
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: c.color + '20', color: c.color }}
                >
                  {c.industry}
                </span>
                <div className="flex items-center gap-1.5">
                  <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition">
                    <Eye size={13} />
                  </button>
                  <button className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition">
                    <Edit2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
