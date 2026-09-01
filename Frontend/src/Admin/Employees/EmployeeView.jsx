import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  DollarSign,
  FileText,
  ExternalLink,
  Edit2,
  PhoneCall,
  Shield,
  CreditCard,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Clock,
  Car,
  Tag,
} from "lucide-react";
import api from "../../api";

const buildUploadUrl = (filePath) => {
  if (!filePath) return null;
  const normalized = `${filePath}`.replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalized)) return normalized;

  const base = (api.defaults.baseURL || "/api").replace(/\/api\/?$/, "");
  if (normalized.startsWith("/uploads/")) return `${base}${normalized}`;
  if (normalized.startsWith("uploads/")) return `${base}/${normalized}`;
  return `${base}/uploads/${normalized}`;
};

const EmployeeView = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/employees/${id}`);
        const data = response.data;
        if (data.employee) {
          setEmployee(data.employee);
        } else {
          setError("Employee not found");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load employee details");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const parseEducationalDetails = (details) => {
    if (!details) return [];
    if (Array.isArray(details)) return details;
    if (typeof details === "string") {
      try {
        const parsed = JSON.parse(details);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const renderInfoItem = (label, value, icon = null) => (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 transition hover:border-white/10">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
        {icon && <span className="text-orange-400/80">{icon}</span>}
        <span>{label}</span>
      </div>
      <p className="text-sm font-medium text-white break-words">
        {value || <span className="text-white/30 italic">Not Specified</span>}
      </p>
    </div>
  );

  const renderDocumentCard = (title, url, description) => {
    const fileUrl = buildUploadUrl(url);
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between hover:bg-white/[0.04] transition">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                fileUrl
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                  : "bg-white/5 text-white/40 border-white/10"
              }`}
            >
              {fileUrl ? "Uploaded" : "Missing"}
            </span>
          </div>
          {description && <p className="text-xs text-white/40 mb-3">{description}</p>}
        </div>

        <div className="mt-3 pt-3 border-t border-white/5">
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400 hover:text-orange-300 transition"
            >
              <ExternalLink size={14} />
              <span>View Document</span>
            </a>
          ) : (
            <span className="text-xs text-white/30 italic">No document attached</span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111318] p-6 flex flex-col items-center justify-center text-white/50">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent mb-4"></div>
        <p className="text-sm font-medium">Loading employee details...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-[#111318] p-6 text-white">
        <div className="max-w-xl mx-auto mt-12 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-6 text-center">
          <AlertCircle size={40} className="mx-auto text-rose-400 mb-3" />
          <h2 className="text-lg font-bold text-rose-300">Unable to load employee</h2>
          <p className="text-sm text-rose-400/80 mt-1 mb-6">{error || "Employee not found."}</p>
          <Link
            to="/admin/employees"
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition"
          >
            <ArrowLeft size={16} /> Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  const educationalList = parseEducationalDetails(employee.educational_details);
  const employeeStatus = employee.status || employee.employment_status || "Active";
  const profilePhotoUrl = buildUploadUrl(employee.profile_photo);
  const employeeCode = employee.employee_code || (employee.employee_id ? employee.employee_id.substring(0, 8) : "N/A");

  return (
    <div className="space-y-6 pb-12 text-white min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/employees"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            title="Back to Employee List"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {employee.first_name} {employee.last_name}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${
                  employeeStatus === "Active"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/25"
                }`}
              >
                {employeeStatus === "Active" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {employeeStatus}
              </span>
            </div>
            <p className="text-white/40 text-xs mt-0.5">
              Employee ID: <span className="text-white/70 font-mono">{employeeCode}</span> • Designation:{" "}
              <span className="text-white/70">{employee.designation || "Not Assigned"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/admin/employees/edit/${employee.employee_id || id}`}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 shadow-md"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            <Edit2 size={16} /> Edit Employee
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Left Column: Profile Card & Quick Contacts */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Profile Card */}
          <div className="rounded-2xl border border-white/10 bg-[#111318] p-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-orange-500/20 to-transparent"></div>
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-2xl border-2 border-orange-500/40 mb-4 bg-[#1a1d24] flex items-center justify-center shadow-inner">
              {profilePhotoUrl ? (
                <img
                  src={profilePhotoUrl}
                  alt={`${employee.first_name} ${employee.last_name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-orange-500/10 text-3xl font-bold text-orange-400">
                  {`${employee.first_name?.[0] || ""}${employee.last_name?.[0] || ""}`.toUpperCase()}
                </div>
              )}
            </div>

            <h2 className="text-lg font-bold text-white">
              {employee.first_name} {employee.last_name}
            </h2>
            <p className="text-xs text-orange-400 font-medium mt-0.5 mb-3">
              {employee.designation || "No Designation"}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-white/80">
                {employeeCode}
              </span>
              <span className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-300">
                {employee.role || "Employee"}
              </span>
            </div>

            <div className="border-t border-white/10 pt-4 text-left space-y-2.5 text-xs text-white/70">
              <div className="flex items-center justify-between">
                <span className="text-white/40">Status:</span>
                <span
                  className={`font-semibold ${
                    employeeStatus === "Active" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {employeeStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Department:</span>
                <span className="text-white font-medium truncate max-w-[140px]" title={employee.designation}>
                  {employee.designation || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Joined On:</span>
                <span className="text-white font-medium">{formatDate(employee.joining_date)}</span>
              </div>
            </div>
          </div>

          {/* Quick Contact Card */}
          <div className="rounded-2xl border border-white/10 bg-[#111318] p-5 shadow-lg space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                <Phone size={14} />
              </div>
              <h3 className="text-sm font-semibold text-white">Contact Channels</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-white/40 mb-0.5">Mobile Phone</p>
                {employee.mobile_number ? (
                  <a
                    href={`tel:${employee.mobile_number}`}
                    className="font-medium text-white hover:text-orange-400 transition flex items-center gap-1.5"
                  >
                    <Phone size={12} className="text-orange-400" />
                    <span>{employee.mobile_number}</span>
                  </a>
                ) : (
                  <span className="text-white/30 italic">Not Provided</span>
                )}
              </div>

              {employee.alternate_mobile && (
                <div>
                  <p className="text-white/40 mb-0.5">Alternate Mobile</p>
                  <a
                    href={`tel:${employee.alternate_mobile}`}
                    className="font-medium text-white hover:text-orange-400 transition"
                  >
                    {employee.alternate_mobile}
                  </a>
                </div>
              )}

              <div>
                <p className="text-white/40 mb-0.5">Personal Email</p>
                {employee.personal_email ? (
                  <a
                    href={`mailto:${employee.personal_email}`}
                    className="font-medium text-white hover:text-orange-400 transition break-all flex items-center gap-1.5"
                  >
                    <Mail size={12} className="text-orange-400 shrink-0" />
                    <span>{employee.personal_email}</span>
                  </a>
                ) : (
                  <span className="text-white/30 italic">Not Provided</span>
                )}
              </div>

              {employee.official_email && (
                <div>
                  <p className="text-white/40 mb-0.5">Official Email</p>
                  <a
                    href={`mailto:${employee.official_email}`}
                    className="font-medium text-white hover:text-orange-400 transition break-all flex items-center gap-1.5"
                  >
                    <Mail size={12} className="text-orange-400 shrink-0" />
                    <span>{employee.official_email}</span>
                  </a>
                </div>
              )}

              {employee.permanent_address && (
                <div>
                  <p className="text-white/40 mb-0.5">Permanent Address</p>
                  <p className="font-medium text-white/80 leading-relaxed flex items-start gap-1.5">
                    <MapPin size={12} className="text-orange-400 shrink-0 mt-0.5" />
                    <span>{employee.permanent_address}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Sections */}
        <div className="lg:col-span-3 space-y-6">
          {/* Section: Employment Details */}
          <div className="rounded-2xl border border-white/10 bg-[#111318] p-5 sm:p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                  <Briefcase size={18} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Employment Details</h2>
                  <p className="text-xs text-white/40">Role, team assignment, dates, and organizational records</p>
                </div>
              </div>
              <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                {employee.role || "Employee"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {renderInfoItem("Department / Designation", employee.designation, <Briefcase size={14} />)}
              {renderInfoItem("System Role", employee.role, <Shield size={14} />)}
              {renderInfoItem("Reporting Team Lead", employee.team_lead, <User size={14} />)}
              {renderInfoItem("Date of Joining", formatDate(employee.joining_date), <Calendar size={14} />)}
              {renderInfoItem("Confirmation Date", formatDate(employee.confirmation_date), <Calendar size={14} />)}
              {renderInfoItem("Employment Status", employee.employment_status || employee.status, <Clock size={14} />)}
              {/* {renderInfoItem("Official Email", employee.official_email, <Mail size={14} />)}
              {renderInfoItem("Username", employee.username, <User size={14} />)} */}
              {employee.driving_licence_number &&
                renderInfoItem("Driving Licence No", employee.driving_licence_number, <Car size={14} />)}
              {employee.vehicle_registration_number &&
                renderInfoItem("Vehicle Reg No", employee.vehicle_registration_number, <Car size={14} />)}
              {employee.referral_code &&
                renderInfoItem("Referral Code", employee.referral_code, <Tag size={14} />)}
            </div>
          </div>

          {/* Section: Emergency Contact */}
          <div className="rounded-2xl border border-rose-500/20 bg-[#111318] p-5 sm:p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-400">
                  <HeartHandshake size={18} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Emergency Contact</h2>
                  <p className="text-xs text-white/40">Primary point of contact during urgent or medical situations</p>
                </div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400">
                Priority Contact
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
                  <User size={13} className="text-rose-400" />
                  <span>Contact Person</span>
                </div>
                <p className="text-base font-bold text-white">
                  {employee.emergency_contact_person || <span className="text-white/30 font-normal italic">Not Specified</span>}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
                  <HeartHandshake size={13} className="text-rose-400" />
                  <span>Relationship</span>
                </div>
                <p className="text-base font-bold text-white">
                  {employee.emergency_relationship || <span className="text-white/30 font-normal italic">Not Specified</span>}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
                  <PhoneCall size={13} className="text-rose-400" />
                  <span>Emergency Phone</span>
                </div>
                {employee.emergency_contact_number ? (
                  <a
                    href={`tel:${employee.emergency_contact_number}`}
                    className="inline-flex items-center gap-1.5 text-base font-bold text-rose-400 hover:text-rose-300 transition"
                  >
                    <Phone size={14} />
                    <span>{employee.emergency_contact_number}</span>
                  </a>
                ) : (
                  <p className="text-sm font-medium text-white/30 italic">Not Specified</p>
                )}
              </div>
            </div>
          </div>

          {/* Section: Educational Details */}
          <div className="rounded-2xl border border-white/10 bg-[#111318] p-5 sm:p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Educational Details</h2>
                  <p className="text-xs text-white/40">Academic qualifications, degrees, and institutions</p>
                </div>
              </div>
              <span className="text-xs font-medium text-white/50">
                {educationalList.length} qualification{educationalList.length !== 1 ? "s" : ""}
              </span>
            </div>

            {educationalList.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="min-w-full text-sm">
                  <thead className="bg-white/5 text-white/60 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">#</th>
                      <th className="px-4 py-3 text-left">Course / Degree</th>
                      <th className="px-4 py-3 text-left">Institution / University</th>
                      <th className="px-4 py-3 text-left">Percentage / Score</th>
                      <th className="px-4 py-3 text-left">Passing Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {educationalList.map((edu, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition">
                        <td className="px-4 py-3.5 text-white/40 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3.5 font-semibold text-white">
                          {edu.course || edu.degree || "—"}
                        </td>
                        <td className="px-4 py-3.5 text-white/80">
                          {edu.institution || edu.college || edu.university || "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-block rounded-md border border-purple-500/25 bg-purple-500/10 px-2 py-0.5 text-xs font-bold text-purple-300">
                            {edu.percentage || edu.cgpa || edu.grade || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-white/70 font-mono">
                          {edu.year_of_passing || edu.passing_year || edu.year || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-white/40">
                <GraduationCap size={32} className="mx-auto text-white/20 mb-2" />
                <p className="text-sm font-medium">No educational details recorded</p>
                <p className="text-xs text-white/30 mt-0.5">Qualifications can be added via the Edit Employee form</p>
              </div>
            )}
          </div>

          {/* Section: Personal Information */}
          <div className="rounded-2xl border border-white/10 bg-[#111318] p-5 sm:p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Personal Information</h2>
                <p className="text-xs text-white/40">Identity, demographics, and statutory identification</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {renderInfoItem("Gender", employee.gender)}
              {renderInfoItem("Date of Birth", formatDate(employee.dob), <Calendar size={14} />)}
              {renderInfoItem("Blood Group", employee.blood_group)}
              {renderInfoItem("Marital Status", employee.marital_status)}
              {renderInfoItem("Nationality", employee.nationality)}
              {renderInfoItem("Aadhaar Number", employee.aadhaar_number)}
              {renderInfoItem("PAN Number", employee.pan_number)}
              {renderInfoItem("Mobile Number", employee.mobile_number, <Phone size={14} />)}
              {renderInfoItem("Alternate Mobile", employee.alternate_mobile, <Phone size={14} />)}
              {renderInfoItem("Personal Email", employee.personal_email, <Mail size={14} />)}
              <div className="sm:col-span-2 md:col-span-2">
                {renderInfoItem("Permanent Address", employee.permanent_address, <MapPin size={14} />)}
              </div>
            </div>
          </div>

          {/* Section: Banking & Salary Details */}
          <div className="rounded-2xl border border-white/10 bg-[#111318] p-5 sm:p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                <DollarSign size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Banking & Salary Information</h2>
                <p className="text-xs text-white/40">Remuneration structure, bank account, and payment IDs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {renderInfoItem("Salary Type", employee.salary_type)}
              {renderInfoItem(
                "Net / Basic Salary",
                employee.basic_salary ? `₹ ${Number(employee.basic_salary).toLocaleString("en-IN")}` : null,
                <DollarSign size={14} />
              )}
              {renderInfoItem("Bank Name", employee.bank_name, <CreditCard size={14} />)}
              {renderInfoItem("Account Number", employee.account_number)}
              {renderInfoItem("IFSC Code", employee.ifsc_code)}
              {renderInfoItem("UPI ID", employee.upi_id)}
            </div>
          </div>

          {/* Section: Uploaded Documents */}
          <div className="rounded-2xl border border-white/10 bg-[#111318] p-5 sm:p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-2.5 border-b border-white/10 pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-400">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Uploaded Documents</h2>
                <p className="text-xs text-white/40">Statutory and verification documents attached to profile</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {renderDocumentCard("Resume", employee.resume_url, "Professional CV / Resume")}
              {renderDocumentCard("Aadhaar Card", employee.aadhaar_url, "Government UIDAI identity")}
              {renderDocumentCard("PAN Card", employee.pan_url, "Income tax identification")}
              {renderDocumentCard(
                "Bank Passbook / Proof",
                employee.bank_passbook_url || employee.passport_url,
                "Cancelled cheque or passbook"
              )}
              {renderDocumentCard(
                "Appointment Letter",
                employee.appointment_letter_url,
                "Signed company appointment"
              )}
              {renderDocumentCard(
                "Non-Disclosure Agreement (NDA)",
                employee.nda_url,
                "Signed confidentiality document"
              )}
              {employee.offer_letter_url &&
                renderDocumentCard("Offer Letter", employee.offer_letter_url, "Initial employment offer letter")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeView;

