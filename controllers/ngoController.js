// controllers/ngoController.js
import Request from "../models/Request.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const getNgoPortal = async (req, res) => {
  try {
    const ngoId = req.session.user?._id;
    if (!ngoId) {
      req.flash("error_msg", "User session not found");
      return res.redirect("/");
    }

    const totalFarmers = await User.countDocuments({ role: "Farmer" });
    const approvedCompanies = await User.countDocuments({
      role: "Company",
      approved: true,
    });
    const pendingRequests = await Request.countDocuments({ status: "Pending" });

    const requests = await Request.find()
      .populate("farmerId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const approvedCompaniesList = await User.find({
      role: "Company",
      approved: true,
    })
      .select("name licenseStatus helpProvided")
      .lean();

    res.render("ngo/portal", {
      title: "NGO Dashboard Portal",
      user: req.session.user,
      stats: { totalFarmers, approvedCompanies, pendingRequests },
      requests,
      approvedCompanies: approvedCompaniesList,
    });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error loading NGO portal");
    res.redirect("/");
  }
};

export const approveRequest = async (req, res) => {
  try {
    await Request.findByIdAndUpdate(req.params.id, { status: "Approved" });
    req.flash("success_msg", "Request approved successfully!");
    res.redirect("/ngo/request");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error approving request");
    res.redirect("/ngo/request");
  }
};

export const denyRequest = async (req, res) => {
  try {
    await Request.findByIdAndUpdate(req.params.id, { status: "Denied" });
    req.flash("error_msg", "Request denied!");
    res.redirect("/ngo/request");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error denying request");
    res.redirect("/ngo/request");
  }
};

export const getNgoFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: "Farmer" })
      .select("name email role createdAt")
      .lean();

    res.render("ngo/farmers", {
      title: "Registered Farmers",
      farmers,
    });
  } catch (error) {
    console.error("Error fetching farmers:", error);
    req.flash("error_msg", "Error fetching farmers");
    res.redirect("/dashboard/ngo");
  }
};

export const renderRequestForm = async (req, res) => {
  try {
    const farmers = await User.find({ role: "Farmer" }).select("name").lean();
    const requests = await Request.find()
      .populate("farmerId", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.render("ngo/request", {
      title: "Send Request to Farmers",
      farmers,
      requests,
    });
  } catch (err) {
    console.error("Error loading request form:", err);
    req.flash("error_msg", "Error loading request form");
    res.redirect("/ngo/portal");
  }
};

export const createRequest = async (req, res) => {
  try {
    const { farmerId, item, quantity } = req.body;

    if (!req.session.user?._id) {
      req.flash("error_msg", "Please log in");
      return res.redirect("/login");
    }

    if (!farmerId || !mongoose.Types.ObjectId.isValid(farmerId)) {
      req.flash("error_msg", "Invalid farmer");
      return res.redirect("/ngo/request");
    }

    if (!item?.trim()) {
      req.flash("error_msg", "Item required");
      return res.redirect("/ngo/request");
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      req.flash("error_msg", "Valid quantity required");
      return res.redirect("/ngo/request");
    }

    const farmer = await User.findById(farmerId);
    if (!farmer || farmer.role !== "Farmer") {
      req.flash("error_msg", "Farmer not found");
      return res.redirect("/ngo/request");
    }

    await Request.create({
      ngoName: req.session.user.name,
      ngoId: req.session.user._id,
      farmerId,
      item: item.trim(),
      quantity: qty,
      status: "Pending",
    });

    req.flash("success_msg", "Request sent!");
    res.redirect("/ngo/request");
  } catch (err) {
    console.error("Create request error:", err);
    req.flash("error_msg", "Error sending request");
    res.redirect("/ngo/request");
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Approved", "Completed"].includes(status)) {
      req.flash("error_msg", "Invalid status");
      return res.redirect("/ngo/request");
    }

    await Request.findByIdAndUpdate(id, { status });
    req.flash("success_msg", "Status updated");
    res.redirect("/ngo/request");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Update failed");
    res.redirect("/ngo/request");
  }
};
