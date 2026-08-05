import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../PrivateRouter/AuthContext';
import Select from 'react-select';
import api from '../../api';
import dayjs from 'dayjs';
import {
  Archive,
  CheckCircle2,
  Clock3,
  FileArchive,
  FileImage,
  Filter,
  FolderKanban,
  LayoutGrid,
  List,
  Search,
  Sparkles,
  UploadCloud,
  UserRound,
  ImageIcon,
  Download,
  Trash2,
} from 'lucide-react';

const SELECTED_PROJECT_KEY = 'qtechx-project-selected-id';

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: '#1a1d24',
    border: `1px solid ${state.isFocused
        ? '#f97316'
        : 'rgba(255,255,255,0.1)'
      }`,
    boxShadow: 'none',
    outline: 'none',
    minHeight: '42px',
    height: '42px',
    borderRadius: '12px',

    '&:hover': {
      border: '1px solid #f97316',
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
        ? 'rgba(249,115,22,.15)'
        : '#1a1d24',
    color: '#fff',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#ea580c',
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

const buildAssetEntriesFromProject = (project, createId) => {
  const entries = [];
  const projectId = project.uuid || project.id?.toString();
  const projectName = project.project_name || project.projectName || `Project ${project.id}`;
  const createdAt = project.updated_at || project.created_at || new Date().toISOString();
  const updatedAt = project.updated_at || project.created_at || new Date().toISOString();
  const createdBy = project.created_by || project.updated_by || 'System';
  const updatedBy = project.updated_by || project.created_by || 'System';

  const parseJsonField = (field) => {
    if (!field) return [];
    if (typeof field === 'string') {
      try { 
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch { 
        return [field]; 
      }
    }
    if (Array.isArray(field)) return field;
    return [field];
  };

  const processItem = (item, defaultLabel) => {
    let actualItem = item;

    // Unwrap string items that are still JSON
    if (typeof actualItem === 'string') {
      try { actualItem = JSON.parse(actualItem); } catch { /* not JSON, use as-is */ }
    }

    // Now extract the path — backend returns {original_name, file_path, asset_type}
    let filePath = null;
    let fileName = null;

    if (typeof actualItem === 'object' && actualItem !== null) {
      filePath = actualItem.file_path || actualItem.path || actualItem.url || null;
      fileName = actualItem.original_name || actualItem.originalname || actualItem.name || null;
    } else if (typeof actualItem === 'string' && actualItem.length > 0) {
      // Plain string path like "/uploads/..."
      filePath = actualItem;
    }

    if (!filePath && !fileName) return; // nothing useful

    // If only a filename was found (no path), try constructing from uploads
    if (!filePath && fileName) {
      filePath = `/uploads/${fileName}`;
    }

    // Derive file name from path if still missing
    if (!fileName && filePath) {
      fileName = filePath.split('/').pop();
    }

    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath || fileName || '');

    entries.push({
      id: createId(),
      projectId,
      projectName,
      assetType: isImage ? 'image' : 'zip',
      fileName: fileName || defaultLabel,
      fileSize: 0,
      mimeType: isImage ? 'image/jpeg' : 'application/zip',
      uploadedPath: filePath,
      createdAt,
      updatedAt,
      createdBy,
      updatedBy,
      kindLabel: defaultLabel,
    });
  };

  const projectImages = parseJsonField(project.project_images);
  projectImages.forEach(item => processItem(item, 'Project Image'));

  const backups = parseJsonField(project.source_code_backup);
  backups.forEach(item => processItem(item, 'Document ZIP'));

  return entries;
};

const formatDate = (value) => {
  if (!value) return 'Not set';
  return dayjs(value).isValid() ? dayjs(value).format('DD MMM YYYY • HH:mm') : 'Not set';
};

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const parseJsonField = (field) => {
  if (!field) return [];
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [field];
    }
  }
  if (Array.isArray(field)) return field;
  return [field];
};

function ProjectAssetsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(() => localStorage.getItem(SELECTED_PROJECT_KEY) || '');
  const [imageZipFiles, setImageZipFiles] = useState([]);
  const [documentZipFile, setDocumentZipFile] = useState(null);
  const [assetEntries, setAssetEntries] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterProject, setFilterProject] = useState('all');

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const { data } = await api.get('/projects?limit=100&page=1');
        const list = Array.isArray(data?.data) ? data.data : [];
        if (list.length) {
          setProjects(list);
          setSelectedProjectId((prev) => prev || list[0].uuid);
          return;
        }
      } catch {
        // fall back to local storage data
      }

      const fallbackProjects = JSON.parse(localStorage.getItem('qtechx-projects') || '[]');
      const safeProjects = Array.isArray(fallbackProjects) ? fallbackProjects : [];
      setProjects(safeProjects);
      if (safeProjects.length && !selectedProjectId) {
        setSelectedProjectId(safeProjects[0].uuid || safeProjects[0].id?.toString());
      }
    };

    loadProjects();
  }, [selectedProjectId]);

  useEffect(() => {
    localStorage.setItem(SELECTED_PROJECT_KEY, selectedProjectId);
  }, [selectedProjectId]);

  useEffect(() => {
    const entries = projects.flatMap((project) => buildAssetEntriesFromProject(project, createId));
    setAssetEntries(entries);
  }, [projects]);

  const selectedProject = useMemo(
    () => projects.find((item) => item.uuid === selectedProjectId || item.id?.toString() === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const selectedProjectAssets = useMemo(
    () => assetEntries.filter((entry) => entry.projectId === (selectedProject?.uuid || selectedProject?.id?.toString())),
    [assetEntries, selectedProject]
  );

  const filteredAssets = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return assetEntries.filter((entry) => {
      const matchesProject = filterProject === 'all' || entry.projectId === filterProject;
      const matchesType =
        filterType === 'all' ||
        (filterType === 'image' && entry.assetType === 'image') ||
        (filterType === 'zip' && entry.assetType === 'zip');

      const matchesSearch =
        !normalizedSearch ||
        entry.fileName.toLowerCase().includes(normalizedSearch) ||
        entry.projectName?.toLowerCase().includes(normalizedSearch);

      return matchesProject && matchesType && matchesSearch;
    });
  }, [assetEntries, searchQuery, filterType, filterProject]);

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const zipFiles = files.filter((file) => /\.(zip|rar|7z)$/i.test(file.name));
    if (!zipFiles.length) return;
    setImageZipFiles(zipFiles);
  };

  const handleZipChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setDocumentZipFile(file);
  };

  const saveAssets = async () => {
    if (!selectedProject) {
      setStatusMessage('Choose a project before uploading files.');
      return;
    }

    if (!imageZipFiles.length && !documentZipFile) {
      setStatusMessage('Please select one or more project ZIP archives or a document ZIP to upload.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Saving project assets...');

    const actorName = user?.username || user?.name || user?.email || 'Admin';
    const now = new Date().toISOString();
    const projectIdentifier = selectedProject.uuid || selectedProject.id?.toString();

    try {
      const formData = new FormData();
      imageZipFiles.forEach((file) => formData.append('project_images', file));
      if (documentZipFile) {
        formData.append('source_code_backup', documentZipFile);
      }
      formData.append('project_name', selectedProject.project_name || selectedProject.projectName || '');
      formData.append('current_status', selectedProject.current_status || selectedProject.currentStatus || 'Planning');

      const response = await api.put(`/projects/${projectIdentifier}`, formData);
      const uploadedProject = response?.data?.data;
      const uploadedImagePaths = uploadedProject?.project_images ? JSON.parse(uploadedProject.project_images || '[]') : [];
      const uploadedZipPath = uploadedProject?.source_code_backup || null;

      setAssetEntries((prev) => {
        const next = [...prev];

        if (documentZipFile) {
          const existingIndex = next.findIndex((item) => item.projectId === projectIdentifier && item.assetType === 'zip' && item.kindLabel === 'Document ZIP');
          const entry = {
            id: createId(),
            projectId: projectIdentifier,
            projectName: selectedProject.project_name || selectedProject.projectName || 'Selected project',
            assetType: 'zip',
            fileName: documentZipFile.name,
            fileSize: documentZipFile.size,
            mimeType: documentZipFile.type || 'application/zip',
            uploadedPath: uploadedZipPath,
            createdAt: existingIndex >= 0 ? next[existingIndex].createdAt : now,
            updatedAt: now,
            createdBy: existingIndex >= 0 ? next[existingIndex].createdBy : actorName,
            updatedBy: actorName,
            kindLabel: 'Document ZIP',
          };
          if (existingIndex >= 0) {
            next[existingIndex] = entry;
          } else {
            next.unshift(entry);
          }
        }

        imageZipFiles.forEach((file) => {
          const existingIndex = next.findIndex((item) => item.projectId === projectIdentifier && item.assetType === 'zip' && item.kindLabel === 'Project image ZIP' && item.fileName === file.name);
          const entry = {
            id: createId(),
            projectId: projectIdentifier,
            projectName: selectedProject.project_name || selectedProject.projectName || 'Selected project',
            assetType: 'zip',
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || 'application/zip',
            uploadedPath:
              Array.isArray(uploadedImagePaths) &&
              uploadedImagePaths.find((path) => typeof path === 'string' && path.endsWith(`/${file.name}`)) ||
              null,
            createdAt: existingIndex >= 0 ? next[existingIndex].createdAt : now,
            updatedAt: now,
            createdBy: existingIndex >= 0 ? next[existingIndex].createdBy : actorName,
            updatedBy: actorName,
            kindLabel: 'Project image ZIP',
          };
          if (existingIndex >= 0) {
            next[existingIndex] = entry;
          } else {
            next.unshift(entry);
          }
        });

        return next;
      });

      setImageZipFiles([]);
      setDocumentZipFile(null);
      setShowPopup(null);
      const message = [];
      if (documentZipFile) message.push('Document ZIP uploaded');
      if (imageZipFiles.length) message.push(`${imageZipFiles.length} project image ZIP${imageZipFiles.length > 1 ? 's' : ''} uploaded`);
      setStatusMessage(message.length ? `${message.join(' and ')} successfully.` : 'Project assets saved successfully.');
    } catch (error) {
      console.error('Failed to save project assets', error);
      setStatusMessage(error?.response?.data?.message || 'Unable to upload files right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async (asset) => {
    if (!asset.uploadedPath) {
      setStatusMessage('File path not available for download.');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    const apiUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
    const backendBase = apiUrl.startsWith('http') ? apiUrl.replace(/\/api$/, '') : '';
    const cleanPath = String(asset.uploadedPath).replace(/^\/*/, '/');
    const url = cleanPath.startsWith('http')
      ? cleanPath
      : cleanPath.startsWith('/api/')
      ? `${apiUrl}${cleanPath}`
      : backendBase
        ? `${backendBase}${cleanPath}`
        : cleanPath;

    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = asset.fileName || cleanPath.split('/').pop() || 'download';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download failed:', err, '→', url);
      setStatusMessage(`Download failed: ${err.message}. Opening in new tab...`);
      setTimeout(() => setStatusMessage(''), 4000);
      window.open(url, '_blank');
    }
  };

  const handleDelete = async (assetId) => {
    const asset = assetEntries.find((a) => a.id === assetId);
    if (!asset) return;
    if (!window.confirm(`Are you sure you want to delete "${asset.fileName}"?`)) return;

    const project = projects.find((item) => item.uuid === asset.projectId || item.id?.toString() === asset.projectId);
    if (!project) {
      setStatusMessage('Unable to find the project for this asset.');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    const normalizePath = (item) => {
      if (!item) return '';
      if (typeof item === 'string') return item;
      if (typeof item === 'object') return item.file_path || item.path || item.url || item.original_name || JSON.stringify(item);
      return String(item);
    };

    const payload = {};
    const projectIdentifier = asset.projectId;
    const assetPath = normalizePath(asset.uploadedPath);
    const existingImages = parseJsonField(project.project_images);

    if (asset.kindLabel?.toLowerCase().includes('document')) {
      payload.source_code_backup = null;
    }

    if (asset.kindLabel?.toLowerCase().includes('project image') || asset.kindLabel?.toLowerCase().includes('image')) {
      const remainingImages = existingImages.filter((item) => {
        const itemPath = normalizePath(item);
        if (!itemPath) return true;
        return itemPath !== assetPath && itemPath !== asset.fileName && !itemPath.endsWith(`/${asset.fileName}`);
      });
      if (remainingImages.length !== existingImages.length) {
        payload.project_images = remainingImages.length ? JSON.stringify(remainingImages) : null;
      }
    }

    if (!Object.keys(payload).length) {
      setAssetEntries((prev) => prev.filter((a) => a.id !== assetId));
      setStatusMessage('Asset removed locally.');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }

    try {
      const response = await api.put(`/projects/${projectIdentifier}`, payload);
      const updatedProject = response?.data?.data || project;
      setProjects((prev) => prev.map((p) => (p.uuid === projectIdentifier || p.id?.toString() === projectIdentifier ? { ...p, ...updatedProject } : p)));
      setAssetEntries((prev) => prev.filter((a) => a.id !== assetId));
      setStatusMessage('Asset deleted successfully.');
    } catch (error) {
      console.error('Failed to delete asset', error);
      setStatusMessage('Unable to delete asset right now. Please try again.');
    } finally {
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  const handleDeleteAll = async () => {
    if (filteredAssets.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete all ${filteredAssets.length} displayed assets?`)) return;

    const assetsByProject = filteredAssets.reduce((grouped, asset) => {
      const projectId = asset.projectId;
      if (!grouped[projectId]) grouped[projectId] = [];
      grouped[projectId].push(asset);
      return grouped;
    }, {});

    const idsToDelete = new Set(filteredAssets.map((a) => a.id));
    let hasFailed = false;

    for (const [projectId, assets] of Object.entries(assetsByProject)) {
      const project = projects.find((item) => item.uuid === projectId || item.id?.toString() === projectId);
      if (!project) continue;

      const payload = {};
      const existingImages = parseJsonField(project.project_images);
      const imageAssets = assets.filter((asset) => asset.kindLabel?.toLowerCase().includes('image'));
      const documentAssets = assets.filter((asset) => asset.kindLabel?.toLowerCase().includes('document') || asset.kindLabel?.toLowerCase().includes('zip'));

      const normalizePath = (item) => {
        if (!item) return '';
        if (typeof item === 'string') return item;
        if (typeof item === 'object') return item.file_path || item.path || item.url || item.original_name || JSON.stringify(item);
        return String(item);
      };

      if (documentAssets.length > 0) {
        payload.source_code_backup = null;
      }

      const imagePathsToRemove = new Set(imageAssets.map((asset) => normalizePath(asset.uploadedPath) || asset.fileName));
      const remainingImages = existingImages.filter((item) => {
        const path = normalizePath(item);
        if (!path) return true;
        return !Array.from(imagePathsToRemove).some((removePath) => path === removePath || path.endsWith(`/${removePath}`) || removePath.endsWith(`/${path}`));
      });

      if (remainingImages.length !== existingImages.length) {
        payload.project_images = remainingImages.length ? JSON.stringify(remainingImages) : null;
      }

      if (Object.keys(payload).length) {
        try {
          const response = await api.put(`/projects/${projectId}`, payload);
          const updatedProject = response?.data?.data;
          if (updatedProject) {
            setProjects((prev) => prev.map((p) => (p.uuid === projectId || p.id?.toString() === projectId ? { ...p, ...updatedProject } : p)));
          }
        } catch (error) {
          console.error('Failed to delete project assets', error);
          hasFailed = true;
        }
      }
    }

    setAssetEntries((prev) => prev.filter((a) => !idsToDelete.has(a.id)));
    setStatusMessage(hasFailed ? 'Some assets could not be deleted. Please refresh and try again.' : 'Assets deleted successfully.');
    setTimeout(() => setStatusMessage(''), 3000);
  };
  
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-linear-to-br from-[#11141d] via-[#0f131b] to-[#111827] p-5 shadow-2xl shadow-black/30">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-orange-400">
              <FolderKanban size={14} />
              Project Assets
            </div>
            <h2 className="text-2xl font-semibold text-white">Upload project images and ZIP documents</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Select a project, upload the relevant files, and keep the created/updated metadata visible for every asset.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPopup('upload')}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
            >
              <UploadCloud size={16} />
              Upload Files
            </button>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
              <span className="text-white">{assetEntries.length}</span> saved assets
            </div>
          </div>
        </div>
      </div>

      {statusMessage ? (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${statusMessage.includes('success') ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-orange-500/20 bg-orange-500/10 text-orange-300'}`}>
          {statusMessage}
        </div>
      ) : null}

      <div className="flex flex-col md:flex-row items-center gap-4 bg-[#11141d] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search by file or project name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0e1118] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48 z-20">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 z-10" />
            <div className="pl-8">
              <Select
                value={[
                  { value: 'all', label: 'All Types' },
                  { value: 'image', label: 'Images' },
                  { value: 'zip', label: 'ZIP Archives' }
                ].find(opt => opt.value === filterType)}
                onChange={(option) => setFilterType(option ? option.value : 'all')}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'image', label: 'Images' },
                  { value: 'zip', label: 'ZIP Archives' }
                ]}
                styles={{
                  ...customSelectStyles,
                  control: (base, state) => ({ ...customSelectStyles.control(base, state), backgroundColor: '#0e1118', minHeight: '38px' })
                }}
                isSearchable={false}
              />
            </div>
          </div>
          
          <div className="relative flex-1 md:w-48 z-10">
            <Select
              value={
                filterProject === 'all' 
                  ? { value: 'all', label: 'All Projects' } 
                  : { value: filterProject, label: projects.find(p => (p.uuid || p.id) === filterProject)?.project_name || projects.find(p => (p.uuid || p.id) === filterProject)?.projectName || 'Project' }
              }
              onChange={(option) => setFilterProject(option ? option.value : 'all')}
              options={[
                { value: 'all', label: 'All Projects' },
                ...projects.map((p) => ({ value: p.uuid || p.id, label: p.project_name || p.projectName || `Project ${p.id}` }))
              ]}
              styles={{
                ...customSelectStyles,
                control: (base, state) => ({ ...customSelectStyles.control(base, state), backgroundColor: '#0e1118', minHeight: '38px' })
              }}
            />
          </div>

          <div className="flex bg-[#0e1118] border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
            >
              <List size={18} />
            </button>
          </div>

          {filteredAssets.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500 hover:text-white transition-colors border border-red-500/20"
              title="Delete all displayed assets"
            >
              <Trash2 size={16} />
              <span className="hidden md:inline">Delete All</span>
            </button>
          )}
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-white/5 bg-white/5">
          <FolderKanban size={48} className="mx-auto text-white/20 mb-4" />
          <h3 className="text-lg font-medium text-white">No assets found</h3>
          <p className="text-sm text-white/40 mt-1">Try adjusting your filters or upload some new files.</p>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#11141d] hover:border-orange-500/30 transition-all duration-300 shadow-lg shadow-black/20">
              <div className="h-40 bg-[#0e1118] relative flex items-center justify-center overflow-hidden">
                {asset.assetType === 'image' && asset.uploadedPath ? (
                  <img src={asset.uploadedPath.startsWith('http') ? asset.uploadedPath : `http://localhost:5000${asset.uploadedPath}`} alt={asset.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : asset.assetType === 'image' ? (
                  <ImageIcon size={48} className="text-white/10" />
                ) : (
                  <FileArchive size={48} className="text-orange-500/20" />
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className="rounded-md border border-white/10 bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {asset.assetType === 'image' ? 'Image' : 'ZIP'}
                  </span>
                  <button onClick={() => handleDownload(asset)} className="rounded-md border border-white/10 bg-black/60 backdrop-blur-md p-1.5 text-white hover:bg-orange-500 hover:border-orange-500 transition-colors shadow-lg" title="Download">
                    <Download size={14} />
                  </button>
                  <button onClick={() => handleDelete(asset.id)} className="rounded-md border border-white/10 bg-black/60 backdrop-blur-md p-1.5 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors shadow-lg" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col p-4 flex-1">
                <h4 className="text-sm font-medium text-white truncate" title={asset.fileName}>{asset.fileName}</h4>
                <p className="text-xs text-orange-400/80 mt-1 truncate">{asset.projectName}</p>
                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-white/40">
                  <span className="flex items-center gap-1"><Clock3 size={12} /> {formatDate(asset.createdAt).split('•')[0]}</span>
                  <span>{(asset.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#11141d] shadow-2xl">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-white/50">
              <tr>
                <th className="px-6 py-4 font-medium">Preview</th>
                <th className="px-6 py-4 font-medium">File Name</th>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Size</th>
                <th className="px-6 py-4 font-medium">Upload Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-3">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-[#0e1118] flex items-center justify-center border border-white/10">
                      {asset.assetType === 'image' && asset.uploadedPath ? (
                        <img src={asset.uploadedPath.startsWith('http') ? asset.uploadedPath : `http://localhost:5000${asset.uploadedPath}`} alt={asset.fileName} className="h-full w-full object-cover" />
                      ) : asset.assetType === 'image' ? (
                        <ImageIcon size={20} className="text-white/20" />
                      ) : (
                        <FileArchive size={20} className="text-orange-500/40" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="max-w-[200px] truncate" title={asset.fileName}>{asset.fileName}</div>
                  </td>
                  <td className="px-6 py-4 text-orange-200/70">{asset.projectName}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
                      {asset.assetType === 'image' ? 'Image' : 'ZIP'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{(asset.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white/40">{formatDate(asset.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleDownload(asset)} className="inline-flex items-center justify-center rounded-lg p-2 text-white/40 hover:bg-white/10 hover:text-white transition-colors" title="Download">
                        <Download size={16} />
                      </button>
                      <button onClick={() => handleDelete(asset.id)} className="inline-flex items-center justify-center rounded-lg p-2 text-red-400/70 hover:bg-red-500/20 hover:text-red-400 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {showPopup && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/20 bg-[#151923] p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-white">
                Upload Project Assets
              </h3>
              <button onClick={() => setShowPopup(null)} className="text-white/50 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/3 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Project selection</h3>
            </div>

            <label className="block text-sm text-white/70">
              <span className="mb-2 block">Select project</span>
              <Select
                value={
                  selectedProjectId 
                    ? { value: selectedProjectId, label: projects.find(p => (p.uuid || p.id) === selectedProjectId)?.project_name || projects.find(p => (p.uuid || p.id) === selectedProjectId)?.projectName || 'Project' }
                    : null
                }
                onChange={(option) => setSelectedProjectId(option ? option.value : '')}
                options={projects.map((p) => ({ value: p.uuid || p.id, label: p.project_name || p.projectName || `Project ${p.id}` }))}
                styles={{
                  ...customSelectStyles,
                  control: (base, state) => ({ ...customSelectStyles.control(base, state), backgroundColor: '#0e1118' })
                }}
              />
            </label>

            {selectedProject ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#0e1118] p-4 text-sm text-white/70">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-white">{selectedProject.project_name || selectedProject.projectName}</p>
                    <p className="mt-1 text-xs text-white/50">{selectedProject.client_name || selectedProject.clientName || 'No client assigned yet'}</p>
                  </div>
                  <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-400">
                    {selectedProject.current_status || selectedProject.currentStatus || 'Planning'}
                  </span>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/3 p-5">
            <div className="mb-4 flex items-center gap-2">
              <UploadCloud size={16} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Upload files</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="rounded-2xl border border-dashed border-white/15 bg-[#0e1118] p-4 text-sm text-white/70">
                <div className="mb-3 flex items-center gap-2 text-white">
                  <FileImage size={16} className="text-orange-400" />
                  Project images
                </div>
                <div className="flex flex-col gap-3">
                  <input
                    id="project-images-input"
                    type="file"
                    accept=".zip,application/zip"
                    multiple
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="project-images-input" className="inline-flex cursor-pointer items-center justify-center rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
                    Choose ZIP archive(s)
                  </label>
                  {imageZipFiles.length ? (
                    <div className="rounded-2xl border border-white/10 bg-[#111827] px-3 py-3 text-xs text-white/60">
                      <div className="font-semibold text-white">Selected images</div>
                      <ul className="mt-2 max-h-36 overflow-auto space-y-1 text-xs text-white/50">
                        {imageZipFiles.map((file) => (
                          <li key={`${file.name}-${file.size}`}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-white/40">ZIP archives only. Select one or more ZIP files to upload project image bundles.</p>
                  )}
                </div>
              </label>

              <label className="rounded-2xl border border-dashed border-white/15 bg-[#0e1118] p-4 text-sm text-white/70">
                <div className="mb-3 flex items-center gap-2 text-white">
                  <FileArchive size={16} className="text-orange-400" />
                  ZIP documents
                </div>
                <input type="file" accept=".zip,.rar,.7z,application/zip" className="block w-full text-sm text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-orange-500/15 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-orange-400" onChange={handleZipChange} />
                {documentZipFile ? <p className="mt-3 text-xs text-white/50">Selected: {documentZipFile.name}</p> : <p className="mt-3 text-xs text-white/40">Upload a ZIP bundle of project documents.</p>}
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={saveAssets}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UploadCloud size={16} />
                {isSaving ? 'Saving...' : 'Save assets'}
              </button>
              <span className="text-sm text-white/50">The latest file replaces the previous version for the same project and file type.</span>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/3 p-5">
            <div className="mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Preview</h3>
            </div>

            {imageZipFiles.length ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/10 bg-[#0e1118] p-4 text-sm text-white/70">
                  <p className="text-white font-semibold">Selected project image ZIPs</p>
                  <ul className="mt-2 space-y-2 text-sm text-white/60">
                    {imageZipFiles.map((file) => (
                      <li key={`${file.name}-${file.size}`} className="truncate">• {file.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#0e1118] text-center text-sm text-white/50">
                Select one or more project image ZIP files to preview the upload list here.
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/3 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Clock3 size={16} className="text-orange-400" />
              <h3 className="text-lg font-semibold text-white">Asset metadata</h3>
            </div>

            {selectedProjectAssets.length ? (
              <div className="space-y-3">
                {selectedProjectAssets.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/10 bg-[#0e1118] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{entry.kindLabel}</p>
                        <p className="mt-1 text-sm text-white/60">{entry.fileName}</p>
                      </div>
                      <div className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-400">
                        {entry.assetType === 'image' ? 'Image' : 'Zip'}
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Created at</p>
                        <p className="mt-1 text-sm text-white/80">{formatDate(entry.createdAt)}</p>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Updated at</p>
                        <p className="mt-1 text-sm text-white/80">{formatDate(entry.updatedAt)}</p>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Created by</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-white/80">
                          <UserRound size={14} className="text-orange-400" />
                          {entry.createdBy}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white/5 p-3">
                        <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Updated by</p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-white/80">
                          <UserRound size={14} className="text-orange-400" />
                          {entry.updatedBy}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 bg-[#0e1118] p-6 text-center text-sm text-white/50">
                No assets have been uploaded for this project yet.
              </div>
            )}
          </section>
        </div>
      </div>
            
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ProjectAssetsPage;
