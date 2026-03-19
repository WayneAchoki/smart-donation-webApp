// controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      req.flash("error_msg", "Email already registered");
      return res.redirect("/register");
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed, role });

    req.flash("success_msg", "Registration successful. Please log in.");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Server error");
    res.redirect("/register");
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error_msg", "Invalid email or password");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error_msg", "Invalid email or password");
      return res.redirect("/login");
    }

    // *** IMPORTANT: store BOTH id and _id ***
    req.session.user = {
      id: user._id.toString(), // <-- short alias (most code uses .id)
      _id: user._id, // <-- keep original
      name: user.name,
      email: user.email,
      role: user.role,
    };

    req.flash("success_msg", `Welcome, ${user.name}!`);
    const redirect =
      user.role === "Farmer"
        ? "/dashboard/farmer"
        : user.role === "NGO"
        ? "/dashboard/ngo"
        : user.role === "Company"
        ? "/dashboard/company"
        : "/";
    res.redirect(redirect);
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Server error");
    res.redirect("/login");
  }
};
