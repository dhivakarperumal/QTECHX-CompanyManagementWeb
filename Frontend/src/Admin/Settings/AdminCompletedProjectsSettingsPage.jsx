import React, { useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FolderKanban,
  LayoutGrid,
  List,
  Plus,
  Search,
  Trash2,
  X,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  AlertCircle,
  Loader2,
  ExternalLink,
  Edit2,
  Upload,
  Globe,
  Tag,
  Building2,
  User,
  Calendar,
  FileText,
  Layers,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import api, { API_URL } from '../../api';
import toast from 'react-hot-toast';
import { useAuth } from '../../PrivateRouter/AuthContext';

const BACKEND_BASE_URL = API_URL.replace(/\/api$/, '');

function buildUploadUrl(filePath) {
  if (!filePath) return null;
  const normalized = `${filePath}`.replace(/\\/g, '/');
  if (/^https?:\/\//i.test(normalized)) return normalized;
  if (normalized.startsWith('/uploads/')) return `${BACKEND_BASE_URL}${normalized}`;
  if (normalized.startsWith('uploads/')) return `${BACKEND_BASE_URL}/${normalized}`;
  return `${BACKEND_BASE_URL}/uploads/${normalized}`;
}

const CATEGORY_OPTIONS = [
  'Web Development',
  'Mobile App Development',
  'UI/UX Design',
  'E-commerce Solutions',
  'Custom Software',
  'Cloud & DevOps',
  'AI & Automation',
  'ERP & CRM Solutions',
  'Digital Marketing & SEO',
  'Cybersecurity',
];

const emptyProject = {
  id: null,
  uuid: '',
  project_name: '',
  category: 'Web Development',
  image: '',
  description: '',
  url: '',
  client_id: '',
  client_name: '',
  client_details: {},
  status: 'Completed',
  technologies: [],
  completion_date: '',
};

const fmtDate = (dateString) => {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="rounded-2xl border border-white/10 bg-[#12141c]/90 p-5 sm:p-6 space-y-4">
    <div className="flex items-center gap-3 pb-3 border-b border-white/10">
      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-emerald-400" />
      </div>
      <h2 className="text-sm font-bold text-white tracking-wide">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

export default function AdminCompletedProjectsSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ ...emptyProject });
  const [techInput, setTechInput] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Client Search in Dropdown
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef(null);

  // Listing state
  const [viewMode, setViewMode] = useState('table');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/completedprojects');
      setProjects(res.data?.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load completed projects:', err);
      setError(err.response?.data?.message || 'Unable to load completed projects');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Clients from /api/clients
  const fetchClients = async () => {
    setClientsLoading(true);
    try {
      const res = await api.get('/clients?limit=500&page=1');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setClients(res.data.data);
      } else if (res.data?.success && res.data.data?.rows) {
        setClients(res.data.data.rows);
      } else {
        setClients([]);
      }
    } catch (err) {
      console.warn('Failed to load clients list:', err);
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  // Close client dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target)) {
        setIsClientDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesSearch =
        !term ||
        [p.project_name, p.category, p.client_name, p.description, p.url, p.client_id ? `#${p.client_id}` : '']
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term);

      const matchesCategory = !categoryFilter || p.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [projects, search, categoryFilter]);

  const total = projects.length;
  const webProjectsCount = projects.filter((p) => (p.category || '').toLowerCase().includes('web')).length;
  const appProjectsCount = projects.filter((p) => (p.category || '').toLowerCase().includes('app') || (p.category || '').toLowerCase().includes('mobile')).length;
  const otherProjectsCount = total - webProjectsCount - appProjectsCount;

  // Filtered clients for dropdown
  const filteredClients = useMemo(() => {
    const q = clientSearchQuery.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => {
      return (
        String(c.id).includes(q) ||
        (c.client_name || '').toLowerCase().includes(q) ||
        (c.company_name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
      );
    });
  }, [clients, clientSearchQuery]);

  // Open Form for Adding
  const openAddForm = () => {
    setEditingId(null);
    setDraft({
      ...emptyProject,
      status: 'Completed',
      created_by: user?.id || user?.uuid || '',
    });
    setTechInput('');
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setClientSearchQuery('');
    setShowForm(true);
  };

  // Open Form for Editing
  const openEditForm = (project) => {
    setEditingId(project.id || project.uuid);
    setDraft({
      ...emptyProject,
      ...project,
      client_id: project.client_id ? String(project.client_id) : '',
      status: project.status || 'Completed',
      technologies: Array.isArray(project.technologies) ? project.technologies : [],
      completion_date: project.completion_date ? project.completion_date.slice(0, 10) : '',
    });
    setTechInput(Array.isArray(project.technologies) ? project.technologies.join(', ') : '');
    setSelectedImageFile(null);
    setImagePreviewUrl(project.image ? buildUploadUrl(project.image) : '');
    setClientSearchQuery('');
    setShowForm(true);
  };

  // Handle Client Selection
  const handleSelectClient = (client) => {
    if (!client) {
      setDraft((prev) => ({
        ...prev,
        client_id: '',
        client_name: '',
        client_details: {},
      }));
    } else {
      setDraft((prev) => ({
        ...prev,
        client_id: String(client.id),
        client_name: client.client_name || '',
        client_details: {
          client_name: client.client_name,
          company_name: client.company_name,
          email: client.email,
          phone_number: client.phone_number,
          contact_person: client.contact_person,
        },
      }));
    }
    setIsClientDropdownOpen(false);
  };

  // Handle Image File Selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreviewUrl(objectUrl);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setDraft((prev) => ({ ...prev, image: '' }));
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = draft.project_name.trim();
    if (!name) {
      return toast.error('Please enter the project name');
    }

    setSubmitting(true);
    try {
      // Process technologies list
      let technologiesList = [];
      if (techInput.trim()) {
        technologiesList = techInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (Array.isArray(draft.technologies)) {
        technologiesList = draft.technologies;
      }

      const formData = new FormData();
      formData.append('project_name', name);
      formData.append('category', draft.category || 'Web Development');
      formData.append('description', draft.description || '');
      formData.append('url', draft.url || '');
      formData.append('status', 'Completed'); // Always default Completed
      formData.append('technologies', JSON.stringify(technologiesList));
      if (draft.completion_date) {
        formData.append('completion_date', draft.completion_date);
      }

      if (draft.client_id) {
        formData.append('client_id', draft.client_id);
        formData.append('client_name', draft.client_name || '');
        if (draft.client_details) {
          formData.append('client_details', JSON.stringify(draft.client_details));
        }
      }

      if (selectedImageFile) {
        formData.append('image', selectedImageFile);
      } else if (draft.image) {
        formData.append('image', draft.image);
      }

      if (editingId) {
        await api.put(`/completedprojects/${editingId}`, formData);
        toast.success('Completed project updated successfully');
      } else {
        await api.post('/completedprojects', formData);
        toast.success('Completed project added successfully');
      }

      setShowForm(false);
      fetchProjects();
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.response?.data?.message || 'Failed to save completed project');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/completedprojects/${deleteTarget.id || deleteTarget.uuid}`);
      toast.success(`"${deleteTarget.project_name}" deleted successfully`);
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-white min-h-screen">
      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget &&
        createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#12141c] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Delete Completed Project?</h3>
              <p className="text-sm text-white/60 mb-6">
                Are you sure you want to delete <span className="text-white font-semibold">"{deleteTarget.project_name}"</span>? This will remove it from the completed projects showcase.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/15 text-sm font-semibold text-rose-400 hover:bg-rose-500/25 transition flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate('/admin/settings')}
            className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition shadow-inner"
            title="Back to Settings"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
            <FolderKanban size={22} className="text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">Completed Projects</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Completed Default
              </span>
            </div>
            <p className="text-white/40 text-xs mt-0.5">
              {loading ? 'Loading…' : `${total} project${total !== 1 ? 's' : ''} showcase catalog`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProjects}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-emerald-400' : ''} />
          </button>

          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-emerald-500/20 hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <Plus size={16} /> Add Completed Project
          </button>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 flex items-center gap-3.5 hover:bg-white/[0.05] transition">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{total}</p>
            <p className="text-[11px] text-white/40 font-medium">Total Completed</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 flex items-center gap-3.5 hover:bg-white/[0.05] transition">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
            <Globe size={18} />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{webProjectsCount}</p>
            <p className="text-[11px] text-white/40 font-medium">Web Projects</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 flex items-center gap-3.5 hover:bg-white/[0.05] transition">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-400 shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{appProjectsCount}</p>
            <p className="text-[11px] text-white/40 font-medium">Mobile / Apps</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 flex items-center gap-3.5 hover:bg-white/[0.05] transition">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{otherProjectsCount}</p>
            <p className="text-[11px] text-white/40 font-medium">Other Portfolios</p>
          </div>
        </div>
      </div>

      {/* ── Search & Controls Bar ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name, category, client (#ID or name)..."
            className="w-full rounded-xl border border-white/10 bg-[#0f1118] pl-10 pr-9 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition ${
              showFilters || categoryFilter
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal size={13} />
            Category Filter
            {categoryFilter && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
            <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
                viewMode === 'table' ? 'bg-emerald-500 text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
              title="Table View"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
                viewMode === 'card' ? 'bg-emerald-500 text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
              title="Grid/Card View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Category Filter Pills Panel ── */}
      {showFilters && (
        <div className="bg-[#12141c]/90 border border-white/8 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Select Category</p>
            {categoryFilter && (
              <button
                onClick={() => setCategoryFilter('')}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <X size={12} /> Clear Filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setCategoryFilter('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                !categoryFilter
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(categoryFilter === cat ? '' : cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                  categoryFilter === cat
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Error & Loading States ── */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
          <button onClick={fetchProjects} className="ml-auto text-xs underline underline-offset-2 hover:opacity-80">
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin text-emerald-400" />
            <p className="text-sm text-white/40">Loading completed projects…</p>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/40 rounded-3xl border border-white/5 bg-[#12141c]/50">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 text-white/20">
            <FolderKanban size={32} />
          </div>
          <h3 className="text-base font-bold text-white/70">No completed projects found</h3>
          <p className="text-xs text-white/40 mt-1 max-w-sm text-center">
            {search || categoryFilter
              ? 'Try changing or clearing your search keywords and filters.'
              : 'Add your first completed project to build your showcase portfolio.'}
          </p>
          {!search && !categoryFilter && (
            <button
              onClick={openAddForm}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <Plus size={15} /> Add First Project
            </button>
          )}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {!loading && !error && filteredProjects.length > 0 && viewMode === 'table' && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#12141c]/80 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-white/40 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Client Details (/admin/clients)</th>
                  <th className="py-3.5 px-4">Live URL</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Added Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProjects.map((p) => {
                  const imageUrl = p.image ? buildUploadUrl(p.image) : null;
                  return (
                    <tr key={p.id || p.uuid} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Project Name + Image */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={p.project_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement.innerHTML = '<span class="text-white/20 text-[10px] font-bold">PROJ</span>';
                                }}
                              />
                            ) : (
                              <FolderKanban size={20} className="text-white/30" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-semibold text-white text-sm truncate">{p.project_name}</p>
                            {p.description && (
                              <p className="text-white/40 text-xs truncate max-w-xs">{p.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/80">
                          {p.category || 'General'}
                        </span>
                      </td>

                      {/* Client Details with ID & Name */}
                      <td className="py-3.5 px-4">
                        {p.client_id || p.client_name ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              {p.client_id && (
                                <span className="px-1.5 py-0.5 rounded bg-blue-500/15 border border-blue-500/30 text-blue-300 font-mono text-[10px] font-bold">
                                  ID: #{p.client_id}
                                </span>
                              )}
                              <span className="font-medium text-white truncate max-w-[180px]">
                                {p.client_name || 'Client #' + p.client_id}
                              </span>
                            </div>
                            {p.client_details?.company_name && (
                              <span className="text-[11px] text-white/40 truncate max-w-[200px]">
                                {p.client_details.company_name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/30 italic">No client linked</span>
                        )}
                      </td>

                      {/* URL */}
                      <td className="py-3.5 px-4">
                        {p.url ? (
                          <a
                            href={p.url.startsWith('http') ? p.url : `https://${p.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:underline max-w-[180px] truncate"
                          >
                            <ExternalLink size={13} className="shrink-0" />
                            <span className="truncate">{p.url.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {p.status || 'Completed'}
                        </span>
                      </td>

                      {/* Added Date */}
                      <td className="py-3.5 px-4 text-white/50">{fmtDate(p.created_at || p.completion_date)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {p.url && (
                            <a
                              href={p.url.startsWith('http') ? p.url : `https://${p.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-emerald-400 hover:bg-white/10 transition"
                              title="Visit live site"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditForm(p)}
                            className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CARD/GRID VIEW ── */}
      {!loading && !error && filteredProjects.length > 0 && viewMode === 'card' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredProjects.map((p) => {
            const imageUrl = p.image ? buildUploadUrl(p.image) : null;
            return (
              <div
                key={p.id || p.uuid}
                className="rounded-3xl border border-white/10 bg-[#12141c]/80 overflow-hidden shadow-2xl flex flex-col hover:border-emerald-500/30 transition group"
              >
                {/* Image top banner */}
                <div className="h-44 w-full bg-black/40 relative overflow-hidden border-b border-white/5">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={p.project_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#181a24] to-[#0e1017] text-white/20">
                      <FolderKanban size={40} />
                      <span className="text-xs mt-2 font-medium">No Preview Image</span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md border border-white/15 text-white">
                      {p.category || 'General'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-lg shadow-black/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {p.status || 'Completed'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
                      {p.project_name}
                    </h3>
                    <p className="text-xs text-white/50 line-clamp-2">
                      {p.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Client Info */}
                  <div className="pt-3 border-t border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Client:</span>
                      {p.client_name || p.client_id ? (
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          {p.client_id && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                              #{p.client_id}
                            </span>
                          )}
                          {p.client_name}
                        </span>
                      ) : (
                        <span className="text-white/30 italic">Unassigned</span>
                      )}
                    </div>

                    {p.url && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">Live URL:</span>
                        <a
                          href={p.url.startsWith('http') ? p.url : `https://${p.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 hover:underline flex items-center gap-1 truncate max-w-[200px]"
                        >
                          <ExternalLink size={12} />
                          <span className="truncate">{p.url.replace(/^https?:\/\//, '')}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    {p.url && (
                      <a
                        href={p.url.startsWith('http') ? p.url : `https://${p.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-500/25 transition"
                      >
                        <ExternalLink size={13} /> View Live
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => openEditForm(p)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(p)}
                      className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADD / EDIT FORM MODAL ── */}
      {showForm &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-2xl max-h-[92vh] rounded-3xl border border-white/10 bg-[#0f1118] p-6 sm:p-8 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <FolderKanban size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {editingId ? 'Edit Completed Project' : 'Add Completed Project'}
                    </h2>
                    <p className="text-xs text-white/40">
                      Fill in project details and link client details from /admin/clients
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body / Scrollable Form */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
                {/* 1. Basic Info Section */}
                <SectionCard icon={FileText} title="Project Overview">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/70">
                        Project Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={draft.project_name}
                        onChange={(e) => setDraft((p) => ({ ...p, project_name: e.target.value }))}
                        placeholder="e.g. Modern E-Commerce Platform"
                        className="w-full rounded-xl border border-white/10 bg-[#161822] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Category */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-white/70">Category</label>
                        <select
                          value={draft.category}
                          onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                          className="w-full rounded-xl border border-white/10 bg-[#161822] px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                        >
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat} value={cat} className="bg-[#161822] text-white">
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Project Status (Default Completed) */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-white/70">
                          Project Status <span className="text-emerald-400 text-[10px]">(Default)</span>
                        </label>
                        <div className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Completed
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-emerald-400/80 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                            Fixed
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* URL */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/70">
                        Live Project URL / Website
                      </label>
                      <div className="relative">
                        <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <input
                          type="url"
                          value={draft.url}
                          onChange={(e) => setDraft((p) => ({ ...p, url: e.target.value }))}
                          placeholder="https://example.com"
                          className="w-full rounded-xl border border-white/10 bg-[#161822] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/70">Project Description</label>
                      <textarea
                        rows={3}
                        value={draft.description}
                        onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                        placeholder="Provide an overview of the completed project, achievements, and features..."
                        className="w-full rounded-xl border border-white/10 bg-[#161822] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                      />
                    </div>
                  </div>
                </SectionCard>

                {/* 2. Client Details Dropdown (Integrated with /admin/clients) */}
                <SectionCard icon={Building2} title="Client Details (From /admin/clients)">
                  <div className="space-y-3" ref={clientDropdownRef}>
                    <label className="block text-xs font-semibold text-white/70">
                      Select Client <span className="text-white/40 text-[11px]">(Shows Client ID & Name)</span>
                    </label>

                    {/* Dropdown Input / Trigger */}
                    <div className="relative">
                      <div
                        onClick={() => setIsClientDropdownOpen((prev) => !prev)}
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition ${
                          isClientDropdownOpen
                            ? 'border-emerald-500/60 bg-[#161822] ring-1 ring-emerald-500/30'
                            : 'border-white/10 bg-[#161822] hover:border-white/20'
                        }`}
                      >
                        {draft.client_id ? (
                          <div className="flex items-center gap-2 truncate">
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono text-xs font-bold">
                              ID: #{draft.client_id}
                            </span>
                            <span className="font-semibold text-white truncate">{draft.client_name}</span>
                            {draft.client_details?.company_name && (
                              <span className="text-white/40 text-xs truncate">
                                ({draft.client_details.company_name})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-white/40">-- Select Client with ID & Name --</span>
                        )}
                        <div className="flex items-center gap-1.5 text-white/40">
                          {draft.client_id && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectClient(null);
                              }}
                              className="hover:text-rose-400 p-1"
                              title="Clear client selection"
                            >
                              <X size={14} />
                            </button>
                          )}
                          <ChevronDown size={16} className={`transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {/* Dropdown Menu Panel */}
                      {isClientDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-white/15 bg-[#12141c] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                          {/* Search inside client dropdown */}
                          <div className="p-3 border-b border-white/10 bg-[#161822]">
                            <div className="relative">
                              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                              <input
                                type="text"
                                autoFocus
                                value={clientSearchQuery}
                                onChange={(e) => setClientSearchQuery(e.target.value)}
                                placeholder="Search client name, company, or ID #..."
                                className="w-full rounded-xl border border-white/10 bg-[#0f1118] pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50"
                              />
                            </div>
                          </div>

                          {/* Client List */}
                          <div className="max-h-56 overflow-y-auto divide-y divide-white/5">
                            <div
                              onClick={() => handleSelectClient(null)}
                              className="px-4 py-2.5 text-xs text-white/50 hover:bg-white/5 hover:text-white cursor-pointer transition flex items-center justify-between"
                            >
                              <span>None (No client associated)</span>
                              {!draft.client_id && <Check size={14} className="text-emerald-400" />}
                            </div>

                            {clientsLoading ? (
                              <div className="py-6 flex items-center justify-center gap-2 text-xs text-white/40">
                                <Loader2 size={14} className="animate-spin text-emerald-400" />
                                Loading clients from /admin/clients...
                              </div>
                            ) : filteredClients.length === 0 ? (
                              <div className="py-6 text-center text-xs text-white/40">
                                No matching clients found
                              </div>
                            ) : (
                              filteredClients.map((client) => {
                                const isSelected = String(client.id) === String(draft.client_id);
                                return (
                                  <div
                                    key={client.id}
                                    onClick={() => handleSelectClient(client)}
                                    className={`px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between transition ${
                                      isSelected
                                        ? 'bg-emerald-500/15 text-emerald-300 font-semibold'
                                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 truncate">
                                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold shrink-0">
                                        ID: #{client.id}
                                      </span>
                                      <div className="truncate">
                                        <span className="font-semibold text-white">{client.client_name}</span>
                                        {client.company_name && (
                                          <span className="text-white/40 ml-1.5 truncate">
                                            ({client.company_name})
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {isSelected && <Check size={14} className="text-emerald-400 shrink-0 ml-2" />}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Selected Client Card Details Preview */}
                    {draft.client_id && (
                      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-400">Selected Client #{draft.client_id}:</span>
                            <span className="text-white font-semibold">{draft.client_name}</span>
                          </div>
                          {draft.client_details?.email && (
                            <p className="text-white/40 text-[11px]">{draft.client_details.email}</p>
                          )}
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                          Linked
                        </span>
                      </div>
                    )}
                  </div>
                </SectionCard>

                {/* 3. Image Upload Section */}
                <SectionCard icon={ImageIcon} title="Project Showcase Image">
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-white/70">
                      Upload Project Image / Screenshot
                    </label>

                    {imagePreviewUrl ? (
                      <div className="relative rounded-2xl border border-white/15 overflow-hidden bg-black/40 max-h-56 group">
                        <img
                          src={imagePreviewUrl}
                          alt="Project Preview"
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <label className="px-3.5 py-1.5 rounded-xl bg-white text-black text-xs font-bold cursor-pointer hover:opacity-90">
                            Change Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={removeSelectedImage}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/15 rounded-2xl bg-[#161822]/60 hover:bg-[#161822] hover:border-emerald-500/50 transition cursor-pointer">
                        <Upload size={24} className="text-white/40 mb-2" />
                        <p className="text-xs font-semibold text-white/70">
                          Click or drag project screenshot to upload
                        </p>
                        <p className="text-[10px] text-white/30 mt-1">PNG, JPG, JPEG or WEBP (Max 10MB)</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </SectionCard>

                {/* 4. Technologies & Optional Metadata */}
                <SectionCard icon={Tag} title="Technologies & Date (Optional)">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/70">
                        Technologies Used (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        placeholder="e.g. React.js, Node.js, Tailwind CSS, MySQL"
                        className="w-full rounded-xl border border-white/10 bg-[#161822] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-white/70">Completion Date</label>
                      <input
                        type="date"
                        value={draft.completion_date}
                        onChange={(e) => setDraft((p) => ({ ...p, completion_date: e.target.value }))}
                        className="w-full rounded-xl border border-white/10 bg-[#161822] px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                      />
                    </div>
                  </div>
                </SectionCard>

                {/* Modal Footer / Actions */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:opacity-90 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        {editingId ? 'Save Changes' : 'Create Completed Project'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
