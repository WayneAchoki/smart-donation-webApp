// server.js
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { engine } from "express-handlebars";
import session from "express-session";
import flash from "connect-flash";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import ngoRoutes from "./routes/ngoRoutes.js";
import farmerRoutes from "./routes/farmerRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import pickRoutes from "./routes/pickRoutes.js";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

// Global locals
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.currentPath = req.path;
  next();
});

// === HANDLEBARS ENGINE WITH FIXED HELPERS ===
app.engine(
  "hbs",
  engine({
    extname: "hbs",
    defaultLayout: "main",
    layoutsDir: "views/layouts",
    partialsDir: "views/partials",
    helpers: {
      // FIXED: Case-insensitive equality
      eq: (a, b) => {
        if (typeof a === "string" && typeof b === "string") {
          return a.toLowerCase() === b.toLowerCase();
        }
        return a === b;
      },

      gt: (a, b) => a > b,

      // LOGICAL AND
      and: function () {
        return Array.prototype.every.call(arguments, Boolean);
      },

      // LOGICAL OR
      or: function () {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
      },

      formatDate: (d) =>
        new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),

      capitalize: (str) => str.charAt(0).toUpperCase() + str.slice(1),

      add: (a, b) => a + b,

      truncate: (str, len) =>
        str.length > len ? str.substring(0, len) + "..." : str,

      formatNumber: (n) =>
        n.toLocaleString("en-KE", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }),

      formatRelative: (d) => {
        const now = new Date();
        const diff = now - new Date(d);
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
      },

      // NEW: Debug helper (optional, remove later)
      debug: (value) => {
        console.log("DEBUG:", value);
        return "";
      },
    },
  })
);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// === DATABASE ===
mongoose
  .connect(process.env.MONGO_URI, { dbName: "smart_donation_db" })
  .then(() => console.log("Mongo connected"))
  .catch((err) => console.error("Mongo connection error:", err));

// === ROUTES ===
app.use("/", authRoutes);
app.use("/ngo", ngoRoutes);
app.use("/farmer", farmerRoutes);
app.use("/company", companyRoutes);

// Redirect old path
app.use("/company/pick", (req, res) => {
  const query = req.originalUrl.replace(/^\/company\/pick/, "") || "";
  res.redirect(301, "/pick" + query);
});

// Shared pick page (now accessible to all authenticated users)
app.use("/pick", pickRoutes);

app.get("/", (req, res) => res.render("index", { title: "Home" }));

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

// === SERVER ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
