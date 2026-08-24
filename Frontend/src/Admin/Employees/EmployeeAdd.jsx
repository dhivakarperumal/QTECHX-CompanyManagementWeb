import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../PrivateRouter/AuthContext";
import { FiArrowLeft, FiSave, FiEye, FiEyeOff } from "react-icons/fi";
import Select from 'react-select';

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

    '&:hover': {
      border: '1px solid #f97316',
    },
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

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahrain",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "Estonia",
  "Ethiopia",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Hong Kong",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kuwait",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lithuania",
  "Luxembourg",
  "Malaysia",
  "Maldives",
  "Mexico",
  "Monaco",
  "Mongolia",
  "Morocco",
  "Myanmar",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "North Korea",
  "Norway",
  "Oman",
  "Pakistan",
  "Palestine",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Thailand",
  "Turkey",
  "UAE",
  "Ukraine",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zimbabwe"
];

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
    nationality: "India",
    aadhaar_number: "",
    pan_number: "",
    mobile_number: "",
    alternate_mobile: "",
    personal_email: "",
    permanent_address: "",
    emergency_contact_person: "",
    emergency_contact_number: "",
    emergency_relationship: "",
    department: "",
    team_lead: "",
    joining_date: "",
    confirmation_date: "",
    status: "Active",
    employment_status: "Active",
    role: "Employee",
    salary_type: "",
    basic_salary: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
    driving_licence_number: "",
    vehicle_registration_number: "",
    referral_code: "",
    resume_url: "",
    aadhaar_url: "",
    pan_url: "",
    bank_passbook_url: "",
    appointment_letter_url: "",
    nda_url: "",
    educational_details: [
      { course: "", institution: "", percentage: "", year_of_passing: "" },
    ],
  });

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const addEducationRow = () => {
    setFormData((prev) => ({
      ...prev,
      educational_details: [...(prev.educational_details || []), { course: "", institution: "", percentage: "", year_of_passing: "" }]
    }));
  };

  const removeEducationRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      educational_details: (prev.educational_details || []).filter((_, i) => i !== index),
    }));
  };

  const handleEducationChange = (index, field, value) => {
    setFormData((prev) => {
      const copy = (prev.educational_details || []).slice();
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, educational_details: copy };
    });
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
            nationality: emp.nationality || "India",
            aadhaar_number: emp.aadhaar_number || "",
            pan_number: emp.pan_number || "",
            mobile_number: emp.mobile_number || "",
            alternate_mobile: emp.alternate_mobile || "",
            personal_email: emp.personal_email || "",
            permanent_address: emp.permanent_address || "",
            emergency_contact_person: emp.emergency_contact_person || "",
            emergency_contact_number: emp.emergency_contact_number || "",
            emergency_relationship: emp.emergency_relationship || "",
            department: emp.department || emp.designation || "",
            team_lead: emp.team_lead || "",
            joining_date: formatDate(emp.joining_date),
            confirmation_date: formatDate(emp.confirmation_date),
            status: emp.status || emp.employment_status || "Active",
            employment_status: emp.status || emp.employment_status || "Active",
            role: emp.role || "Employee",
            salary_type: emp.salary_type || "",
            basic_salary: emp.basic_salary || "",
            bank_name: emp.bank_name || "",
            account_number: emp.account_number || "",
            ifsc_code: emp.ifsc_code || "",
            upi_id: emp.upi_id || "",
            driving_licence_number: emp.driving_licence_number || "",
            vehicle_registration_number: emp.vehicle_registration_number || "",
            referral_code: emp.referral_code || "",
            profile_photo: "",
            resume_url: "",
            aadhaar_url: "",
            pan_url: "",
            bank_passbook_url: emp.bank_passbook_url || emp.passport_url || "",
            appointment_letter_url: "",
            nda_url: "",
            username: "",
            official_email: "",
            password: "",
            educational_details: emp.educational_details ? JSON.parse(emp.educational_details) : [{ course: "", institution: "", percentage: "", year_of_passing: "" }],
          });
          setExistingFiles({
            profile_photo: emp.profile_photo || null,
            resume_url: emp.resume_url || null,
            aadhaar_url: emp.aadhaar_url || null,
            pan_url: emp.pan_url || null,
            bank_passbook_url: emp.bank_passbook_url || emp.passport_url || null,
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

  const departments = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Web Developer",
    "Mobile App Developer",
    "UI/UX Designer",
    "Figma Designer",
    "Graphic Designer",
    "Video Editor",
    "Digital Marketing Executive",
    "SEO Specialist",
    "HR Executive",
    "Recruiter",
    "Technical Support Engineer",
    "Business Development Executive",
    "Accountant",
    "Office Administrator",
    "Software Architect",
    "AI/ML Engineer",
    "Data Analyst",
  ];

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
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.first_name?.trim()) errors.first_name = "First name is required.";
    if (!data.last_name?.trim()) errors.last_name = "Last name is required.";
    if (!data.department?.trim()) errors.department = "Department is required.";
    if (!data.joining_date) errors.joining_date = "Joining date is required.";

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

    if (!data.personal_email?.trim()) {
      errors.personal_email = "Personal email is required.";
    } else if (!emailPattern.test(data.personal_email)) {
      errors.personal_email = "Personal email must be a valid email address.";
    }

    if (!data.dob) {
      errors.dob = "Date of birth is required.";
    } else {
      const dobDate = new Date(data.dob);
      if (Number.isNaN(dobDate.getTime())) {
        errors.dob = "Date of birth is invalid.";
      } else {
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
          age -= 1;
        }
        if (age < 18) {
          errors.dob = "Employee must be at least 18 years old.";
        }
      }
    }

    if (!data.salary_type) {
      errors.salary_type = "Salary type is required.";
    }

    if (!data.bank_name?.trim()) {
      errors.bank_name = "Bank name is required.";
    }

    if (!data.account_number?.trim()) {
      errors.account_number = "Account number is required.";
    } else if (!/^\d{6,20}$/.test(data.account_number)) {
      errors.account_number = "Account number must be 6–20 digits.";
    }

    if (!data.ifsc_code?.trim()) {
      errors.ifsc_code = "IFSC code is required.";
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(data.ifsc_code)) {
      errors.ifsc_code = "IFSC must be 11 characters like SBIN0001234.";
    }

    // UPI ID is optional, but validate format if provided
    if (data.upi_id?.trim() && !/^[A-Za-z0-9._-]{2,}@[A-Za-z0-9.-]{2,}$/.test(data.upi_id)) {
      errors.upi_id = "UPI ID should look like name@bank.";
    }

    if (!isEditMode) {
      if (!data.username?.trim()) {
        errors.username = "Username is required.";
      }
      if (!data.official_email?.trim()) {
        errors.official_email = "Official email is required.";
      } else if (!emailPattern.test(data.official_email)) {
        errors.official_email = "Official email must be a valid email address.";
      }
    }

    if (Array.isArray(data.educational_details)) {
      const incompleteRow = data.educational_details.some((row) => {
        const fields = [row.course, row.institution, row.percentage, row.year_of_passing].map((value) => value?.trim());
        const hasAnyValue = fields.some(Boolean);
        const hasAllValues = fields.every(Boolean);
        return hasAnyValue && !hasAllValues;
      });

      if (incompleteRow) {
        errors.educational_details = "Complete or remove any incomplete education row.";
      }
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    let sanitizedValue = value;

    if (type === "file") {
      const file = files?.[0];
      if (!file) return;

      setFormData((prev) => ({ ...prev, [name]: file }));
      setFieldErrors((prev) => {
        const nextErrors = { ...prev };
        delete nextErrors[name];
        return nextErrors;
      });
      return;
    }

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
          newData.username = `${first.toLowerCase()}${last ? "." + last.toLowerCase() : ""}`.replace(/\s+/g, "");
        }
        if (name === "personal_email") {
          newData.official_email = sanitizedValue;
        }
        if (name === "mobile_number") {
          // autofill password with mobile for initial creation
          newData.password = sanitizedValue;
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);



    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      // Show only the first validation error at the top for clarity
      const firstError = Object.values(validationErrors)[0];
      setError(firstError);
      setLoading(false);
      return;
    }

    setFieldErrors({});

    try {
      const token = localStorage.getItem("token");

      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] === "" || formData[key] === null) return;

        if (key === "educational_details") {
          submitData.append(key, JSON.stringify(formData[key]));
          return;
        }

        submitData.append(key, formData[key]);
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

  const inputClass = "w-full rounded-xl border  border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 placeholder:text-white/30";
  const labelClass = "mb-1.5 block text-sm font-medium text-white/70";
  const sectionClass = "rounded-2xl border border-white/10 bg-[#111318] p-5 sm:p-6";

  if (fetching) {
    return <div className="min-h-screen bg-[#161C24] p-6 text-center text-white/50">Loading employee details...</div>;
  }

  return (
    <div className="space-y-5 pb-10 text-white min-h-screen">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/employees" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white">
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{isEditMode ? "Edit Employee" : "Add New Employee"}</h1>
            <p className="text-white/40 text-xs mt-0.5">{isEditMode ? "Update employee profile and access details" : "Create a new employee record and account"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/employees" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">Cancel</Link>
          <button type="submit" form="employee-form" disabled={loading} className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
            <FiSave size={16} />
            {loading ? "Saving..." : isEditMode ? "Update Employee" : "Save Employee"}
          </button>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">{error}</div>}

      <form id="employee-form" onSubmit={handleSubmit} className="space-y-5">
        <div className={sectionClass}>
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Personal Details</h2>
              <p className="text-xs text-white/40">Core profile information</p>
            </div>
          </div>
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
              <Select
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
                value={formData.gender ? { value: formData.gender, label: formData.gender } : null}
                onChange={(opt) => handleChange({ target: { name: 'gender', value: opt ? opt.value : '', type: 'select' } })}
                styles={customSelectStyles}
                placeholder="Select Gender"
                isSearchable={false}
              />
            </div>
            <div>
              <label className={labelClass}>Date of Birth <span className="text-red-500">*</span></label>
              <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Blood Group</label>
              <Select
                options={[
                  { value: 'A+', label: 'A+' },
                  { value: 'A-', label: 'A-' },
                  { value: 'B+', label: 'B+' },
                  { value: 'B-', label: 'B-' },
                  { value: 'O+', label: 'O+' },
                  { value: 'O-', label: 'O-' },
                  { value: 'AB+', label: 'AB+' },
                  { value: 'AB-', label: 'AB-' },
                  { value: 'Unknown', label: 'Unknown' },
                ]}
                value={formData.blood_group ? { value: formData.blood_group, label: formData.blood_group } : null}
                onChange={(opt) => handleChange({ target: { name: 'blood_group', value: opt ? opt.value : '', type: 'select' } })}
                styles={customSelectStyles}
                placeholder="Select Blood Group"
                isSearchable={false}
              />
            </div>
            <div>
              <label className={labelClass}>Marital Status</label>
              <Select
                options={[
                  { value: 'Single', label: 'Single' },
                  { value: 'Married', label: 'Married' },
                  { value: 'Divorced', label: 'Divorced' },
                  { value: 'Widowed', label: 'Widowed' },
                ]}
                value={formData.marital_status ? { value: formData.marital_status, label: formData.marital_status } : null}
                onChange={(opt) => handleChange({ target: { name: 'marital_status', value: opt ? opt.value : '', type: 'select' } })}
                styles={customSelectStyles}
                placeholder="Select Status"
                isSearchable={false}
              />
            </div>
            <div>
              <label className={labelClass}>Nationality</label>
              <Select
                options={countries.map(c => ({ value: c, label: c }))}
                value={formData.nationality ? { value: formData.nationality, label: formData.nationality } : null}
                onChange={(opt) => handleChange({ target: { name: 'nationality', value: opt ? opt.value : '', type: 'select' } })}
                styles={customSelectStyles}
                placeholder="Select Nationality"
              />
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
              <label className={labelClass}>Personal Email <span className="text-red-500">*</span></label>
              <input type="email" name="personal_email" required value={formData.personal_email} onChange={handleChange} className={inputClass} placeholder="Enter personal email" />
              {fieldErrors.personal_email && <p className="mt-1 text-xs text-red-400">{fieldErrors.personal_email}</p>}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className={labelClass}>Permanent Address</label>
              <textarea name="permanent_address" rows="2" value={formData.permanent_address} onChange={handleChange} className={inputClass} placeholder="Enter permanent address"></textarea>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className={sectionClass}>
          <div className="mb-4 border-b border-white/10 pb-3">
            <h2 className="text-lg font-semibold text-white">Emergency Contact</h2>
            <p className="text-xs text-white/40">Primary contact in case of urgent need</p>
          </div>
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
        <div className={sectionClass}>
          <div className="mb-4 border-b border-white/10 pb-3">
            <h2 className="text-lg font-semibold text-white">Employment Details</h2>
            <p className="text-xs text-white/40">Role, team, and status information</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Department</label>
              <Select
                options={departments.map(d => ({ value: d, label: d }))}
                value={formData.department ? { value: formData.department, label: formData.department } : null}
                onChange={(opt) => handleChange({ target: { name: 'department', value: opt ? opt.value : '', type: 'select' } })}
                styles={customSelectStyles}
                placeholder="Select Department"
              />
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
              <Select
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                  { value: 'Terminated', label: 'Terminated' },
                  { value: 'Resigned', label: 'Resigned' },
                ]}
                value={formData.employment_status ? { value: formData.employment_status, label: formData.employment_status } : null}
                onChange={(opt) => handleChange({ target: { name: 'employment_status', value: opt ? opt.value : '', type: 'select' } })}
                styles={customSelectStyles}
                placeholder="Select Status"
                isSearchable={false}
              />
            </div>
            <div>
              <label className={labelClass}>Role <span className="text-red-500">*</span></label>
              <Select
                options={[
                  { value: 'Employee', label: 'Employee' },
                  { value: 'Manager', label: 'Manager' },
                  { value: 'HR', label: 'HR' },
                  { value: 'Admin', label: 'Admin' },
                ]}
                value={formData.role ? { value: formData.role, label: formData.role } : null}
                onChange={(opt) => handleChange({ target: { name: 'role', value: opt ? opt.value : '', type: 'select' } })}
                styles={customSelectStyles}
                placeholder="Select Role"
                isSearchable={false}
              />
            </div>
          </div>
        </div>

        {/* Banking Details */}
        <div className={sectionClass}>
          <div className="mb-4 border-b border-white/10 pb-3">
            <h2 className="text-lg font-semibold text-white">Banking Details</h2>
            <p className="text-xs text-white/40">Salary and payment account information</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className={labelClass}>Salary Type <span className="text-red-500">*</span></label>
              <Select
                options={[
                  { value: 'Daily', label: 'Daily' },
                  { value: 'Weekly', label: 'Weekly' },
                  { value: 'Monthly', label: 'Monthly' },
                ]}
                value={formData.salary_type ? { value: formData.salary_type, label: formData.salary_type } : null}
                onChange={(opt) => handleChange({ target: { name: 'salary_type', value: opt ? opt.value : '', type: 'select' } })}
                styles={customSelectStyles}
                placeholder="Select Salary Type"
                isSearchable={false}
              />
              {fieldErrors.salary_type && <p className="mt-1 text-xs text-red-400">{fieldErrors.salary_type}</p>}
            </div>
            <div>
              <label className={labelClass}>Net Salary</label>
              <input type="number" step="0.01" name="basic_salary" value={formData.basic_salary} onChange={handleChange} className={inputClass} placeholder="Enter basic salary" />
            </div>
            <div>
              <label className={labelClass}>Bank Name <span className="text-red-500">*</span></label>
              <input type="text" name="bank_name" required value={formData.bank_name} onChange={handleChange} className={inputClass} placeholder="Enter bank name" />
              {fieldErrors.bank_name && <p className="mt-1 text-xs text-red-400">{fieldErrors.bank_name}</p>}
            </div>
            <div>
              <label className={labelClass}>Account Number <span className="text-red-500">*</span></label>
              <input type="text" name="account_number" required value={formData.account_number} onChange={handleChange} className={inputClass} placeholder="Only digits, 6-20" />
              {fieldErrors.account_number && <p className="mt-1 text-xs text-red-400">{fieldErrors.account_number}</p>}
            </div>
            <div>
              <label className={labelClass}>IFSC Code <span className="text-red-500">*</span></label>
              <input type="text" name="ifsc_code" required value={formData.ifsc_code} onChange={handleChange} className={inputClass} placeholder="SBIN0001234" />
              {fieldErrors.ifsc_code && <p className="mt-1 text-xs text-red-400">{fieldErrors.ifsc_code}</p>}
            </div>
            <div>
              <label className={labelClass}>UPI ID <span className="text-white/40 text-xs font-normal">(optional)</span></label>
              <input type="text" name="upi_id" value={formData.upi_id} onChange={handleChange} className={inputClass} placeholder="name@bank" />
              {fieldErrors.upi_id && <p className="mt-1 text-xs text-red-400">{fieldErrors.upi_id}</p>}
            </div>
            <div>
              <label className={labelClass}>Driving Licence Number <span className="text-white/40 text-xs font-normal">(optional)</span></label>
              <input type="text" name="driving_licence_number" value={formData.driving_licence_number} onChange={handleChange} className={inputClass} placeholder="e.g. MH0120200012345" />
              {fieldErrors.driving_licence_number && <p className="mt-1 text-xs text-red-400">{fieldErrors.driving_licence_number}</p>}
            </div>
            <div>
              <label className={labelClass}>Vehicle Registration Number <span className="text-white/40 text-xs font-normal">(optional)</span></label>
              <input type="text" name="vehicle_registration_number" value={formData.vehicle_registration_number} onChange={handleChange} className={inputClass} placeholder="e.g. MH01AB1234" />
              {fieldErrors.vehicle_registration_number && <p className="mt-1 text-xs text-red-400">{fieldErrors.vehicle_registration_number}</p>}
            </div>
            <div>
              <label className={labelClass}>Referral Code <span className="text-white/40 text-xs font-normal">(optional)</span></label>
              <input type="text" name="referral_code" value={formData.referral_code} onChange={handleChange} className={inputClass} placeholder="e.g. REF-XYZ" />
              {fieldErrors.referral_code && <p className="mt-1 text-xs text-red-400">{fieldErrors.referral_code}</p>}
            </div>
          </div>
        </div>

        {/* Educational Details */}
        <div className={sectionClass}>
          <div className="mb-4 border-b border-white/10 pb-3">
            <h2 className="text-lg font-semibold text-white">Educational Details</h2>
            <p className="text-xs text-white/40">Add academic qualifications (multiple rows)</p>
          </div>
          <div className="space-y-3">
            {(formData.educational_details || []).map((row, idx) => (
              <div key={idx} className="grid grid-cols-1 gap-3 md:grid-cols-4 items-end">
                <div>
                  <label className={labelClass}>Course</label>
                  <input value={row.course} onChange={e => handleEducationChange(idx, 'course', e.target.value)} className={inputClass} placeholder="Course" />
                </div>
                <div>
                  <label className={labelClass}>Institution</label>
                  <input value={row.institution} onChange={e => handleEducationChange(idx, 'institution', e.target.value)} className={inputClass} placeholder="Institution" />
                </div>
                <div>
                  <label className={labelClass}>Percentage</label>
                  <input value={row.percentage} onChange={e => handleEducationChange(idx, 'percentage', e.target.value)} className={inputClass} placeholder="Percentage" />
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ flex: 1 }}>
                    <label className={labelClass}>Year of Passing</label>
                    <input value={row.year_of_passing} onChange={e => handleEducationChange(idx, 'year_of_passing', e.target.value)} className={inputClass} placeholder="YYYY" />
                  </div>
                  <div className="mt-6 flex gap-2">
                    <button type="button" onClick={() => addEducationRow()} className="rounded-xl bg-white/5 px-3 py-1 text-sm">+</button>
                    {idx > 0 && <button type="button" onClick={() => removeEducationRow(idx)} className="rounded-xl bg-white/5 px-3 py-1 text-sm">-</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {fieldErrors.educational_details && <p className="mt-3 text-sm text-red-400">{fieldErrors.educational_details}</p>}
        </div>

        {/* Documents */}
        <div className={sectionClass}>
          <div className="mb-4 border-b border-white/10 pb-3">
            <h2 className="text-lg font-semibold text-white">Documents</h2>
            <p className="text-xs text-white/40">Upload supporting employee documents</p>
          </div>
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
              <label className={labelClass}>Bank Passbook</label>
              <input type="file" name="bank_passbook_url" onChange={handleChange} className={inputClass} />
              {existingFiles.bank_passbook_url && (
                <a href={getFileUrl(existingFiles.bank_passbook_url)} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-blue-600 hover:underline">
                  View Current Bank Passbook
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
          <div className={sectionClass}>
            <div className="mb-4 border-b border-white/10 pb-3">
              <h2 className="text-lg font-semibold text-white">Login & Access</h2>
              <p className="text-xs text-white/40">Credentials for the employee portal</p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className={labelClass}>Username <span className="text-red-500">*</span></label>
                <input type="text" name="username" required value={formData.username} onChange={handleChange} className={inputClass} placeholder="Enter username" />
                {fieldErrors.username && <p className="mt-1 text-xs text-red-400">{fieldErrors.username}</p>}
              </div>
              <div>
                <label className={labelClass}>Official Email Address <span className="text-red-500">*</span></label>
                <input type="email" name="official_email" required value={formData.official_email} onChange={handleChange} className={inputClass} placeholder="Enter official email address" />
                {fieldErrors.official_email && <p className="mt-1 text-xs text-red-400">{fieldErrors.official_email}</p>}
              </div>
              <div>
                <label className={labelClass}>Mobile Number</label>
                <input type="text" name="mobile_number" value={formData.mobile_number} onChange={handleChange} className={inputClass} placeholder="Auto-filled from above" />
                {fieldErrors.mobile_number && <p className="mt-1 text-xs text-red-400">{fieldErrors.mobile_number}</p>}
              </div>
              {/* Passwords are managed by employee portal; admin will not set password here. */}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link to="/admin/employees" className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white">Cancel</Link>
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-70" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
            <FiSave size={16} />
            {loading ? "Saving..." : isEditMode ? "Update Employee" : "Save Employee"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EmployeeAdd;
