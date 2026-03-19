// controllers/pickController.js
import CompanyRequest from "../models/CompanyRequest.js";

export const getPickPage = async (req, res) => {
  try {
    const { search, status, type, page = 1 } = req.query;
    const pageSize = 10;
    const currentPage = Math.max(1, parseInt(page));

    const query = {};

    // ---------- 1. USER-SPECIFIC FILTER ----------
    const user = req.session.user;
    if (user?.role?.toLowerCase() === "company") {
      // Companies see ONLY their own requests
      query["company"] = user.id; // <-- now safe (set in login)
    }
    // NGOs see everything (no extra filter)

    // ---------- 2. SEARCH ----------
    if (search) {
      query.$or = [
        { "company.name": { $regex: search, $options: "i" } },
        { "company.email": { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    // ---------- 3. STATUS & TYPE ----------
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }
    if (type && ["donation", "partnership", "csr"].includes(type)) {
      query.type = type;
    }

    // ---------- 4. FETCH ----------
    const totalCount = await CompanyRequest.countDocuments(query);
    const filteredCount = totalCount;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (currentPage - 1) * pageSize;

    const requests = await CompanyRequest.find(query)
      .populate("company", "name email")
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(pageSize)
      .lean();

    // ---------- 5. PAGINATION ----------
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push({ number: i, active: i === currentPage });
    }

    // ---------- 6. RENDER ----------
    res.render("company/pick", {
      user: req.session.user || null,
      requests,
      totalCount,
      filteredCount,
      currentPage,
      totalPages,
      pages,
      hasPrevPage: currentPage > 1,
      prevPage: currentPage - 1,
      hasNextPage: currentPage < totalPages,
      nextPage: currentPage + 1,
      searchQuery: search || "",
      statusFilter: status || "",
      typeFilter: type || "",
      showPagination: totalPages > 1,
      currentUrl: req.originalUrl,
      currentPath: req.path,

      // Helpers
      formatDate: (d) =>
        new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
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
      formatNumber: (n) =>
        n.toLocaleString("en-KE", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }),
      truncate: (str, len) =>
        str.length > len ? str.substring(0, len) + "..." : str,
      add: (a, b) => a + b,
    });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Could not load requests");
    res.redirect("/");
  }
};
