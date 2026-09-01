import React, { useState, useEffect } from "react";
import { useAuth } from "../../PrivateRouter/AuthContext";
import {
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
  PhoneCall,
  Shield,
  CreditCard,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Clock,
  Car,
  Tag,
  Key,
  X,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../api";
import toast from "react-hot-toast";
import ModalPortal from "../../Componets/CommonComponents/ModalPortal";

const buildUploadUrl = (filePath) => {
  if (!filePath) return null;
  const normalized = `${filePath}`.replace(/\\/g, "/");
  if (/^https?:\/\//i.test(normalized)) return normalized;

  const base = (api.defaults.baseURL || "/api").replace(/\/api\/?$/, "");
  if (normalized.startsWith("/uploads/")) return `${base}${normalized}`;
  if (normalized.startsWith("uploads/")) return `${base}/${normalized}`;
  return `${base}/uploads/${normalized}`;
};

const AdminProfile = () => {
  const { user, profileName, role, email, phone } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Change Password Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      try {
        setLoading(true);
        const empId = user?.employee_id || user?.employeeId || user?.user_id || user?.id;
        if (empId) {
          try {
            const response = await api.get(`/employees/${empId}`);
            if (response.data?.employee) {
              setProfileData(response.data.employee);
              return;
            }
          } catch (err) {
            // User might be a standalone admin not in the employees table
          }
        }
      } catch (err) {
        console.error("Failed to load profile details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileDetails();
  }, [user]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters.");
    }

    setIsChangingPassword(true);
    try {
      const res = await api.post("/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success(res.data.message || "Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error.response?.data?.message || "Failed to change password. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

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

  const emp = profileData || {};
  const educationalList = parseEducationalDetails(emp.educational_details);
  const employeeStatus = emp.status || emp.employment_status || user?.status || "Active";
  const profilePhotoUrl = buildUploadUrl(emp.profile_photo || user?.profile_photo);
  const employeeCode = emp.employee_code || user?.employee_code || user?.employee_id || user?.user_id || "ADMIN-01";
  const userFullName = emp.first_name
    ? `${emp.first_name} ${emp.last_name || ""}`.trim()
    : profileName || user?.username || "Admin Profile";
  const userRole = emp.role || role || user?.role || "Admin";
  const userDesignation = emp.designation || user?.designation || (userRole ? `${userRole} Administrator` : "Administrator");

  return (
    <div className="space-y-6 pb-12 text-white min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">{userFullName}</h1>
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
            Admin Profile • System Role: <span className="text-orange-400 font-semibold">{userRole}</span> • Code:{" "}
            <span className="text-white/70 font-mono">{employeeCode}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 shadow-md"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            <Key size={16} /> Change Password
          </button>
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
                  alt={userFullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-orange-500/10 text-3xl font-bold text-orange-400">
                  {`${userFullName?.[0] || "A"}`.toUpperCase()}
                </div>
              )}
            </div>

            <h2 className="text-lg font-bold text-white">{userFullName}</h2>
            <p className="text-xs text-orange-400 font-medium mt-0.5 mb-3">{userDesignation}</p>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-white/80">
                {employeeCode}
              </span>
              <span className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-300">
                {userRole}
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
                <span className="text-white font-medium truncate max-w-[140px]" title={userDesignation}>
                  {userDesignation}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Member Since:</span>
                <span className="text-white font-medium">
                  {formatDate(emp.joining_date || user?.created_at || "2026-01-01")}
                </span>
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
                {emp.mobile_number || phone || user?.mobile ? (
                  <a
                    href={`tel:${emp.mobile_number || phone || user?.mobile}`}
                    className="font-medium text-white hover:text-orange-400 transition flex items-center gap-1.5"
                  >
                    <Phone size={12} className="text-orange-400" />
                    <span>{emp.mobile_number || phone || user?.mobile}</span>
                  </a>
                ) : (
                  <span className="text-white/30 italic">Not Provided</span>
                )}
              </div>

              {emp.alternate_mobile && (
                <div>
                  <p className="text-white/40 mb-0.5">Alternate Mobile</p>
                  <a
                    href={`tel:${emp.alternate_mobile}`}
                    className="font-medium text-white hover:text-orange-400 transition"
                  >
                    {emp.alternate_mobile}
                  </a>
                </div>
              )}

              <div>
                <p className="text-white/40 mb-0.5">Primary Email</p>
                {emp.personal_email || email || user?.email ? (
                  <a
                    href={`mailto:${emp.personal_email || email || user?.email}`}
                    className="font-medium text-white hover:text-orange-400 transition break-all flex items-center gap-1.5"
                  >
                    <Mail size={12} className="text-orange-400 shrink-0" />
                    <span>{emp.personal_email || email || user?.email}</span>
                  </a>
                ) : (
                  <span className="text-white/30 italic">Not Provided</span>
                )}
              </div>

              {emp.official_email && (
                <div>
                  <p className="text-white/40 mb-0.5">Official Email</p>
                  <a
                    href={`mailto:${emp.official_email}`}
                    className="font-medium text-white hover:text-orange-400 transition break-all flex items-center gap-1.5"
                  >
                    <Mail size={12} className="text-orange-400 shrink-0" />
                    <span>{emp.official_email}</span>
                  </a>
                </div>
              )}

              {emp.permanent_address && (
                <div>
                  <p className="text-white/40 mb-0.5">Permanent Address</p>
                  <p className="font-medium text-white/80 leading-relaxed flex items-start gap-1.5">
                    <MapPin size={12} className="text-orange-400 shrink-0 mt-0.5" />
                    <span>{emp.permanent_address}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Account Security Card */}
          <div className="rounded-2xl border border-white/10 bg-[#111318] p-5 shadow-lg space-y-3">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                <Shield size={14} />
              </div>
              <h3 className="text-sm font-semibold text-white">Account Security</h3>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Keep your administrator account secure by updating your credentials periodically.
            </p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 text-xs font-semibold text-white transition"
            >
              <Key size={14} className="text-orange-400" />
              <span>Change Password</span>
            </button>
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
                  <p className="text-xs text-white/40">Role, administrative privileges, and organizational records</p>
                </div>
              </div>
              <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
                {userRole}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {renderInfoItem("Department / Designation", userDesignation, <Briefcase size={14} />)}
              {renderInfoItem("System Role", userRole, <Shield size={14} />)}
              {renderInfoItem("Reporting Team Lead", emp.team_lead || "Management", <User size={14} />)}
              {renderInfoItem(
                "Date of Joining",
                formatDate(emp.joining_date || user?.created_at),
                <Calendar size={14} />
              )}
              {renderInfoItem(
                "Confirmation Date",
                formatDate(emp.confirmation_date || emp.joining_date),
                <Calendar size={14} />
              )}
              {renderInfoItem("Employment Status", employeeStatus, <Clock size={14} />)}
              {renderInfoItem("Official Email", emp.official_email || email || user?.email, <Mail size={14} />)}
              {renderInfoItem("Username", emp.username || user?.username, <User size={14} />)}
              {emp.driving_licence_number &&
                renderInfoItem("Driving Licence No", emp.driving_licence_number, <Car size={14} />)}
              {emp.vehicle_registration_number &&
                renderInfoItem("Vehicle Reg No", emp.vehicle_registration_number, <Car size={14} />)}
              {emp.referral_code &&
                renderInfoItem("Referral Code", emp.referral_code, <Tag size={14} />)}
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
                  {emp.emergency_contact_person || <span className="text-white/30 font-normal italic">Not Specified</span>}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
                  <HeartHandshake size={13} className="text-rose-400" />
                  <span>Relationship</span>
                </div>
                <p className="text-base font-bold text-white">
                  {emp.emergency_relationship || <span className="text-white/30 font-normal italic">Not Specified</span>}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/40 mb-1">
                  <PhoneCall size={13} className="text-rose-400" />
                  <span>Emergency Phone</span>
                </div>
                {emp.emergency_contact_number ? (
                  <a
                    href={`tel:${emp.emergency_contact_number}`}
                    className="inline-flex items-center gap-1.5 text-base font-bold text-rose-400 hover:text-rose-300 transition"
                  >
                    <Phone size={14} />
                    <span>{emp.emergency_contact_number}</span>
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
                <p className="text-xs text-white/30 mt-0.5">Qualifications can be added or updated via employee management</p>
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
              {renderInfoItem("Gender", emp.gender)}
              {renderInfoItem("Date of Birth", formatDate(emp.dob), <Calendar size={14} />)}
              {renderInfoItem("Blood Group", emp.blood_group)}
              {renderInfoItem("Marital Status", emp.marital_status)}
              {renderInfoItem("Nationality", emp.nationality || "India")}
              {renderInfoItem("Aadhaar Number", emp.aadhaar_number)}
              {renderInfoItem("PAN Number", emp.pan_number)}
              {renderInfoItem("Mobile Number", emp.mobile_number || phone || user?.mobile, <Phone size={14} />)}
              {renderInfoItem("Alternate Mobile", emp.alternate_mobile, <Phone size={14} />)}
              {renderInfoItem("Personal Email", emp.personal_email || email || user?.email, <Mail size={14} />)}
              <div className="sm:col-span-2 md:col-span-2">
                {renderInfoItem("Permanent Address", emp.permanent_address, <MapPin size={14} />)}
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
              {renderInfoItem("Salary Type", emp.salary_type)}
              {renderInfoItem(
                "Net / Basic Salary",
                emp.basic_salary ? `₹ ${Number(emp.basic_salary).toLocaleString("en-IN")}` : null,
                <DollarSign size={14} />
              )}
              {renderInfoItem("Bank Name", emp.bank_name, <CreditCard size={14} />)}
              {renderInfoItem("Account Number", emp.account_number)}
              {renderInfoItem("IFSC Code", emp.ifsc_code)}
              {renderInfoItem("UPI ID", emp.upi_id)}
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
              {renderDocumentCard("Resume", emp.resume_url, "Professional CV / Resume")}
              {renderDocumentCard("Aadhaar Card", emp.aadhaar_url, "Government UIDAI identity")}
              {renderDocumentCard("PAN Card", emp.pan_url, "Income tax identification")}
              {renderDocumentCard(
                "Bank Passbook / Proof",
                emp.bank_passbook_url || emp.passport_url,
                "Cancelled cheque or passbook"
              )}
              {renderDocumentCard(
                "Appointment Letter",
                emp.appointment_letter_url,
                "Signed company appointment"
              )}
              {renderDocumentCard(
                "Non-Disclosure Agreement (NDA)",
                emp.nda_url,
                "Signed confidentiality document"
              )}
              {emp.offer_letter_url &&
                renderDocumentCard("Offer Letter", emp.offer_letter_url, "Initial employment offer letter")}
            </div>
          </div>
        </div>
      </div>

      {/* ── PASSWORD CHANGE MODAL ── */}
      {showPasswordModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#12131a] border border-white/10 rounded-3xl w-full max-w-md shadow-2xl shadow-black/50 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Key size={20} className="text-orange-400" /> Change Password
                </h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    setShowCurrentPassword(false);
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  className="text-white/40 hover:text-white transition-colors p-1"
                  disabled={isChangingPassword}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full bg-[#0d0e14] border border-white/10 rounded-xl p-3 pr-10 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full bg-[#0d0e14] border border-white/10 rounded-xl p-3 pr-10 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full bg-[#0d0e14] border border-white/10 rounded-xl p-3 pr-10 text-white placeholder-white/20 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                    }}
                    disabled={isChangingPassword}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex-1 px-4 py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity text-sm font-semibold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Updating...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default AdminProfile;

