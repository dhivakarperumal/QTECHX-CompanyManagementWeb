import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiUser, FiBriefcase, FiDollarSign, FiFileText } from "react-icons/fi";

const EmployeeView = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch employee details");
        }

        const data = await response.json();
        setEmployee(data.employee);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderField = (label, value) => (
    <div className="mb-4">
      <h4 className="text-xs font-semibold uppercase text-slate-400">{label}</h4>
      <p className="mt-1 font-medium text-slate-100">{value || "N/A"}</p>
    </div>
  );

  const renderFileLink = (label, url) => (
    <div className="mb-4 flex flex-col">
      <h4 className="text-xs font-semibold uppercase text-slate-400">{label}</h4>
      {url ? (
        <a href={`http://localhost:5000${url}`} target="_blank" rel="noreferrer" className="mt-1 font-medium text-blue-400 hover:underline">
          View Document
        </a>
      ) : (
        <p className="mt-1 text-sm text-slate-500">Not uploaded</p>
      )}
    </div>
  );

  if (loading) {
    return <div className="min-h-screen bg-slate-900 p-6 text-center text-slate-400">Loading details...</div>;
  }

  if (error || !employee) {
    return <div className="min-h-screen bg-slate-900 p-6 text-center text-red-400">{error || "Employee not found"}</div>;
  }

  return (
    <div className="min-h-screen bg-[#161C24] text-slate-200 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/employees" className="text-slate-400 hover:text-white">
              <FiArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-100">Employee Profile</h1>
          </div>
          <span className={`px-3 py-1 rounded-full border text-sm font-medium ${employee.employment_status === 'Active' ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-red-900/30 text-red-400 border-red-800'}`}>
            {employee.employment_status}
          </span>
        </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-xl text-center">
            <div className="mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-slate-700 mb-4 bg-slate-900 flex items-center justify-center">
              {employee.profile_photo ? (
                <img src={`http://localhost:5000${employee.profile_photo}`} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <FiUser className="h-16 w-16 text-slate-500" />
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-100">{employee.first_name} {employee.last_name}</h2>
            <p className="text-sm text-slate-400 mb-2">{employee.designation || 'No Designation'}</p>
            <p className="text-xs font-medium text-slate-300 bg-slate-700 inline-block px-2 py-1 rounded">
              {employee.employee_code || employee.employee_id.substring(0, 8)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
            <h3 className="font-semibold text-slate-100 mb-4 border-b border-slate-700 pb-2">Quick Contact</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-400">Email</p>
                <p className="font-medium truncate">{employee.personal_email || "N/A"}</p>
              </div>
              <div>
                <p className="text-slate-400">Phone</p>
                <p className="font-medium">{employee.mobile_number}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-3 space-y-6">
          
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
              <FiUser className="text-blue-400" />
              <h3 className="text-lg font-semibold text-slate-100">Personal Information</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
              {renderField("Gender", employee.gender)}
              {renderField("Date of Birth", formatDate(employee.dob))}
              {renderField("Blood Group", employee.blood_group)}
              {renderField("Marital Status", employee.marital_status)}
              {renderField("Nationality", employee.nationality)}
              {renderField("Aadhaar", employee.aadhaar_number)}
              {renderField("PAN", employee.pan_number)}
              {renderField("Alt Phone", employee.alternate_mobile)}
            </div>
            <div className="mt-4">
              {renderField("Permanent Address", employee.permanent_address)}
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
              <FiBriefcase className="text-blue-400" />
              <h3 className="text-lg font-semibold text-slate-100">Employment & Emergency</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
              {renderField("Role", employee.role)}
              {renderField("Team Lead", employee.team_lead)}
              {renderField("Joining Date", formatDate(employee.joining_date))}
              {renderField("Confirmation Date", formatDate(employee.confirmation_date))}
              <div className="col-span-2 md:col-span-3 mt-2 border-t border-slate-700 pt-4">
                <h4 className="text-sm font-semibold text-slate-200 mb-2">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {renderField("Name", employee.emergency_contact_person)}
                  {renderField("Phone", employee.emergency_contact_number)}
                  {renderField("Relationship", employee.emergency_relationship)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
              <FiDollarSign className="text-blue-400" />
              <h3 className="text-lg font-semibold text-slate-100">Banking & Salary</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
              {renderField("Salary Type", employee.salary_type)}
              {renderField("Basic Salary", employee.basic_salary ? `₹${employee.basic_salary}` : "")}
              {renderField("Bank Name", employee.bank_name)}
              {renderField("Account No", employee.account_number)}
              {renderField("IFSC Code", employee.ifsc_code)}
              {renderField("UPI ID", employee.upi_id)}
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
              <FiFileText className="text-blue-400" />
              <h3 className="text-lg font-semibold text-slate-100">Uploaded Documents</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4">
              {renderFileLink("Resume", employee.resume_url)}
              {renderFileLink("Aadhaar", employee.aadhaar_url)}
              {renderFileLink("PAN", employee.pan_url)}
              {renderFileLink("Passport", employee.passport_url)}
              {renderFileLink("Offer Letter", employee.offer_letter_url)}
              {renderFileLink("Appointment Letter", employee.appointment_letter_url)}
              {renderFileLink("NDA", employee.nda_url)}
            </div>
          </div>

        </div>
      </div>
      </div>
    </div>
  );
};

export default EmployeeView;
