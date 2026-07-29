import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api';
import {
  Box,
  Building2,
  CheckCircle2,
  ClipboardList,
  Code2,
  Copy,
  CreditCard,
  Edit3,
  Eye,
  FileText,
  Filter,
  Layers,
  RefreshCw,
  Users,
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

const createEmptyForm = () => ({
  planName: '',
  planCode: '',
  projectType: '',
  category: 'Website',
  shortDescription: '',
  fullDescription: '',
  basePrice: '',
  discountPrice: '',
  currency: 'INR',
  taxPercentage: '0',
  setupFee: '0',
  renewalPrice: '0',
  billingCycle: 'Monthly',
  deliveryDays: '30',
  minimumDeliveryDays: '15',
  maximumDeliveryDays: '45',
  priorityDeliveryAvailable: 'Yes',
  rushDeliveryCharges: '0',
  uiUxDesigner: '0',
  frontendDeveloper: '0',
  backendDeveloper: '0',
  mobileDeveloper: '0',
  qaEngineer: '0',
  devOpsEngineer: '0',
  projectManager: '0',
  supportEngineer: '0',
  estimatedTeamSize: '1',
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
  displayOrder: '1',
  planIcon: '',
  coverImage: '',
  planDocument: null,
  planDocumentName: '',
  newFeature: '',
  newModule: '',
  newTech: '',
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  adminNotes: '',
  salesNotes: '',
  technicalNotes: '',
  features: [],
  includedModules: [],
  technologyStack: [],
  activeProjectsUsingPlan: 0,
  completedProjectsUsingPlan: 0,
  createdBy: 'Admin',
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

const formatCurrency = (value) => {
  if (value === '' || value === null || value === undefined) return '—';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numeric);
};

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
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

const categories = ['Website', 'Web Application', 'Mobile Application', 'ERP', 'CRM', 'SaaS', 'E-commerce'];
const projectTypes = ['Website', 'Web Application', 'Mobile Application', 'ERP', 'CRM', 'SaaS', 'E-commerce'];
const statuses = ['Draft', 'Active', 'Inactive'];
const billingCycles = ['One Time', 'Monthly', 'Quarterly', 'Half Yearly', 'Yearly', 'Lifetime'];
const featuredBadges = ['Popular', 'Recommended', 'Best Seller', 'Premium', 'Enterprise', 'New Launch'];

const initialPlans = [];
function ProjectPlansPage() {
  const [plans, setPlans] = useState(initialPlans);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedFeatured, setSelectedFeatured] = useState('All');
  const [selectedBilling, setSelectedBilling] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('updatedAtDesc');
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState('create');
  const [currentPlan, setCurrentPlan] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState('');
  const [formData, setFormData] = useState(createEmptyForm());

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await api.get('/project-plans');
        const fetchedPlans = Array.isArray(response?.data?.data) ? response.data.data : [];
        setPlans(fetchedPlans);
        setBackendAvailable(true);
      } catch (error) {
        console.warn('Project plans API unavailable', error);
        setBackendAvailable(false);
      }
    };

    loadPlans();
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
    const monthlyRevenue = plans.filter((plan) => plan.status === 'Active').reduce((sum, plan) => sum + (Number(plan.basePrice) || 0), 0);
    const annualRevenue = plans.filter((plan) => plan.status === 'Active').reduce((sum, plan) => sum + (Number(plan.renewalPrice) || 0), 0);

    return {
      total,
      active,
      inactive,
      drafts,
      featured,
      popular: popular?.planName || 'None',
      activeProjects,
      monthlyRevenue,
      annualRevenue,
    };
  }, [plans]);

  const filteredPlans = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const min = Number(minPrice || 0);
    const max = Number(maxPrice || Number.MAX_SAFE_INTEGER);

    return [...plans]
      .filter((plan) => {
        const matchesQuery = !query || [plan.planName, plan.planId, plan.planCode, plan.projectType].some((value) => String(value).toLowerCase().includes(query));
        const matchesCategory = selectedCategory === 'All' || plan.category === selectedCategory;
        const matchesType = selectedType === 'All' || plan.projectType === selectedType;
        const matchesStatus = selectedStatus === 'All' || plan.status === selectedStatus;
        const matchesFeatured = selectedFeatured === 'All' || plan.featuredBadge === selectedFeatured;
        const matchesBilling = selectedBilling === 'All' || plan.billingCycle === selectedBilling;
        const matchesMin = Number(plan.discountPrice || plan.basePrice || 0) >= min;
        const matchesMax = Number(plan.discountPrice || plan.basePrice || 0) <= max;

        return matchesQuery && matchesCategory && matchesType && matchesStatus && matchesFeatured && matchesBilling && matchesMin && matchesMax;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'nameAsc':
            return a.planName.localeCompare(b.planName);
          case 'nameDesc':
            return b.planName.localeCompare(a.planName);
          case 'priceAsc':
            return (Number(a.discountPrice || a.basePrice || 0) || 0) - (Number(b.discountPrice || b.basePrice || 0) || 0);
          case 'priceDesc':
            return (Number(b.discountPrice || b.basePrice || 0) || 0) - (Number(a.discountPrice || a.basePrice || 0) || 0);
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
  }, [plans, searchQuery, selectedCategory, selectedType, selectedStatus, selectedFeatured, selectedBilling, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedType, selectedStatus, selectedFeatured, selectedBilling, minPrice, maxPrice, sortBy]);

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
      planIcon: plan.planIcon || '',
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
      planIcon: plan.planIcon || '',
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
    if (!formData.projectType.trim()) {
      setToast('Project type is required.');
      return false;
    }
    const basePrice = Number(formData.basePrice || 0);
    const discountPrice = Number(formData.discountPrice || 0);
    if (basePrice < 0) {
      setToast('Base price cannot be negative.');
      return false;
    }
    if (discountPrice > basePrice) {
      setToast('Discount price cannot exceed base price.');
      return false;
    }
    const deliveryDays = Number(formData.deliveryDays || 0);
    if (deliveryDays <= 0) {
      setToast('Delivery days must be greater than zero.');
      return false;
    }
    const duplicateFeatures = new Set(formData.features).size !== formData.features.length;
    const duplicateModules = new Set(formData.includedModules).size !== formData.includedModules.length;
    const duplicateStacks = new Set(formData.technologyStack).size !== formData.technologyStack.length;
    if (duplicateFeatures || duplicateModules || duplicateStacks) {
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
      projectType: formData.projectType.trim(),
      category: formData.category || 'Website',
      basePrice: Number(formData.basePrice || 0),
      discountPrice: Number(formData.discountPrice || 0),
      taxPercentage: Number(formData.taxPercentage || 0),
      setupFee: Number(formData.setupFee || 0),
      renewalPrice: Number(formData.renewalPrice || 0),
      deliveryDays: Number(formData.deliveryDays || 0),
      minimumDeliveryDays: Number(formData.minimumDeliveryDays || 0),
      maximumDeliveryDays: Number(formData.maximumDeliveryDays || 0),
      rushDeliveryCharges: Number(formData.rushDeliveryCharges || 0),
      displayOrder: Number(formData.displayOrder || 0),
      features: formData.features.filter(Boolean),
      includedModules: formData.includedModules.filter(Boolean),
      technologyStack: formData.technologyStack.filter(Boolean),
      activeProjectsUsingPlan: currentPlan?.activeProjectsUsingPlan || 0,
      completedProjectsUsingPlan: currentPlan?.completedProjectsUsingPlan || 0,
      createdBy: currentPlan?.createdBy || formData.createdBy || 'Admin',
      createdAt: currentPlan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sanitizedPayload = { ...planPayload };
    delete sanitizedPayload.newFeature;
    delete sanitizedPayload.newModule;
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

    if (currentPlan) {
      if (backendAvailable) {
        try {
          const response = await api.put(`/project-plans/${currentPlan.id}`, requestPayload);
          const updatedPlan = responsePayload(response);
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
          const createdPlan = response?.data?.data || planPayload;
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
        ['Plan ID', 'Plan Code', 'Plan Name', 'Project Type', 'Category', 'Price', 'Status'],
        ...plans.filter((plan) => selectedIds.includes(plan.id)).map((plan) => [plan.planId, plan.planCode, plan.planName, plan.projectType, plan.category, Number(plan.discountPrice || plan.basePrice || 0), plan.status]),
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0f141d] p-4">
          <p className="text-sm text-white/60">Most Popular Plan</p>
          <p className="mt-1 text-lg font-semibold text-white">{stats.popular}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0f141d] p-4">
          <p className="text-sm text-white/60">Active Projects Using Plans</p>
          <p className="mt-1 text-lg font-semibold text-white">{stats.activeProjects}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0f141d] p-4">
          <p className="text-sm text-white/60">Monthly / Annual Revenue</p>
          <p className="mt-1 text-lg font-semibold text-white">{formatCurrency(stats.monthlyRevenue)} / {formatCurrency(stats.annualRevenue)}</p>
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
            <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)} className="rounded-2xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white outline-none">
              <option value="All">Project Type</option>
              {projectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
            <select value={selectedFeatured} onChange={(event) => setSelectedFeatured(event.target.value)} className="rounded-2xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white outline-none">
              <option value="All">Featured</option>
              {featuredBadges.map((badge) => <option key={badge} value={badge}>{badge}</option>)}
            </select>
            <select value={selectedBilling} onChange={(event) => setSelectedBilling(event.target.value)} className="rounded-2xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white outline-none">
              <option value="All">Billing</option>
              {billingCycles.map((cycle) => <option key={cycle} value={cycle}>{cycle}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="text-sm text-white/70">
            <span className="mb-1 block">Min Price</span>
            <input type="number" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} className={fieldClasses} placeholder="0" />
          </label>
          <label className="text-sm text-white/70">
            <span className="mb-1 block">Max Price</span>
            <input type="number" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className={fieldClasses} placeholder="100000" />
          </label>
          <label className="text-sm text-white/70">
            <span className="mb-1 block">Sort By</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className={fieldClasses}>
              <option value="updatedAtDesc">Updated Date</option>
              <option value="createdAtDesc">Created Date</option>
              <option value="nameAsc">Name A-Z</option>
              <option value="nameDesc">Name Z-A</option>
              <option value="priceAsc">Price Low-High</option>
              <option value="priceDesc">Price High-Low</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0f141d] p-3">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button onClick={() => handleBulkAction('activate')} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Activate</button>
          <button onClick={() => handleBulkAction('deactivate')} className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">Deactivate</button>
          <button onClick={() => handleBulkAction('clone')} className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-3 py-2 text-sm text-sky-300">Clone</button>
          <button onClick={() => handleBulkAction('csv')} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">Export CSV</button>
          <button onClick={() => handleBulkAction('excel')} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">Export Excel</button>
          <button onClick={() => handleBulkAction('print')} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">Print</button>
          <button onClick={() => setSelectedIds([])} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80">Clear Selection</button>
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
                  <th className="px-3 py-3">Project Type</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Price</th>
                  <th className="px-3 py-3">Billing</th>
                  <th className="px-3 py-3">Delivery</th>
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
                    <td className="px-3 py-3">{plan.projectType}</td>
                    <td className="px-3 py-3">{plan.category}</td>
                    <td className="px-3 py-3">{formatCurrency(plan.discountPrice || plan.basePrice)}</td>
                    <td className="px-3 py-3">{plan.billingCycle}</td>
                    <td className="px-3 py-3">{plan.deliveryDays} days</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[plan.status] || 'border-white/10 bg-white/5 text-white/70'}`}>{plan.status}</span>
                    </td>
                    
                    
                    <td className="px-3 py-3">{formatDate(plan.updatedAt)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => openViewDrawer(plan)} className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/80">View</button>
                        <button onClick={() => openEditDrawer(plan)} className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/80">Edit</button>
                        {/* <button onClick={() => handleDuplicate(plan)} className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-2.5 py-1.5 text-xs text-sky-300">Clone</button>
                        <button onClick={() => toggleStatus(plan)} className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300">Status</button> */}
                        <button onClick={() => handleDelete(plan)} className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-300">Delete</button>
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
                  <span className="mb-1 block">Project Type</span>
                  <select name="projectType" value={formData.projectType} onChange={handleFieldChange} className={selectClasses} disabled={mode === 'view'}>
                    <option value="">Choose</option>
                    {projectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
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
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Featured Badge</span>
                  <select name="featuredBadge" value={formData.featuredBadge} onChange={handleFieldChange} className={selectClasses} disabled={mode === 'view'}>
                    {featuredBadges.map((badge) => <option key={badge} value={badge}>{badge}</option>)}
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
                  <span className="mb-1 block">Display Order</span>
                  <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Plan Icon</span>
                  <input type="file" accept="image/*" onChange={(event) => handleFileChange(event, 'planIcon')} className={fieldClasses} disabled={mode === 'view'} />
                  {formData.planIcon ? <img src={formData.planIcon} alt="Plan icon preview" className="mt-2 h-14 w-14 rounded-2xl object-cover" /> : null}
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
                <CreditCard size={16} className="text-orange-400" />
                <h4 className="text-lg font-semibold text-white">Pricing & Billing</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Base Price</span>
                  <input type="number" name="basePrice" value={formData.basePrice} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Discount Price</span>
                  <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Currency</span>
                  <input name="currency" value={formData.currency} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Tax %</span>
                  <input type="number" name="taxPercentage" value={formData.taxPercentage} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Setup Fee</span>
                  <input type="number" name="setupFee" value={formData.setupFee} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Renewal Price</span>
                  <input type="number" name="renewalPrice" value={formData.renewalPrice} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Billing Cycle</span>
                  <select name="billingCycle" value={formData.billingCycle} onChange={handleFieldChange} className={selectClasses} disabled={mode === 'view'}>
                    {billingCycles.map((cycle) => <option key={cycle} value={cycle}>{cycle}</option>)}
                  </select>
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Delivery Days</span>
                  <input type="number" name="deliveryDays" value={formData.deliveryDays} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Priority Delivery</span>
                  <select name="priorityDeliveryAvailable" value={formData.priorityDeliveryAvailable} onChange={handleFieldChange} className={selectClasses} disabled={mode === 'view'}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Rush Delivery Charges</span>
                  <input type="number" name="rushDeliveryCharges" value={formData.rushDeliveryCharges} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                </label>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-[#101723] p-4">
              <div className="mb-4 flex items-center gap-2">
                <Users size={16} className="text-orange-400" />
                <h4 className="text-lg font-semibold text-white">Team Allocation</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ['uiUxDesigner', 'UI/UX Designer'],
                  ['frontendDeveloper', 'Frontend Developer'],
                  ['backendDeveloper', 'Backend Developer'],
                  ['mobileDeveloper', 'Mobile Developer'],
                  ['qaEngineer', 'QA Engineer'],
                  ['devOpsEngineer', 'DevOps Engineer'],
                  ['projectManager', 'Project Manager'],
                  ['supportEngineer', 'Support Engineer'],
                ].map(([name, label]) => (
                  <label key={name} className="text-sm text-white/70">
                    <span className="mb-1 block">{label}</span>
                    <input type="number" name={name} value={formData[name]} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
                  </label>
                ))}
                <label className="text-sm text-white/70">
                  <span className="mb-1 block">Estimated Team Size</span>
                  <input type="number" name="estimatedTeamSize" value={formData.estimatedTeamSize} onChange={handleFieldChange} className={fieldClasses} disabled={mode === 'view'} />
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
