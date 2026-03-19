// routes/companyRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import {
  getCompanyDashboard,
  getCompanyRequests,
  approveRequest,
  denyRequest,
  getSubmitForm, // NEW
  postSubmitRequest, // NEW
} from "../controllers/companyController.js";
import {
  ensureAuthenticated,
  ensureCompany,
} from "../middleware/authMiddleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
router.use(ensureAuthenticated, ensureCompany);

// ---------- FILE UPLOAD ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `doc-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });

// ---------- EXISTING ----------
router.get("/dashboard", getCompanyDashboard);
router.get("/request", getCompanyRequests);
router.get("/request/approve/:id", approveRequest);
router.get("/request/deny/:id", denyRequest);

// ---------- NEW: SUBMIT FORM ----------
router.get("/submit", getSubmitForm); // GET  → show form
router.post("/submit", upload.array("verificationDocs", 5), postSubmitRequest); // POST → save

export default router;
