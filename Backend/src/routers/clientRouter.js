const express = require("express");
const { authenticate, authorize } = require("../security/authMiddleware");
const {
  createClientHandler,
  getAllClientsHandler,
  getClientByIdHandler,
  updateClientHandler,
  deleteClientHandler,
  uploadDocumentHandler,
  getDocumentsHandler,
  deleteDocumentHandler,
} = require("../controllers/clientController");

const router = express.Router();

// Role shorthand helpers
const managers     = authorize("Super Admin", "Admin", "Manager");
const admins       = authorize("Super Admin", "Admin");
const allStaff     = authorize("Super Admin", "Admin", "Manager", "Staff", "Employee");

// ─── Client CRUD ──────────────────────────────────────────────────────────────
router.post(  "/",    authenticate, managers, createClientHandler);
router.get(   "/",    authenticate, allStaff, getAllClientsHandler);
router.get(   "/:id", authenticate, allStaff, getClientByIdHandler);
router.put(   "/:id", authenticate, managers, updateClientHandler);
router.delete("/:id", authenticate, admins,   deleteClientHandler);

// ─── Client Documents ─────────────────────────────────────────────────────────
router.post(  "/:id/documents",         authenticate, managers, uploadDocumentHandler);
router.get(   "/:id/documents",         authenticate, allStaff, getDocumentsHandler);
router.delete("/:id/documents/:docId",  authenticate, admins,   deleteDocumentHandler);

module.exports = router;
