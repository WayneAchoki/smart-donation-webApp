// controllers/companyController.js
import CompanyRequest from "../models/CompanyRequest.js";

export const getCompanyDashboard = async (req, res) => {
  const ngoId = req.session.user._id;

  const stats = await CompanyRequest.aggregate([
    { $match: { ngo: ngoId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const map = { pending: 0, approved: 0, rejected: 0 };
  stats.forEach((s) => (map[s._id] = s.count));

  const totalDonations = await CompanyRequest.aggregate([
    { $match: { ngo: ngoId, status: "approved", type: "donation" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  res.render("dashboard/company", {
    user: req.session.user,
    stats: {
      pendingCompanyRequests: map.pending,
      approvedCompanies: map.approved,
      totalDonations: totalDonations[0]?.total ?? 0,
    },
  });
};

export const getCompanyRequests = async (req, res) => {
  const ngoId = req.session.user._id;
  const requests = await CompanyRequest.find({ ngo: ngoId })
    .populate("company", "name email")
    .sort({ createdAt: -1 });
  res.render("company/request-list", { requests });
};

export const approveRequest = async (req, res) => {
  await CompanyRequest.findByIdAndUpdate(req.params.id, { status: "approved" });
  req.flash("success_msg", "Request approved");
  res.redirect("/company/request");
};

export const denyRequest = async (req, res) => {
  await CompanyRequest.findByIdAndUpdate(req.params.id, { status: "rejected" });
  req.flash("error_msg", "Request rejected");
  res.redirect("/company/request");
};

// NEW: FORM
export const getSubmitForm = (req, res) => {
  const { type } = req.query;
  if (!["donation", "partnership", "csr"].includes(type)) {
    req.flash("error_msg", "Invalid request type");
    return res.redirect("/company/dashboard");
  }
  res.render("company/submit-request", { type, user: req.session.user });
};

export const postSubmitRequest = async (req, res) => {
  try {
    const {
      companyName,
      licenseNumber,
      location,
      founderName,
      type,
      amount,
      items,
      message,
    } = req.body;

    const files = req.files?.verificationDocs || [];
    const docPaths = files.map((f) => `/uploads/${f.filename}`);

    const newReq = new CompanyRequest({
      company: req.session.user._id,
      ngo: req.session.user._id,
      companyName,
      licenseNumber,
      location,
      founderName,
      verificationDocs: docPaths,
      type,
      amount: amount ? parseFloat(amount) : undefined,
      items: items
        ? items
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
        : [],
      message,
    });

    await newReq.save();
    req.flash("success_msg", "Request submitted!");
    res.redirect("/company/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Submit failed.");
    res.redirect("/company/submit?type=" + (req.body.type || "donation"));
  }
};
