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
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
        <Link
          to="/admin/employees/add"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-white transition hover:bg-primary-dark"
        >
          <FiPlus /> Add Employee
        </Link>
      </div>

      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700">
            <tr>
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
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  Loading employees...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.employee_id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{emp.employee_code || "N/A"}</td>
                  <td className="px-6 py-4">{`${emp.first_name} ${emp.last_name || ""}`}</td>
                  <td className="px-6 py-4">{emp.personal_email || "N/A"}</td>
                  <td className="px-6 py-4">{emp.mobile_number}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        emp.employment_status === "Active"
                          ? "bg-green-100 text-green-800"
                          : emp.employment_status === "Inactive"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {emp.employment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <Link to={`/admin/employees/view/${emp.employee_id}`} className="text-gray-400 transition hover:text-blue-600">
                        <FiEye size={18} />
                      </Link>
                      <Link to={`/admin/employees/edit/${emp.employee_id}`} className="text-gray-400 transition hover:text-green-600">
                        <FiEdit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(emp.employee_id)}
                        className="text-gray-400 transition hover:text-red-600"
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
