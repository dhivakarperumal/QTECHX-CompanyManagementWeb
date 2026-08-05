import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Select from 'react-select';
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
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';

const pageSize = 8;

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

    // '&:hover': {
    //   border: '1px solid #f97316',
    // },
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
  newFeature: '',
  newModule: '',
  newTech: '',
  newDuration: '',
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  adminNotes: '',
  salesNotes: '',
  technicalNotes: '',
  features: [],
  includedModules: [],
  technologyStack: [],
  durations: [],
  activeProjectsUsingPlan: 0,
  completedProjectsUsingPlan: 0,
  createdBy: 'Admin',
  projectId: '',
});

const selectClasses = 'w-full rounded-xl border border-white/10 bg-[#0f141d] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/70';
const fieldClasses = 'w-full rounded-xl border border-white/10 bg-[#0f141d] px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/70';

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

const featuredStyles = {
  Popular: 'border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300',
  Recommended: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
  'Best Seller': 'border-violet-500/20 bg-violet-500/10 text-violet-300',
  Premium: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300',
  Enterprise: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
  'New Launch': 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
};

const featureOptions = [
  'Responsive Design',
  'SEO Friendly',
  'Admin Dashboard',
  'Mobile Friendly',
  'SSL Certificate',
  'Free Domain',
  'Free Hosting',
  'Email Accounts',
  'Daily Backup',
  'Cloud Deployment',
  'Google Analytics',
  'Live Chat',
  'OTP Login',
  'Payment Integration',
  'AI Integration',
];

const moduleOptions = [
  'Authentication',
  'User Management',
  'Role Management',
  'Dashboard',
  'Client Management',
  'Employee Management',
  'Project Management',
  'Task Management',
  'Reports',
  'Analytics',
  'Invoice Management',
  'Payment Gateway',
  'CRM',
  'HRMS',
  'Inventory',
  'CMS',
  'API Integration',
  'Multi-language',
  'File Manager',
];

const techOptions = [
  'React',
  'Next.js',
  'Node.js',
  'Express.js',
  'Tailwind CSS',
  'MongoDB',
  'PostgreSQL',
  'AWS',
  'Vercel',
  'React Native',
  'Flutter',
  'Docker',
];

const durationOptions = [
  '1 Week',
  '2 Weeks',
  '1 Month',
  '2 Months',
  '3 Months',
  '6 Months',
  '1 Year',
  '2 Years',
  'Lifetime',
];

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

        const normalized = fetchedPlans.map((plan) => ({
          ...plan,
          features: parseField(plan.features),
          includedModules: parseField(plan.includedModules),
          technologyStack: parseField(plan.technologyStack),
          durations: parseField(plan.durations),
        }));

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
    setFormData({
      ...createEmptyForm(),
      ...plan,
      features: [...(plan.features || [])],
      includedModules: [...(plan.includedModules || [])],
      technologyStack: [...(plan.technologyStack || [])],
      durations: [...(plan.durations || [])],
      coverImage: plan.coverImage || '',
    });
    setDrawerOpen(true);
  };

  const openViewDrawer = (plan) => {
    setMode('view');
    setCurrentPlan(plan);
    setFormData({
      ...createEmptyForm(),
      ...plan,
      features: [...(plan.features || [])],
      includedModules: [...(plan.includedModules || [])],
      technologyStack: [...(plan.technologyStack || [])],
      durations: [...(plan.durations || [])],
      coverImage: plan.coverImage || '',
    });
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setCurrentPlan(null);
    setMode('create');
    setFormData(createEmptyForm());
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
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

  const validateForm = () => {
    if (!formData.planName.trim()) {
      setToast('Plan name is required.');
      return false;
    }
    const duplicateFeatures = new Set(formData.features).size !== formData.features.length;
    const duplicateModules = new Set(formData.includedModules).size !== formData.includedModules.length;
    const duplicateStacks = new Set(formData.technologyStack).size !== formData.technologyStack.length;
    const duplicateDurations = new Set(formData.durations).size !== formData.durations.length;
    if (duplicateFeatures || duplicateModules || duplicateStacks || duplicateDurations) {
      setToast('Duplicate features, modules, or technology stack entries are not allowed.');
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

    const normalizedCode = (formData.planCode.trim() || generatePlanCode(plans)).toUpperCase();
    const planPayload = {
      ...formData,
      id: currentPlan?.id || Date.now(),
      planId: currentPlan?.planId || `PLAN-${String(plans.length + 1).padStart(3, '0')}`,
      planCode: normalizedCode,
      planName: formData.planName.trim(),
      category: formData.category || 'Website',
      features: formData.features.filter(Boolean),
      includedModules: formData.includedModules.filter(Boolean),
      technologyStack: formData.technologyStack.filter(Boolean),
      durations: formData.durations.filter(Boolean),
      activeProjectsUsingPlan: currentPlan?.activeProjectsUsingPlan || 0,
      completedProjectsUsingPlan: currentPlan?.completedProjectsUsingPlan || 0,
      createdBy: currentPlan?.createdBy || formData.createdBy || 'Admin',
      projectId: formData.projectId || null,
      createdAt: currentPlan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sanitizedPayload = { ...planPayload };
    delete sanitizedPayload.newFeature;
    delete sanitizedPayload.newModule;
    delete sanitizedPayload.newTech;
    delete sanitizedPayload.newDuration;
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

    if (currentPlan) {
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
            features: Array.isArray(plan.features) ? plan.features : (() => { try { const p = JSON.parse(plan.features); return Array.isArray(p) ? p : (plan.features ? String(plan.features).split(',').map(s=>s.trim()).filter(Boolean) : []); } catch { return plan.features ? String(plan.features).split(',').map(s=>s.trim()).filter(Boolean) : []; } })(),
            includedModules: Array.isArray(plan.includedModules) ? plan.includedModules : (() => { try { const p = JSON.parse(plan.includedModules); return Array.isArray(p) ? p : (plan.includedModules ? String(plan.includedModules).split(',').map(s=>s.trim()).filter(Boolean) : []); } catch { return plan.includedModules ? String(plan.includedModules).split(',').map(s=>s.trim()).filter(Boolean) : []; } })(),
            technologyStack: Array.isArray(plan.technologyStack) ? plan.technologyStack : (() => { try { const p = JSON.parse(plan.technologyStack); return Array.isArray(p) ? p : (plan.technologyStack ? String(plan.technologyStack).split(',').map(s=>s.trim()).filter(Boolean) : []); } catch { return plan.technologyStack ? String(plan.technologyStack).split(',').map(s=>s.trim()).filter(Boolean) : []; } })(),
            durations: Array.isArray(plan.durations) ? plan.durations : (() => { try { const p = JSON.parse(plan.durations); return Array.isArray(p) ? p : (plan.durations ? String(plan.durations).split(',').map(s=>s.trim()).filter(Boolean) : []); } catch { return plan.durations ? String(plan.durations).split(',').map(s=>s.trim()).filter(Boolean) : []; } })(),
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
            features: Array.isArray(plan.features) ? plan.features : (() => { try { const p = JSON.parse(plan.features); return Array.isArray(p) ? p : (plan.features ? String(plan.features).split(',').map(s=>s.trim()).filter(Boolean) : []); } catch { return plan.features ? String(plan.features).split(',').map(s=>s.trim()).filter(Boolean) : []; } })(),
            includedModules: Array.isArray(plan.includedModules) ? plan.includedModules : (() => { try { const p = JSON.parse(plan.includedModules); return Array.isArray(p) ? p : (plan.includedModules ? String(plan.includedModules).split(',').map(s=>s.trim()).filter(Boolean) : []); } catch { return plan.includedModules ? String(plan.includedModules).split(',').map(s=>s.trim()).filter(Boolean) : []; } })(),
            technologyStack: Array.isArray(plan.technologyStack) ? plan.technologyStack : (() => { try { const p = JSON.parse(plan.technologyStack); return Array.isArray(p) ? p : (plan.technologyStack ? String(plan.technologyStack).split(',').map(s=>s.trim()).filter(Boolean) : []); } catch { return plan.technologyStack ? String(plan.technologyStack).split(',').map(s=>s.trim()).filter(Boolean) : []; } })(),
            durations: Array.isArray(plan.durations) ? plan.durations : (() => { try { const p = JSON.parse(plan.durations); return Array.isArray(p) ? p : (plan.durations ? String(plan.durations).split(',').map(s=>s.trim()).filter(Boolean) : []); } catch { return plan.durations ? String(plan.durations).split(',').map(s=>s.trim()).filter(Boolean) : []; } })(),
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
    <div className="space-y-6 text-white">
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#11141d] via-[#0f131b] to-[#111827] p-5 shadow-2xl shadow-black/30">
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
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111827] px-3 py-1 text-sm text-white/70 min-w-[200px]">
              <Filter size={16} />
              <div className="flex-1">
                <Select
                  value={{ value: selectedCategory, label: selectedCategory === 'All' ? 'All Categories' : selectedCategory }}
                  onChange={(option) => setSelectedCategory(option ? option.value : 'All')}
                  options={[
                    { value: 'All', label: 'All Categories' },
                    ...categories.map(c => ({ value: c, label: c }))
                  ]}
                  styles={{
                    ...customSelectStyles,
                    control: (base, state) => ({ ...customSelectStyles.control(base, state), minHeight: '36px', border: 'none' })
                  }}
                  isSearchable={false}
                />
              </div>
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#111827] px-3 py-1 text-sm text-white/70 min-w-[200px]">
              <Filter size={16} />
              <div className="flex-1">
                <Select
                  value={{ value: selectedStatus, label: selectedStatus === 'All' ? 'All Status' : selectedStatus }}
                  onChange={(option) => setSelectedStatus(option ? option.value : 'All')}
                  options={[
                    { value: 'All', label: 'All Status' },
                    ...statuses.map(s => ({ value: s, label: s }))
                  ]}
                  styles={{
                    ...customSelectStyles,
                    control: (base, state) => ({ ...customSelectStyles.control(base, state), minHeight: '36px', border: 'none' })
                  }}
                  isSearchable={false}
                />
              </div>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="min-w-[160px]">
              <Select
                value={{ value: selectedFeatured, label: selectedFeatured === 'All' ? 'Featured' : selectedFeatured }}
                onChange={(option) => setSelectedFeatured(option ? option.value : 'All')}
                options={[
                  { value: 'All', label: 'Featured' },
                  ...featuredBadges.map(b => ({ value: b, label: b }))
                ]}
                styles={{
                  ...customSelectStyles,
                  control: (base, state) => ({ ...customSelectStyles.control(base, state), minHeight: '38px', backgroundColor: '#111827' })
                }}
                isSearchable={false}
              />
            </div>
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-1">
          <label className="text-sm text-white/70">
            <span className="mb-1 block">Sort By</span>
            <Select
              value={[
                { value: 'updatedAtDesc', label: 'Updated Date' },
                { value: 'createdAtDesc', label: 'Created Date' },
                { value: 'nameAsc', label: 'Name A-Z' },
                { value: 'nameDesc', label: 'Name Z-A' }
              ].find(opt => opt.value === sortBy)}
              onChange={(option) => setSortBy(option ? option.value : 'updatedAtDesc')}
              options={[
                { value: 'updatedAtDesc', label: 'Updated Date' },
                { value: 'createdAtDesc', label: 'Created Date' },
                { value: 'nameAsc', label: 'Name A-Z' },
                { value: 'nameDesc', label: 'Name Z-A' }
              ]}
              styles={{
                ...customSelectStyles,
                control: (base, state) => ({ ...customSelectStyles.control(base, state), backgroundColor: '#0f141d' })
              }}
              isSearchable={false}
            />
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
                  <Select
                    name="projectId"
                    value={formData.projectId ? { value: formData.projectId, label: projectsList.find(p => p.uuid === formData.projectId)?.project_name || formData.projectId } : { value: '', label: 'None' }}
                    onChange={(option) => handleFieldChange({ target: { name: 'projectId', value: option ? option.value : '' } })}
                    options={[
                      { value: '', label: 'None' },
                      ...projectsList.map((project) => ({ value: project.uuid, label: project.project_name }))
                    ]}
                    styles={{
                      ...customSelectStyles,
                      control: (base, state) => ({ ...customSelectStyles.control(base, state), backgroundColor: '#0f141d' })
                    }}
                    isDisabled={mode === 'view'}
                  />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Category</span>
                  <Select
                    name="category"
                    value={{ value: formData.category, label: formData.category }}
                    onChange={(option) => handleFieldChange({ target: { name: 'category', value: option ? option.value : '' } })}
                    options={categories.map((category) => ({ value: category, label: category }))}
                    styles={{
                      ...customSelectStyles,
                      control: (base, state) => ({ ...customSelectStyles.control(base, state), backgroundColor: '#0f141d' })
                    }}
                    isDisabled={mode === 'view'}
                  />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Status</span>
                  <Select
                    name="status"
                    value={{ value: formData.status, label: formData.status }}
                    onChange={(option) => handleFieldChange({ target: { name: 'status', value: option ? option.value : '' } })}
                    options={statuses.map((status) => ({ value: status, label: status }))}
                    styles={{
                      ...customSelectStyles,
                      control: (base, state) => ({ ...customSelectStyles.control(base, state), backgroundColor: '#0f141d' })
                    }}
                    isDisabled={mode === 'view'}
                  />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Featured Badge</span>
                  <Select
                    name="featuredBadge"
                    value={{ value: formData.featuredBadge, label: formData.featuredBadge }}
                    onChange={(option) => handleFieldChange({ target: { name: 'featuredBadge', value: option ? option.value : '' } })}
                    options={featuredBadges.map((badge) => ({ value: badge, label: badge }))}
                    styles={{
                      ...customSelectStyles,
                      control: (base, state) => ({ ...customSelectStyles.control(base, state), backgroundColor: '#0f141d' })
                    }}
                    isDisabled={mode === 'view'}
                  />
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
                  <input type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx" onChange={(event) => handleFileChange(event, 'planDocument')} className={fieldClasses} disabled={mode === 'view'} />
                  {formData.planDocumentName ? (
                    <p className="mt-2 text-sm text-white/70">{formData.planDocumentName}</p>
                  ) : formData.planDocument ? (
                    <p className="mt-2 text-sm text-white/70">{typeof formData.planDocument === 'string' ? formData.planDocument : 'Selected file'}</p>
                  ) : null}
                </label>
                <label className="text-sm text-white/70 md:col-span-2">
                  <span className="mb-1 block">Cover Image</span>
                  <input type="file" accept="image/*" onChange={(event) => handleFileChange(event, 'coverImage')} className={fieldClasses} disabled={mode === 'view'} />
                  {formData.coverImage ? <img src={formData.coverImage} alt="Cover preview" className="mt-2 h-28 w-full rounded-2xl object-cover" /> : null}
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#101723] p-4">
              <div className="mb-4 flex items-center gap-2">
                <Code2 size={16} className="text-orange-400" />
                <h4 className="text-lg font-semibold text-white">Features, Modules & Technology</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm text-white/70">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {featureOptions.map((option) => (
                      <button type="button" key={option} onClick={() => addChoice('features', option)} disabled={mode === 'view'} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 disabled:cursor-not-allowed">
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={formData.newFeature}
                      onChange={(event) => setFormData((prev) => ({ ...prev, newFeature: event.target.value }))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addChoice('features', formData.newFeature);
                          setFormData((prev) => ({ ...prev, newFeature: '' }));
                        }
                      }}
                      placeholder="Add a custom feature"
                      className={fieldClasses}
                      disabled={mode === 'view'}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addChoice('features', formData.newFeature);
                        setFormData((prev) => ({ ...prev, newFeature: '' }));
                      }}
                      disabled={mode === 'view' || !formData.newFeature.trim()}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.features.map((item) => (
                      <span key={item} className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-sm text-orange-300">
                        {item}
                        {!mode.includes('view') ? <button type="button" onClick={() => removeChoice('features', item)}><X size={12} /></button> : null}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-white/70">Included Modules</p>
                  <div className="flex flex-wrap gap-2">
                    {moduleOptions.map((option) => (
                      <button type="button" key={option} onClick={() => addChoice('includedModules', option)} disabled={mode === 'view'} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 disabled:cursor-not-allowed">
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={formData.newModule}
                      onChange={(event) => setFormData((prev) => ({ ...prev, newModule: event.target.value }))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addChoice('includedModules', formData.newModule);
                          setFormData((prev) => ({ ...prev, newModule: '' }));
                        }
                      }}
                      placeholder="Add a custom module"
                      className={fieldClasses}
                      disabled={mode === 'view'}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addChoice('includedModules', formData.newModule);
                        setFormData((prev) => ({ ...prev, newModule: '' }));
                      }}
                      disabled={mode === 'view' || !formData.newModule.trim()}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.includedModules.map((item) => (
                      <span key={item} className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                        {item}
                        {!mode.includes('view') ? <button type="button" onClick={() => removeChoice('includedModules', item)}><X size={12} /></button> : null}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-white/70">Technology Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {techOptions.map((option) => (
                      <button type="button" key={option} onClick={() => addChoice('technologyStack', option)} disabled={mode === 'view'} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 disabled:cursor-not-allowed">
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={formData.newTech}
                      onChange={(event) => setFormData((prev) => ({ ...prev, newTech: event.target.value }))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addChoice('technologyStack', formData.newTech);
                          setFormData((prev) => ({ ...prev, newTech: '' }));
                        }
                      }}
                      placeholder="Add a custom technology"
                      className={fieldClasses}
                      disabled={mode === 'view'}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addChoice('technologyStack', formData.newTech);
                        setFormData((prev) => ({ ...prev, newTech: '' }));
                      }}
                      disabled={mode === 'view' || !formData.newTech.trim()}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.technologyStack.map((item) => (
                      <span key={item} className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-sm text-sky-300">
                        {item}
                        {!mode.includes('view') ? <button type="button" onClick={() => removeChoice('technologyStack', item)}><X size={12} /></button> : null}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm text-white/70">Durations</p>
                  <div className="flex flex-wrap gap-2">
                    {durationOptions.map((option) => (
                      <button type="button" key={option} onClick={() => addChoice('durations', option)} disabled={mode === 'view'} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 disabled:cursor-not-allowed">
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={formData.newDuration}
                      onChange={(event) => setFormData((prev) => ({ ...prev, newDuration: event.target.value }))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          addChoice('durations', formData.newDuration);
                          setFormData((prev) => ({ ...prev, newDuration: '' }));
                        }
                      }}
                      placeholder="Add a custom duration"
                      className={fieldClasses}
                      disabled={mode === 'view'}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addChoice('durations', formData.newDuration);
                        setFormData((prev) => ({ ...prev, newDuration: '' }));
                      }}
                      disabled={mode === 'view' || !formData.newDuration.trim()}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.durations.map((item) => (
                      <span key={item} className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-sm text-violet-300">
                        {item}
                        {!mode.includes('view') ? <button type="button" onClick={() => removeChoice('durations', item)}><X size={12} /></button> : null}
                      </span>
                    ))}
                  </div>
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
                  <Select
                    name="hostingIncluded"
                    value={{ value: formData.hostingIncluded, label: formData.hostingIncluded }}
                    onChange={(option) => handleFieldChange({ target: { name: 'hostingIncluded', value: option ? option.value : '' } })}
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' }
                    ]}
                    styles={{
                      ...customSelectStyles,
                      control: (base, state) => ({ ...customSelectStyles.control(base, state), backgroundColor: '#0f141d' })
                    }}
                    isDisabled={mode === 'view'}
                  />
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
                  <Select
                    name="domainIncluded"
                    value={{ value: formData.domainIncluded, label: formData.domainIncluded }}
                    onChange={(option) => handleFieldChange({ target: { name: 'domainIncluded', value: option ? option.value : '' } })}
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' }
                    ]}
                    styles={{
                      ...customSelectStyles,
                      control: (base, state) => ({ ...customSelectStyles.control(base, state), backgroundColor: '#0f141d' })
                    }}
                    isDisabled={mode === 'view'}
                  />
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
                <button type="submit" className="rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white">Save Plan</button>
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
