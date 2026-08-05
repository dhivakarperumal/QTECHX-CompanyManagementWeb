import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus, AlertCircle, CheckCircle, Loader2,
  Paperclip, ClipboardList, CheckSquare, Square, BadgeCheck,
  FileText, Clock, Download
} from "lucide-react";
import api, { API_URL } from "../../api";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500 transition placeholder:text-slate-600";

function FieldBox({ label, children }) {
  return (
    <div className="rounded-2xl bg-slate-900/80 p-4">
      <label className="block text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">{label}</label>
      {children}
    </div>
  );
}

/** Format ISO date string → "05 Aug 2026, 11:45 AM" */
function fmtDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true,
    });
  } catch { return null; }
}

/** Parse JSON attachments array safely */
function parseAttachments(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; }
  catch { return []; }
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

const EMPTY_ASSIGN_FORM = {
  project_id: "",
  assigned_to: "",
  team: "",
  assignment_date: getTodayIso(),
  start_date: "",
  due_date: "",
  status: "",
};


export default function AssignTaskPage() {
  const navigate = useNavigate();

  const [projects, setProjects]                 = useState([]);
  const [planModules, setPlanModules]           = useState([]);
  const [planInfo, setPlanInfo]                 = useState(null);
  const [selectedModules, setSelectedModules]   = useState([]);

  // Set of already-assigned module title keys (lowercase) across the project
  const [assignedTitlesAll, setAssignedTitlesAll]     = useState(new Set());
  // Map: lowercased title → full task row (for created_at, attachments) for the project
  const [assignedTaskMapAll, setAssignedTaskMapAll]   = useState(new Map());
  // Per-selected-employee subset (assigned to the currently selected employee)
  const [assignedTitlesForEmployee, setAssignedTitlesForEmployee] = useState(new Set());
  const [assignedTaskMapForEmployee, setAssignedTaskMapForEmployee] = useState(new Map());
  const [assignedTitlesLoading, setAssignedTitlesLoading] = useState(false);

  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [assignFile, setAssignFile]             = useState(null);
  const [assignForm, setAssignForm]             = useState(EMPTY_ASSIGN_FORM);

  const [projectEmployeesLoading, setProjectEmployeesLoading] = useState(false);
  const [planLoading, setPlanLoading]           = useState(false);
  const [assigningTask, setAssigningTask]       = useState(false);
  const [assignError, setAssignError]           = useState("");
  const [assignSuccess, setAssignSuccess]       = useState("");
  const [moduleTab, setModuleTab]               = useState('not_assigned'); // 'not_assigned' | 'assigned'

  // ─── Load all projects once ────────────────────────────────────────────────
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const [projectsResponse, assignmentsResponse] = await Promise.all([
          api.get('/projects?limit=100&page=1').catch(() => ({ data: { data: [] } })),
          api.get('/projects/assignments/all').catch(() => ({ data: { data: [] } })),
        ]);

        const projectsFromApi = (projectsResponse?.data?.data || []).map((project) => ({
          uuid: project.uuid,
          project_name: project.project_name || project.short_name || project.project_code || project.name || project.uuid,
        }));

        const projectsFromAssignments = (assignmentsResponse?.data?.data || [])
          .map((assignment) => {
            if (!assignment?.project_uuid) return null;
            return {
              uuid: assignment.project_uuid,
              project_name: assignment.project_name || assignment.project_uuid,
            };
          })
          .filter(Boolean);

        const uniqueAssignedProjects = Array.from(
          new Map(projectsFromAssignments.map((project) => [project.uuid, project])).values()
        );

        const mergedProjects = Array.from(
          new Map([...projectsFromAssignments, ...projectsFromApi].map((project) => [project.uuid, project])).values()
        );

        const finalList = uniqueAssignedProjects.length > 0 ? uniqueAssignedProjects : mergedProjects;
        setProjects(finalList);
        if (finalList.length > 0) setAssignForm((p) => ({ ...p, project_id: finalList[0].uuid }));
      } catch (err) {
        setProjects([]);
      }
    };

    fetchProjects();
  }, []);

  // ─── Fetch already-assigned titles + full task data ────────────────────────
  const fetchAssignedTitles = useCallback(async (project_id, employee_id) => {
    if (!project_id) {
      setAssignedTitlesAll(new Set());
      setAssignedTaskMapAll(new Map());
      setAssignedTitlesForEmployee(new Set());
      setAssignedTaskMapForEmployee(new Map());
      return;
    }
    setAssignedTitlesLoading(true);
    try {
      const params = { project_id, limit: 500, page: 1 };
      // Fetch all tasks for the project, then split client-side
      const { data } = await api.get("/tasks", { params });
      const rows = data.data || [];

      // All assigned tasks in project
      const allAssigned = rows.filter((t) => !!t.assigned_to);
      const namesAll = new Set(
        allAssigned
          .map((t) => (t.task_name || t.module_name || "").trim().toLowerCase())
          .filter(Boolean)
      );
      const taskMapAll = new Map();
      allAssigned.forEach((t) => {
        const key = (t.task_name || t.module_name || "").trim().toLowerCase();
        if (key && !taskMapAll.has(key)) taskMapAll.set(key, t);
      });

      // Subset assigned to the selected employee
      const empAssigned = employee_id ? rows.filter((t) => t.assigned_to === employee_id) : [];
      const namesEmp = new Set(
        empAssigned
          .map((t) => (t.task_name || t.module_name || "").trim().toLowerCase())
          .filter(Boolean)
      );
      const taskMapEmp = new Map();
      empAssigned.forEach((t) => {
        const key = (t.task_name || t.module_name || "").trim().toLowerCase();
        if (key && !taskMapEmp.has(key)) taskMapEmp.set(key, t);
      });

      setAssignedTitlesAll(namesAll);
      setAssignedTaskMapAll(taskMapAll);
      setAssignedTitlesForEmployee(namesEmp);
      setAssignedTaskMapForEmployee(taskMapEmp);
    } catch (e) {
      setAssignedTitlesAll(new Set());
      setAssignedTaskMapAll(new Map());
      setAssignedTitlesForEmployee(new Set());
      setAssignedTaskMapForEmployee(new Map());
    } finally {
      setAssignedTitlesLoading(false);
    }
  }, []);


  // ─── When project changes → load employees + plan modules ─────────────────
  useEffect(() => {
    if (!assignForm.project_id) return;

    setProjectEmployeesLoading(true);
    setAssignedEmployees([]);
    api.get(`/projects/${assignForm.project_id}/assignments`)
      .then(({ data }) => {
        const list =
          data.assignedEmployees ||
          data.project?.assignedEmployees ||
          data.project?.employees ||
          data.data ||
          [];
        setAssignedEmployees(list);
      })
      .catch(() => setAssignedEmployees([]))
      .finally(() => setProjectEmployeesLoading(false));

    setPlanLoading(true);
    setPlanModules([]);
    setPlanInfo(null);
    setSelectedModules([]);
    // reset both global and per-employee assigned sets/maps
    setAssignedTitlesAll(new Set());
    setAssignedTitlesForEmployee(new Set());
    setAssignedTaskMapAll(new Map());
    setAssignedTaskMapForEmployee(new Map());

    api.get("/project-plans")
      .then(({ data }) => {
        const allPlans = data.data || data.plans || data || [];
        const matched = allPlans.find(
          (plan) =>
            String(plan.project_id) === String(assignForm.project_id) ||
            String(plan.projectId)  === String(assignForm.project_id)
        );
        if (matched) {
          setPlanInfo(matched);
          let modules = [];
          if (typeof matched.taskmodule === "string") {
            try { modules = JSON.parse(matched.taskmodule); } catch {}
          } else if (Array.isArray(matched.taskmodule)) {
            modules = matched.taskmodule;
          }
          setPlanModules(modules);
        }
      })
      .catch(() => {})
      .finally(() => setPlanLoading(false));

    // Fetch assigned titles for this project (no employee filter yet)
    fetchAssignedTitles(assignForm.project_id, assignForm.assigned_to || null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignForm.project_id]);

  // ─── When employee changes → re-fetch assigned titles ─────────────────────
  useEffect(() => {
    if (!assignForm.project_id) return;
    setSelectedModules([]);
    fetchAssignedTitles(assignForm.project_id, assignForm.assigned_to || null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignForm.assigned_to]);

  // ─── Helpers: check if a module title is already assigned ─────────────────
  const getAssignedTaskRowForTitle = (titleKey) => {
    if (!titleKey) return null;
    // exact match
    const exact = assignedTaskMapAll.get(titleKey);
    if (exact) return exact;
    // fallback: find any assigned task whose task_name/module_name includes the titleKey or vice-versa
    const lower = titleKey.toLowerCase();
    for (const t of assignedTaskMapAll.values()) {
      const name = (t.task_name || t.module_name || "").toLowerCase();
      if (!name) continue;
      if (name.includes(lower) || lower.includes(name)) return t;
    }
    return null;
  };

  const isModuleAssigned = (mod) => {
    const key = (mod.title || "").trim().toLowerCase();
    if (!key) return false;
    if (assignedTitlesAll.has(key)) return true;
    return !!getAssignedTaskRowForTitle(key);
  };

  // Indices of modules that are NOT yet assigned (selectable)
  const selectableIndices = planModules
    .map((mod, i) => ({ mod, i }))
    .filter(({ mod }) => !isModuleAssigned(mod))
    .map(({ i }) => i);

  const toggleModule = (idx) => {
    if (isModuleAssigned(planModules[idx])) return; // block already-assigned
    setSelectedModules((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleAll = () => {
    if (selectableIndices.length === 0) return;
    const allSelectableChosen = selectableIndices.every((i) => selectedModules.includes(i));
    if (allSelectableChosen) {
      setSelectedModules([]);
    } else {
      setSelectedModules(selectableIndices);
    }
  };

  const allSelectableChosen =
    selectableIndices.length > 0 &&
    selectableIndices.every((i) => selectedModules.includes(i));

  // ─── Submit handler ────────────────────────────────────────────────────────
  const handleAssignTask = async () => {
    setAssignError("");
    setAssignSuccess("");
    if (!assignForm.project_id) return setAssignError("Please select a project.");
    if (selectedModules.length === 0) return setAssignError("Please select at least one task module.");
    if (!assignForm.assigned_to) return setAssignError("Please select an employee.");

    const chosenModules = selectedModules.map((i) => planModules[i]);

    try {
      setAssigningTask(true);

      // Prepare attachment base64 once (if file provided)
      let attachmentBase64 = null, attachmentName = null, attachmentType = null;
      if (assignFile) {
        if (assignFile.size > 50 * 1024 * 1024) {
          setAssigningTask(false);
          return setAssignError("File too large. Maximum 50 MB allowed.");
        }
        attachmentBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(assignFile);
        });
        attachmentName = assignFile.name;
        attachmentType = assignFile.type;
      }

      const results      = [];
      const newlyAssigned = []; // { key, taskRow } pairs for live map update

      for (const mod of chosenModules) {
        // Calculate duration-based due_date if not provided
        let computedDueDate = assignForm.due_date || "";
        if (!computedDueDate && assignForm.start_date && mod.duration) {
          const d = new Date(assignForm.start_date);
          // Parse numeric part only (e.g. "5 Days" -> 5)
          const numDays = parseInt(mod.duration, 10);
          if (!isNaN(numDays)) d.setDate(d.getDate() + numDays);
          computedDueDate = d.toISOString().slice(0, 10);
        }

        // Build combined attachments: plan document + user-uploaded file
        const combinedAttachments = [];
        if (mod.documentName) {
          combinedAttachments.push({
            original_name: mod.documentName,
            filename:      mod.documentName,
            path:          `uploads/plan_documents/${mod.documentName}`,
            mimetype:      "application/octet-stream",
            source:        "plan",
          });
        }
        if (attachmentName) {
          combinedAttachments.push({
            original_name: attachmentName,
            filename:      attachmentName,
            path:          `uploads/task_attachments/${attachmentName}`,
            mimetype:      attachmentType || "application/octet-stream",
            source:        "uploaded",
          });
        }

        // Step 1: Create task
        const taskPayload = {
          project_id:      assignForm.project_id,
          task_name:       mod.title       || "Task",
          module_name:     mod.title       || "",
          description:     mod.description || "",
          category:        mod.category    || mod.type || "",
          priority:        mod.priority    || "Medium",
          status:          assignForm.status || "Pending",
          estimated_hours: mod.duration ? (() => { const n = parseInt(mod.duration, 10); return isNaN(n) ? mod.duration : String(n * 8); })() : "",
          assignment_date: assignForm.assignment_date || "",
          start_date:      assignForm.start_date || "",
          due_date:        computedDueDate,
          assigned_to:     assignForm.assigned_to,
          team:            assignForm.team || "",
          attachments:     combinedAttachments.length > 0 ? JSON.stringify(combinedAttachments) : null,
          ...(attachmentBase64 && { attachmentBase64, attachmentName, attachmentType }),
        };
        const createRes = await api.post("/tasks", taskPayload);
        if (createRes.data?.success === false) {
          throw new Error(createRes.data?.message || `Failed to create task for module "${mod.title}"`);
        }
        const createdTask = createRes.data?.data || {};
        const taskUuid    = createdTask.uuid || createRes.data?.uuid;
        if (!taskUuid) throw new Error(`Could not get task ID for module "${mod.title}"`);

        // Step 2: Assign task
        const assignPayload = {
          project_id:    assignForm.project_id,
          employee_id:   assignForm.assigned_to,
          task_id:       taskUuid,
          assigned_date: assignForm.assignment_date || null,
          start_date:    assignForm.start_date || null,
          due_date:      computedDueDate || null,
          status:        assignForm.status || "Pending",
          duration:      mod.duration || null,
          team:          assignForm.team || null,
        };
        const assignRes = await api.post("/tasks/assign", assignPayload);
        if (assignRes.data?.success === false) {
          throw new Error(assignRes.data?.message || `Failed to assign task "${mod.title}"`);
        }

        const assignedTask = assignRes.data?.data?.task || createdTask;

        // Merge combinedAttachments into the returned task row so the
        // document column reflects them immediately without a page reload
        const enrichedTaskRow = {
          ...assignedTask,
          attachments: assignedTask.attachments
            ? assignedTask.attachments
            : (combinedAttachments.length > 0 ? JSON.stringify(combinedAttachments) : null),
        };

        results.push(mod.title);
        newlyAssigned.push({
          key:     (mod.title || "").trim().toLowerCase(),
          taskRow: enrichedTaskRow,
          mod:     mod,
        });
      }

      // ── Live-update assignedTitles + assignedTaskMap immediately ──────────
      // Update global/project-level assigned sets/maps
      setAssignedTitlesAll((prev) => {
        const updated = new Set(prev);
        newlyAssigned.forEach(({ key }) => updated.add(key));
        return updated;
      });
      setAssignedTaskMapAll((prev) => {
        const updated = new Map(prev);
        newlyAssigned.forEach(({ key, taskRow }) => {
          if (key) {
            updated.set(key, {
              ...taskRow,
              attachments: taskRow.attachments || null,
            });
          }
        });
        return updated;
      });
      // Update per-employee maps (we just assigned to the selected employee)
      setAssignedTitlesForEmployee((prev) => {
        const updated = new Set(prev);
        newlyAssigned.forEach(({ key }) => updated.add(key));
        return updated;
      });
      setAssignedTaskMapForEmployee((prev) => {
        const updated = new Map(prev);
        newlyAssigned.forEach(({ key, taskRow }) => {
          if (key) {
            updated.set(key, {
              ...taskRow,
              attachments: taskRow.attachments || null,
            });
          }
        });
        return updated;
      });

      setAssignSuccess(`${results.length} module${results.length > 1 ? "s" : ""} assigned successfully!`);
      setAssignForm((p) => ({ ...EMPTY_ASSIGN_FORM, project_id: p.project_id, assigned_to: p.assigned_to }));
      setSelectedModules([]);
      setAssignFile(null);

      // Full server re-fetch after 1.5 s to get real attachment paths
      setTimeout(() => {
        fetchAssignedTitles(assignForm.project_id, assignForm.assigned_to || null);
      }, 1500);

    } catch (err) {
      setAssignError(err?.response?.data?.message || err.message || "Failed to assign task.");
    } finally {
      setAssigningTask(false);
    }
  };

  // ─── Count stats ──────────────────────────────────────────────────────────
  const totalModules    = planModules.length;
  const assignedCount   = planModules.filter((m) => isModuleAssigned(m)).length;
  const availableCount  = totalModules - assignedCount;

  return (
    <div className="space-y-6 text-white pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <ClipboardList size={22} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Assign Task</h1>
            <p className="text-white/40 text-xs mt-0.5">
              Select a project, pick task modules and assign to an employee.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/tasks")}
          className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-slate-300 hover:border-white/20 transition"
        >
          Back to Tasks
        </button>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0f141d] p-6 space-y-4">

        {/* Row 1: Project + Employee */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldBox label="Project *">
            <select
              value={assignForm.project_id}
              onChange={(e) =>
                setAssignForm((p) => ({ ...p, project_id: e.target.value, assigned_to: "" }))
              }
              className={inputCls}
            >
              <option value="" disabled>Select project</option>
              {projects.map((project) => (
                <option key={project.uuid} value={project.uuid}>
                  {project.project_name || project.short_name || project.project_code}
                </option>
              ))}
            </select>
          </FieldBox>

          <FieldBox label="Assign To Employee *">
            {projectEmployeesLoading ? (
              <div className="flex items-center gap-2 text-sm text-white/40 py-3">
                <Loader2 size={14} className="animate-spin" /> Loading employees...
              </div>
            ) : !assignForm.project_id ? (
              <p className="text-sm text-white/30 py-2">Select a project to see assigned employees.</p>
            ) : assignedEmployees.length === 0 ? (
              <p className="text-sm text-white/30 py-2">No employees assigned to this project.</p>
            ) : (
              <select
                value={assignForm.assigned_to}
                onChange={(e) => setAssignForm((p) => ({ ...p, assigned_to: e.target.value }))}
                className={inputCls}
                disabled={!assignForm.project_id}
              >
                <option value="" disabled>Select employee</option>
                {assignedEmployees.map((emp) => {
                  const id = emp.employee_id || emp.id || emp.employeeCode || emp.employee_code;
                  const name = emp.full_name || emp.employee_name ||
                    `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || id;
                  const code = emp.employee_code || emp.employeeCode || "";
                  const role = emp.designation || emp.role || "";
                  return (
                    <option key={id} value={id}>
                      {`${name}${code ? ` (${code})` : ""}${role ? ` • ${role}` : ""}`}
                    </option>
                  );
                })}
              </select>
            )}
          </FieldBox>
        </div>

        {/* Task Modules Table */}
        <div className="rounded-2xl bg-slate-900/80 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">
                Task Modules *
                {planInfo && (
                  <span className="ml-2 text-orange-400 normal-case">
                    — {planInfo.plan_name || planInfo.planName}
                  </span>
                )}
              </label>
              {/* Stats badges */}
              {totalModules > 0 && !planLoading && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-400">
                    <BadgeCheck size={11} /> {assignedCount} Assigned
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 border border-orange-500/20 px-2 py-0.5 text-[11px] text-orange-400">
                    {availableCount} Available
                  </span>
                  {assignedTitlesLoading && (
                    <Loader2 size={12} className="animate-spin text-white/30" />
                  )}
                </div>
              )}
            </div>

            {selectableIndices.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-orange-400 hover:text-orange-300 transition whitespace-nowrap"
              >
                {allSelectableChosen ? "Deselect All" : `Select All (${availableCount})`}
              </button>
            )}
          </div>

          {planLoading ? (
            <div className="flex items-center gap-2 text-sm text-white/40 py-4">
              <Loader2 size={16} className="animate-spin" /> Loading modules...
            </div>
          ) : !assignForm.project_id ? (
            <p className="text-sm text-white/30 py-3">Select a project to see its task modules.</p>
          ) : planModules.length === 0 ? (
            <p className="text-sm text-white/30 py-3">No task modules found for this project plan.</p>
          ) : (
            <div>
              {/* ── Tabs ── */}
              <div className="flex items-center gap-1 mb-3 border-b border-white/5 pb-3">
                <button
                  type="button"
                  onClick={() => setModuleTab('not_assigned')}
                  className={[
                    "px-4 py-1.5 rounded-lg text-[12px] font-medium transition",
                    moduleTab === 'not_assigned'
                      ? "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                      : "bg-white/5 border border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10",
                  ].join(" ")}
                >
                  Not Assigned
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-orange-500/20 text-[10px] text-orange-400">
                    {availableCount}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setModuleTab('assigned')}
                  className={[
                    "px-4 py-1.5 rounded-lg text-[12px] font-medium transition",
                    moduleTab === 'assigned'
                      ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                      : "bg-white/5 border border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10",
                  ].join(" ")}
                >
                  Assigned
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-[10px] text-emerald-400">
                    {assignedCount}
                  </span>
                </button>
              </div>

              {/* ── Not Assigned Tab ── */}
              {moduleTab === 'not_assigned' && (
                <div className="overflow-x-auto rounded-xl border border-white/5">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-white/5 text-white/40 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 w-10">
                          <button
                            type="button"
                            onClick={toggleAll}
                            disabled={selectableIndices.length === 0}
                            className="disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {allSelectableChosen
                              ? <CheckSquare size={16} className="text-orange-500" />
                              : <Square size={16} className="text-white/30" />}
                          </button>
                        </th>
                        <th className="px-4 py-3">S No</th>
                        <th className="px-4 py-3">Module / Task Title</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3"><span className="flex items-center gap-1"><FileText size={11}/>Documents</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {planModules.filter((mod) => !isModuleAssigned(mod)).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-white/30 text-sm">
                            All modules have been assigned.
                          </td>
                        </tr>
                      ) : (
                        planModules.map((mod, idx) => {
                          const assigned = isModuleAssigned(mod);
                          if (assigned) return null;
                          const checked = selectedModules.includes(idx);
                          return (
                            <tr
                              key={idx}
                              onClick={() => toggleModule(idx)}
                              className={[
                                "transition-colors align-top cursor-pointer",
                                checked ? "bg-orange-500/10" : "hover:bg-white/[0.03]",
                              ].join(" ")}
                            >
                              <td className="px-4 py-3">
                                {checked
                                  ? <CheckSquare size={16} className="text-orange-500" />
                                  : <Square size={16} className="text-white/30" />}
                              </td>
                              <td className="px-4 py-3 text-white/40">{idx + 1}</td>
                              <td className="px-4 py-3 font-semibold text-white">{mod.title || "—"}</td>
                              <td className="px-4 py-3 text-white/70 whitespace-nowrap">
                                {(() => {
                                  if (mod.duration_hours) return `${mod.duration_hours} hours`;
                                  if (!mod.duration) return "—";
                                  if (/[a-zA-Z]/.test(mod.duration)) return mod.duration;
                                  const num = Number(mod.duration);
                                  return !isNaN(num) ? `${num * 8} hours` : mod.duration;
                                })()}
                              </td>
                              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                {mod.documentName ? (
                                  <a
                                    href={`${API_URL.replace('/api','')}/uploads/plan_documents/${mod.documentName}`}
                                    target="_blank" rel="noopener noreferrer"
                                    download={mod.documentName}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 px-2 py-1 text-[11px] text-sky-400 hover:bg-sky-500/20 transition max-w-[160px] truncate"
                                    title={mod.documentName}
                                  >
                                    <Download size={10} className="shrink-0" />
                                    <span className="truncate">{mod.documentName}</span>
                                  </a>
                                ) : (
                                  <span className="text-white/20 text-xs">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ── Assigned Tab ── */}
              {moduleTab === 'assigned' && (
                <div className="overflow-x-auto rounded-xl border border-white/5">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-white/5 text-white/40 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 w-10"><BadgeCheck size={14} className="text-emerald-500" /></th>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Module / Task Title</th>
                        <th className="px-4 py-3">Duration</th>
                        <th className="px-4 py-3"><span className="flex items-center gap-1"><Clock size={11}/>Assigned At</span></th>
                        <th className="px-4 py-3"><span className="flex items-center gap-1"><FileText size={11}/>Documents</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {planModules.filter((mod) => isModuleAssigned(mod)).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-white/30 text-sm">
                            No modules have been assigned yet.
                          </td>
                        </tr>
                      ) : (
                        planModules.map((mod, idx) => {
                          const assigned = isModuleAssigned(mod);
                          if (!assigned) return null;
                          const titleKey = (mod.title || "").trim().toLowerCase();
                          const taskRow  = assignedTaskMapAll.get(titleKey);
                          const createdAt = taskRow ? fmtDate(taskRow.created_at) : null;
                          const docs = taskRow ? parseAttachments(taskRow.attachments) : [];
                          return (
                            <tr key={idx} className="bg-white/[0.01] align-top">
                              <td className="px-4 py-3">
                                <BadgeCheck size={16} className="text-emerald-500" />
                              </td>
                              <td className="px-4 py-3 text-white/40">{idx + 1}</td>
                              <td className="px-4 py-3 font-semibold text-white/60">{mod.title || "—"}</td>
                              <td className="px-4 py-3 text-white/50 whitespace-nowrap">
                                {(() => {
                                  if (mod.duration_hours) return `${mod.duration_hours} hours`;
                                  if (!mod.duration) return "—";
                                  if (/[a-zA-Z]/.test(mod.duration)) return mod.duration;
                                  const num = Number(mod.duration);
                                  return !isNaN(num) ? `${num * 8} hours` : mod.duration;
                                })()}
                              </td>
                              <td className="px-4 py-3">
                                {createdAt ? (
                                  <span className="flex items-center gap-1 text-[12px] text-sky-400 whitespace-nowrap">
                                    <Clock size={11} className="shrink-0" />{createdAt}
                                  </span>
                                ) : (
                                  <span className="text-white/20 text-xs">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                {(docs.length > 0 || mod.documentName) ? (
                                  <div className="flex flex-col gap-1">
                                    {docs.map((doc, di) => {
                                      const fileUrl = `${API_URL.replace('/api','')}/${doc.path || doc.filename}`;
                                      const label = doc.original_name || doc.filename || `File ${di + 1}`;
                                      return (
                                        <a key={di} href={fileUrl} target="_blank" rel="noopener noreferrer"
                                          download={doc.original_name || true}
                                          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 px-2 py-1 text-[11px] text-orange-400 hover:bg-orange-500/20 transition max-w-[160px] truncate"
                                          title={label}
                                        >
                                          <Download size={10} className="shrink-0" />
                                          <span className="truncate">{label}</span>
                                        </a>
                                      );
                                    })}
                                    {docs.length === 0 && mod.documentName && (
                                      <a
                                        href={`${API_URL.replace('/api','')}/uploads/plan_documents/${mod.documentName}`}
                                        target="_blank" rel="noopener noreferrer"
                                        download={mod.documentName}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 px-2 py-1 text-[11px] text-sky-400 hover:bg-sky-500/20 transition max-w-[160px] truncate"
                                        title={mod.documentName}
                                      >
                                        <Download size={10} className="shrink-0" />
                                        <span className="truncate">{mod.documentName}</span>
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-white/20 text-xs">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Selection counter */}
          <div className="mt-2 flex items-center gap-3">
            {selectedModules.length > 0 && (
              <p className="text-xs text-orange-400">
                {selectedModules.length} module{selectedModules.length > 1 ? "s" : ""} selected
              </p>
            )}
            {availableCount === 0 && totalModules > 0 && !planLoading && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <BadgeCheck size={12} /> All modules have been assigned
                {assignForm.assigned_to ? " to this employee" : ""}.
              </p>
            )}
          </div>
        </div>

        {/* Row 3: Team + Assignment + Start + End + Status */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <FieldBox label="Team / Department">
            <input
              value={assignForm.team}
              onChange={(e) => setAssignForm((p) => ({ ...p, team: e.target.value }))}
              className={inputCls}
              placeholder="e.g. Frontend, Backend"
            />
          </FieldBox>

          <FieldBox label="Assignment Date">
            <input
              type="date"
              value={assignForm.assignment_date}
              onChange={(e) => setAssignForm((p) => ({ ...p, assignment_date: e.target.value }))}
              className={inputCls}
            />
          </FieldBox>

          <FieldBox label="Start Date">
            <input
              type="date"
              value={assignForm.start_date}
              onChange={(e) => setAssignForm((p) => ({ ...p, start_date: e.target.value }))}
              className={inputCls}
            />
          </FieldBox>

          <FieldBox label="End Date">
            <input
              type="date"
              value={assignForm.due_date}
              onChange={(e) => setAssignForm((p) => ({ ...p, due_date: e.target.value }))}
              className={inputCls}
            />
          </FieldBox>

          <FieldBox label="Status">
            <select
              value={assignForm.status}
              onChange={(e) => setAssignForm((p) => ({ ...p, status: e.target.value }))}
              className={inputCls}
            >
              <option value="" disabled>Select status</option>
              {["Pending","In Progress","Review","Testing","Completed"].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </FieldBox>
        </div>

        {/* Attachment */}
        <FieldBox label="Attachment (PDF, Word, Excel, etc.)">
          <label
            htmlFor="assign-file-upload"
            style={{
              display: "flex", alignItems: "center", gap: "10px", cursor: "pointer",
              border: "2px dashed rgba(255,255,255,0.12)", borderRadius: "12px",
              padding: "14px 16px", transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(251,146,60,0.5)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
          >
            <Paperclip size={18} style={{ color: "#f97316", flexShrink: 0 }} />
            <span style={{ fontSize: "13px", color: assignFile ? "#e2e8f0" : "#64748b" }}>
              {assignFile ? assignFile.name : "Click to attach a document..."}
            </span>
            {assignFile && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); setAssignFile(null); }}
                style={{ marginLeft: "auto", color: "#f43f5e", fontSize: "12px", background: "none", border: "none", cursor: "pointer" }}
              >
                Remove
              </button>
            )}
          </label>
          <input
            id="assign-file-upload"
            type="file"
            style={{ display: "none" }}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg"
            onChange={(e) => setAssignFile(e.target.files[0] || null)}
          />
        </FieldBox>

        {assignError && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            <AlertCircle size={16} /> {assignError}
          </div>
        )}
        {assignSuccess && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            <CheckCircle size={16} /> {assignSuccess}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/tasks")}
            className="rounded-xl border border-white/10 bg-slate-900 px-6 py-2.5 text-sm text-slate-300 hover:border-white/20 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssignTask}
            disabled={assigningTask || selectedModules.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {assigningTask
              ? <><Loader2 size={14} className="animate-spin" /> Assigning...</>
              : <><UserPlus size={14} /> Assign {selectedModules.length > 0 ? `(${selectedModules.length})` : "Task"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
