import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../PrivateRouter/AuthContext';
import { useLocation } from 'react-router-dom';
import Select from 'react-select';
import api from '../../api';
import dayjs from 'dayjs';
import {
  Archive,
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileArchive,
  FileImage,
  Filter,
  FolderKanban,
  LayoutGrid,
  List,
  X,
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

    const backendAssetType = (typeof actualItem === 'object' && actualItem !== null) ? actualItem.asset_type : null;
    const isImage = backendAssetType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath || fileName || '');

    entries.push({
      id: createId(),
      projectId,
      projectName,
      assetType: backendAssetType || (isImage ? 'image' : 'zip'),
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
  const location = useLocation();
  const apiUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
  const backendBase = apiUrl.startsWith('http') ? apiUrl.replace(/\/api$/, '') : '';
  const isImageRoute = location.pathname.endsWith('/images');
  const isDocumentsRoute = location.pathname.endsWith('/documents');

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(() => localStorage.getItem(SELECTED_PROJECT_KEY) || '');
  const [imageZipFiles, setImageZipFiles] = useState([]);
  const [documentZipFile, setDocumentZipFile] = useState(null);
  const [assetEntries, setAssetEntries] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(null);
  const [viewMode, setViewMode] = useState(isImageRoute ? 'card' : 'table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState(isImageRoute ? 'project_image' : isDocumentsRoute ? 'zip' : 'all');
  const [filterProject, setFilterProject] = useState('all');

  const pageTitle = useMemo(() => {
    if (isImageRoute) return 'Project Images';
    if (isDocumentsRoute) return 'Project Documents';
    return 'Project Assets';
  }, [isImageRoute, isDocumentsRoute]);

  const resolveUploadPath = (uploadedPath) => {
    if (!uploadedPath) return null;
    const rawPath = String(uploadedPath).trim();
    if (rawPath.startsWith('http')) return rawPath;
    const cleanPath = rawPath.replace(/^\/*/, '/');
    if (cleanPath.startsWith('/api/')) return `${apiUrl}${cleanPath}`;
    if (backendBase) return `${backendBase}${cleanPath}`;
    return cleanPath;
  };

  useEffect(() => {
    if (isImageRoute) {
      setFilterType('project_image');
      setViewMode('card');
      return;
    }
    if (isDocumentsRoute) {
      setFilterType('zip');
      setViewMode('table');
      return;
    }
  }, [isImageRoute, isDocumentsRoute]);

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
        (filterType === 'project_image' && entry.kindLabel === 'Project Image') ||
        (filterType === 'image' && entry.assetType === 'image') ||
        (filterType === 'zip' && (entry.kindLabel === 'Document ZIP' || (entry.assetType === 'zip' && entry.kindLabel !== 'Project Image')));

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
    <div className="space-y-5 pb-10 text-white min-h-screen">
      {statusMessage && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 border text-sm font-medium px-5 py-3 rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-300 ${statusMessage.includes('success') ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/15 border-rose-500/30 text-rose-400'}`}>
          {statusMessage.includes('success') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} 
          {statusMessage}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center">
            <FolderKanban size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{pageTitle}</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''} displayed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPopup('upload')}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition shadow-lg shadow-primary/25 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
          >
            <UploadCloud size={15} /> Upload Files
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search by file or project name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 transition"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <div className="flex items-center gap-3">
          <div className="w-40 z-20">
            <Select
              value={[
                { value: 'all', label: 'All Types' },
                { value: 'project_image', label: 'Project Images' },
                { value: 'image', label: 'Images (Direct)' },
                { value: 'zip', label: 'ZIP Archives' }
              ].find(opt => opt.value === filterType)}
              onChange={(option) => setFilterType(option ? option.value : 'all')}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'project_image', label: 'Project Images' },
                { value: 'image', label: 'Images (Direct)' },
                { value: 'zip', label: 'ZIP Archives' }
              ]}
              styles={{
                ...customSelectStyles,
                control: (base, state) => ({ ...customSelectStyles.control(base, state), backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' })
              }}
              isSearchable={false}
            />
          </div>
          
          <div className="w-48 z-10">
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
                control: (base, state) => ({ ...customSelectStyles.control(base, state), backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' })
              }}
            />
          </div>
        </div>

        {filteredAssets.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500 hover:text-white transition border border-rose-500/20"
            title="Delete all displayed assets"
          >
            <Trash2 size={13} />
            <span className="hidden md:inline">Delete All</span>
          </button>
        )}

        {/* View toggle */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === 'table' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            title="Table View"
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${
              viewMode === 'card' ? 'bg-primary text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
            title="Card View"
          >
            <LayoutGrid size={15} />
          </button>
        </div>
      </div>

      {/* ── Empty State ── */}
      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-white/30">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Archive size={30} className="opacity-40" />
          </div>
          <p className="text-base font-semibold text-white/40">No assets found</p>
          <p className="text-xs mt-1">Try adjusting your filters or upload some new files.</p>
          <button
            onClick={() => setShowPopup('upload')}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
            <UploadCloud size={14} /> Upload Files
          </button>
        </div>
      ) : viewMode === 'card' ? (
        /* ── Card Mode ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="group flex flex-col overflow-hidden bg-white/[0.03] border border-white/8 rounded-2xl hover:bg-white/[0.06] transition cursor-pointer relative">
              <div className="h-40 bg-black/20 relative flex items-center justify-center overflow-hidden">
                {asset.assetType === 'image' && asset.uploadedPath ? (
                  <img src={resolveUploadPath(asset.uploadedPath)} alt={asset.fileName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : asset.assetType === 'image' ? (
                  <ImageIcon size={48} className="text-white/10" />
                ) : asset.kindLabel === 'Project Image' ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileImage size={40} className="text-sky-400/40" />
                    <span className="text-[10px] text-white/30">Image Archive</span>
                  </div>
                ) : (
                  <FileArchive size={48} className="text-primary/20" />
                )}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button onClick={() => handleDownload(asset)} className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition shadow-lg" title="Download">
                    <Download size={13} />
                  </button>
                  <button onClick={() => handleDelete(asset.id)} className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-rose-400 hover:bg-rose-500 hover:text-white transition shadow-lg" title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    asset.kindLabel === 'Project Image' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : asset.assetType === 'image' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {asset.kindLabel === 'Project Image' ? 'Project Image' : asset.assetType === 'image' ? 'Image' : 'ZIP'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col p-4 flex-1">
                <h4 className="text-sm font-semibold text-white truncate" title={asset.fileName}>{asset.fileName}</h4>
                <p className="text-xs text-white/40 mt-1 truncate flex items-center gap-1.5"><FolderKanban size={10} /> {asset.projectName}</p>
                <div className="mt-auto pt-4 flex items-center justify-between text-[11px] text-white/30 font-semibold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><Clock3 size={11} /> {formatDate(asset.createdAt).split('•')[0]}</span>
                  <span>{(asset.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Table Mode ── */
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/8">
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Preview</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">File Name</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Project</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Type</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Size</th>
                  <th className="text-left text-[10px] font-bold text-white/35 uppercase tracking-widest px-4 py-3.5">Upload Date</th>
                  <th className="text-right text-[10px] font-bold text-white/35 uppercase tracking-widest px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors group">
                    <td className="px-5 py-3">
                      <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                        {asset.assetType === 'image' && asset.uploadedPath ? (
                          <img src={resolveUploadPath(asset.uploadedPath)} alt={asset.fileName} className="h-full w-full object-cover" />
                        ) : asset.assetType === 'image' ? (
                          <ImageIcon size={18} className="text-white/20" />
                        ) : (
                          <FileArchive size={18} className="text-primary/40" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-white font-semibold text-sm truncate max-w-[200px]" title={asset.fileName}>{asset.fileName}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-white/60 text-xs flex items-center gap-1.5"><FolderKanban size={11} /> {asset.projectName}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        asset.kindLabel === 'Project Image' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                        : asset.assetType === 'image' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      }`}>
                        {asset.kindLabel === 'Project Image' ? 'Project Image' : asset.assetType === 'image' ? 'Image' : 'ZIP'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-white/50">
                      {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="px-4 py-3.5 text-xs text-white/50">
                      {formatDate(asset.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleDownload(asset)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition" title="Download">
                          <Download size={14} />
                        </button>
                        <button onClick={() => handleDelete(asset.id)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 flex items-center justify-center text-rose-400/70 hover:text-rose-400 transition" title="Delete">
                          <Trash2 size={14} />
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

      {/* ── Upload Modal ── */}
      {showPopup === 'upload' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPopup(null)} />
          <div className="relative bg-[#111318] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <UploadCloud size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Upload Project Assets</h3>
                  <p className="text-white/40 text-xs mt-0.5">Add images and documents to a project</p>
                </div>
              </div>
              <button onClick={() => setShowPopup(null)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition">
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              
              {/* Project Selection */}
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">1. Select Project</p>
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
                    control: (base, state) => ({ ...customSelectStyles.control(base, state), backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' })
                  }}
                  placeholder="Select a project..."
                />
                {selectedProject && (
                  <div className="mt-3 flex items-center justify-between bg-white/5 border border-white/8 rounded-xl px-4 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-white">{selectedProject.project_name || selectedProject.projectName}</p>
                      <p className="text-[10px] text-white/40">{selectedProject.client_name || selectedProject.clientName || 'No client assigned'}</p>
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/60 border border-white/10">
                      {selectedProject.current_status || selectedProject.currentStatus || 'Planning'}
                    </span>
                  </div>
                )}
              </div>

              {/* File Uploads */}
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">2. Upload Files</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex flex-col bg-white/[0.02] border border-white/8 border-dashed rounded-xl p-4 hover:bg-white/[0.04] transition cursor-pointer group">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                      <FileImage size={16} className="text-primary" /> Project Images (ZIP)
                    </div>
                    <input
                      id="project-images-input"
                      type="file"
                      accept=".zip,application/zip"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <div className="mt-auto flex flex-col items-start gap-3">
                      <div className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/60 group-hover:bg-primary/20 group-hover:text-primary transition font-semibold">
                        Choose ZIP(s)
                      </div>
                      {imageZipFiles.length > 0 ? (
                        <div className="w-full text-[11px] text-white/50 space-y-1 bg-black/20 p-2 rounded-lg">
                          <p className="text-white/70 font-semibold mb-1">Selected:</p>
                          {imageZipFiles.map((file) => (
                            <div key={`${file.name}-${file.size}`} className="truncate">• {file.name}</div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-white/40 leading-relaxed">Select one or more ZIP archives containing project images.</p>
                      )}
                    </div>
                  </label>

                  <label className="flex flex-col bg-white/[0.02] border border-white/8 border-dashed rounded-xl p-4 hover:bg-white/[0.04] transition cursor-pointer group">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                      <FileArchive size={16} className="text-primary" /> Documents (ZIP)
                    </div>
                    <input type="file" accept=".zip,.rar,.7z,application/zip" className="hidden" onChange={handleZipChange} />
                    <div className="mt-auto flex flex-col items-start gap-3">
                      <div className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/60 group-hover:bg-primary/20 group-hover:text-primary transition font-semibold">
                        Choose Document
                      </div>
                      {documentZipFile ? (
                        <div className="w-full text-[11px] text-white/50 bg-black/20 p-2 rounded-lg truncate">
                          <span className="text-white/70 font-semibold">Selected:</span><br/>{documentZipFile.name}
                        </div>
                      ) : (
                        <p className="text-[10px] text-white/40 leading-relaxed">Upload a single ZIP bundle containing source code or project docs.</p>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-white/8 bg-black/20 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowPopup(null)}
                disabled={isSaving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={saveAssets}
                disabled={isSaving || (!imageZipFiles.length && !documentZipFile)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <UploadCloud size={15} /> Save Assets
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}

export default ProjectAssetsPage;
