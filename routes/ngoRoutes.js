// routes/ngoRoutes.js
import express from "express";
import {
  getNgoPortal,
  approveRequest,
  denyRequest,
  getNgoFarmers,
  renderRequestForm,
  createRequest,
  updateRequestStatus,
} from "../controllers/ngoController.js";
import {
  ensureAuthenticated,
  ensureNgo, // ← FIXED: was ensureNGO (uppercase)
} from "../middleware/authMiddleware.js";
import CompanyRequest from "../models/CompanyRequest.js";

const router = express.Router();

// === NGO DASHBOARD & ACTIONS ===
router.get("/portal", ensureAuthenticated, ensureNgo, getNgoPortal);
router.get("/approve/:id", ensureAuthenticated, ensureNgo, approveRequest);
router.get("/deny/:id", ensureAuthenticated, ensureNgo, denyRequest);
router.get("/farmers", ensureAuthenticated, ensureNgo, getNgoFarmers);
router.get("/request", ensureAuthenticated, ensureNgo, renderRequestForm);
router.post("/request", ensureAuthenticated, ensureNgo, createRequest);
router.post(
  "/requests/:id/status",
  ensureAuthenticated,
  ensureNgo,
  updateRequestStatus
);

// === NGO-ONLY: Update Company Request Status (from /company/pick) ===
router.post(
  "/company/request/update/:id",
  ensureAuthenticated,
  ensureNgo,
  async (req, res) => {
    const { status, returnUrl } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      req.flash("error_msg", "Invalid status");
      return res.redirect(returnUrl || "/pick");
    }

    try {
      const request = await CompanyRequest.findById(req.params.id);
      if (!request) {
        req.flash("error_msg", "Request not found");
        return res.redirect(returnUrl || "/pick");
      }

      // Allow updating ANY status (even if already approved/rejected)
      await CompanyRequest.findByIdAndUpdate(req.params.id, { status });

      const action =
        status === "approved"
          ? "approved"
          : status === "rejected"
          ? "rejected"
          : "set to pending";
      req.flash("success_msg", `Request ${action} successfully`);
    } catch (err) {
      console.error("Update failed:", err);
      req.flash("error_msg", "Failed to update request");
    }

    res.redirect(returnUrl || "/pick");
  }
);

export default router;
