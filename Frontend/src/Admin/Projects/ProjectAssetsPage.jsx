import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../PrivateRouter/AuthContext';
import api from '../../api';
import dayjs from 'dayjs';
import {
  Archive,
  CheckCircle2,
  Clock3,
  FileArchive,
  FileImage,
  FolderKanban,
  Sparkles,
  UploadCloud,
  UserRound,
} from 'lucide-react';

const STORAGE_KEY = 'qtechx-project-assets';

const readStoredAssets = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
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

function ProjectAssetsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [zipFile, setZipFile] = useState(null);
  const [zipSource, setZipSource] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [assetEntries, setAssetEntries] = useState(readStoredAssets);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(null);

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assetEntries));
  }, [assetEntries]);

  const selectedProject = useMemo(
    () => projects.find((item) => item.uuid === selectedProjectId || item.id?.toString() === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const selectedProjectAssets = useMemo(
    () => assetEntries.filter((entry) => entry.projectId === (selectedProject?.uuid || selectedProject?.id?.toString())),
    [assetEntries, selectedProject]
  );

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const selectedImages = [];
    let selectedZip = zipFile;

    files.forEach((file) => {
      if (file.type === 'application/zip' || /\.(zip|rar|7z)$/i.test(file.name)) {
        selectedZip = file;
      } else {
        selectedImages.push(file);
      }
    });

    if (selectedImages.length) {
      setImageFiles(selectedImages);
    }
    if (selectedZip) {
      setZipFile(selectedZip);
    }

    const previewFile = selectedImages[0] || files[0];
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(previewFile);
  };

  const handleZipChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setZipFile(file);
  };

  const saveAssets = async () => {
    if (!selectedProject) {
      setStatusMessage('Choose a project before uploading files.');
      return;
    }

    if (!imageFiles.length && !zipFile) {
      setStatusMessage('Please select one or more images and/or a ZIP document to upload.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Saving project assets...');

    const actorName = user?.username || user?.name || user?.email || 'Admin';
    const now = new Date().toISOString();
    const projectIdentifier = selectedProject.uuid || selectedProject.id?.toString();

    try {
      const formData = new FormData();
      imageFiles.forEach((file) => formData.append('project_images', file));
      if (zipFile) {
        if (zipSource === 'image') {
          formData.append('project_images', zipFile);
        } else {
          formData.append('source_code_backup', zipFile);
        }
      }
      formData.append('project_name', selectedProject.project_name || selectedProject.projectName || '');
      formData.append('current_status', selectedProject.current_status || selectedProject.currentStatus || 'Planning');

      const response = await api.put(`/projects/${projectIdentifier}`, formData);
      const uploadedProject = response?.data?.data;
      const uploadedImagePaths = uploadedProject?.project_images ? JSON.parse(uploadedProject.project_images || '[]') : [];
      const uploadedZipPath = uploadedProject?.source_code_backup || null;

      setAssetEntries((prev) => {
        const next = [...prev];

        if (zipFile) {
          const existingIndex = next.findIndex((item) => item.projectId === projectIdentifier && item.assetType === 'zip');
          const entry = {
            id: createId(),
            projectId: projectIdentifier,
            projectName: selectedProject.project_name || selectedProject.projectName || 'Selected project',
            assetType: 'zip',
            fileName: zipFile.name,
            fileSize: zipFile.size,
            mimeType: zipFile.type || 'application/zip',
            uploadedPath: uploadedZipPath,
            createdAt: existingIndex >= 0 ? next[existingIndex].createdAt : now,
            updatedAt: now,
            createdBy: existingIndex >= 0 ? next[existingIndex].createdBy : actorName,
            updatedBy: actorName,
            kindLabel: 'ZIP documents',
          };
          if (existingIndex >= 0) {
            next[existingIndex] = entry;
          } else {
            next.unshift(entry);
          }
        }

        imageFiles.forEach((file) => {
          const existingIndex = next.findIndex((item) => item.projectId === projectIdentifier && item.assetType === 'image' && item.fileName === file.name);
          const entry = {
            id: createId(),
            projectId: projectIdentifier,
            projectName: selectedProject.project_name || selectedProject.projectName || 'Selected project',
            assetType: 'image',
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type || 'image/*',
            uploadedPath: uploadedImagePaths.find((path) => path.endsWith(`/${file.name}`)) || null,
            createdAt: existingIndex >= 0 ? next[existingIndex].createdAt : now,
            updatedAt: now,
            createdBy: existingIndex >= 0 ? next[existingIndex].createdBy : actorName,
            updatedBy: actorName,
            kindLabel: 'Project image',
          };
          if (existingIndex >= 0) {
            next[existingIndex] = entry;
          } else {
            next.unshift(entry);
          }
        });

        return next;
      });

      setImageFiles([]);
      setZipFile(null);
      setImagePreview('');
      const message = [];
      if (zipFile) message.push('ZIP uploaded');
      if (imageFiles.length) message.push(`${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} uploaded`);
      setStatusMessage(message.length ? `${message.join(' and ')} successfully.` : 'Project assets saved successfully.');
    } catch (error) {
      console.error('Failed to save project assets', error);
      setStatusMessage(error?.response?.data?.message || 'Unable to upload files right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
              <select
                className="w-full rounded-2xl border border-white/10 bg-[#0e1118] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/70"
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
              >
                {projects.map((project) => (
                  <option key={project.uuid || project.id} value={project.uuid || project.id}>
                    {project.project_name || project.projectName || `Project ${project.id}`}
                  </option>
                ))}
              </select>
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
                    accept="image/*,.zip,application/zip"
                    multiple
                    webkitdirectory
                    directory
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="project-images-input" className="inline-flex cursor-pointer items-center justify-center rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
                    Choose image files, folder, or ZIP
                  </label>
                  {imageFiles.length ? (
                    <div className="rounded-2xl border border-white/10 bg-[#111827] px-3 py-3 text-xs text-white/60">
                      <div className="font-semibold text-white">Selected images</div>
                      <ul className="mt-2 max-h-36 overflow-auto space-y-1 text-xs text-white/50">
                        {imageFiles.map((file) => (
                          <li key={`${file.name}-${file.size}`}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-white/40">PNG, JPG, WEBP and other image formats are supported. You can select multiple images, a folder, or a ZIP archive if your browser supports it.</p>
                  )}
                </div>
              </label>

              <label className="rounded-2xl border border-dashed border-white/15 bg-[#0e1118] p-4 text-sm text-white/70">
                <div className="mb-3 flex items-center gap-2 text-white">
                  <FileArchive size={16} className="text-orange-400" />
                  ZIP documents
                </div>
                <input type="file" accept=".zip,.rar,.7z,application/zip" className="block w-full text-sm text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-orange-500/15 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-orange-400" onChange={handleZipChange} />
                {zipFile ? <p className="mt-3 text-xs text-white/50">Selected: {zipFile.name}</p> : <p className="mt-3 text-xs text-white/40">Upload a ZIP bundle of project documents.</p>}
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

            {imagePreview ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e1118]">
                  <img src={imagePreview} alt="Preview" className="h-56 w-full object-cover" />
                </div>
                {imageFiles.length > 1 ? (
                  <div className="rounded-2xl border border-white/10 bg-[#0e1118] p-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Selected images</p>
                    <ul className="mt-2 space-y-1 text-sm text-white/70">
                      {imageFiles.map((file) => (
                        <li key={file.name} className="truncate">• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#0e1118] text-center text-sm text-white/50">
                Your selected image preview will appear here.
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
