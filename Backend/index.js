const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { AsyncLocalStorage } = require("async_hooks");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { initDB } = require("./src/config/db");
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
      } catch (err) {}
      const allowed = ["https://myqtechx.qtechx.com"];
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
app.use("/api/users",   usersRouter);
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
  path.join(__dirname, "public"),
  path.join(__dirname, "..", "public"),
];

const frontendBuildPath = potentialFrontendBuildPaths.find((buildPath) => fs.existsSync(buildPath));
if (frontendBuildPath) {
  // console.log(`Serving static frontend from: ${frontendBuildPath}`);
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

// ── Stub routes for features not yet implemented in this backend ──────────────
// These prevent 404 noise from the StoreContext (cart/wishlist from e-commerce build)
app.get("/api/cart/:userId",           (req, res) => res.json({ success: true, data: [] }));
app.get("/api/wishlist/:userId",       (req, res) => res.json({ success: true, data: [] }));
app.post("/api/cart",                  (req, res) => res.status(501).json({ success: false, message: "Cart not implemented" }));
app.post("/api/wishlist",              (req, res) => res.status(501).json({ success: false, message: "Wishlist not implemented" }));
app.delete("/api/cart/:id",            (req, res) => res.json({ success: true }));
app.put("/api/cart/:id",               (req, res) => res.json({ success: true }));
app.delete("/api/cart/clear/:userId",  (req, res) => res.json({ success: true }));
app.delete("/api/wishlist/:uid/:pid",  (req, res) => res.json({ success: true }));


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

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

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
