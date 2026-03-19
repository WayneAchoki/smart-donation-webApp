// routes/pickRoutes.js
import express from "express";
import { ensureAuthenticated } from "../middleware/authMiddleware.js";
import { getPickPage } from "../controllers/pickController.js";

const router = express.Router();

// Allow ANY authenticated user (NGO, Company, etc.)
router.use(ensureAuthenticated);

router.get("/", getPickPage);

export default router;
