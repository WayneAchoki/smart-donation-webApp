export const ensureAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  req.flash("error_msg", "Please log in.");
  res.redirect("/login");
};

export const ensureNgo = (req, res, next) => {
  if (req.session.user?.role === "NGO") return next();
  req.flash("error_msg", "NGO access only.");
  res.redirect("/");
};

export const ensureFarmer = (req, res, next) => {
  if (req.session.user?.role === "Farmer") return next();
  req.flash("error_msg", "Farmers only.");
  res.redirect("/");
};

export const ensureCompany = (req, res, next) => {
  if (req.session.user?.role === "Company") return next();
  req.flash("error_msg", "Company access only.");
  res.redirect("/");
};
