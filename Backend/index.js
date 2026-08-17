const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { AsyncLocalStorage } = require("async_hooks");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: path.join(__dirname, ".env") });
console.table({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
});

const { initDB } = require("./src/config/db");
const { upload } = require("./src/config/multerConfig");
const cartStore = new Map();
const wishlistStore = new Map();
const usersRouter = require("./src/routers/usersRouter");
const employeesRouter = require("./src/routers/employeesRouter");
const attendanceRouter = require("./src/routers/attendanceRouter");
const clientRouter = require("./src/routers/clientRouter");
const projectRouter = require("./src/routers/projectRouter");
const quotationRouter = require("./src/routers/quotationRouter");
const projectPlanRouter = require('./src/routers/projectPlanRouter');
const projectExpiryRouter = require('./src/routers/projectExpiryRouter');
const taskRouter = require("./src/routers/taskRouter");
const fundRouter = require("./src/routers/fundRouter");
const expenseRouter = require("./src/routers/expenseRouter");
const traineeInternRouter = require("./src/routers/traineeInternRouter");
const traineeInternAttendanceRouter = require("./src/routers/traineeInternAttendanceRouter");
const traineeTaskRouter = require("./src/routers/traineeTaskRouter");
const salaryRouter = require("./src/routers/salaryRouter");
const projectPaymentRouter = require("./src/routers/projectPaymentRouter");
const incomeRouter = require("./src/routers/incomeRouter");
const eventRouter = require("./src/routers/eventRouter");
const myEventRouter = require("./src/routers/myEventRouter");
const dashboardRouter = require("./src/routers/dashboardRouter");
const employeeLeaveRouter = require("./src/routers/employeeLeaveRouter");
const leaveSettingsRouter = require("./src/routers/leaveSettingsRouter");
const traineeAssignmentRouter = require("./src/routers/traineeAssignmentRouter");
const serviceRouter = require("./src/routers/serviceRouter");
const pricingRouter = require("./src/routers/pricingRouter");
const reviewRouter = require("./src/routers/reviewRouter");
const app = express();
const als = new AsyncLocalStorage();

// console.log("Starting backend index.js...");

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ✅ EXACT CORS FIX - Allow multiple ports */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      try {
        const url = new URL(origin);
        const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
        if (isLocalhost) return callback(null, origin);
      } catch (err) { }
      const allowed = ["https://qt1.qtechx.com"];
      if (allowed.includes(origin)) return callback(null, origin);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use("/api/users", usersRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/quotations", quotationRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/clients", clientRouter);
app.use("/api/projects", projectRouter);
app.use("/api/project-plans", projectPlanRouter);
app.use("/api/project-expiries", projectExpiryRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/fund", fundRouter);
app.use("/api/expenses", expenseRouter);
app.use("/api/trainee-intern", traineeInternRouter);
app.use("/api/trainee-intern-attendance", traineeInternAttendanceRouter);
app.use("/api", traineeTaskRouter);
app.use("/api/salary", salaryRouter);
app.use("/api/project-payments", projectPaymentRouter);
app.use("/api/incomes", incomeRouter);
app.use("/api/events", eventRouter);
app.use("/api/myevents", myEventRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/employee-leaves", employeeLeaveRouter);
app.use("/api/leave-settings", leaveSettingsRouter);
app.use("/api/services", serviceRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/trainee-assignments", traineeAssignmentRouter);

app.post("/api/upload", upload.any(), (req, res) => {
  const files = Array.isArray(req.files) ? req.files : [];

  if (!files.length) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }

  const urls = files.map((file) => {
    const relativePath = path.relative(__dirname, file.path).replace(/\\/g, "/");
    return `/${relativePath}`;
  });

  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    url: urls[0],
    urls,
    data: urls,
  });
});

app.get("/api/cart/:userId", (req, res) => {
  const cart = cartStore.get(req.params.userId) || [];
  res.json({ success: true, data: cart });
});

app.post("/api/cart", (req, res) => {
  const userId = req.body.user_id;
  if (!userId) return res.status(400).json({ success: false, message: "user_id is required" });

  const current = cartStore.get(userId) || [];
  const item = { ...req.body, id: req.body.id || Date.now().toString(), created_at: new Date().toISOString() };
  const next = [...current, item];
  cartStore.set(userId, next);
  res.status(201).json({ success: true, data: item, cart: next });
});

app.put("/api/cart/:cartItemId", (req, res) => {
  let found = null;
  for (const [userId, items] of cartStore.entries()) {
    const idx = items.findIndex((item) => String(item.id) === String(req.params.cartItemId));
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...req.body, updated_at: new Date().toISOString() };
      found = items[idx];
      cartStore.set(userId, items);
      break;
    }
  }

  if (!found) return res.status(404).json({ success: false, message: "Cart item not found" });
  res.json({ success: true, data: found });
});

app.delete("/api/cart/:cartItemId", (req, res) => {
  let removed = false;
  for (const [userId, items] of cartStore.entries()) {
    const next = items.filter((item) => String(item.id) !== String(req.params.cartItemId));
    if (next.length !== items.length) {
      cartStore.set(userId, next);
      removed = true;
      break;
    }
  }

  if (!removed) return res.status(404).json({ success: false, message: "Cart item not found" });
  res.json({ success: true, message: "Removed from cart" });
});

app.delete("/api/cart/clear/:userId", (req, res) => {
  cartStore.set(req.params.userId, []);
  res.json({ success: true, message: "Cart cleared" });
});

app.get("/api/wishlist/:userId", (req, res) => {
  const wishlist = wishlistStore.get(req.params.userId) || [];
  res.json({ success: true, data: wishlist });
});

app.post("/api/wishlist", (req, res) => {
  const userId = req.body.user_id;
  if (!userId) return res.status(400).json({ success: false, message: "user_id is required" });

  const current = wishlistStore.get(userId) || [];
  const exists = current.some((item) => String(item.product_id) === String(req.body.product_id));
  if (exists) {
    return res.status(200).json({ success: true, data: current, wishlist: current });
  }

  const item = { ...req.body, id: req.body.id || Date.now().toString(), created_at: new Date().toISOString() };
  const next = [...current, item];
  wishlistStore.set(userId, next);
  res.status(201).json({ success: true, data: item, wishlist: next });
});

app.delete("/api/wishlist/:userId/:productId", (req, res) => {
  const current = wishlistStore.get(req.params.userId) || [];
  const next = current.filter((item) => String(item.product_id) !== String(req.params.productId));
  wishlistStore.set(req.params.userId, next);
  res.json({ success: true, data: next, wishlist: next });
});

// Health check (must be before the catch-all /api/* 404 handler)
app.get("/api/health", (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// Explicit API 404 to prevent API paths from being handled by frontend fallback
// ⚠️ This MUST be the LAST /api route — anything registered after this will never be reached
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Serve uploaded files from the backend uploads directory as inline browser content
app.use(["/uploads", "/api/uploads"], (req, res, next) => {
  res.setHeader("Content-Disposition", "inline");

  const requestedPath = req.path.replace(/^\/+/, "");
  const absoluteRequestedPath = path.join(__dirname, "uploads", requestedPath);

  if (fs.existsSync(absoluteRequestedPath)) {
    return next();
  }

  const fileName = path.basename(requestedPath);
  const fallbackCandidates = [
    path.join(__dirname, "uploads", "projects", "source_code_backup", fileName),
    path.join(__dirname, "uploads", "projects", "ProjectImageZip", fileName),
    path.join(__dirname, "uploads", "projects", "images", fileName),
    path.join(__dirname, "uploads", "projects", "project_plans", fileName),
  ];

  const resolvedFile = fallbackCandidates.find((candidate) => fs.existsSync(candidate));
  if (resolvedFile) {
    return res.sendFile(resolvedFile);
  }

  next();
}, express.static(path.join(__dirname, "uploads")));

// Serve frontend production build if available
const potentialFrontendBuildPaths = [
  path.join(__dirname, "Frontend", "dist"),
  path.join(__dirname, "..", "Frontend", "dist"),
  path.join(__dirname, "..", "..", "Frontend", "dist"),
  path.join(__dirname, "..", "..", "..", "Frontend", "dist"),
  path.join(__dirname, "dist"),
  path.join(__dirname, "..", "dist"),
  path.join(__dirname, "build"),
  path.join(__dirname, "..", "build"),
];

const frontendBuildPath = potentialFrontendBuildPaths.find((buildPath) => {
  return fs.existsSync(buildPath) && fs.existsSync(path.join(buildPath, "index.html"));
});

const frontendPublicPath = path.join(__dirname, "..", "Frontend", "public");

const faviconCandidates = [
  path.join(frontendPublicPath, "favicon.ico"),
  path.join(frontendPublicPath, "images", "favicon.ico"),
  frontendBuildPath ? path.join(frontendBuildPath, "favicon.ico") : null,
].filter(Boolean);

app.get("/favicon.ico", (req, res) => {
  try {
    const faviconPath = faviconCandidates.find((candidate) => fs.existsSync(candidate));
    if (!faviconPath) {
      return res.status(404).json({ success: false, message: "favicon.ico not found" });
    }
    return res.sendFile(faviconPath);
  } catch (error) {
    console.error("Favicon Error:", error);
    return res.status(500).json({ success: false, message: "Error serving favicon" });
  }
});

if (frontendBuildPath) {
  app.use(express.static(frontendBuildPath));
  app.get(["/", "/index.html"], (req, res) => {
    return res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    return res.sendFile(path.join(frontendBuildPath, "index.html"));
  });
} else {
  console.warn("Frontend build directory not found. Backend will run in API-only mode.");
}

if (fs.existsSync(frontendPublicPath)) {
  app.use(express.static(frontendPublicPath));
}

// Global Context Middleware for tracking created_by / updated_by
app.use((req, res, next) => {
  let user = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      user = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    } catch (err) {
      // Ignore token errors here, just proceed without user context
    }
  }

  als.run(new Map([['user', user]]), next);
});

async function startServer() {
  try {
    await initDB();

    const PORT = Number(process.env.PORT || 5000);
    const server = app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Stop the running process or set a different PORT.`);
      } else {
        console.error("Server error:", err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error("Backend failed to start:", err);
    process.exit(1);
  }
}

startServer();

module.exports = app;
