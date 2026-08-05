import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
import { CalendarClock, Search, Plus, Eye, Edit, RefreshCcw, History, Send, Download, Printer, Trash2, Filter, ChevronLeft, ChevronRight, Sparkles, AlertTriangle, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import api from '../../api';

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'rgba(0,0,0,0.2)',
    border: `1px solid ${state.isFocused
        ? 'rgba(255,255,255,0.2)'
        : 'rgba(255,255,255,0.1)'
      }`,
    boxShadow: 'none',
    outline: 'none',
    minHeight: '42px',
    height: '42px',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',

    '&:hover': {
      border: '1px solid rgba(255,255,255,0.2)',
    },
  }),

  valueContainer: (provided) => ({
    ...provided,
    padding: '0 12px',
    fontSize: '13px',
  }),

  singleValue: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
  }),

  placeholder: (provided) => ({
    ...provided,
    color: 'rgba(255,255,255,.35)',
    fontSize: '13px',
  }),

  input: (provided) => ({
    ...provided,
    color: '#fff',
    fontSize: '13px',
    margin: 0,
    padding: 0,
  }),

  menu: (provided) => ({
    ...provided,
    background: '#1a1d24',
    border: '1px solid rgba(255,255,255,.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  }),

  menuList: (provided) => ({
    ...provided,
    padding: 0,
    fontSize: '13px',
  }),

  option: (provided, state) => ({
    ...provided,
    fontSize: '13px',      // dropdown font size
    padding: '8px 14px',   // reduce option height
    backgroundColor: state.isSelected
      ? '#f97316'
      : state.isFocused
        ? 'rgba(255,255,255,0.05)'
        : '#1a1d24',
    color: '#fff',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#f97316',
    },
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),

  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#888',
    padding: '6px',
  }),
};

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
  const [statusMessage, setStatusMessage] = useState('');
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
      price_per_month: record.price_per_month || '',
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
      const payload = {
        ...form,
        project_id: Number(form.project_id || 0),
        client_id: form.client_id ? Number(form.client_id) : null,
        renewal_cost: Number(form.renewal_cost || 0),
        price_per_month: Number(form.price_per_month || 0)
      };
      if (modalMode === 'edit') {
        await api.put(`/project-expiries/${selectedRecord.id}`, payload);
      } else {
        await api.post('/project-expiries', payload);
      }
      setShowModal(false);
      setStatusMessage(modalMode === 'edit' ? 'Record updated successfully!' : 'Record created successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
      loadData();
    } catch (error) {
      console.error(error);
      setStatusMessage('Failed to save record. Please try again.');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`/project-expiries/${id}`);
      setStatusMessage('Record deleted successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
      loadData();
    } catch (error) {
      console.error(error);
      setStatusMessage('Failed to delete record. Please try again.');
      setTimeout(() => setStatusMessage(''), 3000);
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
      setStatusMessage('Record renewed successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
      loadData();
    } catch (error) {
      console.error(error);
      setStatusMessage('Failed to renew record. Please try again.');
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleReminderSend = async (record) => {
    try {
      await api.post(`/project-expiries/${record.id}/reminders`, { reminder_type: 'Internal', reminder_days_before: 0 });
      setStatusMessage('Reminder sent successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
      loadData();
    } catch (error) {
      console.error(error);
      setStatusMessage('Failed to send reminder. Please try again.');
      setTimeout(() => setStatusMessage(''), 3000);
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
    <div className="space-y-5 pb-10 text-white min-h-screen">
      {statusMessage && (
        <div className={`fixed top-5 right-5 z-[150] flex items-center gap-3 border text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-300 ${statusMessage.toLowerCase().includes('success') ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/15 border-rose-500/30 text-rose-400'}`}>
          {statusMessage.toLowerCase().includes('success') ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} 
          {statusMessage}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <CalendarClock size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Project Expiry</h1>
            <p className="text-white/40 text-xs mt-0.5">Track hosting, domain, SSL, and other renewals.</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center justify-center gap-2 bg-linear-to-r from-[#f97316] to-[#ea580c] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95">
          <Plus size={16} /> Add Expiry
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="bg-white/5 border border-white/8 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group">
              <div className="flex items-center justify-between relative z-10">
                <p className="text-xs font-medium text-white/50">{card.label}</p>
                <Icon size={16} className="text-white/40 group-hover:text-white transition-colors" />
              </div>
              <p className="text-2xl font-bold text-white relative z-10">{card.value}</p>
              <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-linear-to-br ${card.tone} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} />
            </div>
          );
        })}
      </div>

      {/* ── Search & Filters ── */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search projects or clients..."
                className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <button onClick={() => { setFilters({ search: '', project_id: '', client_id: '', expiry_type: '', renewal_status: '', status: '', from_date: '', to_date: '', expiring_today: false, next_7_days: false, next_30_days: false, expired: false }); loadData(); }} className="h-[42px] px-4 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 hover:text-white transition-all flex items-center justify-center">
              Reset
            </button>
            <button onClick={loadData} className="h-[42px] px-4 rounded-xl border border-white/10 text-white/60 text-sm font-medium hover:bg-white/5 hover:text-white transition-all flex items-center justify-center">
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            value={filters.project_id ? { value: filters.project_id, label: projects.find(p => String(p.id) === String(filters.project_id))?.project_name || 'All projects' } : null}
            onChange={(option) => setFilters({ ...filters, project_id: option ? option.value : '' })}
            options={[{ value: '', label: 'All projects' }, ...projects.map(p => ({ value: p.id, label: p.project_name }))]}
            styles={customSelectStyles}
            placeholder="All projects"
            isSearchable={false}
          />
          <Select
            value={filters.client_id ? { value: filters.client_id, label: clients.find(c => String(c.id) === String(filters.client_id))?.client_name || clients.find(c => String(c.id) === String(filters.client_id))?.company_name || 'All clients' } : null}
            onChange={(option) => setFilters({ ...filters, client_id: option ? option.value : '' })}
            options={[{ value: '', label: 'All clients' }, ...clients.map(c => ({ value: c.id, label: c.client_name || c.company_name }))]}
            styles={customSelectStyles}
            placeholder="All clients"
            isSearchable={false}
          />
          <Select
            value={filters.expiry_type ? { value: filters.expiry_type, label: filters.expiry_type } : null}
            onChange={(option) => setFilters({ ...filters, expiry_type: option ? option.value : '' })}
            options={[{ value: '', label: 'All expiry types' }, ...expiryTypeOptions.map(o => ({ value: o, label: o }))]}
            styles={customSelectStyles}
            placeholder="All expiry types"
            isSearchable={false}
          />
          <Select
            value={filters.renewal_status ? { value: filters.renewal_status, label: filters.renewal_status } : null}
            onChange={(option) => setFilters({ ...filters, renewal_status: option ? option.value : '' })}
            options={[{ value: '', label: 'All renewal status' }, ...renewalStatusOptions.map(o => ({ value: o, label: o }))]}
            styles={customSelectStyles}
            placeholder="All renewal status"
            isSearchable={false}
          />
          <input type="date" value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value })} className="h-[42px] bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-primary/50 transition-colors w-full [color-scheme:dark] placeholder:text-white/35" />
          <input type="date" value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value })} className="h-[42px] bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-primary/50 transition-colors w-full [color-scheme:dark] placeholder:text-white/35" />
          <Select
            value={filters.status ? { value: filters.status, label: filters.status } : null}
            onChange={(option) => setFilters({ ...filters, status: option ? option.value : '' })}
            options={[{ value: '', label: 'All status' }, ...statusOptions.map(o => ({ value: o, label: o }))]}
            styles={customSelectStyles}
            placeholder="All status"
            isSearchable={false}
          />
          <div className="flex flex-wrap gap-2">
            {[
              ['expiring_today', 'Today'],
              ['next_7_days', '7D'],
              ['next_30_days', '30D'],
              ['expired', 'Expired'],
            ].map(([key, label]) => (
              <button key={key} onClick={() => setFilters({ ...filters, [key]: !filters[key] })} className={`h-[42px] px-4 rounded-xl text-xs font-medium transition-colors ${filters[key] ? 'bg-primary text-white border border-primary' : 'bg-black/20 border border-white/10 text-white/60 hover:bg-white/5 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table View ── */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="uppercase tracking-widest text-[10px] font-semibold text-white/40 pb-4 px-4 border-b border-white/8">#</th>
                <th className="uppercase tracking-widest text-[10px] font-semibold text-white/40 pb-4 px-4 border-b border-white/8">Project / Client</th>
                <th className="uppercase tracking-widest text-[10px] font-semibold text-white/40 pb-4 px-4 border-b border-white/8">Service Name</th>
                <th className="uppercase tracking-widest text-[10px] font-semibold text-white/40 pb-4 px-4 border-b border-white/8">Expiry Type</th>
                <th className="uppercase tracking-widest text-[10px] font-semibold text-white/40 pb-4 px-4 border-b border-white/8">Provider / Plan</th>
                <th className="uppercase tracking-widest text-[10px] font-semibold text-white/40 pb-4 px-4 border-b border-white/8">Dates</th>
                <th className="uppercase tracking-widest text-[10px] font-semibold text-white/40 pb-4 px-4 border-b border-white/8">Days Left</th>
                <th className="uppercase tracking-widest text-[10px] font-semibold text-white/40 pb-4 px-4 border-b border-white/8">Cost & Payment</th>
                <th className="uppercase tracking-widest text-[10px] font-semibold text-white/40 pb-4 px-4 border-b border-white/8 text-center">Auto</th>
                <th className="uppercase tracking-widest text-[10px] font-semibold text-white/40 pb-4 px-4 border-b border-white/8">Status</th>
                <th className="uppercase tracking-widest text-[10px] font-semibold text-white/40 pb-4 px-4 border-b border-white/8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-white/40">
                      <RefreshCcw size={32} className="animate-spin mb-4 opacity-20" />
                      <p className="text-sm font-medium">Loading expiry records...</p>
                    </div>
                  </td>
                </tr>
              ) : visibleRecords.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-white/40">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <CalendarClock size={24} />
                      </div>
                      <p className="text-sm font-medium text-white/60">No expiry records found</p>
                      <p className="text-xs mt-1 text-white/40">Try adjusting your filters or search query.</p>
                    </div>
                  </td>
                </tr>
              ) : visibleRecords.map((record, idx) => {
                const badge = getDaysBadge(record.days_remaining);
                return (
                  <tr key={record.id} className="group border-b border-white/4 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 text-xs text-white/40 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3.5 min-w-[160px]">
                      <div className="font-medium text-white/90 text-sm truncate max-w-[150px]">{record.project_name || `Project #${record.project_id}`}</div>
                      <div className="text-xs text-white/40 mt-0.5 truncate max-w-[150px]">{record.client_name || '—'}</div>
                      {record.domain_name && <div className="text-[11px] text-primary/70 mt-0.5 font-medium truncate max-w-[150px]">{record.domain_name}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-white/70 text-sm whitespace-nowrap">{record.service_name || '—'}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-[11px] font-medium text-blue-400">{record.expiry_type || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 min-w-[140px]">
                      <div className="text-white/70 text-sm font-medium">{record.provider_name || '—'}</div>
                      {record.plan_name && <div className="text-xs text-white/40 mt-0.5">{record.plan_name}</div>}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                      <div className="text-white/60 mb-0.5"><span className="text-white/30 mr-1">Start:</span>{record.start_date ? new Date(record.start_date).toLocaleDateString('en-IN') : '—'}</div>
                      <div className="text-white/90 font-medium"><span className="text-white/30 mr-1">Exp:</span>{record.expiry_date ? new Date(record.expiry_date).toLocaleDateString('en-IN') : '—'}</div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${badge.className}`}>{badge.label}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {record.renewal_cost ? (
                        <div className="text-emerald-400/90 text-sm font-semibold">₹{Number(record.renewal_cost).toLocaleString('en-IN')}</div>
                      ) : <div className="text-white/40 text-sm">—</div>}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          record.payment_status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          record.payment_status === 'Failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>{record.payment_status || 'Pending'}</span>
                        {record.payment_method && <span className="text-[10px] text-white/30">{record.payment_method}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      {record.auto_renew ? (
                        <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400" title="Auto renew enabled">
                          <CheckCircle2 size={12} />
                        </div>
                      ) : (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getBadgeClass(record.renewal_status)}`}>{record.renewal_status || 'Active'}</span>
                        {record.status !== 'Active' && <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-white/5 text-white/40 border border-white/10">{record.status}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openAction(record, 'view')} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-500/20 flex items-center justify-center text-white/60 hover:text-blue-400 transition" title="View"><Eye size={14} /></button>
                        <button onClick={() => openEdit(record)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-orange-500/20 flex items-center justify-center text-white/60 hover:text-orange-400 transition" title="Edit"><Edit size={14} /></button>
                        <button onClick={() => openAction(record, 'renew')} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 flex items-center justify-center text-white/60 hover:text-emerald-400 transition" title="Renew"><RefreshCcw size={14} /></button>
                        <button onClick={() => openAction(record, 'history')} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-purple-500/20 flex items-center justify-center text-white/60 hover:text-purple-400 transition" title="History"><History size={14} /></button>
                        <button onClick={() => handleReminderSend(record)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-sky-500/20 flex items-center justify-center text-white/60 hover:text-sky-400 transition" title="Send Reminder"><Send size={14} /></button>
                        <button onClick={() => handleDelete(record.id)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 flex items-center justify-center text-white/60 hover:text-rose-400 transition" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ── */}
      {actionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111318]/90 backdrop-blur-sm p-4 w-screen h-[100dvh]">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#161922] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-primary uppercase mb-1">{actionModal.type === 'renew' ? 'Renew record' : actionModal.type === 'history' ? 'Renewal history' : 'Expiry details'}</p>
                <h2 className="text-xl font-bold text-white">{actionModal.record?.service_name || actionModal.record?.expiry_type}</h2>
              </div>
              <button onClick={() => setActionModal(null)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <XCircle size={16} />
              </button>
            </div>
            {actionModal.type === 'renew' ? (
              <form onSubmit={handleRenewSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">Renewal Type</label>
                  <Select
                    value={renewForm.renewal_type ? { value: renewForm.renewal_type, label: renewForm.renewal_type } : null}
                    onChange={(option) => setRenewForm({ ...renewForm, renewal_type: option ? option.value : '' })}
                    options={expiryTypeOptions.map((option) => ({ value: option, label: option }))}
                    styles={customSelectStyles}
                    isSearchable={false}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">New Expiry Date</label>
                  <input type="date" value={renewForm.new_expiry_date} onChange={(e) => setRenewForm({ ...renewForm, new_expiry_date: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors [color-scheme:dark]" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">Renewal Amount (₹)</label>
                  <input type="number" value={renewForm.renewal_amount} onChange={(e) => setRenewForm({ ...renewForm, renewal_amount: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">Tax (₹)</label>
                  <input type="number" value={renewForm.tax_amount} onChange={(e) => setRenewForm({ ...renewForm, tax_amount: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">Total (₹)</label>
                  <input type="number" value={renewForm.total_amount} onChange={(e) => setRenewForm({ ...renewForm, total_amount: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">Payment Method</label>
                  <Select
                    value={renewForm.payment_method ? { value: renewForm.payment_method, label: renewForm.payment_method } : null}
                    onChange={(option) => setRenewForm({ ...renewForm, payment_method: option ? option.value : '' })}
                    options={[
                      { value: 'UPI', label: 'UPI' },
                      { value: 'Cash', label: 'Cash' },
                      { value: 'Card', label: 'Card' },
                      { value: 'Net Banking', label: 'Net Banking' },
                      { value: 'Cheque', label: 'Cheque' },
                      { value: 'Others', label: 'Others' }
                    ]}
                    styles={customSelectStyles}
                    placeholder="Select method"
                    isSearchable={false}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-white/60">Payment Status</label>
                  <Select
                    value={renewForm.payment_status ? { value: renewForm.payment_status, label: renewForm.payment_status } : null}
                    onChange={(option) => setRenewForm({ ...renewForm, payment_status: option ? option.value : '' })}
                    options={[
                      { value: 'Pending', label: 'Pending' },
                      { value: 'Paid', label: 'Paid' },
                      { value: 'Failed', label: 'Failed' }
                    ]}
                    styles={customSelectStyles}
                    isSearchable={false}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs font-medium text-white/60">Notes</label>
                  <textarea value={renewForm.notes} onChange={(e) => setRenewForm({ ...renewForm, notes: e.target.value })} rows="3" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-white/10 mt-2">
                  <button type="button" onClick={() => setActionModal(null)} className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
                  <button type="submit" className="bg-linear-to-r from-[#f97316] to-[#ea580c] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-primary/25">Save renewal</button>
                </div>
              </form>
            ) : actionModal.type === 'history' ? (
              <div className="mt-6 space-y-3">
                {historyRecords.length === 0 ? <p className="text-white/40 text-sm text-center py-6 border border-dashed border-white/10 rounded-2xl">No renewal history yet.</p> : historyRecords.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between text-sm text-white/80 font-medium mb-3">
                      <span>{item.renewal_type}</span>
                      <span className="text-white/40 text-xs">{item.renewed_at?.slice(0, 10)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/60 mb-2">
                      <div className="flex-1 bg-black/20 rounded-lg p-2 border border-white/5">
                        <p className="text-white/40 mb-1">Old Expiry</p>
                        <p className="font-medium text-white/80">{item.old_expiry_date || '-'}</p>
                      </div>
                      <AlertTriangle size={14} className="text-white/20" />
                      <div className="flex-1 bg-black/20 rounded-lg p-2 border border-white/5">
                        <p className="text-white/40 mb-1">New Expiry</p>
                        <p className="font-medium text-emerald-400">{item.new_expiry_date || '-'}</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-white/70 border-t border-white/10 pt-2 mt-1">
                      Paid: <span className="text-emerald-400">₹{item.total_amount || item.renewal_amount || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/40 font-medium mb-1">Project</p>
                  <p className="text-sm font-medium text-white/90">{detailRecord?.project_name || '-'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/40 font-medium mb-1">Expiry Type</p>
                  <p className="text-sm font-medium text-white/90">{detailRecord?.expiry_type || '-'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/40 font-medium mb-1">Provider / Plan</p>
                  <p className="text-sm font-medium text-white/90">{detailRecord?.provider_name || detailRecord?.plan_name || '-'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/40 font-medium mb-1">Expiry Date</p>
                  <p className="text-sm font-medium text-white/90">{detailRecord?.expiry_date || '-'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/40 font-medium mb-1">Payment Status</p>
                  <p className="text-sm font-medium text-white/90">{detailRecord?.payment_status || '-'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/40 font-medium mb-1">Renewal Status</p>
                  <p className="text-sm font-medium text-white/90">{detailRecord?.renewal_status || '-'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#111318]/90 backdrop-blur-sm p-4 w-screen h-[100dvh]">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-white/10 bg-[#161922] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-primary uppercase mb-1">{modalMode === 'edit' ? 'Edit Expiry' : 'Add New Expiry'}</p>
                <h2 className="text-xl font-bold text-white">Expiry Record Details</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <XCircle size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">Project</label>
                <Select
                  value={form.project_id ? { value: form.project_id, label: projects.find(p => String(p.id) === String(form.project_id))?.project_name || 'Select project' } : null}
                  onChange={(option) => handleProjectSelect(option ? option.value : '')}
                  options={projects.map(p => ({ value: p.id, label: p.project_name }))}
                  styles={customSelectStyles}
                  placeholder="Select project"
                  isSearchable={true}
                />
              </div>
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-medium text-white/60">
                  Client
                  {form.client_name && <span className="text-[10px] text-primary/80 bg-primary/10 px-1.5 rounded-sm">auto-filled</span>}
                </label>
                <Select
                  value={form.client_id ? { value: form.client_id, label: clients.find(c => String(c.id) === String(form.client_id))?.client_name || clients.find(c => String(c.id) === String(form.client_id))?.company_name || 'Select client' } : null}
                  onChange={(option) => setForm({ ...form, client_id: option ? option.value : '' })}
                  options={clients.map(c => ({ value: c.id, label: c.client_name || c.company_name }))}
                  styles={customSelectStyles}
                  placeholder="Select client"
                  isSearchable={true}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">Expiry Type</label>
                <Select
                  value={form.expiry_type ? { value: form.expiry_type, label: form.expiry_type } : null}
                  onChange={(option) => setForm({ ...form, expiry_type: option ? option.value : '' })}
                  options={expiryTypeOptions.map(o => ({ value: o, label: o }))}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-medium text-white/60">
                  Domain Name
                  {form.domain_name && <span className="text-[10px] text-primary/80 bg-primary/10 px-1.5 rounded-sm">auto-filled</span>}
                </label>
                <input value={form.domain_name} onChange={(e) => setForm({ ...form, domain_name: e.target.value })} placeholder="e.g. example.com" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20" />
              </div>
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-medium text-white/60">
                  Project Type
                  {form.project_type && <span className="text-[10px] text-primary/80 bg-primary/10 px-1.5 rounded-sm">auto-filled</span>}
                </label>
                <input value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })} placeholder="e.g. Website, Mobile App" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20" />
              </div>
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-medium text-white/60">
                  Service Name
                  {form.service_name && <span className="text-[10px] text-primary/80 bg-primary/10 px-1.5 rounded-sm">auto-filled</span>}
                </label>
                <input value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} placeholder="e.g. Website Hosting" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20" />
              </div>
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-medium text-white/60">
                  Provider / Plan
                  {form.provider_name && <span className="text-[10px] text-primary/80 bg-primary/10 px-1.5 rounded-sm">auto-filled</span>}
                </label>
                <input value={form.provider_name} onChange={(e) => setForm({ ...form, provider_name: e.target.value })} placeholder="e.g. GoDaddy, AWS" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">Plan Name</label>
                <input value={form.plan_name} onChange={(e) => setForm({ ...form, plan_name: e.target.value })} placeholder="e.g. Business Pro" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">Price / Month (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">₹</span>
                  <input type="number" min="0" step="0.01" value={form.price_per_month} onChange={(e) => setForm({ ...form, price_per_month: e.target.value })} placeholder="0.00" className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">Renewal Cost (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-medium">₹</span>
                  <input type="number" min="0" step="0.01" value={form.renewal_cost} onChange={(e) => setForm({ ...form, renewal_cost: e.target.value })} placeholder="0.00" className="w-full bg-black/20 border border-white/10 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/20" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">Purchase Date</label>
                <input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors [color-scheme:dark]" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">Start Date</label>
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors [color-scheme:dark]" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">Expiry Date</label>
                <input type="date" required value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors [color-scheme:dark]" />
              </div>
              
              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">Payment Method</label>
                <Select
                  value={form.payment_method ? { value: form.payment_method, label: form.payment_method } : null}
                  onChange={(option) => setForm({ ...form, payment_method: option ? option.value : '' })}
                  options={[
                    { value: 'UPI', label: 'UPI' },
                    { value: 'Cash', label: 'Cash' },
                    { value: 'Card', label: 'Card' },
                    { value: 'Net Banking', label: 'Net Banking' },
                    { value: 'Cheque', label: 'Cheque' },
                    { value: 'Others', label: 'Others' }
                  ]}
                  styles={customSelectStyles}
                  placeholder="Select method"
                  isSearchable={false}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">Payment Status</label>
                <Select
                  value={form.payment_status ? { value: form.payment_status, label: form.payment_status } : null}
                  onChange={(option) => setForm({ ...form, payment_status: option ? option.value : '' })}
                  options={[
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Paid', label: 'Paid' },
                    { value: 'Failed', label: 'Failed' }
                  ]}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-white/60">Renewal Status</label>
                <Select
                  value={form.renewal_status ? { value: form.renewal_status, label: form.renewal_status } : null}
                  onChange={(option) => setForm({ ...form, renewal_status: option ? option.value : '' })}
                  options={renewalStatusOptions.map(o => ({ value: o, label: o }))}
                  styles={customSelectStyles}
                  isSearchable={false}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-medium text-white/60">Internal Notes</label>
                <textarea value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} rows="2" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-medium text-white/60">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows="2" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors" />
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <label className="relative flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.auto_renew} onChange={(e) => setForm({ ...form, auto_renew: e.target.checked })} className="sr-only peer" />
                  <div className="w-9 h-5 bg-black/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary border border-white/10"></div>
                  <span className="ml-3 text-sm font-medium text-white/80">Auto renew enabled</span>
                </label>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-white/10 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" className="bg-linear-to-r from-[#f97316] to-[#ea580c] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:shadow-lg hover:shadow-primary/25">Save Expiry</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
