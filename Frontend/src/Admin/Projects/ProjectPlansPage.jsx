import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api';
import dayjs from 'dayjs';
import {
  Box,
  Building2,
  CheckCircle2,
  ClipboardList,
  Code2,
  Copy,
  Edit3,
  Eye,
  FileText,
  Filter,
  Layers,
  RefreshCw,
  Plus,
  Search,
  Server,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

const pageSize = 8;

const createEmptyForm = () => ({
  planName: '',
  planCode: '',
  category: 'Website',
  shortDescription: '',
  fullDescription: '',
  hostingIncluded: 'Yes',
  hostingType: 'Cloud Hosting',
  storageLimit: '50 GB',
  bandwidthLimit: '200 GB',
  freeSsl: 'Yes',
  freeEmailAccounts: '5',
  dailyBackup: 'Yes',
  hostingDuration: '12 Months',
  domainIncluded: 'Yes',
  domainExtension: '.com',
  domainValidity: '1 Year',
  freeRenewal: 'Yes',
  whoisPrivacy: 'Yes',
  freeMaintenance: 'Yes',
  maintenanceDuration: '6 Months',
  bugFixesIncluded: 'Yes',
  securityUpdates: 'Yes',
  performanceOptimization: 'Yes',
  backupSupport: 'Yes',
  emailSupport: 'Yes',
  phoneSupport: 'Yes',
  whatsappSupport: 'No',
  liveChat: 'Yes',
  prioritySupport: 'No',
  dedicatedProjectManager: 'No',
  supportDuration: '6 Months',
  responseSla: '24 Hours',
  sourceCode: 'Yes',
  documentation: 'Yes',
  installationGuide: 'Yes',
  apiDocumentation: 'No',
  userManual: 'Yes',
  adminManual: 'Yes',
  trainingSession: 'No',
  deployment: 'Yes',
  testingReport: 'Yes',
  featuredBadge: 'Recommended',
  status: 'Active',
  coverImage: '',
  planDocument: null,
  planDocumentName: '',
  newTech: '',
  newModuleTitle: '',
  newModuleDuration: '',
  newModuleDescription: '',
  newModuleDocumentName: '',
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  adminNotes: '',
  salesNotes: '',
  technicalNotes: '',
  includedModules: [],
  technologyStack: [],
  modules: [],
  activeProjectsUsingPlan: 0,
  completedProjectsUsingPlan: 0,
  createdBy: 'Admin',
  projectId: '',
  projectCode: '',
});

const selectClasses = 'w-full rounded-xl border border-white/10 bg-[#0f141d] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/70';
const fieldClasses = 'w-full rounded-xl border border-white/10 bg-[#0f141d] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/70';

const parseJsonField = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const parseModulesField = (val, includedModules = []) => {
  const parsed = parseJsonField(val);
  if (Array.isArray(parsed) && parsed.every((item) => item && typeof item === 'object')) {
    return parsed.map((item) => ({
      title: item.title || '',
      duration: item.duration || '',
      description: item.description || '',
      documentName: item.documentName || item.document || '',
    }));
  }
  if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
    return parsed.map((title) => ({ title, duration: '', description: '', documentName: '' }));
  }
  if (Array.isArray(includedModules) && includedModules.length) {
    return includedModules.map((title) => ({ title, duration: '', description: '', documentName: '' }));
  }
  return [];
};

const generatePlanCode = (existingPlans = []) => {
  const existingCodes = new Set(existingPlans.map((plan) => String(plan.planCode || '').toUpperCase()));
  let nextIndex = existingPlans.length + 1;
  let candidate = `PLAN-${String(nextIndex).padStart(3, '0')}`;
  while (existingCodes.has(candidate)) {
    nextIndex += 1;
    candidate = `PLAN-${String(nextIndex).padStart(3, '0')}`;
  }
  return candidate;
};

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return dayjs(value).isValid() ? dayjs(value).format('DD MMM YYYY • HH:mm') : value;
  } catch {
    return value;
  }
};

const statusStyles = {
  Active: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  Inactive: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
  Draft: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
};

const categories = ['Website', 'Web Application', 'Mobile Application', 'ERP', 'CRM', 'SaaS', 'E-commerce'];
const statuses = ['Draft', 'Active', 'Inactive'];
const featuredBadges = ['Popular', 'Recommended', 'Best Seller', 'Premium', 'Enterprise', 'New Launch'];

const initialPlans = [];
function ProjectPlansPage() {
  const [plans, setPlans] = useState(initialPlans);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedFeatured, setSelectedFeatured] = useState('All');
  const [sortBy, setSortBy] = useState('updatedAtDesc');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState('create');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState('');
  const [formData, setFormData] = useState(createEmptyForm());
  const [projectsList, setProjectsList] = useState([]);
  const [editingModuleIndex, setEditingModuleIndex] = useState(null);
  const [showAddModuleForm, setShowAddModuleForm] = useState(false);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await api.get('/project-plans');
        const fetchedPlans = Array.isArray(response?.data?.data) ? response.data.data : [];

        // Normalize fields that may be returned as JSON strings by the backend
        const parseField = (val) => {
          if (!val) return [];
          if (Array.isArray(val)) return val;
          if (typeof val === 'string') {
            try {
              const parsed = JSON.parse(val);
              return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
              // fallback: split comma-separated string
              return val.split(',').map((s) => s.trim()).filter(Boolean);
            }
          }
          return [];
        };

        const normalized = fetchedPlans.map((plan) => {
          const parsedIncludedModules = parseField(plan.includedModules);
          return {
            ...plan,
            includedModules: parsedIncludedModules,
            technologyStack: parseField(plan.technologyStack),
            modules: parseModulesField(plan.modules, parsedIncludedModules),
          };
        });

        setPlans(normalized);
        setBackendAvailable(true);
      } catch (error) {
        console.warn('Project plans API unavailable', error);
        setBackendAvailable(false);
      }
    };

    loadPlans();
  }, []);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await api.get('/projects?limit=1000&page=1');
        if (response?.data?.data) {
          setProjectsList(response.data.data.filter((p) => p.current_status !== 'Cancelled'));
        }
      } catch (error) {
        console.warn('Projects API unavailable', error);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(() => {
    const total = plans.length;
    const active = plans.filter((plan) => plan.status === 'Active').length;
    const inactive = plans.filter((plan) => plan.status === 'Inactive').length;
    const drafts = plans.filter((plan) => plan.status === 'Draft').length;
    const featured = plans.filter((plan) => Boolean(plan.featuredBadge)).length;
    const popular = plans.reduce((acc, plan) => (plan.activeProjectsUsingPlan > acc.activeProjectsUsingPlan ? plan : acc), plans[0] ?? { activeProjectsUsingPlan: 0 });
    const activeProjects = plans.reduce((sum, plan) => sum + (Number(plan.activeProjectsUsingPlan) || 0), 0);

    return {
      total,
      active,
      inactive,
      drafts,
      featured,
      popular: popular?.planName || 'None',
      activeProjects,
    };
  }, [plans]);

  const filteredPlans = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...plans]
      .filter((plan) => {
        const matchesQuery = !query || [plan.planName, plan.planId, plan.planCode].some((value) => String(value).toLowerCase().includes(query));
        const matchesCategory = selectedCategory === 'All' || plan.category === selectedCategory;
        const matchesStatus = selectedStatus === 'All' || plan.status === selectedStatus;
        const matchesFeatured = selectedFeatured === 'All' || plan.featuredBadge === selectedFeatured;

        return matchesQuery && matchesCategory && matchesStatus && matchesFeatured;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'nameAsc':
            return a.planName.localeCompare(b.planName);
          case 'nameDesc':
            return b.planName.localeCompare(a.planName);
          case 'createdAtAsc':
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          case 'createdAtDesc':
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case 'updatedAtAsc':
            return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
          default:
            return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        }
      });
  }, [plans, searchQuery, selectedCategory, selectedStatus, selectedFeatured, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, selectedFeatured, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredPlans.length / pageSize));
  const pagedPlans = filteredPlans.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const resetForm = () => {
    setFormData(createEmptyForm());
    setCurrentPlan(null);
    setMode('create');
    setEditingModuleIndex(null);
    setShowAddModuleForm(false);
  };

  const openCreateDrawer = () => {
    resetForm();
    setFormData((prev) => ({
      ...prev,
      planCode: generatePlanCode(plans),
    }));
    setDrawerOpen(true);
  };

  const openEditDrawer = (plan) => {
    setMode('edit');
    setCurrentPlan(plan);
    setEditingModuleIndex(null);
    setShowAddModuleForm(false);
    setFormData({
      ...createEmptyForm(),
      ...plan,
      includedModules: [...(plan.includedModules || [])],
      technologyStack: [...(plan.technologyStack || [])],
      modules: Array.isArray(plan.modules)
        ? plan.modules.map((module) => ({
            title: module.title || '',
            duration: module.duration || '',
            description: module.description || '',
            documentName: module.documentName || module.document || '',
          }))
        : (plan.includedModules || []).map((title) => ({ title, duration: '', description: '', documentName: '' })),
      coverImage: plan.coverImage || '',
    });
    setDrawerOpen(true);
  };

  const openViewDrawer = (plan) => {
    setMode('view');
    setCurrentPlan(plan);
    setEditingModuleIndex(null);
    setFormData({
      ...createEmptyForm(),
      ...plan,
      includedModules: [...(plan.includedModules || [])],
      technologyStack: [...(plan.technologyStack || [])],
      modules: Array.isArray(plan.modules)
        ? plan.modules.map((module) => ({
            title: module.title || '',
            duration: module.duration || '',
            description: module.description || '',
            documentName: module.documentName || module.document || '',
          }))
        : (plan.includedModules || []).map((title) => ({ title, duration: '', description: '', documentName: '' })),
      coverImage: plan.coverImage || '',
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrentPlan(null);
    setMode('create');
    setFormData(createEmptyForm());
    setEditingModuleIndex(null);
    setShowAddModuleForm(false);
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    if (name === 'projectId') {
      const selectedProject = projectsList.find((project) => String(project.uuid) === String(value));
      setFormData((prev) => ({
        ...prev,
        projectId: value,
        projectCode: selectedProject?.project_code || selectedProject?.projectCode || '',
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (field === 'planDocument') {
      setFormData((prev) => ({ ...prev, planDocument: file, planDocumentName: file.name }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, [field]: reader.result, [`${field}Name`]: file.name }));
    };
    reader.readAsDataURL(file);
  };

  const handleModuleDocumentSelection = (event, target = 'add') => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (target === 'edit') {
      setFormData((prev) => ({ ...prev, newModuleDocumentName: file.name }));
      return;
    }
    setFormData((prev) => ({ ...prev, newModuleDocumentName: file.name }));
  };

  const addChoice = (field, value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (formData[field].includes(trimmed)) {
      setToast(`${field} already exists.`);
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], trimmed] }));
  };

  const removeChoice = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field].filter((item) => item !== value) }));
  };

  const addModule = () => {
    const title = formData.newModuleTitle.trim();
    const duration = formData.newModuleDuration.trim();
    const description = formData.newModuleDescription.trim();
    const documentName = formData.newModuleDocumentName.trim();
    if (!title || !duration) {
      setToast('Module name and duration are required.');
      return;
    }

    if (editingModuleIndex !== null) {
      if (
        formData.modules.some(
          (module, index) => index !== editingModuleIndex && module.title?.trim().toLowerCase() === title.toLowerCase()
        )
      ) {
        setToast('Another module with the same name already exists.');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        modules: prev.modules.map((module, idx) =>
          idx === editingModuleIndex ? { ...module, title, duration, description, documentName } : module
        ),
        newModuleTitle: '',
        newModuleDuration: '',
        newModuleDescription: '',
        newModuleDocumentName: '',
      }));
      setEditingModuleIndex(null);
      setShowAddModuleForm(false);
    } else {
      if (formData.modules.some((module) => module.title?.trim().toLowerCase() === title.toLowerCase())) {
        setToast('Module title already exists.');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        modules: [
          ...prev.modules,
          {
            title,
            duration,
            description,
            documentName,
          },
        ],
        newModuleTitle: '',
        newModuleDuration: '',
        newModuleDescription: '',
        newModuleDocumentName: '',
      }));
      setShowAddModuleForm(false);
    }
  };

  const startEditModule = (index) => {
    const module = formData.modules[index];
    if (!module) return;
    setEditingModuleIndex(index);
    setShowAddModuleForm(true);
    setFormData((prev) => ({
      ...prev,
      newModuleTitle: module.title || '',
      newModuleDuration: module.duration || '',
      newModuleDescription: module.description || '',
      newModuleDocumentName: module.documentName || '',
    }));
  };

  const cancelEditModule = () => {
    setEditingModuleIndex(null);
    setFormData((prev) => ({
      ...prev,
      newModuleTitle: '',
      newModuleDuration: '',
      newModuleDescription: '',
      newModuleDocumentName: '',
    }));
    setShowAddModuleForm(false);
  };

  const removeModule = (index) => {
    setFormData((prev) => ({ ...prev, modules: prev.modules.filter((_, idx) => idx !== index) }));
  };

  const validateForm = () => {
    if (!formData.planName.trim()) {
      setToast('Plan name is required.');
      return false;
    }
    const moduleTitles = formData.modules.map((module) => module.title?.trim()).filter(Boolean);
    const duplicateModules = new Set(moduleTitles.map((title) => title.toLowerCase())).size !== moduleTitles.length;
    const duplicateStacks = new Set(formData.technologyStack).size !== formData.technologyStack.length;
    if (duplicateModules || duplicateStacks) {
      setToast('Duplicate modules or technology stack entries are not allowed.');
      return false;
    }

    const planCodeValue = formData.planCode.trim();
    if (planCodeValue) {
      const existingCode = plans.find(
        (plan) => plan.planCode.toLowerCase() === planCodeValue.toLowerCase() && plan.id !== currentPlan?.id
      );
      if (existingCode) {
        setToast('Plan code must be unique.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const isEditMode = mode === 'edit' && Boolean(currentPlan?.id);
    const normalizedCode = (formData.planCode.trim() || generatePlanCode(plans)).toUpperCase();
    const moduleEntries = formData.modules.filter((module) => module.title?.trim());
    const planPayload = {
      ...formData,
      id: currentPlan?.id || Date.now(),
      planId: currentPlan?.planId || `PLAN-${String(plans.length + 1).padStart(3, '0')}`,
      planCode: normalizedCode,
      planName: formData.planName.trim(),
      category: formData.category || 'Website',
      modules: moduleEntries,
      includedModules: moduleEntries.map((module) => module.title.trim()),
      technologyStack: formData.technologyStack.filter(Boolean),
      activeProjectsUsingPlan: currentPlan?.activeProjectsUsingPlan || 0,
      completedProjectsUsingPlan: currentPlan?.completedProjectsUsingPlan || 0,
      createdBy: currentPlan?.createdBy || formData.createdBy || 'Admin',
      projectId: formData.projectId || null,
      createdAt: currentPlan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sanitizedPayload = { ...planPayload };
    delete sanitizedPayload.newModuleTitle;
    delete sanitizedPayload.newModuleDuration;
    delete sanitizedPayload.newModuleDescription;
    delete sanitizedPayload.newTech;
    delete sanitizedPayload.planDocumentName;

    const useMultipart = formData.planDocument instanceof File;
    if (useMultipart) {
      delete sanitizedPayload.planDocument;
    }

    const requestPayload = useMultipart ? new FormData() : sanitizedPayload;
    if (useMultipart) {
      Object.entries(sanitizedPayload).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (typeof value === 'object' && !(value instanceof File)) {
          requestPayload.append(key, JSON.stringify(value));
        } else {
          requestPayload.append(key, value);
        }
      });
      requestPayload.append('plan_document', formData.planDocument);
    }

    const responsePayload = (response) => {
      if (!response?.data?.data) return planPayload;
      return response.data.data;
    };

    if (isEditMode) {
      if (backendAvailable) {
        try {
          // Debug: log payload being sent to API to diagnose update issues
          if (requestPayload instanceof FormData) {
            const entries = {};
            for (const pair of requestPayload.entries()) {
              const [k, v] = pair;
              entries[k] = entries[k] ? [].concat(entries[k], v) : v;
            }
            console.debug('Submitting (FormData) plan payload:', entries);
          } else {
            console.debug('Submitting (JSON) plan payload:', requestPayload);
          }

          const response = await api.put(`/project-plans/${currentPlan.id}`, requestPayload);
          const updatedPlanRaw = responsePayload(response);
          const normalizePlan = (plan) => ({
            ...plan,
            includedModules: Array.isArray(plan.includedModules) ? plan.includedModules : parseJsonField(plan.includedModules),
            technologyStack: Array.isArray(plan.technologyStack) ? plan.technologyStack : parseJsonField(plan.technologyStack),
            modules: Array.isArray(plan.modules) ? plan.modules : parseModulesField(plan.modules, Array.isArray(plan.includedModules) ? plan.includedModules : parseJsonField(plan.includedModules)),
          });
          const updatedPlan = normalizePlan(updatedPlanRaw);
          setPlans((prev) => prev.map((plan) => (plan.id === currentPlan.id ? updatedPlan : plan)));
          setToast('Plan updated successfully.');
        } catch (error) {
          console.error('Project plan update failed:', error);
          setBackendAvailable(false);
          setPlans((prev) => prev.map((plan) => (plan.id === currentPlan.id ? planPayload : plan)));
          setToast('Plan updated locally. Backend unavailable.');
        }
      } else {
        setPlans((prev) => prev.map((plan) => (plan.id === currentPlan.id ? planPayload : plan)));
        setToast('Plan updated locally. Backend unavailable.');
      }
    } else {
      if (backendAvailable) {
        try {
          const response = await api.post('/project-plans', requestPayload);
          const createdPlanRaw = response?.data?.data || planPayload;
          const normalizePlanShort = (plan) => ({
            ...plan,
            includedModules: Array.isArray(plan.includedModules) ? plan.includedModules : parseJsonField(plan.includedModules),
            technologyStack: Array.isArray(plan.technologyStack) ? plan.technologyStack : parseJsonField(plan.technologyStack),
            modules: Array.isArray(plan.modules) ? plan.modules : parseModulesField(plan.modules, Array.isArray(plan.includedModules) ? plan.includedModules : parseJsonField(plan.includedModules)),
          });
          const createdPlan = normalizePlanShort(createdPlanRaw);
          setPlans((prev) => [createdPlan, ...prev]);
          setToast('Plan created successfully.');
        } catch (error) {
          console.error('Project plan creation failed:', error);
          setBackendAvailable(false);
          setPlans((prev) => [planPayload, ...prev]);
          setToast('Plan created locally. Backend unavailable.');
        }
      } else {
        setPlans((prev) => [planPayload, ...prev]);
        setToast('Plan created locally. Backend unavailable.');
      }
    }

    closeDrawer();
  };

  const handleDelete = async (plan) => {
    if (plan.activeProjectsUsingPlan > 0) {
      setToast('This plan is linked to active projects and cannot be deleted.');
      return;
    }
    const confirmed = window.confirm(`Delete ${plan.planName}?`);
    if (!confirmed) return;

    if (backendAvailable) {
      try {
        await api.delete(`/project-plans/${plan.id}`);
        setPlans((prev) => prev.filter((item) => item.id !== plan.id));
        setToast('Plan deleted.');
      } catch (error) {
        console.error('Project plan deletion failed:', error);
        setBackendAvailable(false);
        setPlans((prev) => prev.filter((item) => item.id !== plan.id));
        setToast('Plan deleted locally. Backend unavailable.');
      }
    } else {
      setPlans((prev) => prev.filter((item) => item.id !== plan.id));
      setToast('Plan deleted locally. Backend unavailable.');
    }
  };

  const toggleStatus = (plan) => {
    const nextStatus = plan.status === 'Active' ? 'Inactive' : 'Active';
    const confirmed = window.confirm(`Change status of ${plan.planName} to ${nextStatus}?`);
    if (!confirmed) return;
    setPlans((prev) => prev.map((item) => (item.id === plan.id ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() } : item)));
    setToast('Status updated.');
  };

  const handleDuplicate = (plan) => {
    const duplicateCode = `${plan.planCode}-CLONE`;
    const newPlan = {
      ...plan,
      id: Date.now(),
      planId: `PLAN-${String(plans.length + 1).padStart(3, '0')}`,
      planCode: duplicateCode,
      planName: `${plan.planName} Clone`,
      status: 'Draft',
      activeProjectsUsingPlan: 0,
      completedProjectsUsingPlan: 0,
      createdBy: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPlans((prev) => [newPlan, ...prev]);
    setToast('Plan duplicated successfully.');
  };

  const toggleSelect = (planId) => {
    setSelectedIds((prev) => (prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]));
  };

  const handleBulkAction = (action) => {
    if (!selectedIds.length) {
      setToast('Select at least one plan first.');
      return;
    }

    if (action === 'delete') {
      const confirmed = window.confirm('Delete the selected plans?');
      if (!confirmed) return;
      setPlans((prev) => prev.filter((plan) => !selectedIds.includes(plan.id)));
      setSelectedIds([]);
      setToast('Selected plans deleted.');
      return;
    }

    if (action === 'activate') {
      setPlans((prev) => prev.map((plan) => (selectedIds.includes(plan.id) ? { ...plan, status: 'Active', updatedAt: new Date().toISOString() } : plan)));
      setSelectedIds([]);
      setToast('Selected plans activated.');
      return;
    }

    if (action === 'deactivate') {
      setPlans((prev) => prev.map((plan) => (selectedIds.includes(plan.id) ? { ...plan, status: 'Inactive', updatedAt: new Date().toISOString() } : plan)));
      setSelectedIds([]);
      setToast('Selected plans deactivated.');
      return;
    }

    if (action === 'clone') {
      const clones = plans.filter((plan) => selectedIds.includes(plan.id)).map((plan) => ({
        ...plan,
        id: Date.now() + Math.random(),
        planId: `PLAN-${String(plans.length + 1).padStart(3, '0')}`,
        planCode: `${plan.planCode}-CLONE`,
        planName: `${plan.planName} Clone`,
        status: 'Draft',
        activeProjectsUsingPlan: 0,
        completedProjectsUsingPlan: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setPlans((prev) => [...clones, ...prev]);
      setSelectedIds([]);
      setToast('Selected plans cloned.');
      return;
    }

    if (action === 'csv') {
      const csvRows = [
        ['Plan ID', 'Plan Code', 'Plan Name', 'Category', 'Status'],
        ...plans.filter((plan) => selectedIds.includes(plan.id)).map((plan) => [plan.planId, plan.planCode, plan.planName, plan.category, plan.status]),
      ];
      const csvContent = csvRows.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'project-plans.csv';
      link.click();
      URL.revokeObjectURL(url);
      setToast('Exported selected plans as CSV.');
      return;
    }

    if (action === 'excel') {
      handleBulkAction('csv');
      setToast('Excel export is prepared as CSV.');
      return;
    }

    if (action === 'print') {
      window.print();
      setToast('Print dialog opened.');
    }
  };

  return (
    <div className="space-y-6 text-white pb-10 min-h-screen">
      <div className="rounded-3xl border bg-black/70 bg-gradient-to-br from-[#11141d] via-[#0f131b] to-[#111827] p-5 shadow-2xl shadow-black/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-orange-400">
              <ClipboardList size={14} />
              Project plan management
            </div>
            <h2 className="text-2xl font-semibold text-white">Create and manage reusable project plans</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Build plan packages for websites, apps, SaaS, ERP, and CRM deliveries with flexible pricing, modules, hosting, and support options.
            </p>
          </div>
          <button onClick={openCreateDrawer} className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-400">
            <Plus size={16} />
            Add New Plan
          </button>
        </div>
      </div>

      {toast ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {toast}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Plans', value: stats.total, icon: Layers },
          { label: 'Active Plans', value: stats.active, icon: CheckCircle2 },
          { label: 'Draft Plans', value: stats.drafts, icon: FileText },
          { label: 'Featured Plans', value: stats.featured, icon: Sparkles },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-[#0f141d] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">{card.label}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{card.value}</p>
              </div>
              <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-2 text-orange-400">
                <card.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0f141d] p-4">
          <p className="text-sm text-white/60">Most Popular Plan</p>
          <p className="mt-1 text-lg font-semibold text-white">{stats.popular}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0f141d] p-4">
          <p className="text-sm text-white/60">Active Projects Using Plans</p>
          <p className="mt-1 text-lg font-semibold text-white">{stats.activeProjects}</p>
        </div>
      </div>

      <div className="sticky top-4 z-20 rounded-3xl border border-white/10 bg-[#0f141d]/95 p-4 shadow-xl shadow-black/20 backdrop-blur">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-1 flex-col gap-2 md:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-[#111827] px-3 py-2">
              <Search size={16} className="text-white/50" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search plan name, ID or code" className="w-full bg-transparent text-sm text-white outline-none" />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white/70">
              <Filter size={16} />
              <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="bg-transparent outline-none">
                <option value="All">All Categories</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white/70">
              <Filter size={16} />
              <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="bg-transparent outline-none">
                <option value="All">All Status</option>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={selectedFeatured} onChange={(event) => setSelectedFeatured(event.target.value)} className="rounded-2xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white outline-none">
              <option value="All">Featured</option>
              {featuredBadges.map((badge) => <option key={badge} value={badge}>{badge}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-1">
          <label className="text-sm text-white/70">
            <span className="mb-1 block">Sort By</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className={fieldClasses}>
              <option value="updatedAtDesc">Updated Date</option>
              <option value="createdAtDesc">Created Date</option>
              <option value="nameAsc">Name A-Z</option>
              <option value="nameDesc">Name Z-A</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0f141d] p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button onClick={() => handleBulkAction('activate')} className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            <CheckCircle2 size={16} />
            Activate
          </button>
          <button onClick={() => handleBulkAction('deactivate')} className="inline-flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
            <RefreshCw size={16} />
            Deactivate
          </button>
          <button onClick={() => handleBulkAction('clone')} className="inline-flex items-center gap-2 rounded-2xl border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-sm text-sky-300">
            <Copy size={16} />
            Clone
          </button>
          <button onClick={() => handleBulkAction('csv')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
            <Upload size={16} />
            Export CSV
          </button>
          <button onClick={() => handleBulkAction('excel')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
            <FileText size={16} />
            Export Excel
          </button>
          <button onClick={() => handleBulkAction('print')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
            <ClipboardList size={16} />
            Print
          </button>
          <button onClick={() => setSelectedIds([])} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">
            <X size={16} />
            Clear Selection
          </button>
        </div>

        {filteredPlans.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-[1300px] w-full text-left text-sm">
              <thead className="bg-white/5 text-white/60">
                <tr>
                  <th className="px-3 py-3">
                    <input type="checkbox" checked={selectedIds.length === filteredPlans.length && filteredPlans.length > 0} onChange={() => setSelectedIds(selectedIds.length === filteredPlans.length ? [] : filteredPlans.map((plan) => plan.id))} />
                  </th>
                  
                  <th className="px-3 py-3">Plan Code</th>
                  <th className="px-3 py-3">Plan Name</th>
                  <th className="px-3 py-3">Status</th>
                  
               
                  <th className="px-3 py-3">Updated</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedPlans.map((plan) => (
                  <tr key={plan.id} className="border-t border-white/10 bg-[#101723] text-white/80">
                    <td className="px-3 py-3">
                      <input type="checkbox" checked={selectedIds.includes(plan.id)} onChange={() => toggleSelect(plan.id)} />
                    </td>
                    
                    <td className="px-3 py-3">{plan.planCode}</td>
                    <td className="px-3 py-3">
                      <div>
                        <div className="font-semibold text-white">{plan.planName}</div>
                        
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[plan.status] || 'border-white/10 bg-white/5 text-white/70'}`}>{plan.status}</span>
                    </td>
                    
                    
                    <td className="px-3 py-3">{formatDate(plan.updatedAt)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button aria-label="View" onClick={() => openViewDrawer(plan)} className="rounded-full border border-white/10 bg-white/5 p-2 text-white/80">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button aria-label="Edit" onClick={() => openEditDrawer(plan)} className="rounded-full border border-white/10 bg-white/5 p-2 text-white/80">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {/* <button onClick={() => handleDuplicate(plan)} className="rounded-full border border-sky-500/20 bg-sky-500/10 p-2 text-sky-300"><Copy className="w-4 h-4" /></button>
                        <button onClick={() => toggleStatus(plan)} className="rounded-full border border-amber-500/20 bg-amber-500/10 p-2 text-amber-300"><RefreshCw className="w-4 h-4" /></button> */}
                        <button aria-label="Delete" onClick={() => handleDelete(plan)} className="rounded-full border border-rose-500/20 bg-rose-500/10 p-2 text-rose-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#101723] p-8 text-center text-white/70">
            <Box size={36} className="mb-3 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">No plans found</h3>
            <p className="mt-2 max-w-md text-sm">Try adjusting the search or create your first plan from the button above.</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm text-white/70">
          <div>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredPlans.length)} of {filteredPlans.length} plans
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Previous</button>
            <span className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">{page}/{totalPages}</span>
            <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">Next</button>
          </div>
        </div>
      </div>

      {createPortal(
      <div className={`fixed inset-0 z-[9999] ${drawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/80 backdrop-blur-md transition ${drawerOpen ? 'opacity-100' : 'opacity-0'}`} onClick={closeDrawer} />
        <aside className={`absolute right-0 top-0 h-full w-full max-w-4xl overflow-y-auto border-l border-white/10 bg-[#090c12] p-4 shadow-2xl shadow-black/40 transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-orange-400">{mode === 'view' ? 'Plan overview' : mode === 'edit' ? 'Update plan' : 'Create plan'}</p>
              <h3 className="text-xl font-semibold text-white">{mode === 'view' ? currentPlan?.planName : mode === 'edit' ? 'Edit Plan' : 'Add New Plan'}</h3>
            </div>
            <button onClick={closeDrawer} className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white/80">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-[#101723] p-4">
              <div className="mb-4 flex items-center gap-2">
                <Building2 size={16} className="text-orange-400" />
                <h4 className="text-lg font-semibold text-white">Basic Information</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Plan Name</span>
                  <input name="planName" value={formData.planName} onChange={handleFieldChange} className={fieldClasses} required disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Plan Code</span>
                  <input name="planCode" value={formData.planCode} onChange={handleFieldChange} className={fieldClasses} required disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Link Project</span>
                  <select name="projectId" value={formData.projectId || ''} onChange={handleFieldChange} className={selectClasses} disabled={mode === 'view'}>
                    <option value="">None</option>
                    {projectsList.map((project) => (
                      <option key={project.uuid} value={project.uuid}>
                        {project.project_code || 'PRJ'} - {project.project_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Project Code</span>
                  <input name="projectCode" value={formData.projectCode || ''} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} readOnly />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Category</span>
                  <select name="category" value={formData.category} onChange={handleFieldChange} className={selectClasses} disabled={mode === 'view'}>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Status</span>
                  <select name="status" value={formData.status} onChange={handleFieldChange} className={selectClasses} disabled={mode === 'view'}>
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
                <label className="text-sm text-white/70 md:col-span-2">
                  <span className="mb-1 block">Short Description</span>
                  <input name="shortDescription" value={formData.shortDescription} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70 md:col-span-2">
                  <span className="mb-1 block">Full Description</span>
                  <textarea name="fullDescription" value={formData.fullDescription} onChange={handleFieldChange} className={`${fieldClasses} min-h-[90px]`} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Project Document</span>
                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#0f141d] p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3 text-white/80">
                        <div className="rounded-xl bg-orange-500/15 p-2 text-orange-400">
                          <Upload size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Upload project document</p>
                          <p className="text-xs text-white/50">PDF, DOC, XLS, TXT</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80">
                        Choose File
                      </span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                      onChange={(event) => handleFileChange(event, 'planDocument')}
                      className="sr-only"
                      disabled={mode === 'view'}
                    />
                  </div>
                  {formData.planDocumentName ? (
                    <p className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{formData.planDocumentName}</p>
                  ) : formData.planDocument ? (
                    <p className="mt-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">{typeof formData.planDocument === 'string' ? formData.planDocument : 'Selected file'}</p>
                  ) : null}
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Cover Image</span>
                  <input type="file" accept="image/*" onChange={(event) => handleFileChange(event, 'coverImage')} className={fieldClasses} disabled={mode === 'view'} />
                  {formData.coverImage ? <img src={formData.coverImage} alt="Cover preview" className="mt-2 h-28 w-full rounded-2xl object-cover" /> : null}
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#101723] p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 size={16} className="text-orange-400" />
                  <h4 className="text-lg font-semibold text-white">Modules & Technology</h4>
                </div>
                {!mode.includes('view') && (
                  <button
                    type="button"
                    onClick={() => setShowAddModuleForm(!showAddModuleForm)}
                    className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10"
                  >
                    <Plus size={14} /> Add New Module
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm text-white/70">Included Modules</p>
                  <div className="grid gap-4">
                    {formData.modules.length ? (
                      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5">
                        <table className="w-full text-left text-sm text-white/70">
                          <thead className="border-b border-white/10 bg-white/5 text-white">
                            <tr>
                              <th className="px-4 py-3 font-semibold">No</th>
                              <th className="px-4 py-3 font-semibold">Module Title</th>
                              <th className="px-4 py-3 font-semibold">Duration</th>
                              <th className="px-4 py-3 font-semibold">Description</th>
                              <th className="px-4 py-3 font-semibold">Document</th>
                              {!mode.includes('view') && <th className="px-4 py-3 font-semibold text-right">Action</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {formData.modules.map((module, index) => (
                              <tr key={`${module.title || 'module'}-${index}`} className={`transition ${editingModuleIndex === index ? 'bg-orange-500/10' : 'hover:bg-white/5'}`}>
                                <td className="px-4 py-3">{index + 1}</td>
                                <td className="px-4 py-3 font-medium text-white">{module.title || 'Untitled module'}</td>
                                <td className="px-4 py-3">{module.duration || '—'}</td>
                                <td className="max-w-[200px] truncate px-4 py-3" title={module.description}>{module.description || 'No description provided.'}</td>
                                <td className="px-4 py-3">
                                  {module.documentName ? (
                                    <span className="inline-flex max-w-[150px] truncate rounded-xl border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-xs text-sky-300" title={module.documentName}>
                                      {module.documentName}
                                    </span>
                                  ) : (
                                    '—'
                                  )}
                                </td>
                                {!mode.includes('view') && (
                                  <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                      <button type="button" onClick={() => startEditModule(index)} className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white/80 transition hover:bg-white/10"><Edit3 size={14} /></button>
                                      <button type="button" onClick={() => removeModule(index)} className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white/80 transition hover:bg-white/10"><Trash2 size={14} /></button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/60">
                        No course modules added yet. Add module cards to define the learning path.
                      </div>
                    )}
                  </div>
                  {!mode.includes('view') && showAddModuleForm ? (
                    <div className="mt-4 grid gap-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input
                          type="text"
                          value={formData.newModuleTitle}
                          onChange={(event) => setFormData((prev) => ({ ...prev, newModuleTitle: event.target.value }))}
                          placeholder="Module name"
                          className={fieldClasses}
                        />
                        <input
                          type="text"
                          value={formData.newModuleDuration}
                          onChange={(event) => setFormData((prev) => ({ ...prev, newModuleDuration: event.target.value }))}
                          placeholder="Duration"
                          className={fieldClasses}
                        />
                      </div>
                      <textarea
                        value={formData.newModuleDescription}
                        onChange={(event) => setFormData((prev) => ({ ...prev, newModuleDescription: event.target.value }))}
                        placeholder="Description"
                        className={`${fieldClasses} min-h-[80px]`}
                      />
                      <label className="text-sm text-white/70">
                        <span className="mb-1 block">Document</span>
                        <label htmlFor="module-doc-add" className="block cursor-pointer rounded-2xl border border-dashed border-white/10 bg-[#0f141d] p-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3 text-white/80">
                              <div className="rounded-xl bg-orange-500/15 p-2 text-orange-400">
                                <Upload size={16} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">Upload module document</p>
                                <p className="text-xs text-white/50">PDF, DOC, XLS, TXT</p>
                              </div>
                            </div>
                            <span className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80">
                              Choose File
                            </span>
                          </div>
                          <input id="module-doc-add" type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx" onChange={(event) => handleModuleDocumentSelection(event, 'add')} className="sr-only" />
                        </label>
                        {formData.newModuleDocumentName ? (
                          <p className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{formData.newModuleDocumentName}</p>
                        ) : null}
                      </label>
                      <div className="mt-2 flex justify-end gap-2">
                        {editingModuleIndex !== null && (
                          <button
                            type="button"
                            onClick={cancelEditModule}
                            className="h-[46px] rounded-2xl border border-white/10 bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={addModule}
                          disabled={!formData.newModuleTitle.trim() || !formData.newModuleDuration.trim()}
                          className="h-[46px] rounded-2xl border border-white/10 bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-white/10"
                        >
                          {editingModuleIndex !== null ? 'Update' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>


              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#101723] p-4">
              <div className="mb-4 flex items-center gap-2">
                <Server size={16} className="text-orange-400" />
                <h4 className="text-lg font-semibold text-white">Hosting, Domain & Support</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Hosting Included</span>
                  <select name="hostingIncluded" value={formData.hostingIncluded} onChange={handleFieldChange} className={selectClasses} disabled={mode === 'view'}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Hosting Type</span>
                  <input name="hostingType" value={formData.hostingType} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Storage Limit</span>
                  <input name="storageLimit" value={formData.storageLimit} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Bandwidth Limit</span>
                  <input name="bandwidthLimit" value={formData.bandwidthLimit} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Domain Included</span>
                  <select name="domainIncluded" value={formData.domainIncluded} onChange={handleFieldChange} className={selectClasses} disabled={mode === 'view'}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Domain Extension</span>
                  <input name="domainExtension" value={formData.domainExtension} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Response SLA</span>
                  <input name="responseSla" value={formData.responseSla} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#101723] p-4">
              <div className="mb-4 flex items-center gap-2">
                <FileText size={16} className="text-orange-400" />
                <h4 className="text-lg font-semibold text-white">Deliverables & SEO</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Meta Title</span>
                  <input name="metaTitle" value={formData.metaTitle} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Keywords</span>
                  <input name="keywords" value={formData.keywords} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70 md:col-span-2">
                  <span className="mb-1 block">Meta Description</span>
                  <textarea name="metaDescription" value={formData.metaDescription} onChange={handleFieldChange} className={`${fieldClasses} min-h-[80px]`} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70 md:col-span-2">
                  <span className="mb-1 block">Admin Notes</span>
                  <textarea name="adminNotes" value={formData.adminNotes} onChange={handleFieldChange} className={`${fieldClasses} min-h-[80px]`} disabled={mode === 'view'} />
                </label>
              </div>
            </section>

            {mode !== 'view' ? (
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white">
                  {mode === 'edit' ? 'Update Plan' : 'Save Plan'}
                </button>
                <button type="button" onClick={closeDrawer} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80">Cancel</button>
              </div>
            ) : null}
          </form>
        </aside>
      </div>,
      document.body
      )}
    </div>
  );
}

export default ProjectPlansPage;
