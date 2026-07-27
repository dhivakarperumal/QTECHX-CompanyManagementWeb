import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Handshake, Search, Edit2, Eye, Users, TrendingUp, UserCheck,
  UserX, LayoutGrid, List, Loader2, RefreshCw, UserRoundPlus,
  Mail, Phone, Building2, Briefcase, Calendar, AlertCircle,
  ChevronLeft, ChevronRight, Clock, SlidersHorizontal, X,
} from 'lucide-react';
import api from '../../api';

// ─── Constants (mirror backend) ──────────────────────────────────────────────
const CLIENT_STATUSES   = ['Lead', 'Prospect', 'Active', 'Inactive', 'Converted', 'Closed'];
const SERVICE_TYPES     = ['Website', 'Mobile App', 'Web App', 'Software', 'Other'];
const FOLLOW_UP_STATUSES = ['Pending', 'Completed', 'Rescheduled', 'Cancelled'];

const STATUS_STYLES = {
  Lead:      { pill: 'bg-sky-500/15 text-sky-400 border border-sky-500/25',      dot: 'bg-sky-400'      },
  Prospect:  { pill: 'bg-violet-500/15 text-violet-400 border border-violet-500/25', dot: 'bg-violet-400' },
  Active:    { pill: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400' },
  Inactive:  { pill: 'bg-rose-500/15 text-rose-400 border border-rose-500/25',    dot: 'bg-rose-400'    },
  Converted: { pill: 'bg-amber-500/15 text-amber-400 border border-amber-500/25', dot: 'bg-amber-400'   },
  Closed:    { pill: 'bg-white/10 text-white/50 border border-white/15',          dot: 'bg-white/40'    },
};

const FOLLOW_UP_STYLES = {
  Pending:     'bg-amber-500/15 text-amber-400',
  Completed:   'bg-emerald-500/15 text-emerald-400',
  Rescheduled: 'bg-sky-500/15 text-sky-400',
  Cancelled:   'bg-rose-500/15 text-rose-400',
};

// Colour palette for avatars (by index)
const AVATAR_COLOURS = [
  '#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899',
  '#14b8a6','#f97316','#8b5cf6','#ef4444','#22c55e',
];

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase() || '??';
}

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function Avatar({ name, index }) {
  const colour = AVATAR_COLOURS[index % AVATAR_COLOURS.length];
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 select-none"
      style={{ background: colour + '28', border: `1.5px solid ${colour}44`, color: colour }}
    >
      {getInitials(name)}
    </div>
  );
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AllClients() {
  const navigate = useNavigate();

  // ── View / UI state ──
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'table'
  const [showFilters, setShowFilters] = useState(false);

  // ── Filter state ──
  const [search, setSearch]               = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [fuFilter, setFuFilter]           = useState('');

  // ── Pagination ──
  const [page, setPage]   = useState(1);
  const [limit]           = useState(12);

  // ── Data state ──
  const [clients, setClients]       = useState([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // ── Stats (derived from API) ──
  const [statsData, setStatsData] = useState({ total: 0, active: 0, inactive: 0, leads: 0 });

  // ── Fetch ──
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit });
      if (search)        params.append('search', search);
      if (statusFilter)  params.append('client_status', statusFilter);
      if (serviceFilter) params.append('service_type', serviceFilter);
      if (fuFilter)      params.append('follow_up_status', fuFilter);

      const { data } = await api.get(`/clients?${params}`);
      if (data.success === false) throw new Error(data.message || 'Failed to fetch clients');

      const rows = data.data || [];
      setClients(rows);
      setTotal(data.pagination?.total ?? rows.length);
      setTotalPages(data.pagination?.pages ?? 1);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, serviceFilter, fuFilter]);

  // Fetch summary stats (no filters, high limit)
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/clients?limit=1000&page=1');
      if (!data.success) return;
      const all = data.data || [];
      setStatsData({
        total:    data.pagination?.total ?? all.length,
        active:   all.filter((c) => c.client_status === 'Active').length,
        inactive: all.filter((c) => c.client_status === 'Inactive').length,
        leads:    all.filter((c) => c.client_status === 'Lead').length,
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);
  useEffect(() => { fetchStats(); },  [fetchStats]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, statusFilter, serviceFilter, fuFilter]);

  const hasFilters = statusFilter || serviceFilter || fuFilter || search;
  const clearFilters = () => {
    setSearch(''); setStatusFilter(''); setServiceFilter(''); setFuFilter('');
  };

  const stats = [
    { label: 'Total Clients',  value: statsData.total,    icon: Users,      cls: 'text-blue-400',    bg: 'bg-blue-500/15'    },
    { label: 'Active',         value: statsData.active,   icon: UserCheck,  cls: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { label: 'Inactive',       value: statsData.inactive, icon: UserX,      cls: 'text-rose-400',    bg: 'bg-rose-500/15'    },
    { label: 'Leads',          value: statsData.leads,    icon: TrendingUp, cls: 'text-primary',     bg: 'bg-primary/15'     },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-10 text-white min-h-screen">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Handshake size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">All Clients</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? 'Loading…' : `${total} client${total !== 1 ? 's' : ''} total`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchClients()}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <a
            href="#/admin/clients/add"
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-primary/30 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}
          >
            <UserRoundPlus size={15} />
            Add Client
          </a>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white/[0.04] border border-white/8 rounded-2xl p-5 flex items-center gap-4 hover:bg-white/[0.06] transition">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <Icon size={20} className={s.cls} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/50 text-xs mt-0.5">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Search + View Toggle + Filter Toggle ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by name, company, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
            showFilters || hasFilters
              ? 'bg-primary/15 border-primary/40 text-primary'
              : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {hasFilters && (
            <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
              {[statusFilter, serviceFilter, fuFilter, search].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* View mode toggle */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button
            id="view-card"
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'card' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white'
            }`}
          >
            <LayoutGrid size={13} /> Card
          </button>
          <button
            id="view-table"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'table' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white'
            }`}
          >
            <List size={13} /> Table
          </button>
        </div>
      </div>

      {/* ── Expandable Filters ── */}
      {showFilters && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Filter By</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-primary/80 hover:text-primary transition flex items-center gap-1">
                <X size={11} /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status filter */}
            <div>
              <label className="text-[11px] text-white/40 font-medium mb-1.5 block">Client Status</label>
              <div className="flex flex-wrap gap-2">
                {CLIENT_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition ${
                      statusFilter === s
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* Service filter */}
            <div>
              <label className="text-[11px] text-white/40 font-medium mb-1.5 block">Service Type</label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_TYPES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setServiceFilter(serviceFilter === s ? '' : s)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition ${
                      serviceFilter === s
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* Follow-up filter */}
            <div>
              <label className="text-[11px] text-white/40 font-medium mb-1.5 block">Follow-up Status</label>
              <div className="flex flex-wrap gap-2">
                {FOLLOW_UP_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFuFilter(fuFilter === s ? '' : s)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold border transition ${
                      fuFilter === s
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
          <AlertCircle size={17} className="shrink-0" />
          {error}
          <button onClick={fetchClients} className="ml-auto text-xs underline underline-offset-2 hover:opacity-80">Retry</button>
        </div>
      )}

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-white/40">
            <Loader2 size={32} className="animate-spin text-primary/70" />
            <p className="text-sm">Loading clients…</p>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && clients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Users size={32} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No clients found</p>
          <p className="text-xs mt-1">
            {hasFilters ? 'Try adjusting your filters.' : 'Add your first client to get started.'}
          </p>
          {!hasFilters && (
            <a
              href="#/admin/clients/add"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition shadow-lg shadow-primary/30 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
            >
              <UserRoundPlus size={15} /> Add First Client
            </a>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          CARD MODE
      ══════════════════════════════════════════════════════════════ */}
      {!loading && !error && clients.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {clients.map((c, i) => {
            const colour = AVATAR_COLOURS[i % AVATAR_COLOURS.length];
            return (
              <div
                key={c.uuid}
                className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.055] hover:border-white/14 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={c.client_name} index={i} />
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm leading-tight truncate">{c.client_name}</p>
                      {c.company_name && (
                        <p className="text-white/40 text-xs mt-0.5 truncate flex items-center gap-1">
                          <Building2 size={10} /> {c.company_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusPill status={c.client_status} />
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5">
                  {c.email && (
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <Mail size={11} className="shrink-0 text-white/30" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.phone_number && (
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <Phone size={11} className="shrink-0 text-white/30" />
                      <span>{c.phone_number}</span>
                    </div>
                  )}
                  {c.follow_up_date && (
                    <div className="flex items-center gap-2 text-white/50 text-xs">
                      <Calendar size={11} className="shrink-0 text-white/30" />
                      <span>Follow-up: {formatDate(c.follow_up_date)}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  {c.service_type && (
                    <span
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: colour + '20', color: colour }}
                    >
                      {c.service_type}
                    </span>
                  )}
                  {c.follow_up_status && (
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${FOLLOW_UP_STYLES[c.follow_up_status] || 'bg-white/10 text-white/50'}`}>
                      {c.follow_up_status}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-white/8">
                  <span className="text-[10px] text-white/30 flex items-center gap-1">
                    <Clock size={9} />
                    {formatDate(c.created_at)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigate(`/admin/clients/${c.uuid}`)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition"
                      title="View"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/clients/${c.uuid}/edit`)}
                      className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/25 text-primary transition"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TABLE MODE
      ══════════════════════════════════════════════════════════════ */}
      {!loading && !error && clients.length > 0 && viewMode === 'table' && (
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-[11px] font-bold text-white/40 uppercase tracking-wider px-5 py-4">Client</th>
                  <th className="text-left text-[11px] font-bold text-white/40 uppercase tracking-wider px-4 py-4">Contact</th>
                  <th className="text-left text-[11px] font-bold text-white/40 uppercase tracking-wider px-4 py-4">Status</th>
                  <th className="text-left text-[11px] font-bold text-white/40 uppercase tracking-wider px-4 py-4">Service</th>
                  <th className="text-left text-[11px] font-bold text-white/40 uppercase tracking-wider px-4 py-4">Follow-up</th>
                  <th className="text-left text-[11px] font-bold text-white/40 uppercase tracking-wider px-4 py-4">Date</th>
                  <th className="text-right text-[11px] font-bold text-white/40 uppercase tracking-wider px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c, i) => (
                  <tr
                    key={c.uuid}
                    className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Client name + company */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.client_name} index={i} />
                        <div>
                          <p className="text-white font-semibold text-sm leading-tight">{c.client_name}</p>
                          {c.company_name && (
                            <p className="text-white/40 text-xs mt-0.5 flex items-center gap-1">
                              <Building2 size={9} /> {c.company_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        {c.email && (
                          <p className="text-white/60 text-xs flex items-center gap-1.5">
                            <Mail size={10} className="text-white/30 shrink-0" />
                            <span className="truncate max-w-[150px]">{c.email}</span>
                          </p>
                        )}
                        {c.phone_number && (
                          <p className="text-white/60 text-xs flex items-center gap-1.5">
                            <Phone size={10} className="text-white/30 shrink-0" />
                            {c.phone_number}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusPill status={c.client_status} />
                    </td>

                    {/* Service */}
                    <td className="px-4 py-3.5">
                      {c.service_type ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/60 bg-white/8 border border-white/10 px-2.5 py-1 rounded-lg">
                          <Briefcase size={9} className="text-white/30" /> {c.service_type}
                        </span>
                      ) : <span className="text-white/20 text-xs">—</span>}
                    </td>

                    {/* Follow-up */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${FOLLOW_UP_STYLES[c.follow_up_status] || 'bg-white/10 text-white/50'}`}>
                          {c.follow_up_status || '—'}
                        </span>
                        {c.follow_up_date && (
                          <p className="text-white/30 text-[10px] flex items-center gap-1">
                            <Calendar size={8} /> {formatDate(c.follow_up_date)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Created date */}
                    <td className="px-4 py-3.5">
                      <span className="text-white/40 text-xs">{formatDate(c.created_at)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/clients/${c.uuid}`)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/40 hover:text-white transition"
                          title="View"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/clients/${c.uuid}/edit`)}
                          className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/25 text-primary transition"
                          title="Edit"
                        >
                          <Edit2 size={13} />
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

      {/* ── Pagination ── */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-white/30">
            Page <span className="text-white/60 font-semibold">{page}</span> of{' '}
            <span className="text-white/60 font-semibold">{totalPages}</span>
            {' '}· {total} total
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                    p === page
                      ? 'bg-primary text-white shadow-md shadow-primary/30'
                      : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
