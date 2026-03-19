// controllers/farmerController.js
import Request from "../models/Request.js";
import {
  ensureAuthenticated,
  ensureFarmer,
} from "../middleware/authMiddleware.js";

export const getNgoRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("farmerId", "name email")
      .populate("ngoId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const enriched = requests.map((r) => ({
      _id: r._id,
      ngoName: r.ngoId?.name ?? r.ngoName,
      ngoEmail: r.ngoId?.email ?? "—",
      item: r.item,
      quantity: r.quantity,
      status: r.status,
      createdAt: r.createdAt,
    }));

    res.render("farmer/ngoRequests", {
      title: "NGO Requests",
      requests: enriched,
    });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Could not load NGO requests");
    res.redirect("/dashboard/farmer");
  }
};

export const approveNgoRequest = async (req, res) => {
  try {
    await Request.findByIdAndUpdate(req.params.id, { status: "Approved" });
    req.flash("success_msg", "Request approved");
  } catch (e) {
    req.flash("error_msg", "Failed to approve");
  }
  res.redirect("/farmer/requests");
};

export const denyNgoRequest = async (req, res) => {
  try {
    await Request.findByIdAndUpdate(req.params.id, { status: "Denied" });
    req.flash("error_msg", "Request denied");
  } catch (e) {
    req.flash("error_msg", "Failed to deny");
  }
  res.redirect("/farmer/requests");
};
