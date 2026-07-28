import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../PrivateRouter/AuthContext";
import { FiPlus, FiEdit, FiTrash2, FiEye } from "react-icons/fi";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

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
    <div className="p-6 min-h-screen bg-[#161C24] text-slate-200">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Employees</h1>
        <Link
          to="/admin/employees/add"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-dark"
        >
          <FiPlus /> Add Employee
        </Link>
      </div>

      {error && <div className="mb-4 rounded border border-red-500/50 bg-red-900/20 p-4 text-red-400">{error}</div>}

      <div className="overflow-x-auto rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/50 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-4 font-medium">Photo</th>
              <th className="px-6 py-4 font-medium">Employee Code</th>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Mobile</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                  Loading employees...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.employee_id} className="border-t border-slate-700 hover:bg-slate-700/50">
                  <td className="px-4 py-4">
                    {emp.profile_photo ? (
                      <img
                        src={getProfilePhotoUrl(emp.profile_photo)}
                        alt={`${emp.first_name} ${emp.last_name || ""}`.trim()}
                        className="h-10 w-10 rounded-full object-cover border border-slate-600"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 bg-slate-700 text-sm font-semibold text-slate-300">
                        {`${emp.first_name?.[0] || ""}${emp.last_name?.[0] || ""}`.toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-100">{emp.employee_code || "N/A"}</td>
                  <td className="px-6 py-4">{`${emp.first_name} ${emp.last_name || ""}`}</td>
                  <td className="px-6 py-4">{emp.personal_email || "N/A"}</td>
                  <td className="px-6 py-4">{emp.mobile_number}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-900/30 border border-blue-800 px-2.5 py-0.5 text-xs font-medium text-blue-300">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        emp.employment_status === "Active"
                          ? "bg-green-900/30 text-green-400 border-green-800"
                          : emp.employment_status === "Inactive"
                          ? "bg-slate-700 text-slate-300 border-slate-600"
                          : "bg-red-900/30 text-red-400 border-red-800"
                      }`}
                    >
                      {emp.employment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link to={`/admin/employees/view/${emp.employee_id}`} className="text-slate-400 transition hover:text-blue-400">
                        <FiEye size={18} />
                      </Link>
                      <Link to={`/admin/employees/edit/${emp.employee_id}`} className="text-slate-400 transition hover:text-green-400">
                        <FiEdit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(emp.employee_id)}
                        className="text-slate-400 transition hover:text-red-400"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;
