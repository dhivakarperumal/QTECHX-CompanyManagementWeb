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
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      console.warn(`[Auth] Authorization blocked. User role '${req.user?.role}' not in allowed roles: [${allowedRoles.join(", ")}]`);
      return res.status(403).json({ success: false, message: "You do not have permission to perform this action" });
    }
    console.log(`[Auth] Authorization successful for role: ${req.user.role}`);
    next();
  };
}

module.exports = { authenticate, optionalAuthenticate, authorize };
