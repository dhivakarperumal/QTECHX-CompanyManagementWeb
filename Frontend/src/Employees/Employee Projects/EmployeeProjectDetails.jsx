import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Building2, CalendarDays, CheckCircle, FileText, Loader2,
  User, DollarSign, TrendingUp, FolderKanban, Users, Code2, Paperclip,
  Globe, Phone, Mail, MapPin, Briefcase, Clock, AlertCircle, BarChart3,
  ExternalLink, Download, Image, FileArchive, Search, LayoutGrid, List,
  X, ChevronLeft, ChevronRight, Eye, CheckSquare
} from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../PrivateRouter/AuthContext';

/* ── asset helpers ──────────────────────────────────────────────────── */
const parseJsonField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try { const p = JSON.parse(field); return Array.isArray(p) ? p : [p]; }
    catch { return field.trim() ? [field] : []; }
  }
  return [field];
};

const ASSET_LABELS = {
  proposal_doc:      'Proposal',
  quotation_doc:     'Quotation',
  agreement_doc:     'Agreement',
  nda_doc:           'NDA',
  api_documentation: 'API Docs',
  database_schema:   'DB Schema',
  source_code_backup:'Source Backup',
};

const isImagePath = (p) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(p || '');
const isZipPath   = (p) => /\.(zip|rar|7z|tar|gz)$/i.test(p || '');

const buildAssets = (project) => {
  if (!project) return [];
  const BASE = import.meta.env.VITE_API_URL || '';
  const assets = [];

  // Project images array
  parseJsonField(project.project_images).forEach((item, i) => {
    let path = null, name = null;
    if (typeof item === 'object' && item) {
      path = item.file_path || item.path || item.url || null;
      name = item.original_name || item.originalname || item.name || null;
    } else if (typeof item === 'string') {
      path = item;
    }
    if (!path && !name) return;
    if (!path && name) path = `/uploads/${name}`;
    if (!name) name = path.split('/').pop();
    const full = path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
    assets.push({ id:`img-${i}`, kind:'image', label:'Project Image', name, url: full });
  });

  // Source code backup (zip)
  parseJsonField(project.source_code_backup).forEach((item, i) => {
    let path = null, name = null;
    if (typeof item === 'object' && item) {
      path = item.file_path || item.path || item.url || null;
      name = item.original_name || item.originalname || item.name || null;
    } else if (typeof item === 'string') { path = item; }
    if (!path && !name) return;
    if (!path && name) path = `/uploads/${name}`;
    if (!name) name = path.split('/').pop();
    const full = path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
    assets.push({ id:`zip-${i}`, kind:'zip', label:'Source Backup', name, url: full });
  });

  // Document files
  Object.entries(ASSET_LABELS).forEach(([key, label]) => {
    if (key === 'source_code_backup') return; // already handled
    const val = project[key];
    if (!val) return;
    const items = parseJsonField(val);
    items.forEach((item, i) => {
      let path = null, name = null;
      if (typeof item === 'object' && item) {
        path = item.file_path || item.path || item.url || null;
        name = item.original_name || item.originalname || item.name || null;
      } else if (typeof item === 'string') { path = item; }
      if (!path && !name) return;
      if (!path && name) path = `/uploads/${name}`;
      if (!name) name = path.split('/').pop();
      const full = path.startsWith('http') ? path : `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
      const kind = isImagePath(full) ? 'image' : 'doc';
      assets.push({ id:`${key}-${i}`, kind, label, name, url: full });
    });
  });

  return assets;
};

/* ─── helpers ─────────────────────────────────────────────────────────── */
const formatCurrency = (v) => {
  if (!v && v !== 0) return '—';
  const n = Number(v);
  return Number.isNaN(n) ? v
    : new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
};
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

const AVATAR_COLOURS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#14b8a6','#f97316','#8b5cf6','#ef4444','#22c55e'];
const initials = (name='') => name.split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?';
function Avatar({ name, size=10, index=0 }) {
  const c = AVATAR_COLOURS[index % AVATAR_COLOURS.length];
  return (
    <div style={{ width:size*4, height:size*4, background:c+'28', border:`1.5px solid ${c}44`, color:c }}
      className="rounded-xl text-xs font-bold flex items-center justify-center shrink-0 select-none">
      {initials(name)}
    </div>
  );
}

const STATUS_STYLES = {
  'Planning':    { pill:'bg-blue-500/15 text-blue-400 border-blue-500/30',   dot:'bg-blue-400'    },
  'In Progress': { pill:'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot:'bg-emerald-400' },
  'Testing':     { pill:'bg-violet-500/15 text-violet-400 border-violet-500/30',    dot:'bg-violet-400'  },
  'On Hold':     { pill:'bg-orange-500/15 text-orange-400 border-orange-500/30',    dot:'bg-orange-400'  },
  'Live':        { pill:'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',          dot:'bg-cyan-400'    },
  'Completed':   { pill:'bg-purple-500/15 text-purple-400 border-purple-500/30',    dot:'bg-purple-400'  },
  'Cancelled':   { pill:'bg-rose-500/15 text-rose-400 border-rose-500/30',          dot:'bg-rose-400'    },
};
function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { pill:'bg-white/10 text-white/60 border-white/20', dot:'bg-white/50' };
  return (
    <span className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border ${s.pill}`}>
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      {status || 'Unknown'}
    </span>
  );
}

function InfoCard({ title, value, icon: Icon, accent='text-white/40' }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 hover:bg-white/[0.04] transition">
      <div className={`flex items-center gap-2 text-xs uppercase tracking-wider mb-2 font-medium ${accent}`}>
        {Icon && <Icon size={13} />} {title}
      </div>
      <div className="text-white font-semibold text-sm leading-6 break-all">{value || '—'}</div>
    </div>
  );
}

function Section({ title, icon: Icon, iconCls='text-white/50', children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111318] p-5 space-y-4">
      <div className="flex items-center gap-2.5">
        {Icon && <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 ${iconCls}`}><Icon size={16} /></div>}
        <h2 className="text-base font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function AssetsSection({ project }) {
  const assets = useMemo(() => buildAssets(project), [project]);
  const [viewMode, setViewMode] = useState('grid');
  const [previewAsset, setPreviewAsset] = useState(null);

  if (!assets || assets.length === 0) return null;

  return (
    <Section title={`Project Assets & Documents (${assets.length})`} icon={FolderKanban} iconCls="text-blue-400">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-white/50">All related files, images, and documents for this project.</p>
        <div className="flex bg-[#1a1d24] p-1 rounded-xl border border-white/5">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' 
        ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" 
        : "space-y-3"}>
        {assets.map(asset => (
          <div key={asset.id} 
            className={`group relative bg-[#15181e] border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all ${
              viewMode === 'list' ? 'flex items-center p-3 pr-4 gap-4' : 'flex flex-col'
            }`}>
            
            {/* Thumbnail */}
            <div className={`relative bg-white/5 shrink-0 flex items-center justify-center ${
              viewMode === 'list' ? 'w-12 h-12 rounded-xl' : 'aspect-square w-full'
            }`}>
              {asset.kind === 'image' ? (
                <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
              ) : asset.kind === 'zip' ? (
                <FileArchive size={viewMode==='list'?20:32} className="text-orange-400/80" />
              ) : (
                <FileText size={viewMode==='list'?20:32} className="text-blue-400/80" />
              )}
              
              {/* Overlay Actions (Grid) */}
              {viewMode === 'grid' && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                  {asset.kind === 'image' && (
                    <button onClick={() => setPreviewAsset(asset)} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-blue-500 hover:text-white transition">
                      <Eye size={14} />
                    </button>
                  )}
                  <a href={asset.url} target="_blank" rel="noreferrer" download className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-emerald-500 hover:text-white transition">
                    <Download size={14} />
                  </a>
                </div>
              )}
            </div>

            {/* Info */}
            <div className={`flex-1 min-w-0 ${viewMode === 'grid' ? 'p-3' : ''}`}>
              <p className="text-xs font-medium text-blue-400 mb-1">{asset.label}</p>
              <p className="text-sm font-semibold text-white truncate" title={asset.name}>{asset.name}</p>
            </div>

            {/* List Actions */}
            {viewMode === 'list' && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {asset.kind === 'image' && (
                  <button onClick={() => setPreviewAsset(asset)} className="w-8 h-8 rounded-full bg-white/5 text-white/70 hover:bg-blue-500 hover:text-white flex items-center justify-center transition">
                    <Eye size={14} />
                  </button>
                )}
                <a href={asset.url} target="_blank" rel="noreferrer" download className="w-8 h-8 rounded-full bg-white/5 text-white/70 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition">
                  <Download size={14} />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8" onClick={() => setPreviewAsset(null)}>
          <button onClick={() => setPreviewAsset(null)} className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition">
            <X size={20} />
          </button>
          
          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            <img src={previewAsset.url} alt={previewAsset.name} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" />
            <div className="flex items-center justify-between w-full max-w-2xl bg-[#111318] p-4 rounded-2xl border border-white/10">
              <div>
                <p className="text-xs text-blue-400 font-medium mb-1">{previewAsset.label}</p>
                <p className="text-sm text-white font-semibold truncate">{previewAsset.name}</p>
              </div>
              <a href={previewAsset.url} target="_blank" rel="noreferrer" download className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-400 transition">
                <Download size={16} /> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

/* ─── main component ──────────────────────────────────────────────────── */

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'tech', label: 'Tech Stack', icon: Code2 },
  { id: 'assets', label: 'Assets', icon: FolderKanban }
];

export default function EmployeeProjectDetails() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project,     setProject]     = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [tasks,       setTasks]       = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [progressData, setProgressData] = useState(null);

  const fetchProgress = useCallback(async (projectUUID) => {
    try {
      const { data } = await api.get(`/projects/${projectUUID}/progress`);
      if (data.success) setProgressData(data);
    } catch (e) {
      console.error('Failed to fetch progress:', e);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [projRes, assignRes, tasksRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/projects/${id}/assignments`).catch(() => ({ data: {} })),
          api.get(`/tasks?project_id=${id}`).catch(() => ({ data: { data: [] } })),
        ]);
        if (!projRes.data.success) throw new Error(projRes.data.message || 'Project not found');
        
        setProject(projRes.data.data);
        await fetchProgress(id);
        
        const employees = assignRes.data?.assignedEmployees
                        || assignRes.data?.project?.employees
                        || assignRes.data?.employees
                        || [];
        setAssignments(employees);

        let projTasks = tasksRes.data?.data || [];
        if (user?.user_id) {
          projTasks = projTasks.filter(t => t.assigned_to === user.user_id || t.assigned_to === user.employee_id || !t.assigned_to);
        }
        setTasks(projTasks);

      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, fetchProgress]);

  // Poll progress every 15 seconds for real-time updates
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => fetchProgress(id), 15000);
    return () => clearInterval(interval);
  }, [id, fetchProgress]);


  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-primary/70" />
        <p className="text-sm text-white/40">Loading project details…</p>
      </div>
    </div>
  );

  /* ── error ── */
  if (error || !project) return (
    <div className="space-y-4">
      <button onClick={() => navigate('/employee/projects')}
        className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition">
        <ArrowLeft size={16} /> Back to projects
      </button>
      <div className="flex items-center gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-5 text-sm text-rose-400">
        <AlertCircle size={18} /> {error || 'Project not found'}
      </div>
    </div>
  );

  const pct = progressData?.progress ?? 0;
  const progressColor = pct >= 100 ? '#22c55e' : pct >= 70 ? '#f97316' : pct >= 40 ? '#3b82f6' : '#ef4444';
  const isFullyCompleted = pct >= 100 && (progressData?.total ?? 0) > 0;

  return (
    <div className="pb-12 text-white">

      {/* ── Back + Title ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/employee/projects')}
            className="w-10 h-10 rounded-xl bg-[#111318] border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
              <FolderKanban size={10} /> Project Details
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{project.project_name}</h1>
            <p className="text-sm text-white/40 mt-0.5">
              {[project.project_code, project.project_category, project.industry].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
        <StatusBadge status={project.current_status} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* ── Left Side Tabs ───────────────────────────────────────── */}
        <div className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 sticky top-6">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap outline-none ${
                    isActive 
                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' 
                    : 'bg-[#111318] text-white/50 border border-white/5 hover:bg-white/5 hover:text-white hover:border-white/10'
                  }`}
                >
                  <Icon size={16} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right Side Content ───────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-5">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Top stat strip */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label:'Progress',   value:`${pct}%`,                               icon:BarChart3,   cls:'text-emerald-400', bg:'bg-emerald-500/10' },
                  { label:'Budget',     value:formatCurrency(project.total_project_cost), icon:DollarSign,  cls:'text-blue-400',    bg:'bg-blue-500/10'    },
                  { label:'Deadline',   value:fmtDate(project.estimated_completion_date), icon:Clock,       cls:'text-rose-400',    bg:'bg-rose-500/10'    },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="bg-[#111318] border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                        <Icon size={18} className={s.cls} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{s.value}</p>
                        <p className="text-white/40 text-xs">{s.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress card — dynamic from employee_task_assignments */}
              <div className="rounded-2xl border border-white/10 bg-[#111318] p-5 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-400" />
                    <span className="font-semibold text-sm">Overall Progress</span>
                  </div>
                  {isFullyCompleted ? (
                    <span className="text-emerald-400 font-bold text-sm">100%</span>
                  ) : (
                    <span className="text-2xl font-bold" style={{ color: progressColor }}>{pct}%</span>
                  )}
                </div>

                {isFullyCompleted ? (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-emerald-400 font-bold text-sm">
                    <CheckCircle size={18} />
                    ✅ Project Completed (100%)
                  </div>
                ) : (
                  <>
                    <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width:`${pct}%`, background:`linear-gradient(90deg, ${progressColor}cc, ${progressColor})` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-white/30">
                      <span>0%</span><span>50%</span><span>100%</span>
                    </div>
                  </>
                )}

                {/* Task breakdown stats */}
                {(progressData?.total ?? 0) > 0 ? (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[
                      { label: 'Total',       value: progressData?.total,      color: 'border-white/10 text-white/80' },
                      { label: 'Completed',   value: progressData?.completed,  color: 'border-emerald-500/30 text-emerald-400' },
                      { label: 'Remaining',   value: progressData?.remaining,  color: 'border-orange-500/30 text-orange-400' },
                      { label: 'In Progress', value: progressData?.inProgress, color: 'border-blue-500/30 text-blue-400' },
                      { label: 'Pending',     value: progressData?.pending,    color: 'border-yellow-500/30 text-yellow-400' },
                      { label: 'On Hold',     value: progressData?.onHold,     color: 'border-violet-500/30 text-violet-400' },
                      { label: 'Cancelled',   value: progressData?.cancelled,  color: 'border-rose-500/30 text-rose-400' },
                    ].map(s => (
                      <div key={s.label} className={`flex flex-col items-center justify-center rounded-xl border p-2 ${s.color}`}>
                        <span className="text-base font-bold">{s.value ?? 0}</span>
                        <span className="text-[9px] uppercase tracking-wide mt-0.5 opacity-70 text-center">{s.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/30 text-center py-1">No tasks assigned yet.</p>
                )}
              </div>

              {/* 2-col: Description + Client & Team */}
              <div className="grid gap-5 lg:grid-cols-2">
                <Section title="Project Summary" icon={FileText} iconCls="text-orange-400">
                  <p className="text-sm leading-7 text-white/70">
                    {project.description || 'No description provided.'}
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <InfoCard title="Project Code" value={project.project_code}     icon={FileText}    />
                    <InfoCard title="Category"     value={project.project_category}  icon={FolderKanban}/>
                    <InfoCard title="Industry"     value={project.industry}           icon={Building2}   />
                    <InfoCard title="Client"       value={project.client_name}        icon={Users}       />
                  </div>
                </Section>

                <Section title="Client & Team" icon={User} iconCls="text-blue-400">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard title="Contact Person"  value={project.contact_person}  icon={User}       />
                    <InfoCard title="Project Manager" value={project.project_manager}  icon={Briefcase}  />
                    <InfoCard title="Email"           value={project.email}            icon={Mail}       />
                    <InfoCard title="Phone"           value={project.phone_number}     icon={Phone}      />
                    {project.website && (
                      <div className="col-span-2">
                        <InfoCard title="Website" value={project.website} icon={Globe} />
                      </div>
                    )}
                    {project.address && (
                      <div className="col-span-2">
                        <InfoCard title="Address" value={project.address} icon={MapPin} />
                      </div>
                    )}
                  </div>
                </Section>
              </div>
            </div>
          )}

          {/* TAB: TEAM */}
          {activeTab === 'team' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Section title={`Team Members (${assignments.length})`} icon={Users} iconCls="text-emerald-400">
                {assignments.length === 0 ? (
                  <p className="text-sm text-white/40 text-center py-4">No team members assigned.</p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/8 bg-[#111318]">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/6">
                          {['S No', 'Member', 'Role', 'Email', 'Status'].map((col) => (
                            <th key={col} className="px-4 py-3 text-[10px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map((emp, i) => {
                          const fullName = emp.full_name || [emp.first_name, emp.last_name].filter(Boolean).join(' ') || 'Unknown';
                          return (
                            <tr key={emp.employee_id || i} className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors">
                              <td className="px-4 py-3 text-white/55 text-xs whitespace-nowrap">{i + 1}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <Avatar name={fullName} size={11} index={i} />
                                  <div>
                                    <p className="text-white text-sm font-semibold truncate">{fullName}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-white/60 text-xs whitespace-nowrap">
                                {emp.designation || emp.role || 'Team Member'}
                              </td>
                              <td className="px-4 py-3 text-white/55 text-xs whitespace-nowrap">
                                {emp.email || '—'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/50 uppercase tracking-widest shrink-0 inline-flex">
                                  {emp.status || 'Assigned'}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* TAB: TASKS */}
          {activeTab === 'tasks' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Section title={`Your Assigned Tasks (${tasks.length})`} icon={CheckSquare} iconCls="text-blue-400">
                {tasks.length === 0 ? (
                  <p className="text-sm text-white/40 text-center py-4">No tasks assigned to you for this project yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/8 bg-[#111318]">
                    <table className="min-w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/6">
                          {['S No', 'Task', 'Description', 'Due Date', 'Priority', 'Status'].map((col) => (
                            <th key={col} className="px-4 py-3 text-[10px] font-bold tracking-widest text-white/40 uppercase whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task, index) => (
                          <tr key={task.id || task.uuid} className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors">
                            <td className="px-4 py-3 text-white/55 text-xs whitespace-nowrap">{index + 1}</td>
                            <td className="px-4 py-3 text-white text-sm font-semibold whitespace-nowrap">
                              {task.task_name}
                            </td>
                            <td className="px-4 py-3 text-white/60 text-xs max-w-[260px]">
                              {task.description || 'No description provided.'}
                            </td>
                            <td className="px-4 py-3 text-white/55 text-xs whitespace-nowrap">
                              {fmtDate(task.due_date)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              {task.priority && (
                                <span className={`text-[10px] uppercase tracking-widest font-bold ${
                                  task.priority.toLowerCase() === 'high' ? 'text-rose-400' : 
                                  task.priority.toLowerCase() === 'medium' ? 'text-orange-400' : 'text-emerald-400'
                                }`}>
                                  {task.priority}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <StatusBadge status={task.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            </div>
          )}

          {/* TAB: TECH */}
          {activeTab === 'tech' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Section title="Technology Stack" icon={Code2} iconCls="text-violet-400">
                <div className="grid grid-cols-2 gap-3">
                  <InfoCard title="Frontend"  value={project.frontend_tech}  icon={Code2} />
                  <InfoCard title="Backend"   value={project.backend_tech}   icon={Code2} />
                  <InfoCard title="Database"  value={project.database_tech}  icon={Code2} />
                  {project.hosting_platform && <InfoCard title="Hosting"  value={project.hosting_platform} icon={Globe} />}
                  {project.version_control  && <InfoCard title="Version Control" value={project.version_control}  icon={Code2} />}
                </div>
              </Section>

              {(project.objective || project.business_requirements) && (
                <Section title="Objectives & Requirements" icon={CheckCircle} iconCls="text-emerald-400">
                  <div className="grid gap-5">
                    {project.objective && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-2">Objective</p>
                        <p className="text-sm leading-7 text-white/70">{project.objective}</p>
                      </div>
                    )}
                    {project.business_requirements && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/35 mb-2">Business Requirements</p>
                        <p className="text-sm leading-7 text-white/70">{project.business_requirements}</p>
                      </div>
                    )}
                  </div>
                </Section>
              )}
            </div>
          )}

          {/* TAB: ASSETS */}
          {activeTab === 'assets' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AssetsSection project={project} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

