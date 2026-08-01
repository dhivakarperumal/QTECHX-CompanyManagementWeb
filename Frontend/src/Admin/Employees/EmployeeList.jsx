import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, Search, RefreshCw, Eye, Edit2, Trash2, Loader2, UserCheck, UserX, Briefcase, List, LayoutGrid, Phone, Mail } from "lucide-react";

const EmployeeList = () => {
  const [viewMode, setViewMode] = useState("table");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await response.json();
      setEmployees(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const getProfilePhotoUrl = (photo) => {
    if (!photo) return "";
    let cleanPath = photo.replace(/\\/g, "/");
    if (cleanPath.startsWith("/")) {
      return `http://localhost:5000${cleanPath}`;
    }
    return `http://localhost:5000/${cleanPath}`;
  };

  const filteredEmployees = useMemo(() => {
    const term = search.toLowerCase();
    return employees.filter((emp) => {
      const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
      const matchSearch = !term || fullName.includes(term) || (emp.employee_code || "").toLowerCase().includes(term) || (emp.personal_email || "").toLowerCase().includes(term);
      const matchStatus = !statusFilter || emp.employment_status === statusFilter;
      const matchRole = !roleFilter || emp.role === roleFilter;
      return matchSearch && matchStatus && matchRole;
    });
  }, [employees, search, statusFilter, roleFilter]);

  const handleDelete = async (employeeId) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setEmployees(employees.filter((emp) => emp.employee_id !== employeeId));
      } else {
        alert("Failed to delete employee");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting employee");
    }
  };

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/15 flex items-center justify-center">
            <Users size={22} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">All Employees</h1>
            <p className="text-white/40 text-xs mt-0.5">{loading ? "Loading…" : `${employees.length} employee${employees.length !== 1 ? "s" : ""} total`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchEmployees} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition">
            <RefreshCw size={15} className={loading ? "animate-spin text-orange-500" : ""} />
          </button>
          <Link to="/admin/employees/add" className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition hover:opacity-90" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
            <Plus size={15} /> Add Employee
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: employees.length, icon: Users, cls: "text-blue-400", bg: "bg-blue-500/15" },
          { label: "Active", value: employees.filter((item) => item.employment_status === "Active").length, icon: UserCheck, cls: "text-emerald-400", bg: "bg-emerald-500/15" },
          { label: "Inactive", value: employees.filter((item) => item.employment_status === "Inactive").length, icon: UserX, cls: "text-rose-400", bg: "bg-rose-500/15" },
          { label: "Roles", value: new Set(employees.map((item) => item.role).filter(Boolean)).size, icon: Briefcase, cls: "text-violet-400", bg: "bg-violet-500/15" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-[#111318] p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.bg}`}>
                <Icon size={18} className={item.cls} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{item.value}</p>
                <p className="text-white/50 text-xs">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {error && <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm px-4 py-3 rounded-2xl">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-[#111318] p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, code or email" className="w-full rounded-xl border border-white/10 bg-white/4 pl-9 pr-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-black text-white px-3 py-2.5 text-sm outline-none focus:border-orange-500/50"
          >
            <option value="" className="bg-black text-white">All Status</option>
            <option value="Active" className="bg-black text-white">Active</option>
            <option value="Inactive" className="bg-black text-white">Inactive</option>
            <option value="Terminated" className="bg-black text-white">Terminated</option>
            <option value="Resigned" className="bg-black text-white">Resigned</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-black text-white px-3 py-2.5 text-sm outline-none focus:border-orange-500/50"
          >
            <option value="" className="bg-black text-white">All Roles</option>
            <option value="Employee" className="bg-black text-white">Employee</option>
            <option value="Manager" className="bg-black text-white">Manager</option>
            <option value="HR" className="bg-black text-white">HR</option>
            <option value="Admin" className="bg-black text-white">Admin</option>
          </select>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1 ml-auto md:ml-0">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${viewMode === 'table' ? 'bg-orange-500 text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              title="Table View"
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition ${viewMode === 'card' ? 'bg-orange-500 text-white shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              title="Card View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>

        {viewMode === 'table' && (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/4 text-white/60">
                <tr>
                  <th className="px-4 py-3 text-left w-16">S.No</th>
                  <th className="px-4 py-3 text-left">Photo</th>
                  <th className="px-4 py-3 text-left">Employee Code</th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Mobile</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="8" className="px-4 py-8 text-center text-white/40"><Loader2 size={18} className="mx-auto animate-spin" /></td></tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr><td colSpan="8" className="px-4 py-8 text-center text-white/40">No employees found</td></tr>
                ) : filteredEmployees.map((emp, index) => (
                  <tr key={emp.employee_id} className="border-t border-white/10 hover:bg-white/2">
                    <td className="px-4 py-3 text-white/70">{index + 1}</td>
                    <td className="px-4 py-3">
                      {emp.profile_photo ? (
                        <img src={getProfilePhotoUrl(emp.profile_photo)} alt={`${emp.first_name} ${emp.last_name || ""}`.trim()} className="h-10 w-10 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white/70">
                          {`${emp.first_name?.[0] || ""}${emp.last_name?.[0] || ""}`.toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{emp.employee_code || "N/A"}</td>
                    <td className="px-4 py-3"><div className="font-semibold text-white">{`${emp.first_name} ${emp.last_name || ""}`}</div><div className="text-white/40 text-xs">{emp.designation || "—"}</div></td>
                    <td className="px-4 py-3 text-white/70">{emp.personal_email || "N/A"}</td>
                    <td className="px-4 py-3 text-white/70">{emp.mobile_number}</td>
                    <td className="px-4 py-3"><span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-300">{emp.role}</span></td>
                    <td className="px-4 py-3"><span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${emp.employment_status === "Active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : emp.employment_status === "Inactive" ? "bg-rose-500/15 text-rose-400 border-rose-500/25" : "bg-white/10 text-white/60 border-white/15"}`}>{emp.employment_status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/employees/view/${emp.employee_id}`} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10"><Eye size={14} /></Link>
                        <Link to={`/admin/employees/edit/${emp.employee_id}`} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 hover:text-white hover:bg-white/10"><Edit2 size={14} /></Link>
                        <button onClick={() => handleDelete(emp.employee_id)} className="rounded-lg border border-white/10 bg-white/5 p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full py-8 text-center text-white/40"><Loader2 size={18} className="mx-auto animate-spin" /></div>
            ) : filteredEmployees.length === 0 ? (
              <div className="col-span-full py-8 text-center text-white/40">No employees found</div>
            ) : filteredEmployees.map((emp, index) => (
              <div key={emp.employee_id} className="rounded-2xl border border-white/10 bg-[#111318] p-5 hover:bg-white/[0.02] transition relative">
                <div className="absolute top-5 right-5 text-xs text-white/40 font-medium">#{index + 1}</div>
                <div className="flex items-center gap-4 mb-5">
                  {emp.profile_photo ? (
                    <img src={getProfilePhotoUrl(emp.profile_photo)} alt={`${emp.first_name} ${emp.last_name || ""}`.trim()} className="h-12 w-12 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-base font-bold text-white/70">
                      {`${emp.first_name?.[0] || ""}${emp.last_name?.[0] || ""}`.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-white text-base leading-tight">{emp.first_name} {emp.last_name}</div>
                    <div className="text-white/40 text-xs mt-0.5">{emp.designation || "—"} • {emp.employee_code || "N/A"}</div>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                    <Mail size={14} className="text-white/40" />
                    <span className="text-white/70 text-sm truncate">{emp.personal_email || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
                    <Phone size={14} className="text-white/40" />
                    <span className="text-white/70 text-sm">{emp.mobile_number || "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-300">
                      {emp.role}
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${emp.employment_status === "Active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : emp.employment_status === "Inactive" ? "bg-rose-500/15 text-rose-400 border-rose-500/25" : "bg-white/10 text-white/60 border-white/15"}`}>
                      {emp.employment_status}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Link to={`/admin/employees/view/${emp.employee_id}`} className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 hover:text-white hover:bg-white/10"><Eye size={14} /></Link>
                    <Link to={`/admin/employees/edit/${emp.employee_id}`} className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 hover:text-white hover:bg-white/10"><Edit2 size={14} /></Link>
                    <button onClick={() => handleDelete(emp.employee_id)} className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
