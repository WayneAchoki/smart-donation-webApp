// routes/farmerRoutes.js
import express from "express";
import {
  getNgoRequests,
  approveNgoRequest,
  denyNgoRequest,
} from "../controllers/farmerController.js";
import {
  ensureAuthenticated,
  ensureFarmer,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/requests", ensureAuthenticated, ensureFarmer, getNgoRequests);
router.post(
  "/requests/:id/approve",
  ensureAuthenticated,
  ensureFarmer,
  approveNgoRequest
);
router.post(
  "/requests/:id/deny",
  ensureAuthenticated,
  ensureFarmer,
  denyNgoRequest
);

export default router;
