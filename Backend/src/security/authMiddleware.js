const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  console.log(`[Auth] Incoming Authorization header: ${header ? 'Present' : 'Missing'}`);

  if (!header || !header.startsWith("Bearer ")) {
    console.warn("[Auth] Error: Missing or malformed Authorization header");
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const token = header.slice(7);
  console.log("[Auth] Token extracted successfully");

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[Auth] JWT verified. Authenticated User ID: ${req.user.user_id}, Role: ${req.user.role}`);
    next();
  } catch (error) {
    console.warn(`[Auth] JWT verification failed: ${error.message}`);
    return res.status(403).json({ success: false, message: "Invalid or expired token" });
  }
}

function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }

  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch (error) {
    req.user = null;
    next();
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      console.warn(`[Auth] Authorization blocked. No user in request.`);
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Get user role - check multiple possible field names for flexibility
    const userRole = req.user.role || req.user.user_role || req.user.emp_role || null;
    
    if (!userRole) {
      console.warn(`[Auth] Authorization blocked. User has no role assigned.`);
      return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
    }

    // Normalize role comparison (case-insensitive, trim whitespace)
    const normalizedUserRole = userRole.toLowerCase().trim();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().trim());

    // Check if user role is in allowed roles
    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      // Also check for "super admin" which should have access to everything
      if (normalizedUserRole !== "super admin") {
        console.warn(`[Auth] Authorization blocked. User role '${userRole}' not in allowed roles: [${allowedRoles.join(", ")}]`);
        return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
      }
    }

    console.log(`[Auth] Authorization successful for role: ${userRole}`);
    next();
  };
}

module.exports = { authenticate, optionalAuthenticate, authorize };
