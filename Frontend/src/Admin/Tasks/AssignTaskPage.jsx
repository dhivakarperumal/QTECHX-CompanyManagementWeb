import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus, AlertCircle, CheckCircle, Loader2,
  Paperclip, ClipboardList, CheckSquare, Square
} from "lucide-react";
import api from "../../api";

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

const EMPTY_ASSIGN_FORM = {
  project_id: "",
  assigned_to: "",
  team: "",
  assignment_date: "",
  start_date: "",
  due_date: "",
  status: "",
};

const normalizeTaskStatus = (s) => {
  if (!s) return "Pending";
  const v = s.toString().trim();
  if (["Pending", "To Do"].includes(v)) return "Pending";
  if (["In Progress", "Progress"].includes(v)) return "In Progress";
  if (["Completed", "Done"].includes(v)) return "Completed";
  return v;
};

export default function AssignTaskPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [planModules, setPlanModules] = useState([]);     // taskmodule array from project_plan
  const [planInfo, setPlanInfo]     = useState(null);     // the matched plan row
  const [selectedModules, setSelectedModules] = useState([]);
  const [existingTaskNames, setExistingTaskNames] = useState(new Set()); // already-assigned module titles
  const [assignedEmployees, setAssignedEmployees] = useState([]);
  const [assignFile, setAssignFile] = useState(null);
  const [assignForm, setAssignForm] = useState(EMPTY_ASSIGN_FORM);

  const [projectEmployeesLoading, setProjectEmployeesLoading] = useState(false);
  const [planLoading, setPlanLoading]   = useState(false);
  const [assigningTask, setAssigningTask] = useState(false);
  const [assignError, setAssignError]   = useState("");
  const [assignSuccess, setAssignSuccess] = useState("");

  // Load all projects once
  useEffect(() => {
    api
      .get("/projects")
      .then(({ data }) => {
        const list = data.data || data.projects || [];
        setProjects(list);
        if (list.length > 0)
          setAssignForm((p) => ({ ...p, project_id: list[0].uuid }));
      })
      .catch(() => {});
  }, []);

  // When project changes → load employees + project plan modules
  useEffect(() => {
    if (!assignForm.project_id) return;

    // employees — use the assignments endpoint (same as AllProjects.jsx)
    setProjectEmployeesLoading(true);
    setAssignedEmployees([]);
    api
      .get(`/projects/${assignForm.project_id}/assignments`)
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

    // project plan → taskmodule + already-assigned task names
    setPlanLoading(true);
    setPlanModules([]);
    setPlanInfo(null);
    setSelectedModules([]);
    setExistingTaskNames(new Set());

    const planPromise = api
      .get("/project-plans")
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
      .catch(() => {});

    // Fetch existing tasks for this project to know which modules are already assigned
    const tasksPromise = api
      .get("/tasks", { params: { project_id: assignForm.project_id, limit: 500, page: 1 } })
      .then(({ data }) => {
        const rows = data.data || [];
        const names = new Set(
          rows
            .filter((t) => t.assigned_to)   // only already-assigned tasks
            .map((t) => (t.task_name || t.module_name || "").trim().toLowerCase())
            .filter(Boolean)
        );
        setExistingTaskNames(names);
      })
      .catch(() => {});

    Promise.all([planPromise, tasksPromise]).finally(() => setPlanLoading(false));
  }, [assignForm.project_id]);

  const toggleModule = (idx) => {
    setSelectedModules((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleAll = () => {
    if (selectedModules.length === planModules.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(planModules.map((_, i) => i));
    }
  };

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

      // Step 1: Create a task in the tasks table for each selected module,
      //         then Step 2: assign each task to the employee
      const results = [];
      for (const mod of chosenModules) {
        // Create task
        const taskPayload = {
          project_id:      assignForm.project_id,
          task_name:       mod.title || "Task",
          module_name:     mod.title || "",
          description:     mod.description || "",
          status:          assignForm.status || "Pending",
          priority:        "Medium",
          estimated_hours: mod.duration ? String(Number(mod.duration) * 8) : "",
          start_date:      assignForm.assignment_date || "",
          due_date:        "",
          assigned_to:     assignForm.assigned_to,
        };
        const createRes = await api.post("/tasks", taskPayload);
        if (createRes.data?.success === false) {
          throw new Error(createRes.data?.message || `Failed to create task for module "${mod.title}"`);
        }
        const taskUuid = createRes.data?.data?.uuid || createRes.data?.uuid || createRes.data?.data?.id;
        if (!taskUuid) throw new Error(`Could not get task ID for module "${mod.title}"`);

        // Assign task
        const assignPayload = {
          project_id:    assignForm.project_id,
          employee_id:   assignForm.assigned_to,
          task_id:       taskUuid,
          assigned_date: assignForm.assignment_date || null,
          status:        assignForm.status || "Pending",
          ...(attachmentBase64 && { attachmentBase64, attachmentName, attachmentType }),
        };
        const assignRes = await api.post("/tasks/assign", assignPayload);
        if (assignRes.data?.success === false) {
          throw new Error(assignRes.data?.message || `Failed to assign task "${mod.title}"`);
        }
        results.push(mod.title);
      }

      setAssignSuccess(`${results.length} module${results.length > 1 ? "s" : ""} assigned successfully!`);
      setAssignForm((p) => ({ ...EMPTY_ASSIGN_FORM, project_id: p.project_id }));
      setSelectedModules([]);
      setAssignFile(null);
      setTimeout(() => navigate("/admin/tasks"), 1800);
    } catch (err) {
      setAssignError(err?.response?.data?.message || err.message || "Failed to assign task.");
    } finally {
      setAssigningTask(false);
    }
  };

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
                <option value="" disabled>
                  Select employee
                </option>
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
            <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">
              Task Modules *
              {planInfo && (
                <span className="ml-2 text-orange-400 normal-case">
                  — {planInfo.plan_name || planInfo.planName}
                </span>
              )}
            </label>
            {planModules.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                className="text-xs text-orange-400 hover:text-orange-300 transition"
              >
                {selectedModules.length === planModules.length ? "Deselect All" : "Select All"}
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
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-white/5 text-white/40 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <button type="button" onClick={toggleAll}>
                        {selectedModules.length === planModules.length
                          ? <CheckSquare size={16} className="text-orange-500" />
                          : <Square size={16} className="text-white/30" />}
                      </button>
                    </th>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Module / Task Title</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Technology</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {planModules.map((mod, idx) => {
                    const checked = selectedModules.includes(idx);
                    return (
                      <tr
                        key={idx}
                        onClick={() => toggleModule(idx)}
                        className={`cursor-pointer transition-colors ${checked ? "bg-orange-500/10" : "hover:bg-white/[0.02]"}`}
                      >
                        <td className="px-4 py-3">
                          {checked
                            ? <CheckSquare size={16} className="text-orange-500" />
                            : <Square size={16} className="text-white/30" />}
                        </td>
                        <td className="px-4 py-3 text-white/40">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-white">{mod.title || "—"}</td>
                        <td className="px-4 py-3 text-white/70">{mod.duration ? `${mod.duration} days` : "—"}</td>
                        <td className="px-4 py-3 text-white/50 max-w-xs truncate">{mod.description || "—"}</td>
                        <td className="px-4 py-3 text-white/50">{mod.technology || mod.tech || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {selectedModules.length > 0 && (
            <p className="mt-2 text-xs text-orange-400">
              {selectedModules.length} module{selectedModules.length > 1 ? "s" : ""} selected
            </p>
          )}
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
              {["Pending","To Do","In Progress","Review","Testing","Completed","On Hold","Cancelled"].map((v) => (
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
            disabled={assigningTask}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {assigningTask
              ? <><Loader2 size={14} className="animate-spin" /> Assigning...</>
              : <><UserPlus size={14} /> Assign Task</>}
          </button>
        </div>
      </div>
    </div>
  );
}
