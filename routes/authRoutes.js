import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();

// Views
router.get("/register", (req, res) =>
  res.render("auth/register", { title: "Register" })
);
router.get("/login", (req, res) =>
  res.render("auth/login", { title: "Login" })
);

// Actions
router.post("/register", registerUser);
router.post("/login", loginUser);

// Dashboards
router.get("/dashboard/farmer", (req, res) =>
  res.render("dashboard/farmer", { title: "Farmer Dashboard" })
);
router.get("/dashboard/ngo", (req, res) =>
  res.render("dashboard/ngo", { title: "NGO Dashboard" })
);
router.get("/dashboard/company", (req, res) =>
  res.render("dashboard/company", { title: "Company Dashboard" })
);

export default router;
