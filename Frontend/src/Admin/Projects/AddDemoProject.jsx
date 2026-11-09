import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FlaskConical, FileText, Globe, Building2,
  Image as ImageIcon, Tag, CheckCircle, AlertCircle,
  X, Loader2, Save, Search, ChevronDown, Upload, Check,
  ArrowLeft,
} from 'lucide-react';
import api, { API_URL } from '../../api';

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

const BLANK = {
  project_name: '',
  category: 'Web Development',
  url: '',
  description: '',
  client_id: '',
  client_name: '',
  client_details: {},
  technologies: [],
  completion_date: '',
};

const toForm = (p) => ({
  project_name: p.project_name || '',
  category: p.category || 'Web Development',
  url: p.url || '',
  description: p.description || '',
  client_id: p.client_id ? String(p.client_id) : '',
  client_name: p.client_name || '',
  client_details: p.client_details || {},
  technologies: Array.isArray(p.technologies) ? p.technologies : [],
  completion_date: p.completion_date ? p.completion_date.slice(0, 10) : '',
});

// ── Shared style tokens ──────────────────────────────────────────────────────
const inputCls =
  'w-full rounded-xl border border-white/10 bg-[#161822] px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30';

// ── SectionCard: exact copy of completed-projects modal card, orange theme ───
function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12141c]/90 p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-orange-400" />
        </div>
        <h2 className="text-sm font-bold text-white tracking-wide">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function AddDemoProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(BLANK);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Client dropdown state
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef(null);

  // Image state
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  // Technologies input (comma-separated string)
  const [techInput, setTechInput] = useState('');

  // ── Load project for edit ────────────────────────────────────────────────
  useEffect(() => {
    setSuccess('');
    setError('');
    if (!isEdit) {
      setFormData(BLANK);
      setSelectedImageFile(null);
      setImagePreviewUrl('');
      setTechInput('');
    } else {
      (async () => {
        setFetchLoading(true);
        try {
          const { data } = await api.get(`/demo-projects/${id}`);
          if (!data.success) throw new Error(data.message || 'Not found');
          const p = data.data;
          setFormData(toForm(p));
          setTechInput(Array.isArray(p.technologies) ? p.technologies.join(', ') : '');
          if (p.image) setImagePreviewUrl(buildUploadUrl(p.image));
        } catch (err) {
          setError(err?.response?.data?.message || err.message || 'Failed to load demo project');
        } finally {
          setFetchLoading(false);
        }
      })();
    }
  }, [id, isEdit]);

  // ── Load clients ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setClientsLoading(true);
      try {
        const { data } = await api.get('/clients?limit=500&page=1');
        if (data.success && Array.isArray(data.data)) setClients(data.data);
        else if (data.success && data.data?.rows) setClients(data.data.rows);
      } catch (err) {
        console.warn('Failed to load clients:', err?.message || err);
      } finally {
        setClientsLoading(false);
      }
    })();
  }, []);

  // ── Close client dropdown on outside click ───────────────────────────────
  useEffect(() => {
    function handleOutside(e) {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target)) {
        setIsClientDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // ── Cleanup object URL on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (selectedImageFile && imagePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, []);

  // ── Filtered clients ─────────────────────────────────────────────────────
  const filteredClients = (() => {
    const q = clientSearchQuery.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      String(c.id).includes(q) ||
      (c.client_name || '').toLowerCase().includes(q) ||
      (c.company_name || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  })();

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectClient = (client) => {
    if (!client) {
      setFormData((prev) => ({ ...prev, client_id: '', client_name: '', client_details: {} }));
    } else {
      setFormData((prev) => ({
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
    setClientSearchQuery('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreviewUrl.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl);
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (imagePreviewUrl.startsWith('blob:')) URL.revokeObjectURL(imagePreviewUrl);
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.project_name.trim()) {
      setError('Project name is required.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const technologiesList = techInput.trim()
        ? techInput.split(',').map((t) => t.trim()).filter(Boolean)
        : formData.technologies;

      const form = new FormData();
      form.append('project_name', formData.project_name.trim());
      form.append('category', formData.category || 'Web Development');
      form.append('current_status', 'Completed');
      form.append('description', formData.description || '');
      form.append('url', formData.url || '');
      form.append('technologies', JSON.stringify(technologiesList));
      if (formData.completion_date) form.append('completion_date', formData.completion_date);
      if (formData.client_id) {
        form.append('client_id', formData.client_id);
        form.append('client_name', formData.client_name || '');
        if (formData.client_details) {
          form.append('client_details', JSON.stringify(formData.client_details));
        }
      }
      if (selectedImageFile) {
        form.append('image', selectedImageFile);
      } else if (formData.image) {
        form.append('image', formData.image);
      }

      const res = isEdit
        ? await api.put(`/demo-projects/${id}`, form)
        : await api.post('/demo-projects', form);

      if (!res.data.success) throw new Error(res.data.message || 'Failed');
      setSuccess(isEdit ? 'Demo project updated!' : 'Demo project created!');
      setTimeout(() => navigate('/admin/demo-projects'), 1000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save demo project');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={30} className="animate-spin text-orange-500/70" />
          <p className="text-sm text-white/40">Loading demo project…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-white min-h-screen">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate('/admin/demo-projects')}
            className="w-11 h-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition shadow-inner"
            title="Back to Demo Projects"
          >
            <ArrowLeft size={18} />
          </button>
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)' }}
          >
            <FlaskConical size={22} className="text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {isEdit ? (formData.project_name || 'Edit Demo Project') : 'Add Demo Project'}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                Demo
              </span>
            </div>
            <p className="text-white/40 text-xs mt-0.5">
              {isEdit
                ? 'Update demo project details and save changes.'
                : 'Fill in demo project details, client info, and assets.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/demo-projects')}
          className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition self-start"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Alerts ────────────────────────────────────────────────────────── */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm px-5 py-3.5 rounded-2xl">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-5 py-3.5 rounded-2xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── Form ──────────────────────────────────────────────────────────── */}
      <form id="demo-project-form" onSubmit={handleSave} className="space-y-5">

        {/* ── 1. Project Overview ───────────────────────────────────────── */}
        <SectionCard icon={FileText} title="Project Overview">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/70">
              Project Name <span className="text-rose-400">*</span>
            </label>
            <input
              className={inputCls}
              type="text"
              name="project_name"
              value={formData.project_name}
              onChange={handleChange}
              placeholder="e.g. Modern E-Commerce Platform"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/70">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={inputCls}
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#161822] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Demo projects are always completed. */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-white/70">
                Current Status
              </label>
              <div className={`${inputCls} text-emerald-400`}>Completed</div>
            </div>
          </div>

          {/* Demo Project URL */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/70">
              Demo Project URL
            </label>
            <div className="relative">
              <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                className={`${inputCls} pl-10`}
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/70">
              Project Description
            </label>
            <textarea
              className={`${inputCls} min-h-20 resize-y`}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide an overview of the demo project, features, and goals…"
              rows={3}
            />
          </div>
        </SectionCard>

        {/* ── 2. Client Details ─────────────────────────────────────────── */}
        <SectionCard icon={Building2} title="Client Details (From /admin/clients)">
          <div className="space-y-3" ref={clientDropdownRef}>
            <label className="block text-xs font-semibold text-white/70">
              Select Client{' '}
              <span className="text-white/40 text-[11px]">(Shows Client ID &amp; Name)</span>
            </label>

            {/* Dropdown Trigger */}
            <div className="relative">
              <div
                onClick={() => setIsClientDropdownOpen((prev) => !prev)}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition ${
                  isClientDropdownOpen
                    ? 'border-orange-500/60 bg-[#161822] ring-1 ring-orange-500/30'
                    : 'border-white/10 bg-[#161822] hover:border-white/20'
                }`}
              >
                {formData.client_id ? (
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-500/30 text-blue-300 font-mono text-xs font-bold">
                      ID: #{formData.client_id}
                    </span>
                    <span className="font-semibold text-white truncate">{formData.client_name}</span>
                    {formData.client_details?.company_name && (
                      <span className="text-white/40 text-xs truncate">
                        ({formData.client_details.company_name})
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-white/40">— Select Client with ID &amp; Name —</span>
                )}
                <div className="flex items-center gap-1.5 text-white/40 shrink-0">
                  {formData.client_id && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSelectClient(null); }}
                      className="hover:text-rose-400 p-1"
                      title="Clear client selection"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${isClientDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </div>

              {/* Dropdown Panel */}
              {isClientDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-white/15 bg-[#12141c] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Search */}
                  <div className="p-3 border-b border-white/10 bg-[#161822]">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="text"
                        autoFocus
                        value={clientSearchQuery}
                        onChange={(e) => setClientSearchQuery(e.target.value)}
                        placeholder="Search client name, company, or ID #…"
                        className="w-full rounded-xl border border-white/10 bg-[#0f1118] pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-orange-500/50"
                      />
                    </div>
                  </div>

                  {/* Client List */}
                  <div className="max-h-56 overflow-y-auto divide-y divide-white/5">
                    {/* None option */}
                    <div
                      onClick={() => handleSelectClient(null)}
                      className="px-4 py-2.5 text-xs text-white/50 hover:bg-white/5 hover:text-white cursor-pointer transition flex items-center justify-between"
                    >
                      <span>None (No client associated)</span>
                      {!formData.client_id && <Check size={14} className="text-orange-400" />}
                    </div>

                    {clientsLoading ? (
                      <div className="py-6 flex items-center justify-center gap-2 text-xs text-white/40">
                        <Loader2 size={14} className="animate-spin text-orange-400" />
                        Loading clients from /admin/clients…
                      </div>
                    ) : filteredClients.length === 0 ? (
                      <div className="py-6 text-center text-xs text-white/40">
                        No matching clients found
                      </div>
                    ) : (
                      filteredClients.map((client) => {
                        const isSelected = String(client.id) === String(formData.client_id);
                        return (
                          <div
                            key={client.id}
                            onClick={() => handleSelectClient(client)}
                            className={`px-4 py-2.5 text-xs cursor-pointer flex items-center justify-between transition ${
                              isSelected
                                ? 'bg-orange-500/15 text-orange-300 font-semibold'
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
                            {isSelected && <Check size={14} className="text-orange-400 shrink-0 ml-2" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Client Preview Card */}
            {formData.client_id && (
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-400">Selected Client #{formData.client_id}:</span>
                    <span className="text-white font-semibold">{formData.client_name}</span>
                  </div>
                  {formData.client_details?.email && (
                    <p className="text-white/40 text-[11px]">{formData.client_details.email}</p>
                  )}
                  {formData.client_details?.company_name && (
                    <p className="text-white/40 text-[11px]">{formData.client_details.company_name}</p>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] font-bold">
                  Linked
                </span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ── 3. Project Image ──────────────────────────────────────────── */}
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
                    onClick={removeImage}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/15 rounded-2xl bg-[#161822]/60 hover:bg-[#161822] hover:border-orange-500/50 transition cursor-pointer">
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

        {/* ── 4. Technologies & Date ────────────────────────────────────── */}
        <SectionCard icon={Tag} title="Technologies & Date (Optional)">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/70">
              Technologies Used (Comma separated)
            </label>
            <input
              className={inputCls}
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="e.g. React.js, Node.js, Tailwind CSS, MySQL"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-white/70">
              Completion Date
            </label>
            <input
              className={inputCls}
              type="date"
              name="completion_date"
              value={formData.completion_date}
              onChange={handleChange}
            />
          </div>
        </SectionCard>

        {/* ── Footer Actions ────────────────────────────────────────────── */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
          {!isEdit && (
            <button
              type="button"
              onClick={() => {
                setFormData(BLANK);
                setTechInput('');
                setSelectedImageFile(null);
                setImagePreviewUrl('');
                setError('');
                setSuccess('');
              }}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-40"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/admin/demo-projects')}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="demo-project-form"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:opacity-90 active:scale-95 transition disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save size={15} />
                {isEdit ? 'Save Changes' : 'Save Demo Project'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
