const normalizeRole = (role) => String(role || "").trim().toLowerCase();

export const getRoleHome = (role) => {
  const normalizedRole = normalizeRole(role);

  if (["super admin", "admin"].includes(normalizedRole)) return "/admin";
  if (["manager", "staff", "employee"].includes(normalizedRole)) return "/employee";
  return "/";
};

export const isAdminRole = (role) =>
  ["super admin", "admin"].includes(normalizeRole(role));

export const isEmployeeRole = (role) =>
  ["manager", "staff", "employee"].includes(normalizeRole(role));

export const isCustomerRole = (role) =>
  ["customer", "user", ""].includes(normalizeRole(role));
