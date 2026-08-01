import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, MapPin, PlusCircle, X, Eye, Loader2, UserRoundCheck, UserRoundX, LayoutGrid, List, Search, RefreshCw } from "lucide-react";
import api from "../api";
import { Link } from "react-router-dom";

const today = new Date();
const defaultMonth = today.getMonth() + 1;
const defaultYear = today.getFullYear();

const AttendancePage = () => {
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState([]);
  const selectedMonth = defaultMonth;
  const selectedYear = defaultYear;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    employee_id: "",
    date: today.toISOString().slice(0, 10),
    check_in_time: "09:30",
    check_out_time: "18:00",
    attendance_status: "Present",
    location: "",
  });
  const [viewMode, setViewMode] = useState("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [employeeRes, summaryRes] = await Promise.all([
        api.get("/employees?limit=200"),
        api.get(`/attendance/summary?month=${selectedMonth}&year=${selectedYear}`),
      ]);

      setEmployees(employeeRes?.data?.data || []);
      setSummary(summaryRes?.data?.data || []);
    } catch (err) {
      console.error("Failed to load attendance data", err);
      setError("Unable to load attendance data. Please refresh or check your login.");
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);

  };

  const calculateMetrics = (checkIn, checkOut) => {
    const parseTime = (value) => {
      if (!value) return null;
      const [time, modifier] = String(value).split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let total = hours * 60 + minutes;
      if (modifier === "PM" && hours !== 12) total += 12 * 60;
      if (modifier === "AM" && hours === 12) total -= 12 * 60;
      return total;
    };

    const officeCheckIn = parseTime("9:30 AM");
    const officeCheckOut = parseTime("6:00 PM");
    const checkInMinutes = parseTime(checkIn);
    const checkOutMinutes = parseTime(checkOut);

    let workingHours = "0h 0m";
    let lateEntry = "No";
    let earlyExit = "No";
    let overtime = "No";

    if (checkInMinutes !== null) {
      const lateBy = checkInMinutes - officeCheckIn;
      if (lateBy > 0) {
        lateEntry = `${Math.floor(lateBy / 60)}h ${lateBy % 60}m`;
      }
    }

    if (checkOutMinutes !== null) {
      const exitBefore = officeCheckOut - checkOutMinutes;
      if (exitBefore > 0) {
        earlyExit = `${Math.floor(exitBefore / 60)}h ${exitBefore % 60}m`;
      }
    }

    if (checkInMinutes !== null && checkOutMinutes !== null) {
      const durationMinutes = Math.max(0, checkOutMinutes - checkInMinutes);
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      workingHours = `${hours}h ${minutes}m`;

      const overtimeMinutes = Math.max(0, checkOutMinutes - officeCheckOut);
      if (overtimeMinutes > 0) {
        overtime = `${Math.floor(overtimeMinutes / 60)}h ${overtimeMinutes % 60}m`;
      }
    }

    return { working_hours: workingHours, late_entry: lateEntry, early_exit: earlyExit, overtime };
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadData();
    };
    fetchData();
  }, [loadData]);

  const metrics = useMemo(
    () => calculateMetrics(form.check_in_time, form.check_out_time),
    [form.check_in_time, form.check_out_time]
  );

  const openAddModal = () => {
    setForm((prev) => ({ ...prev, employee_id: employees[0]?.employee_id || "" }));
    setIsModalOpen(true);
  };

  // const handleLocation = () => {
  //   if (!navigator.geolocation) {
  //     setForm((prev) => ({ ...prev, location: "Geolocation not supported" }));
  //     return;
  //   }

  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       setForm((prev) => ({
  //         ...prev,
  //         location: `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`,
  //       }));
  //     },
  //     () => {
  //       setForm((prev) => ({ ...prev, location: "Location permission denied" }));
  //     }
  //   );
  // };


  const handleLocation = () => {
    if (!navigator.geolocation) {
      setForm((prev) => ({
        ...prev,
        location: "Geolocation not supported",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );

          const data = await response.json();

          const address = data.address || {};

          const fullAddress = [
            address.house_number,
            address.road,
            address.neighbourhood,
            address.suburb,
            address.village,
            address.town,
            address.city,
            address.county,
            address.state,
            address.postcode,
            address.country,
          ]
            .filter(Boolean)
            .join(", ");

          setForm((prev) => ({
            ...prev,
            location: `Latitude: ${latitude}
Longitude: ${longitude}

Address: ${fullAddress}`,
          }));

          console.log({
            latitude,
            longitude,
            address: fullAddress,
          });
        } catch (err) {
          console.error(err);

          setForm((prev) => ({
            ...prev,
            location: `Latitude: ${position.coords.latitude}
Longitude: ${position.coords.longitude}`,
          }));
        }
      },
      (error) => {
        console.error(error);
        alert("Unable to fetch location");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/attendance", {
        employee_id: form.employee_id,
        date: form.date,
        check_in_time: form.check_in_time,
        check_out_time: form.check_out_time,
        working_hours: metrics.working_hours,
        late_entry: metrics.late_entry,
        early_exit: metrics.early_exit,
        overtime: metrics.overtime,
        attendance_status: form.attendance_status,
        location: form.location,
      });
      setIsModalOpen(false);
      setForm({
        employee_id: "",
        date: today.toISOString().slice(0, 10),
        check_in_time: "09:30",
        check_out_time: "18:00",
        attendance_status: "Present",
        location: "",
      });
      loadData();
    } catch (error) {
      console.error("Failed to add attendance", error);
      alert(error?.response?.data?.message || "Could not save attendance");
    } finally {
      setSubmitting(false);
    }
  };


  const employeeCards = useMemo(() => {
    const summaryMap = new Map(summary.map((item) => [item.employee_id, item]));
    return employees.map((employee) => {
      const attendance = summaryMap.get(employee.employee_id) || {};
      return {
        ...employee,
        employee_name: `${employee.first_name || ""} ${employee.last_name || ""}`.trim(),
        present_days: attendance.present_days ?? 0,
        absent_days: attendance.absent_days ?? 0,
      };
    });
  }, [employees, summary]);

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();
    return employeeCards.filter((employee) => {
      const fullName = `${employee.first_name || ""} ${employee.last_name || ""}`.toLowerCase();
      const matchSearch =
        !term ||
        fullName.includes(term) ||
        (employee.employee_code || "").toLowerCase().includes(term) ||
        (employee.personal_email || "").toLowerCase().includes(term);
      const matchStatus = !statusFilter || employee.employment_status === statusFilter;
      const matchRole = !roleFilter || employee.role === roleFilter;
      return matchSearch && matchStatus && matchRole;
    });
  }, [employeeCards, search, statusFilter, roleFilter]);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((emp) => emp.employment_status === "Active").length;
  const inactiveEmployees = employees.filter((emp) => emp.employment_status === "Inactive").length;
  const rolesCount = new Set(employees.map((emp) => emp.role).filter(Boolean)).size;

  const getProfilePhotoUrl = (photo) => {
    if (!photo) return "";
    const cleanPath = photo.replace(/\\/g, "/");
    return cleanPath.startsWith("/") ? `http://localhost:5000${cleanPath}` : `http://localhost:5000/${cleanPath}`;
  };

  return (
    <div className="space-y-5 text-white">
      <div className="space-y-4 rounded-3xl border border-white/10 bg-[#0f172a]/80 p-4 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-orange-400">Employee Attendance</p>
            <h2 className="text-xl font-semibold">Attendance dashboard</h2>
            <p className="mt-1 text-sm text-white/60">Track day-to-day attendance, manage check-ins, and review monthly reports.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={openAddModal} className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 font-medium text-white transition hover:bg-orange-600">
              <PlusCircle size={16} /> Add Attendance
            </button>
            <div className="flex items-center rounded-full border border-white/10 bg-white/10 p-1">
              <button onClick={() => setViewMode("table")} className={`rounded-full p-2 transition ${viewMode === "table" ? "bg-orange-500 text-white" : "text-white/60 hover:text-white"}`} title="Table view"><List size={16} /></button>
              <button onClick={() => setViewMode("card")} className={`rounded-full p-2 transition ${viewMode === "card" ? "bg-orange-500 text-white" : "text-white/60 hover:text-white"}`} title="Card view"><LayoutGrid size={16} /></button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total", value: totalEmployees, icon: Eye, bg: "bg-blue-500/15", color: "text-blue-400" },
            { label: "Active", value: activeEmployees, icon: UserRoundCheck, bg: "bg-emerald-500/15", color: "text-emerald-400" },
            { label: "Inactive", value: inactiveEmployees, icon: UserRoundX, bg: "bg-rose-500/15", color: "text-rose-400" },
            { label: "Roles", value: rolesCount, icon: CalendarDays, bg: "bg-violet-500/15", color: "text-violet-400" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-[#111318] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{item.value}</p>
                    <p className="text-sm text-white/50">{item.label}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.bg}`}>
                    <Icon size={18} className={item.color} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-[#111318] p-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, code or email"
                className="w-full rounded-2xl border border-white/10 bg-white/4 px-10 py-2.5 text-sm text-white outline-none focus:border-orange-500/50"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-white/4 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Terminated">Terminated</option>
              <option value="Resigned">Resigned</option>
            </select>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="rounded-2xl border border-white/10 bg-white/4 px-3 py-2.5 text-sm text-white outline-none focus:border-orange-500/50">
              <option value="">All Roles</option>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
              <option value="HR">HR</option>
              <option value="Admin">Admin</option>
            </select>
            <button onClick={loadData} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition hover:bg-white/10">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-[#0f172a]/70 p-10">
          <Loader2 className="mr-3 animate-spin" /> Loading attendance details...
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-900/20 p-4 text-red-200">
              {error}
            </div>
          )}
          {viewMode === "table" ? (
            <div className="overflow-x-auto rounded-3xl border border-white/10 bg-[#0f172a]/70">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5 text-white/60">
                  <tr>
                    <th className="px-4 py-3 text-left w-16">S.No</th>
                    <th className="px-4 py-3 text-left">Photo</th>
                    <th className="px-4 py-3 text-left">Employee Code</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Mobile</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Present</th>
                    <th className="px-4 py-3 text-left">Absent</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr><td colSpan="11" className="px-4 py-8 text-center text-white/60">No employees found.</td></tr>
                  ) : filteredEmployees.map((employee, index) => (
                    <tr key={employee.employee_id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-4 py-3 text-white/60">{index + 1}</td>
                      <td className="px-4 py-3">
                        {employee.profile_photo ? (
                          <img src={getProfilePhotoUrl(employee.profile_photo)} alt={employee.employee_name} className="h-10 w-10 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white/70">
                            {`${employee.first_name?.[0] || ""}${employee.last_name?.[0] || ""}`.toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">{employee.employee_code || employee.employee_id}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{employee.employee_name}</div>
                        <div className="text-white/40 text-xs">{employee.designation || "Staff"}</div>
                      </td>
                      <td className="px-4 py-3 text-white/70">{employee.personal_email || "—"}</td>
                      <td className="px-4 py-3 text-white/70">{employee.mobile_number || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-300">{employee.role || "Employee"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${employee.employment_status === "Active" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" : employee.employment_status === "Inactive" ? "bg-rose-500/15 text-rose-400 border-rose-500/25" : "bg-white/10 text-white/60 border-white/15"}`}>
                          {employee.employment_status || "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-400">{employee.present_days || 0}</td>
                      <td className="px-4 py-3 text-rose-400">{employee.absent_days || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/admin/attendance/view/${employee.employee_id}?month=${selectedMonth}&year=${selectedYear}`} className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 px-3 py-2 text-orange-300 transition hover:bg-orange-400/10">
                          <Eye size={14} /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredEmployees.length === 0 ? (
                <div className="col-span-full rounded-3xl border border-white/10 bg-[#0f172a]/70 p-10 text-center text-white/60">
                  No employees found.
                </div>
              ) : (
                filteredEmployees.map((employee) => (
                  <div key={employee.employee_id} className="rounded-3xl border border-white/10 bg-[#0f172a]/70 p-5 shadow-lg shadow-black/20">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/40">{employee.employee_code || "EMP"}</p>
                        <h3 className="mt-1 text-lg font-semibold">{employee.employee_name}</h3>
                      </div>
                      <div className={`rounded-full p-2 ${employee.present_days > 0 ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700/60 text-slate-300"}`}>
                        {employee.present_days > 0 ? <UserRoundCheck size={18} /> : <UserRoundX size={18} />}
                      </div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-white/40">Present Days</p>
                        <p className="mt-1 text-xl font-semibold text-emerald-400">{employee.present_days || 0}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                        <p className="text-white/40">Absent Days</p>
                        <p className="mt-1 text-xl font-semibold text-rose-400">{employee.absent_days || 0}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between text-sm text-white/60">
                      <span className="font-medium">Employee ID: {employee.employee_id}</span>
                      <Link to={`/admin/attendance/view/${employee.employee_id}?month=${selectedMonth}&year=${selectedYear}`} className="inline-flex items-center gap-2 rounded-full border border-orange-400/40 px-3 py-2 text-orange-300 transition hover:bg-orange-400/10">
                        <Eye size={14} /> View
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-orange-400">New record</p>
                <h3 className="text-xl font-semibold">Add attendance</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full border border-white/10 p-2 text-white/70 hover:bg-white/10">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-white/70">Employee</label>
                <select name="employee_id" value={form.employee_id} onChange={handleFormChange} required className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none">
                  <option value="" disabled>Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.employee_id} value={employee.employee_id} className="bg-slate-900">
                      {employee.first_name} {employee.last_name} ({employee.employee_code || employee.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">Date</label>
                <input type="date" name="date" value={form.date} onChange={handleFormChange} required className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70">Attendance Status</label>
                <select name="attendance_status" value={form.attendance_status} onChange={handleFormChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none">
                  <option value="Present" className="bg-slate-900">Present</option>
                  <option value="Absent" className="bg-slate-900">Absent</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">Check-in Time</label>
                <input type="time" name="check_in_time" value={form.check_in_time} onChange={handleFormChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70">Check-out Time</label>
                <input type="time" name="check_out_time" value={form.check_out_time} onChange={handleFormChange} className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/70">Working Hours</label>
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm">
                  <Clock3 size={16} className="text-orange-400" />
                  <span>{metrics.working_hours}</span>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70">Late Entry</label>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm">{metrics.late_entry}</div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70">Early Exit</label>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm">{metrics.early_exit}</div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/70">Overtime</label>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm">{metrics.overtime}</div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-white/70">Location</label>
                <div className="flex flex-col gap-3 md:flex-row">
                  <input name="location" value={form.location} onChange={handleFormChange} placeholder="Use the button to fetch current location" className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 outline-none" />
                  <button type="button" onClick={handleLocation} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-400/40 px-4 py-3 text-orange-300 transition hover:bg-orange-400/10">
                    <MapPin size={16} /> Fetch Location
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-2xl border border-white/10 px-4 py-3 text-white/70 hover:bg-white/10">Cancel</button>
                <button type="submit" disabled={submitting} className="rounded-2xl bg-orange-500 px-4 py-3 font-medium text-white transition hover:bg-orange-600 disabled:opacity-70">
                  {submitting ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AttendancePage;
