import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../PrivateRouter/AuthContext";
import { FiArrowLeft, FiSave, FiEye, FiEyeOff } from "react-icons/fi";

const EmployeeAdd = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [existingFiles, setExistingFiles] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    employee_code: "",
    first_name: "",
    last_name: "",
    profile_photo: "",
    gender: "",
    dob: "",
    blood_group: "",
    marital_status: "",
    nationality: "",
    aadhaar_number: "",
    pan_number: "",
    mobile_number: "",
    alternate_mobile: "",
    personal_email: "",
    permanent_address: "",
    emergency_contact_person: "",
    emergency_contact_number: "",
    emergency_relationship: "",
    designation: "",
    team_lead: "",
    joining_date: "",
    confirmation_date: "",
    employment_status: "Active",
    role: "Employee",
    salary_type: "",
    basic_salary: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
    resume_url: "",
    aadhaar_url: "",
    pan_url: "",
    passport_url: "",
    offer_letter_url: "",
    appointment_letter_url: "",
    nda_url: "",
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const getFileUrl = (path) => {
    if (!path) return "";
    let cleanPath = path.replace(/\\/g, '/');
    if (cleanPath.startsWith('/')) {
      cleanPath = cleanPath.substring(1);
    }
    return `http://localhost:5000/${cleanPath}`;
  };

  useEffect(() => {
    if (isEditMode) return;

    let ignore = false;

    const fetchEmployeeCode = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/employees/generate-code", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to generate employee code");
        }

        const data = await response.json();
        if (!ignore && data.employee_code) {
          setFormData((prev) => ({ ...prev, employee_code: data.employee_code }));
        }
      } catch (err) {
        console.error("Failed to generate employee code:", err);
        if (!ignore) {
          setFormData((prev) => ({
            ...prev,
            employee_code: `EMPQT${Date.now().toString().slice(-4)}`,
          }));
        }
      }
    };

    fetchEmployeeCode();
    return () => {
      ignore = true;
    };
  }, [isEditMode]);

  useEffect(() => {
    if (!isEditMode) return;

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
        const emp = data.employee;
        
        if (emp) {
          setFormData({
            employee_code: emp.employee_code || "",
            first_name: emp.first_name || "",
            last_name: emp.last_name || "",
            gender: emp.gender || "",
            dob: formatDate(emp.dob),
            blood_group: emp.blood_group || "",
            marital_status: emp.marital_status || "",
            nationality: emp.nationality || "",
            aadhaar_number: emp.aadhaar_number || "",
            pan_number: emp.pan_number || "",
            mobile_number: emp.mobile_number || "",
            alternate_mobile: emp.alternate_mobile || "",
            personal_email: emp.personal_email || "",
            permanent_address: emp.permanent_address || "",
            emergency_contact_person: emp.emergency_contact_person || "",
            emergency_contact_number: emp.emergency_contact_number || "",
            emergency_relationship: emp.emergency_relationship || "",
            designation: emp.designation || "",
            team_lead: emp.team_lead || "",
            joining_date: formatDate(emp.joining_date),
            confirmation_date: formatDate(emp.confirmation_date),
            employment_status: emp.employment_status || "Active",
            role: emp.role || "Employee",
            salary_type: emp.salary_type || "",
            basic_salary: emp.basic_salary || "",
            bank_name: emp.bank_name || "",
            account_number: emp.account_number || "",
            ifsc_code: emp.ifsc_code || "",
            upi_id: emp.upi_id || "",
            profile_photo: "",
            resume_url: "",
            aadhaar_url: "",
            pan_url: "",
            passport_url: "",
            offer_letter_url: "",
            appointment_letter_url: "",
            nda_url: "",
            username: "",
            official_email: "",
            password: "",
            confirm_password: "",
          });
          setExistingFiles({
            profile_photo: emp.profile_photo || null,
            resume_url: emp.resume_url || null,
            aadhaar_url: emp.aadhaar_url || null,
            pan_url: emp.pan_url || null,
            passport_url: emp.passport_url || null,
            offer_letter_url: emp.offer_letter_url || null,
            appointment_letter_url: emp.appointment_letter_url || null,
            nda_url: emp.nda_url || null,
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    };

    fetchEmployee();
  }, [id, isEditMode]);

  const validateField = (name, value) => {
    if (!value) return "";

    switch (name) {
      case "mobile_number":
      case "alternate_mobile":
      case "emergency_contact_number": {
        if (!/^[6-9]\d{9}$/.test(value)) {
          return "Must be 10 digits and start with 6, 7, 8, or 9.";
        }
        return "";
      }
      case "aadhaar_number": {
        if (!/^\d{12}$/.test(value)) {
          return "Aadhaar must be exactly 12 digits.";
        }
        return "";
      }
      case "pan_number": {
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(value)) {
          return "PAN must be in format ABCDE1234F.";
        }
        return "";
      }
      case "account_number": {
        if (!/^\d{6,20}$/.test(value)) {
          return "Account number must contain only digits (6-20 digits).";
        }
        return "";
      }
      case "ifsc_code": {
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(value)) {
          return "IFSC must be 11 characters like SBIN0001234.";
        }
        return "";
      }
      case "upi_id": {
        if (!/^[A-Za-z0-9._-]{2,}@[A-Za-z0-9.-]{2,}$/.test(value)) {
          return "UPI ID should look like name@bank.";
        }
        return "";
      }
      default:
        return "";
    }
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.mobile_number?.trim()) {
      errors.mobile_number = "Mobile number is required.";
    } else {
      const mobileError = validateField("mobile_number", data.mobile_number);
      if (mobileError) errors.mobile_number = mobileError;
    }

    if (data.alternate_mobile && validateField("alternate_mobile", data.alternate_mobile)) {
      errors.alternate_mobile = validateField("alternate_mobile", data.alternate_mobile);
    }

    if (data.aadhaar_number && validateField("aadhaar_number", data.aadhaar_number)) {
      errors.aadhaar_number = validateField("aadhaar_number", data.aadhaar_number);
    }

    if (data.pan_number && validateField("pan_number", data.pan_number)) {
      errors.pan_number = validateField("pan_number", data.pan_number);
    }

    if (data.account_number && validateField("account_number", data.account_number)) {
      errors.account_number = validateField("account_number", data.account_number);
    }

    if (data.ifsc_code && validateField("ifsc_code", data.ifsc_code)) {
      errors.ifsc_code = validateField("ifsc_code", data.ifsc_code);
    }

    if (data.upi_id && validateField("upi_id", data.upi_id)) {
      errors.upi_id = validateField("upi_id", data.upi_id);
    }

    if (data.emergency_contact_number && validateField("emergency_contact_number", data.emergency_contact_number)) {
      errors.emergency_contact_number = validateField("emergency_contact_number", data.emergency_contact_number);
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      let sanitizedValue = value;

      switch (name) {
        case "mobile_number":
        case "alternate_mobile":
        case "emergency_contact_number":
          sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
          break;
        case "aadhaar_number":
          sanitizedValue = value.replace(/\D/g, "").slice(0, 12);
          break;
        case "pan_number":
          sanitizedValue = value.replace(/[^A-Z0-9]/gi, "").slice(0, 10).toUpperCase();
          break;
        case "account_number":
          sanitizedValue = value.replace(/\D/g, "").slice(0, 20);
          break;
        case "ifsc_code":
          sanitizedValue = value.replace(/[^A-Z0-9]/gi, "").slice(0, 11).toUpperCase();
          break;
        case "upi_id":
          sanitizedValue = value.replace(/\s+/g, "").toLowerCase();
          break;
        default:
          break;
      }

      setFormData((prev) => {
        const newData = { ...prev, [name]: sanitizedValue };
        if (!isEditMode) {
          if (name === "first_name" || name === "last_name") {
            const first = name === "first_name" ? sanitizedValue : prev.first_name;
            const last = name === "last_name" ? sanitizedValue : prev.last_name;
            newData.username = `${first.toLowerCase()}${last ? '.' + last.toLowerCase() : ''}`.replace(/\s+/g, '');
          }
          if (name === "personal_email") {
            newData.official_email = sanitizedValue;
          }
        }
        return newData;
      });

      setFieldErrors((prev) => {
        const nextErrors = { ...prev };
        const error = validateField(name, sanitizedValue);
        if (error) {
          nextErrors[name] = error;
        } else {
          delete nextErrors[name];
        }
        return nextErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!isEditMode && formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    if (isEditMode && formData.password && formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Please correct the highlighted fields before saving.");
      setLoading(false);
      return;
    }

    setFieldErrors({});

    try {
      const token = localStorage.getItem("token");
      
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== "" && formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      const url = isEditMode 
        ? `http://localhost:5000/api/employees/${id}` 
        : "http://localhost:5000/api/employees";
        
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditMode ? "update" : "create"} employee`);
      }

      alert(`Employee ${isEditMode ? "updated" : "created"} successfully!`);
      navigate("/admin/employees");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-md border border-slate-700 bg-slate-800 p-2.5 text-sm text-slate-200 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary placeholder-slate-500";
  const labelClass = "mb-1.5 block text-sm font-medium text-slate-300";

  if (fetching) {
    return <div className="min-h-screen bg-slate-900 p-6 text-center text-slate-400">Loading employee details...</div>;
  }

  return (
    <div className="p-6 min-h-screen bg-[#161C24] text-slate-200">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/employees" className="text-slate-400 hover:text-white">
            <FiArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">{isEditMode ? "Edit Employee" : "Add New Employee"}</h1>
        </div>
      </div>

      {error && <div className="mb-6 rounded-md border border-red-500/50 bg-red-900/20 p-4 text-red-400">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8 rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
        
        {/* Personal Details */}
        <div>
          <h2 className="mb-4 border-b border-slate-700 pb-2 text-lg font-semibold text-slate-200">Personal Details</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Profile Photo</label>
              <input type="file" name="profile_photo" onChange={handleChange} className={inputClass} accept="image/*" />
              {existingFiles.profile_photo && (
                <a href={getFileUrl(existingFiles.profile_photo)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-blue-600 hover:underline">
                  View Current Photo
                </a>
              )}
            </div>
            <div>
              <label className={labelClass}>Employee Code</label>
              <input type="text" name="employee_code" readOnly value={formData.employee_code} onChange={handleChange} className={`${inputClass} cursor-not-allowed bg-slate-900/70`} placeholder="Auto-generated employee code" />
            </div>
            <div>
              <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
              <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className={inputClass} placeholder="Enter first name" />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} placeholder="Enter last name" />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Blood Group</label>
              <select name="blood_group" value={formData.blood_group} onChange={handleChange} className={inputClass}>
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Marital Status</label>
              <select name="marital_status" value={formData.marital_status} onChange={handleChange} className={inputClass}>
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Nationality</label>
              <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} className={inputClass} placeholder="Enter nationality" />
            </div>
            <div>
              <label className={labelClass}>Aadhaar Number</label>
              <input type="text" name="aadhaar_number" value={formData.aadhaar_number} onChange={handleChange} className={inputClass} placeholder="12 digits only" />
              {fieldErrors.aadhaar_number && <p className="mt-1 text-xs text-red-400">{fieldErrors.aadhaar_number}</p>}
            </div>
            <div>
              <label className={labelClass}>PAN Number</label>
              <input type="text" name="pan_number" value={formData.pan_number} onChange={handleChange} className={inputClass} placeholder="ABCDE1234F" />
              {fieldErrors.pan_number && <p className="mt-1 text-xs text-red-400">{fieldErrors.pan_number}</p>}
            </div>
            <div>
              <label className={labelClass}>Mobile Number <span className="text-red-500">*</span></label>
              <input type="text" name="mobile_number" required value={formData.mobile_number} onChange={handleChange} className={inputClass} placeholder="Start with 6-9, 10 digits" />
              {fieldErrors.mobile_number && <p className="mt-1 text-xs text-red-400">{fieldErrors.mobile_number}</p>}
            </div>
            <div>
              <label className={labelClass}>Alternate Mobile</label>
              <input type="text" name="alternate_mobile" value={formData.alternate_mobile} onChange={handleChange} className={inputClass} placeholder="Start with 6-9, 10 digits" />
              {fieldErrors.alternate_mobile && <p className="mt-1 text-xs text-red-400">{fieldErrors.alternate_mobile}</p>}
            </div>
            <div>
              <label className={labelClass}>Personal Email</label>
              <input type="email" name="personal_email" value={formData.personal_email} onChange={handleChange} className={inputClass} placeholder="Enter personal email" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelClass}>Permanent Address</label>
              <textarea name="permanent_address" rows="2" value={formData.permanent_address} onChange={handleChange} className={inputClass} placeholder="Enter permanent address"></textarea>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h2 className="mb-4 border-b border-slate-700 pb-2 text-lg font-semibold text-slate-200">Emergency Contact</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className={labelClass}>Contact Person</label>
              <input type="text" name="emergency_contact_person" value={formData.emergency_contact_person} onChange={handleChange} className={inputClass} placeholder="Enter emergency contact person" />
            </div>
            <div>
              <label className={labelClass}>Contact Number</label>
              <input type="text" name="emergency_contact_number" value={formData.emergency_contact_number} onChange={handleChange} className={inputClass} placeholder="Start with 6-9, 10 digits" />
              {fieldErrors.emergency_contact_number && <p className="mt-1 text-xs text-red-400">{fieldErrors.emergency_contact_number}</p>}
            </div>
            <div>
              <label className={labelClass}>Relationship</label>
              <input type="text" name="emergency_relationship" value={formData.emergency_relationship} onChange={handleChange} className={inputClass} placeholder="Enter relationship" />
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div>
          <h2 className="mb-4 border-b border-slate-700 pb-2 text-lg font-semibold text-slate-200">Employment Details</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Designation</label>
              <input type="text" name="designation" value={formData.designation} onChange={handleChange} className={inputClass} placeholder="Enter designation" />
            </div>
            <div>
              <label className={labelClass}>Team Lead</label>
              <input type="text" name="team_lead" value={formData.team_lead} onChange={handleChange} className={inputClass} placeholder="Enter team lead name" />
            </div>
            <div>
              <label className={labelClass}>Joining Date</label>
              <input type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Confirmation Date</label>
              <input type="date" name="confirmation_date" value={formData.confirmation_date} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Employment Status <span className="text-red-500">*</span></label>
              <select name="employment_status" required value={formData.employment_status} onChange={handleChange} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Terminated">Terminated</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Role <span className="text-red-500">*</span></label>
              <select name="role" required value={formData.role} onChange={handleChange} className={inputClass}>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="HR">HR</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Banking Details */}
        <div>
          <h2 className="mb-4 border-b border-slate-700 pb-2 text-lg font-semibold text-slate-200">Banking Details</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className={labelClass}>Salary Type</label>
              <input type="text" name="salary_type" value={formData.salary_type} onChange={handleChange} className={inputClass} placeholder="Enter salary type" />
            </div>
            <div>
              <label className={labelClass}>Basic Salary</label>
              <input type="number" step="0.01" name="basic_salary" value={formData.basic_salary} onChange={handleChange} className={inputClass} placeholder="Enter basic salary" />
            </div>
            <div>
              <label className={labelClass}>Bank Name</label>
              <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className={inputClass} placeholder="Enter bank name" />
            </div>
            <div>
              <label className={labelClass}>Account Number</label>
              <input type="text" name="account_number" value={formData.account_number} onChange={handleChange} className={inputClass} placeholder="Only digits, 6-20" />
              {fieldErrors.account_number && <p className="mt-1 text-xs text-red-400">{fieldErrors.account_number}</p>}
            </div>
            <div>
              <label className={labelClass}>IFSC Code</label>
              <input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} className={inputClass} placeholder="SBIN0001234" />
              {fieldErrors.ifsc_code && <p className="mt-1 text-xs text-red-400">{fieldErrors.ifsc_code}</p>}
            </div>
            <div>
              <label className={labelClass}>UPI ID</label>
              <input type="text" name="upi_id" value={formData.upi_id} onChange={handleChange} className={inputClass} placeholder="name@bank" />
              {fieldErrors.upi_id && <p className="mt-1 text-xs text-red-400">{fieldErrors.upi_id}</p>}
            </div>
          </div>
        </div>

        {/* Documents */}
        <div>
          <h2 className="mb-4 border-b border-slate-700 pb-2 text-lg font-semibold text-slate-200">Documents</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Resume</label>
              <input type="file" name="resume_url" onChange={handleChange} className={inputClass} />
              {existingFiles.resume_url && (
                <a href={getFileUrl(existingFiles.resume_url)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-blue-600 hover:underline">
                  View Current Resume
                </a>
              )}
            </div>
            <div>
              <label className={labelClass}>Aadhaar</label>
              <input type="file" name="aadhaar_url" onChange={handleChange} className={inputClass} />
              {existingFiles.aadhaar_url && (
                <a href={getFileUrl(existingFiles.aadhaar_url)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-blue-600 hover:underline">
                  View Current Aadhaar
                </a>
              )}
            </div>
            <div>
              <label className={labelClass}>PAN</label>
              <input type="file" name="pan_url" onChange={handleChange} className={inputClass} />
              {existingFiles.pan_url && (
                <a href={getFileUrl(existingFiles.pan_url)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-blue-600 hover:underline">
                  View Current PAN
                </a>
              )}
            </div>
            <div>
              <label className={labelClass}>Passport</label>
              <input type="file" name="passport_url" onChange={handleChange} className={inputClass} />
              {existingFiles.passport_url && (
                <a href={getFileUrl(existingFiles.passport_url)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-blue-600 hover:underline">
                  View Current Passport
                </a>
              )}
            </div>
            <div>
              <label className={labelClass}>Offer Letter</label>
              <input type="file" name="offer_letter_url" onChange={handleChange} className={inputClass} />
              {existingFiles.offer_letter_url && (
                <a href={getFileUrl(existingFiles.offer_letter_url)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-blue-600 hover:underline">
                  View Current Offer Letter
                </a>
              )}
            </div>
            <div>
              <label className={labelClass}>Appointment Letter</label>
              <input type="file" name="appointment_letter_url" onChange={handleChange} className={inputClass} />
              {existingFiles.appointment_letter_url && (
                <a href={getFileUrl(existingFiles.appointment_letter_url)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-blue-600 hover:underline">
                  View Current Appointment Letter
                </a>
              )}
            </div>
            <div>
              <label className={labelClass}>NDA</label>
              <input type="file" name="nda_url" onChange={handleChange} className={inputClass} />
              {existingFiles.nda_url && (
                <a href={getFileUrl(existingFiles.nda_url)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-blue-600 hover:underline">
                  View Current NDA
                </a>
              )}
            </div>
          </div>
        </div>

        {!isEditMode && (
          <div>
            {/* Login & Access */}
            <div>
              <h2 className="mb-4 border-b border-slate-700 pb-2 text-lg font-semibold text-slate-200">Login & Access</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Username <span className="text-red-500">*</span></label>
                  <input type="text" name="username" required value={formData.username} onChange={handleChange} className={inputClass} placeholder="Enter username" />
                </div>
                <div>
                  <label className={labelClass}>Official Email Address <span className="text-red-500">*</span></label>
                  <input type="email" name="official_email" required value={formData.official_email} onChange={handleChange} className={inputClass} placeholder="Enter official email address" />
                </div>
                <div className="relative">
                  <label className={labelClass}>Password {isEditMode ? "" : <span className="text-red-500">*</span>}</label>
                  <input type={showPassword ? "text" : "password"} name="password" required={!isEditMode} value={formData.password} onChange={handleChange} className={inputClass} placeholder={isEditMode ? "Leave blank to keep unchanged" : "Enter password"} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                  <p className="mt-1 text-xs text-slate-500">Password must be at least 6 characters long.</p>
                </div>
                <div className="relative">
                  <label className={labelClass}>Confirm Password {isEditMode ? "" : <span className="text-red-500">*</span>}</label>
                  <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" required={!isEditMode && (formData.password?.length > 0)} value={formData.confirm_password} onChange={handleChange} className={inputClass} placeholder="Confirm password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-4">
          <Link
            to="/admin/employees"
            className="rounded-md border border-slate-700 px-6 py-2.5 font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 font-medium text-white transition hover:bg-primary-dark disabled:opacity-70"
          >
            <FiSave />
            {loading ? "Saving..." : isEditMode ? "Update Employee" : "Save Employee"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EmployeeAdd;
