import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarClock, Search, Plus, Eye, Edit, RefreshCcw, History, Send, Download, Printer, Trash2, Filter, ChevronLeft, ChevronRight, Sparkles, AlertTriangle, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import api from '../../api';

const expiryTypeOptions = ['Hosting', 'Domain', 'SSL', 'Maintenance', 'License', 'Subscription', 'Support Plan'];
const renewalStatusOptions = ['Active', 'Expiring Soon', 'Expired', 'Renewed'];
const statusOptions = ['Active', 'Inactive'];

function getBadgeClass(status) {
  if (!status) return 'bg-slate-700 text-slate-100';
  if (status === 'Expired') return 'bg-rose-500/20 text-rose-300 border border-rose-400/30';
  if (status === 'Expiring Soon') return 'bg-amber-500/20 text-amber-300 border border-amber-400/30';
  if (status === 'Renewed') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30';
  return 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30';
}

function getDaysBadge(days) {
  if (days === null || days === undefined || Number.isNaN(days)) return { label: 'N/A', className: 'bg-slate-700 text-slate-100' };
  if (days < 0) return { label: `${Math.abs(days)} expired`, className: 'bg-rose-500/20 text-rose-300 border border-rose-400/30' };
  if (days <= 7) return { label: `${days} days`, className: 'bg-orange-500/20 text-orange-300 border border-orange-400/30' };
  if (days <= 30) return { label: `${days} days`, className: 'bg-amber-500/20 text-amber-300 border border-amber-400/30' };
  return { label: `${days} days`, className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' };
}

export default function ProjectExpiryPage() {
  const [records, setRecords] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [filters, setFilters] = useState({ search: '', project_id: '', client_id: '', expiry_type: '', renewal_status: '', status: '', from_date: '', to_date: '', expiring_today: false, next_7_days: false, next_30_days: false, expired: false });
  const [form, setForm] = useState({ project_id: '', client_id: '', client_name: '', domain_name: '', expiry_type: 'Hosting', project_type: '', service_name: '', provider_name: '', plan_name: '', price_per_month: '', purchase_date: '', start_date: '', expiry_date: '', renewal_cost: '', payment_status: 'Pending', payment_method: '', invoice_number: '', auto_renew: false, renewal_status: 'Active', notes: '', internal_notes: '', status: 'Active' });
  const [renewForm, setRenewForm] = useState({ renewal_type: 'Hosting', new_expiry_date: '', renewal_amount: '', tax_amount: '', total_amount: '', payment_method: '', payment_status: 'Pending', invoice_number: '', notes: '' });

  const fetchExpiryData = async () => {
    setIsLoading(true);
    try {
      const [expiryRes, statsRes] = await Promise.all([
        api.get('/project-expiries', { params: { ...filters, page: 1, limit: 200 } }),
        api.get('/project-expiries/stats').catch(() => ({ data: { data: {} } })),
      ]);
      setRecords(expiryRes?.data?.data || []);
      setStats(statsRes?.data?.data || {});
    } catch (error) {
      console.error('Failed to load expiry records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaticData = async () => {
    try {
      const clientRes = await api.get('/clients', { params: { page: 1, limit: 100 } });
      setClients(clientRes?.data?.data || []);
    } catch (e) { console.error('Clients load failed:', e); }

    try {
      const assignmentRes = await api.get('/projects/assignments/all', { params: { page: 1, limit: 200 } });
      const assignments = assignmentRes?.data?.data || [];
      const assignedUUIDs = [...new Set(assignments.map((a) => a.project_uuid).filter(Boolean))];

      const projectRes = await api.get('/projects', { params: { page: 1, limit: 200 } });
      const allProjects = projectRes?.data?.data || [];

      if (assignedUUIDs.length > 0) {
        const assignedProjects = allProjects.filter((p) =>
          assignedUUIDs.includes(p.uuid) || assignedUUIDs.includes(String(p.id))
        );
        setProjects(assignedProjects.length > 0 ? assignedProjects : allProjects);
      } else {
        setProjects(allProjects);
      }
    } catch (e) {
      console.error('Projects load failed:', e);
      try {
        const projectRes = await api.get('/projects', { params: { page: 1, limit: 200 } });
        setProjects(projectRes?.data?.data || []);
      } catch (e2) { console.error(e2); }
    }
  };

  const loadData = () => {
    fetchExpiryData();
  };

  useEffect(() => {
    fetchStaticData();
  }, []);

  useEffect(() => {
    fetchExpiryData();
  }, [filters]);

  const visibleRecords = useMemo(() => records.map((record) => ({ ...record, days_remaining: record.expiry_date ? Math.ceil((new Date(record.expiry_date) - new Date(new Date().toDateString())) / (1000 * 60 * 60 * 24)) : null })), [records]);

  const openCreate = () => {
    setModalMode('create');
    setSelectedRecord(null);
    setForm({ project_id: '', client_id: '', client_name: '', domain_name: '', expiry_type: 'Hosting', project_type: '', service_name: '', provider_name: '', plan_name: '', price_per_month: '', purchase_date: '', start_date: '', expiry_date: '', renewal_cost: '', payment_status: 'Pending', payment_method: '', invoice_number: '', auto_renew: false, renewal_status: 'Active', notes: '', internal_notes: '', status: 'Active' });
    setShowModal(true);
  };

  // Auto-fill all fields when a project is selected - fetch full project details
  const handleProjectSelect = async (projectId) => {
    // Set project_id immediately so the select feels responsive
    setForm((prev) => ({ ...prev, project_id: projectId }));
    if (!projectId) return;

    // First try to use already-loaded project data
    const localProject = projects.find((p) => String(p.id) === String(projectId) || String(p.uuid) === String(projectId));

    const applyProject = (project, clientList) => {
      const matchedClient = (clientList || clients).find(
        (c) => String(c.id) === String(project.client_id) ||
               c.client_name === project.client_name ||
               c.company_name === project.company_name
      );
      setForm((prev) => ({
        ...prev,
        project_id: projectId,
        client_id: matchedClient ? String(matchedClient.id) : (project.client_id ? String(project.client_id) : prev.client_id),
        client_name: project.client_name || project.company_name || '',
        domain_name: project.domain_name || prev.domain_name,
        project_type: project.project_category || project.project_type || prev.project_type,
        service_name: project.project_name || project.domain_name || prev.service_name,
        provider_name: project.company_name || project.client_name || prev.provider_name,
      }));
    };

    if (localProject && (localProject.client_name || localProject.domain_name)) {
      // Local data has enough — use it directly
      applyProject(localProject, clients);
    } else {
      // Fetch full project details from API
      try {
        const { data } = await api.get(`/projects/${projectId}`);
        const project = data.data || data.project || data;
        applyProject(project, clients);
      } catch (err) {
        console.error('Failed to fetch project details', err);
      }
    }
  };

  const openEdit = (record) => {
    setModalMode('edit');
    setSelectedRecord(record);
    setForm({
      project_id: record.project_id || '',
      client_id: record.client_id || '',
      client_name: record.client_name || record.company_name || '',
      domain_name: record.domain_name || '',
      expiry_type: record.expiry_type || 'Hosting',
      project_type: record.project_type || '',
      service_name: record.service_name || '',
      provider_name: record.provider_name || '',
      plan_name: record.plan_name || '',
      purchase_date: record.purchase_date ? record.purchase_date.split('T')[0] : '',
      start_date: record.start_date ? record.start_date.split('T')[0] : '',
      expiry_date: record.expiry_date ? record.expiry_date.split('T')[0] : '',
      renewal_cost: record.renewal_cost || '',
      payment_status: record.payment_status || 'Pending',
      payment_method: record.payment_method || '',
      invoice_number: record.invoice_number || '',
      auto_renew: Boolean(record.auto_renew),
      renewal_status: record.renewal_status || 'Active',
      notes: record.notes || '',
      internal_notes: record.internal_notes || '',
      status: record.status || 'Active',
    });
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, project_id: Number(form.project_id || 0), client_id: form.client_id ? Number(form.client_id) : null, renewal_cost: Number(form.renewal_cost || 0) };
      if (modalMode === 'edit') {
        await api.put(`/project-expiries/${selectedRecord.id}`, payload);
      } else {
        await api.post('/project-expiries', payload);
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/project-expiries/${id}`);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const openAction = async (record, type) => {
    setActionModal({ type, record });
    if (type === 'view' || type === 'history') {
      try {
        const response = await api.get(`/project-expiries/${record.id}`);
        const payload = response?.data?.data || {};
        setDetailRecord(payload);
        setHistoryRecords(payload.renewal_history || []);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRenewSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post(`/project-expiries/${actionModal.record.id}/renew`, {
        ...renewForm,
        renewal_amount: Number(renewForm.renewal_amount || 0),
        tax_amount: Number(renewForm.tax_amount || 0),
        total_amount: Number(renewForm.total_amount || 0),
      });
      setActionModal(null);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReminderSend = async (record) => {
    try {
      await api.post(`/project-expiries/${record.id}/reminders`, { reminder_type: 'Internal', reminder_days_before: 0 });
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleInvoiceDownload = (record) => {
    if (record.invoice_file) {
      window.open(record.invoice_file, '_blank');
    }
  };

  const statsCards = [
    { key: 'total_projects', label: 'Total Projects', icon: Sparkles, value: stats.total_projects || 0, tone: 'from-indigo-500 to-violet-500' },
    { key: 'active_records', label: 'Active Projects', icon: CheckCircle2, value: stats.active_records || 0, tone: 'from-emerald-500 to-green-500' },
    { key: 'expiring_today', label: 'Expiring Today', icon: AlertTriangle, value: stats.expiring_today || 0, tone: 'from-amber-500 to-orange-500' },
    { key: 'expiring_7_days', label: 'Expiring in 7 Days', icon: Clock3, value: stats.expiring_7_days || 0, tone: 'from-orange-500 to-rose-500' },
    { key: 'expiring_30_days', label: 'Expiring in 30 Days', icon: CalendarClock, value: stats.expiring_30_days || 0, tone: 'from-cyan-500 to-sky-500' },
    { key: 'expired_projects', label: 'Expired Projects', icon: XCircle, value: stats.expired_projects || 0, tone: 'from-rose-600 to-red-500' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-orange-400">Project Expiry Management</p>
              <h1 className="mt-2 text-3xl font-semibold">Admin expiry dashboard</h1>
              <p className="mt-2 text-sm text-slate-400">Track hosting, domain, SSL, maintenance, license, and subscription renewals in one place.</p>
            </div>
            <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 font-medium text-white shadow-lg shadow-orange-500/20">
              <Plus size={18} /> Add Expiry
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.key} className={`rounded-3xl border border-white/10 bg-linear-to-br ${card.tone} p-px`}>
                <div className="rounded-[calc(1.5rem-1px)] bg-slate-950/95 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{card.label}</p>
                      <p className="mt-2 text-3xl font-semibold">{card.value}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
                      <Icon size={20} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-black/20">
          <div className="flex flex-wrap items-center gap-3 border-b border-white/10 pb-4">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50">
              <Search size={18} className="text-slate-400" />
              <input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search projects or clients" className="w-full bg-transparent outline-none text-white" />
            </div>
            <button onClick={() => { setFilters({ search: '', project_id: '', client_id: '', expiry_type: '', renewal_status: '', status: '', from_date: '', to_date: '', expiring_today: false, next_7_days: false, next_30_days: false, expired: false }); loadData(); }} className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-300">Reset</button>
            <button onClick={loadData} className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-slate-300">Refresh</button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <select value={filters.project_id} onChange={(e) => setFilters({ ...filters, project_id: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
              <option value="">All projects</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.project_name}</option>)}
            </select>
            <select value={filters.client_id} onChange={(e) => setFilters({ ...filters, client_id: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
              <option value="">All clients</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.client_name || client.company_name}</option>)}
            </select>
            <select value={filters.expiry_type} onChange={(e) => setFilters({ ...filters, expiry_type: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
              <option value="">All expiry types</option>
              {expiryTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select value={filters.renewal_status} onChange={(e) => setFilters({ ...filters, renewal_status: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
              <option value="">All renewal status</option>
              {renewalStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <input type="date" value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50" />
            <input type="date" value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50" />
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
              <option value="">All status</option>
              {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <div className="flex flex-wrap gap-2">
              {[
                ['expiring_today', 'Today'],
                ['next_7_days', '7D'],
                ['next_30_days', '30D'],
                ['expired', 'Expired'],
              ].map(([key, label]) => (
                <button key={key} onClick={() => setFilters({ ...filters, [key]: !filters[key] })} className={`rounded-2xl px-3 py-2 text-sm ${filters[key] ? 'bg-orange-500 text-white' : 'border border-white/10 bg-slate-950/70 text-slate-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-800/80 text-slate-300 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left whitespace-nowrap">#</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Project / Client</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Service Name</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Expiry Type</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Provider / Plan</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Purchase Date</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Start Date</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Expiry Date</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Days Left</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Renewal Cost</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Payment</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Auto Renew</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Renewal Status</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="15" className="px-4 py-10 text-center text-slate-400">Loading expiry records…</td></tr>
                ) : visibleRecords.length === 0 ? (
                  <tr><td colSpan="15" className="px-4 py-10 text-center text-slate-400">No expiry records found.</td></tr>
                ) : visibleRecords.map((record, idx) => {
                  const badge = getDaysBadge(record.days_remaining);
                  return (
                    <tr key={record.id} className="border-t border-white/10 hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
                      <td className="px-4 py-3 min-w-[160px]">
                        <div className="font-medium text-white truncate max-w-[150px]">{record.project_name || `Project #${record.project_id}`}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[150px]">{record.client_name || '—'}</div>
                        {record.domain_name && <div className="text-xs text-orange-400/70 truncate max-w-[150px]">{record.domain_name}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{record.service_name || '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="rounded-full bg-blue-500/15 border border-blue-500/30 px-2.5 py-1 text-xs font-medium text-blue-300">{record.expiry_type || '—'}</span>
                      </td>
                      <td className="px-4 py-3 min-w-[140px]">
                        <div className="text-slate-200 text-xs">{record.provider_name || '—'}</div>
                        {record.plan_name && <div className="text-xs text-slate-400">{record.plan_name}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{record.purchase_date ? new Date(record.purchase_date).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="px-4 py-3 text-slate-300 whitespace-nowrap text-xs">{record.start_date ? new Date(record.start_date).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-white text-xs font-medium">{record.expiry_date ? new Date(record.expiry_date).toLocaleDateString('en-IN') : '—'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {record.renewal_cost ? (
                          <div className="text-emerald-400 text-xs font-semibold">₹{Number(record.renewal_cost).toLocaleString('en-IN')}</div>
                        ) : <span className="text-slate-500">—</span>}
                        {record.payment_method && <div className="text-xs text-slate-400">{record.payment_method}</div>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          record.payment_status === 'Paid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          record.payment_status === 'Failed' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>{record.payment_status || 'Pending'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {record.auto_renew ? (
                          <span className="text-emerald-400 text-xs font-medium">✓ Yes</span>
                        ) : (
                          <span className="text-slate-500 text-xs">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getBadgeClass(record.renewal_status)}`}>{record.renewal_status || 'Active'}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          record.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}>{record.status || 'Active'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => openAction(record, 'view')} className="rounded-xl border border-white/10 p-1.5 text-slate-300 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/30 transition-colors" title="View"><Eye size={14} /></button>
                          <button onClick={() => openEdit(record)} className="rounded-xl border border-white/10 p-1.5 text-slate-300 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/30 transition-colors" title="Edit"><Edit size={14} /></button>
                          <button onClick={() => openAction(record, 'renew')} className="rounded-xl border border-white/10 p-1.5 text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 transition-colors" title="Renew"><RefreshCcw size={14} /></button>
                          <button onClick={() => openAction(record, 'history')} className="rounded-xl border border-white/10 p-1.5 text-slate-300 hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/30 transition-colors" title="History"><History size={14} /></button>
                          <button onClick={() => handleReminderSend(record)} className="rounded-xl border border-white/10 p-1.5 text-slate-300 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-500/30 transition-colors" title="Send Reminder"><Send size={14} /></button>
                          <button onClick={() => handleDelete(record.id)} className="rounded-xl border border-white/10 p-1.5 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 transition-colors" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        </div>
      </div>

      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-orange-400">{actionModal.type === 'renew' ? 'Renew record' : actionModal.type === 'history' ? 'Renewal history' : 'Expiry details'}</p>
                <h2 className="mt-2 text-2xl font-semibold">{actionModal.record?.service_name || actionModal.record?.expiry_type}</h2>
              </div>
              <button onClick={() => setActionModal(null)} className="rounded-full border border-white/10 p-2 text-slate-300"><XCircle size={18} /></button>
            </div>
            {actionModal.type === 'renew' ? (
              <form onSubmit={handleRenewSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-400">Renewal Type</label>
                  <select value={renewForm.renewal_type} onChange={(e) => setRenewForm({ ...renewForm, renewal_type: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
                    {expiryTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-400">New Expiry Date</label>
                  <input type="date" value={renewForm.new_expiry_date} onChange={(e) => setRenewForm({ ...renewForm, new_expiry_date: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-400">Renewal Amount</label>
                  <input type="number" value={renewForm.renewal_amount} onChange={(e) => setRenewForm({ ...renewForm, renewal_amount: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-400">Tax</label>
                  <input type="number" value={renewForm.tax_amount} onChange={(e) => setRenewForm({ ...renewForm, tax_amount: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-400">Total</label>
                  <input type="number" value={renewForm.total_amount} onChange={(e) => setRenewForm({ ...renewForm, total_amount: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-400">Payment Method</label>
                  <select value={renewForm.payment_method} onChange={(e) => setRenewForm({ ...renewForm, payment_method: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
                    <option value="">Select method</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-400">Payment Status</label>
                  <select value={renewForm.payment_status} onChange={(e) => setRenewForm({ ...renewForm, payment_status: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm text-slate-400">Notes</label>
                  <textarea value={renewForm.notes} onChange={(e) => setRenewForm({ ...renewForm, notes: e.target.value })} rows="3" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3">
                  <button type="button" onClick={() => setActionModal(null)} className="rounded-2xl border border-white/10 px-4 py-2 text-slate-300">Cancel</button>
                  <button type="submit" className="rounded-2xl bg-orange-500 px-4 py-2 font-medium text-white">Save renewal</button>
                </div>
              </form>
            ) : actionModal.type === 'history' ? (
              <div className="mt-6 space-y-3">
                {historyRecords.length === 0 ? <p className="text-slate-400">No renewal history yet.</p> : historyRecords.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{item.renewal_type}</span>
                      <span>{item.renewed_at?.slice(0, 10)}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-400">Old: {item.old_expiry_date || '-'} → New: {item.new_expiry_date || '-'}</div>
                    <div className="mt-1 text-sm text-slate-400">Amount: {item.total_amount || item.renewal_amount || 0}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Project</p>
                  <p className="mt-1 font-medium text-white">{detailRecord?.project_name || '-'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Expiry Type</p>
                  <p className="mt-1 font-medium text-white">{detailRecord?.expiry_type || '-'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Provider / Plan</p>
                  <p className="mt-1 font-medium text-white">{detailRecord?.provider_name || detailRecord?.plan_name || '-'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Expiry Date</p>
                  <p className="mt-1 font-medium text-white">{detailRecord?.expiry_date || '-'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Payment Status</p>
                  <p className="mt-1 font-medium text-white">{detailRecord?.payment_status || '-'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <p className="text-sm text-slate-400">Renewal Status</p>
                  <p className="mt-1 font-medium text-white">{detailRecord?.renewal_status || '-'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 w-screen h-[100dvh]">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-orange-400">{modalMode === 'edit' ? 'Edit' : 'Add'} expiry</p>
                <h2 className="mt-2 text-2xl font-semibold">Expiry record</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full border border-white/10 p-2 text-slate-300"><XCircle size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-slate-400">Project</label>
                <select value={form.project_id} onChange={(e) => handleProjectSelect(e.target.value)} required className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
                  <option value="">Select project</option>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.project_name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-400 flex items-center gap-1.5">
                  Client
                  {form.client_name && <span className="text-xs text-orange-400 font-medium">(auto-filled)</span>}
                </label>
                <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
                  <option value="">Select client</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.client_name || client.company_name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-400">Expiry Type</label>
                <select value={form.expiry_type} onChange={(e) => setForm({ ...form, expiry_type: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
                  {expiryTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm text-slate-400">
                  Domain Name
                  {form.domain_name && <span className="text-xs text-orange-400 font-medium">(auto-filled)</span>}
                </label>
                <input value={form.domain_name} onChange={(e) => setForm({ ...form, domain_name: e.target.value })} placeholder="e.g. example.com" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 placeholder:text-white/25" />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm text-slate-400">
                  Project Type
                  {form.project_type && <span className="text-xs text-orange-400 font-medium">(auto-filled)</span>}
                </label>
                <input value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })} placeholder="e.g. Website, Mobile App, ERP" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 placeholder:text-white/25" />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm text-slate-400">
                  Service Name
                  {form.service_name && <span className="text-xs text-orange-400 font-medium">(auto-filled)</span>}
                </label>
                <input value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} placeholder="e.g. Website, App" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 placeholder:text-white/25" />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-1.5 text-sm text-slate-400">
                  Provider / Plan
                  {form.provider_name && <span className="text-xs text-orange-400 font-medium">(auto-filled)</span>}
                </label>
                <input value={form.provider_name} onChange={(e) => setForm({ ...form, provider_name: e.target.value })} placeholder="e.g. GoDaddy, AWS" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 placeholder:text-white/25" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-400">Plan Name</label>
                <input
                  value={form.plan_name}
                  onChange={(e) => setForm({ ...form, plan_name: e.target.value })}
                  placeholder="e.g. Business Pro, Starter"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 placeholder:text-white/25"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-400">Price / Month (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-medium">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price_per_month}
                    onChange={(e) => setForm({ ...form, price_per_month: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/70 pl-7 pr-3 py-2 text-white outline-none focus:border-orange-500/50 placeholder:text-white/25"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-400">Purchase Date</label>
                <input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-400">Start Date</label>
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-400">Expiry Date</label>
                <input type="date" required value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-400">Renewal Cost</label>
                <input type="number" value={form.renewal_cost} onChange={(e) => setForm({ ...form, renewal_cost: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-400">Payment Status</label>
                <select value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-400">Payment Method</label>
                <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
                  <option value="">Select method</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">Renewal Status</label>
                <select value={form.renewal_status} onChange={(e) => setForm({ ...form, renewal_status: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50 [&>option]:bg-[#111318]">
                  {renewalStatusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-400">Internal Notes</label>
                <textarea value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} rows="3" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-slate-400">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="3" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-white outline-none focus:border-orange-500/50" />
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <input type="checkbox" checked={form.auto_renew} onChange={(e) => setForm({ ...form, auto_renew: e.target.checked })} />
                <span className="text-sm text-slate-300">Auto renew enabled</span>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-2xl border border-white/10 px-4 py-2 text-slate-300">Cancel</button>
                <button type="submit" className="rounded-2xl bg-orange-500 px-4 py-2 font-medium text-white">Save</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
